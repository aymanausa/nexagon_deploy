import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const AdmZip = require('adm-zip'); // CJS default export; `import * as` doesn't yield the constructor
import {
  PSD_GRAINS_URL, PSD_GRAINS_CSV, SAUDI_CODE, ATTR_ENDING_STOCKS, ATTR_DOMESTIC_CONSUMPTION, STOCK_COMMODITIES,
  THRESHOLDS_KEY, DEFAULT_THRESHOLDS, StockThresholds,
} from './stock-levels.constants';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// splits a CSV line honouring double-quoted fields (descriptions like "Rice, Milled" contain commas)
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

// colour band from days of supply against the configured thresholds
function statusFor(daysOfSupply: number, t: StockThresholds): string {
  return daysOfSupply >= t.adequateDays ? 'adequate' : daysOfSupply >= t.watchDays ? 'watch' : 'low';
}

// Real strategic-reserve stock levels from USDA PSD (ending stocks + days of supply).
@Injectable()
export class StockLevelsService implements OnModuleInit {
  private logger = new Logger('StockLevelsService');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.refresh().catch((e) => this.logger.error(`initial stock refresh failed: ${e.message}`));
  }

  // --- status thresholds (admin-tunable, persisted in AppConfig) ---
  async getThresholds(): Promise<StockThresholds> {
    const row = await this.prisma.appConfig.findUnique({ where: { key: THRESHOLDS_KEY } });
    return { ...DEFAULT_THRESHOLDS, ...((row?.value as any) || {}) };
  }

  async setThresholds(input: Partial<StockThresholds>): Promise<StockThresholds> {
    const adequateDays = Math.round(Number(input.adequateDays));
    const watchDays = Math.round(Number(input.watchDays));
    if (!Number.isFinite(adequateDays) || !Number.isFinite(watchDays) || watchDays < 1 || adequateDays <= watchDays) {
      throw new BadRequestException('Require adequateDays > watchDays >= 1');
    }
    const value = { adequateDays, watchDays };
    await this.prisma.appConfig.upsert({ where: { key: THRESHOLDS_KEY }, create: { key: THRESHOLDS_KEY, value }, update: { value } });
    // re-colour existing rows immediately (no USDA re-fetch needed)
    for (const s of await this.prisma.stockLevel.findMany()) {
      await this.prisma.stockLevel.update({ where: { id: s.id }, data: { status: statusFor(s.daysOfSupply, value) } });
    }
    return value;
  }

  // Rows follow the watched commodities (catalog showOnDashboard) so Stock Levels stays
  // coherent with the rest of the system; USDA PSD only covers some of them, so the rest
  // come back with null stock data (rendered blank / "no USDA data").
  async list() {
    const watched = await this.prisma.commodity.findMany({
      where: { showOnDashboard: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    const byName = new Map((await this.prisma.stockLevel.findMany()).map((s) => [s.commodity, s]));
    const stocks = watched.map((c) => {
      const s = byName.get(c.name);
      return s
        ? {
            commodity: c.name, category: c.category, hasData: true,
            currentStockMt: s.currentStockMt, targetStockMt: s.targetStockMt,
            daysOfSupply: s.daysOfSupply, utilizationPercent: s.utilizationPercent, status: s.status,
          }
        : {
            commodity: c.name, category: c.category, hasData: false,
            currentStockMt: null, targetStockMt: null, daysOfSupply: null, utilizationPercent: null, status: 'nodata',
          };
    });
    return { stocks, count: stocks.length, withData: [...byName.keys()].length };
  }

  async refresh() {
    const buf = Buffer.from(await (await fetch(PSD_GRAINS_URL, { headers: { 'User-Agent': UA } })).arrayBuffer());
    const csv = new AdmZip(buf).readAsText(PSD_GRAINS_CSV);
    const lines = csv.split(/\r?\n/);

    // commodity -> year -> { stocks, consumption }
    const byCom: Record<string, Record<number, { s?: number; c?: number }>> = {};
    const wanted = new Set(STOCK_COMMODITIES.map((c) => c.psd));
    for (const line of lines) {
      if (!line.includes(`,${SAUDI_CODE},`)) continue;
      const f = splitCsv(line);
      const desc = f[1];
      if (!wanted.has(desc)) continue;
      const attr = f[7];
      if (attr !== ATTR_ENDING_STOCKS && attr !== ATTR_DOMESTIC_CONSUMPTION) continue;
      const year = Number(f[4]);
      const val = Number(f[11]);
      if (!Number.isFinite(year) || !Number.isFinite(val)) continue;
      const y = (byCom[desc] = byCom[desc] || {});
      const rec = (y[year] = y[year] || {});
      if (attr === ATTR_ENDING_STOCKS) rec.s = val;
      else rec.c = val;
    }

    const thresholds = await this.getThresholds();
    let updated = 0;
    for (const c of STOCK_COMMODITIES) {
      const years = byCom[c.psd];
      if (!years) continue;
      const latest = Math.max(...Object.keys(years).map(Number).filter((y) => years[y].s != null));
      if (!Number.isFinite(latest)) continue;
      const stocks1000mt = years[latest].s!;
      const cons1000mt = years[latest].c;
      const currentStockMt = Math.round(stocks1000mt * 1000);
      const daysOfSupply = cons1000mt ? Math.round((stocks1000mt / cons1000mt) * 365) : 0;
      const utilizationPercent = Math.round((currentStockMt / c.capacity) * 1000) / 10;
      const status = statusFor(daysOfSupply, thresholds);

      const data = {
        commodity: c.name, currentStockMt, targetStockMt: c.target, daysOfSupply,
        capacityMt: c.capacity, utilizationPercent, silosCount: c.silos, status, recordedAt: new Date(),
      };
      const existing = await this.prisma.stockLevel.findFirst({ where: { commodity: c.name } });
      if (existing) await this.prisma.stockLevel.update({ where: { id: existing.id }, data });
      else await this.prisma.stockLevel.create({ data });
      updated++;
    }
    // drop any rows outside the PSD-tracked set (stale seed data)
    await this.prisma.stockLevel.deleteMany({ where: { commodity: { notIn: STOCK_COMMODITIES.map((c) => c.name) } } });
    this.logger.log(`Stock levels refreshed for ${updated} commodities (USDA PSD)`);
    return { updated };
  }
}
