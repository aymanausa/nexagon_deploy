import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { IngestionService } from '../integration/ingestion.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CORE_COMMODITIES, DEFAULT_VISIBLE, FAO_TO_WB, NON_FOOD, categoryFor } from './catalog.constants';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const norm = (s: any) => String(s ?? '').replace(/\*+/g, '').trim().toLowerCase();

@Injectable()
export class CatalogService implements OnModuleInit {
  private logger = new Logger('CatalogService');

  constructor(
    private prisma: PrismaService,
    private ingestion: IngestionService,
    private suppliers: SuppliersService,
  ) {}

  // seed the curated core so the dashboard keeps working; never clobber an admin's showOnDashboard
  async onModuleInit() {
    for (const c of CORE_COMMODITIES) {
      const existing = await this.prisma.commodity.findUnique({ where: { name: c.name } });
      if (existing) {
        await this.prisma.commodity.update({
          where: { name: c.name },
          data: { category: c.category, faoItemCode: c.faoItemCode, wbColumn: c.wbColumn, hsCode: c.hsCode ?? null },
        });
      } else {
        await this.prisma.commodity.create({
          data: {
            name: c.name,
            category: c.category,
            faoItemCode: c.faoItemCode,
            wbColumn: c.wbColumn,
            hsCode: c.hsCode ?? null,
            hasYearly: true,
            hasMonthly: !!c.wbColumn,
            showOnDashboard: DEFAULT_VISIBLE.has(c.name),
          },
        });
      }
    }
    this.logger.log(`Catalog seeded (${CORE_COMMODITIES.length} core commodities)`);
  }

  async list() {
    const commodities = await this.prisma.commodity.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    return { commodities, count: commodities.length };
  }

  // Pull the FAO food-item list, add anything new, and refresh yearly/monthly availability flags.
  async refresh() {
    const faoItems = await this.fetchFaoFoodItems();
    let added = 0;
    for (const it of faoItems) {
      const exists = await this.prisma.commodity.findFirst({ where: { faoItemCode: it.code } });
      if (exists) continue;
      await this.prisma.commodity.create({
        data: {
          name: it.label,
          category: categoryFor(it.label),
          faoItemCode: it.code,
          wbColumn: FAO_TO_WB[it.code] ?? null,
          hasYearly: false,
          hasMonthly: false,
          showOnDashboard: false,
          isNew: true,
        },
      });
      added++;
    }

    const yearlyCodes = await this.probeFaoYearly();
    const monthlyCols = await this.probeWorldBankColumns();

    const all = await this.prisma.commodity.findMany();
    for (const c of all) {
      await this.prisma.commodity.update({
        where: { id: c.id },
        data: {
          hasYearly: c.faoItemCode ? yearlyCodes.has(c.faoItemCode) : false,
          hasMonthly: c.wbColumn ? monthlyCols.has(norm(c.wbColumn)) : false,
        },
      });
    }
    this.logger.log(`Catalog refresh: +${added} new, ${all.length} total`);
    return { added, total: all.length, newCommodities: added };
  }

  async setShow(id: string, show: boolean) {
    const c = await this.prisma.commodity.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Commodity not found');
    await this.prisma.commodity.update({ where: { id }, data: { showOnDashboard: show, isNew: false } });
    // force an immediate fetch so the dashboard populates right away
    if (show) await this.forceFetch();
    // trade flows follow the watched set: rebuild the supplier map if this commodity has an HS code
    // (fire-and-forget — Comtrade calls take a few seconds and shouldn't block the toggle)
    if (c.hsCode) {
      this.suppliers.refreshAll().catch((e) => this.logger.error(`supplier auto-refresh failed: ${e.message}`));
    }
    return { id, showOnDashboard: show };
  }

  // re-run FAO + World Bank sources; fetchers read the catalog, so newly-enabled commodities get pulled
  private async forceFetch() {
    const sources = await this.prisma.dataSource.findMany({ where: { shortName: { in: ['FAO', 'WorldBank'] } } });
    for (const s of sources) {
      try { await this.ingestion.runSource(s.id); } catch (e: any) { this.logger.error(`forceFetch ${s.shortName}: ${e.message}`); }
    }
  }

  // ── source probes ──
  private async fetchFaoFoodItems(): Promise<{ code: string; label: string }[]> {
    const token = await this.faoToken();
    const res = await fetch('https://faostatservices.fao.org/api/v1/en/codes/items/PP', {
      headers: { 'User-Agent': UA, Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`FAO items HTTP ${res.status}`);
    const data = ((await res.json()) as any).data || [];
    return data.filter((x: any) => !NON_FOOD.test(x.label)).map((x: any) => ({ code: String(x.code), label: x.label }));
  }

  private async probeFaoYearly(): Promise<Set<string>> {
    const rows = await this.prisma.commodity.findMany({ where: { faoItemCode: { not: null } }, select: { faoItemCode: true } });
    const codes = [...new Set(rows.map((r) => r.faoItemCode as string))];
    const token = await this.faoToken();
    const now = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => now - 1 - i).join(',');
    const withData = new Set<string>();
    for (let i = 0; i < codes.length; i += 40) {
      const chunk = codes.slice(i, i + 40).join(',');
      const res = await fetch(
        `https://faostatservices.fao.org/api/v1/en/data/PP?item=${chunk}&element=5532&year=${years}&format=json`,
        { headers: { 'User-Agent': UA, Accept: 'application/json', Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) continue;
      const data = ((await res.json()) as any).data || [];
      for (const r of data) if (Number.isFinite(Number(r.Value))) withData.add(String(r['Item Code']));
    }
    return withData;
  }

  private async probeWorldBankColumns(): Promise<Set<string>> {
    const src = await this.prisma.dataSource.findFirst({ where: { shortName: 'WorldBank' } });
    const url = (src?.config as any)?.url;
    if (!url) return new Set();
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return new Set();
    const wb = XLSX.read(Buffer.from(await res.arrayBuffer()), { type: 'buffer' });
    const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets['Monthly Prices'], { header: 1, blankrows: false });
    const headerIdx = rows.findIndex((r) => r?.some((c) => norm(c) === 'wheat, us hrw'));
    if (headerIdx < 0) return new Set();
    const header = rows[headerIdx];
    const dataRows = rows.slice(headerIdx + 2);
    // latest period across the file, keep columns with data in the last 12 months
    let maxIdx = 0;
    const perCol: Record<number, number> = {};
    for (const r of dataRows) {
      const mt = String(r?.[0] ?? '').match(/^(\d{4})M(\d{2})$/);
      if (!mt) continue;
      const idx = Number(mt[1]) * 12 + Number(mt[2]);
      maxIdx = Math.max(maxIdx, idx);
      for (let c = 1; c < header.length; c++) if (Number.isFinite(Number(r[c]))) perCol[c] = Math.max(perCol[c] || 0, idx);
    }
    const fresh = new Set<string>();
    for (let c = 1; c < header.length; c++) if ((perCol[c] || 0) > maxIdx - 12) fresh.add(norm(header[c]));
    return fresh;
  }

  private async faoToken(): Promise<string> {
    const user = process.env.FAO_USERNAME?.trim();
    const pass = process.env.FAO_PASSWORD?.trim();
    if (!user || !pass) throw new Error('FAO_USERNAME/FAO_PASSWORD not set');
    const res = await fetch('https://faostatservices.fao.org/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: new URLSearchParams({ username: user, password: pass }).toString(),
    });
    if (!res.ok) throw new Error(`FAO login HTTP ${res.status}`);
    return ((await res.json()) as any)?.AuthenticationResult?.AccessToken;
  }
}
