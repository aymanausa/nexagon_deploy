import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from '@prisma/client';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { Fetcher } from './fetcher.interface';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

interface WbConfig {
  url: string;
  sheet: string;
  months: number;
  sarPerUsd: number;
}

// normalise headers so "Beef **" / "Rice, Thai 5% " match "Beef" / "Rice, Thai 5%"
const norm = (s: any) => String(s ?? '').replace(/\*+/g, '').trim().toLowerCase();

@Injectable()
export class WorldBankPricesFetcher implements Fetcher {
  private logger = new Logger('WorldBankPricesFetcher');

  constructor(private prisma: PrismaService) {}

  async run(source: DataSource): Promise<number> {
    const cfg = source.config as unknown as WbConfig;
    // columns come from the catalog (dashboard commodities that map to a Pink Sheet column)
    const catalog = await this.prisma.commodity.findMany({
      where: { showOnDashboard: true, wbColumn: { not: null } },
    });
    const map = catalog.map((c) => ({ col: c.wbColumn as string, name: c.name }));
    if (map.length === 0) return 0;

    const res = await fetch(cfg.url, { headers: { 'User-Agent': BROWSER_UA } });
    if (!res.ok) throw new Error(`World Bank Pink Sheet HTTP ${res.status}`);
    const wb = XLSX.read(Buffer.from(await res.arrayBuffer()), { type: 'buffer' });
    const ws = wb.Sheets[cfg.sheet];
    if (!ws) throw new Error(`Sheet "${cfg.sheet}" not found`);
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

    // header row = the one containing our first mapped column; units row is next
    const wanted = new Set(map.map((m) => norm(m.col)));
    const headerIdx = rows.findIndex((r) => r?.some((c) => wanted.has(norm(c))));
    if (headerIdx < 0) throw new Error('Could not locate header row in Pink Sheet');
    const header = rows[headerIdx];
    const unitsRow = rows[headerIdx + 1] || [];
    const dataRows = rows.slice(headerIdx + 2); // skip header + units row

    const sarPerUsd = cfg.sarPerUsd || 3.75;
    const monthIdx = (y: number, m: number) => y * 12 + m;

    // Pass 1: collect numeric monthly points per commodity, and track the file's latest month.
    const collected: { m: { col: string; name: string; unit: string }; points: { year: number; month: number; value: number }[] }[] = [];
    let globalMax = 0;
    for (const entry of map) {
      const colIdx = header.findIndex((h) => norm(h) === norm(entry.col));
      if (colIdx < 0) continue;
      const m = { ...entry, unit: String(unitsRow[colIdx] ?? '$/mt').replace(/[()]/g, '').trim() };
      const points: { year: number; month: number; value: number }[] = [];
      for (const r of dataRows) {
        const mt = String(r?.[0] ?? '').match(/^(\d{4})M(\d{2})$/);
        const v = Number(r?.[colIdx]);
        if (!mt || !Number.isFinite(v)) continue;
        const year = Number(mt[1]);
        const month = Number(mt[2]);
        points.push({ year, month, value: v });
        globalMax = Math.max(globalMax, monthIdx(year, month));
      }
      if (points.length) collected.push({ m, points });
    }
    if (globalMax === 0) throw new Error('Pink Sheet had no dated monthly rows');
    const cutoff = globalMax - cfg.months; // only keep months within the window of the newest data

    // clear all WorldBank rows once, so discontinued series don't linger from a prior run
    await this.prisma.commodityPrice.deleteMany({ where: { source: 'WorldBank' } });

    let written = 0;
    for (const { m, points } of collected) {
      // drop discontinued series (e.g. Barley stopped ~2020) so stale values don't look current
      const recent = points.filter((p) => monthIdx(p.year, p.month) > cutoff);
      if (recent.length === 0) continue;

      await this.prisma.commodityPrice.createMany({
        data: recent.map((p, i) => {
          const prev = recent[i - 1];
          const changePercent = prev ? ((p.value - prev.value) / prev.value) * 100 : 0;
          return {
            commodity: m.name,
            priceUsd: Math.round(p.value * 100) / 100,
            priceSar: Math.round(p.value * sarPerUsd * 100) / 100, // ponytail: SAR via fixed peg 3.75
            changePercent: Math.round(changePercent * 100) / 100,
            source: 'WorldBank',
            metadata: {
              unit: m.unit,
              granularity: 'monthly',
              period: `${p.year}-${String(p.month).padStart(2, '0')}`,
            },
            recordedAt: new Date(Date.UTC(p.year, p.month - 1, 1)),
          };
        }),
      });
      written += recent.length;
    }

    if (written === 0) throw new Error('Pink Sheet had no usable rows for configured columns');
    this.logger.log(`Wrote ${written} World Bank monthly price rows (${map.length} commodities)`);
    return written;
    // ponytail: Pink Sheet download URL rotates monthly — kept in config.url; scrape the landing page for the current link if it 404s
  }
}
