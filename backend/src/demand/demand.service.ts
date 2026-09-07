import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KSA_AREA, SS_COMMODITIES, EL_PRODUCTION, EL_DOMESTIC_SUPPLY } from '../self-sufficiency/self-sufficiency.constants';
import { DEMAND_ASSUMPTIONS_KEY, DEFAULT_ASSUMPTIONS, DemandAssumptions, RAMADAN_PROFILE, DEFICIT_THRESHOLD } from './demand.constants';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Computes a 12-month KSA demand projection per commodity: FAO FBS consumption baseline shaped by
// deterministic Ramadan/Hajj seasonality (via the built-in Hijri calendar) and population growth,
// then compared to steady supply (production + imports) to flag surplus/deficit months.
@Injectable()
export class DemandService implements OnModuleInit {
  private logger = new Logger('DemandService');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.refresh().catch((e) => this.logger.error(`initial demand refresh failed: ${e.message}`));
  }

  // ── assumptions (tunable, persisted; reviewable by GASTAT/SAGO) ──
  async getAssumptions(): Promise<DemandAssumptions> {
    const row = await this.prisma.appConfig.findUnique({ where: { key: DEMAND_ASSUMPTIONS_KEY } });
    return { ...DEFAULT_ASSUMPTIONS, ...((row?.value as any) || {}) };
  }
  async setAssumptions(input: Partial<DemandAssumptions>): Promise<DemandAssumptions> {
    const merged = { ...(await this.getAssumptions()), ...input };
    for (const k of ['ramadanUpliftPct', 'hajjUpliftPct', 'populationGrowthPct'] as const) {
      if (!Number.isFinite(merged[k]) || merged[k] < 0 || merged[k] > 200) throw new BadRequestException(`${k} must be 0–200`);
    }
    await this.prisma.appConfig.upsert({ where: { key: DEMAND_ASSUMPTIONS_KEY }, create: { key: DEMAND_ASSUMPTIONS_KEY, value: merged }, update: { value: merged } });
    return merged;
  }

  // ── read: baselines + computed 12-month projection ──
  async list() {
    const [baselines, assumptions] = await Promise.all([this.prisma.demandBaseline.findMany(), this.getAssumptions()]);
    const commodities = baselines.map((b) => this.project(b, assumptions));
    return { assumptions, commodities };
  }

  private project(b: any, a: DemandAssumptions) {
    const monthlyBase = b.annualConsumptionMt / 12;
    const monthlySupply = (b.annualProductionMt + b.annualImportsMt) / 12;
    const ramUplift = (RAMADAN_PROFILE[b.commodity] ?? a.ramadanUpliftPct) / 100;
    const now = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
      const { ramadan, hajj } = this.seasonFractions(d);
      const seasonal = 1 + ramadan * ramUplift + hajj * (a.hajjUpliftPct / 100);
      const growth = Math.pow(1 + a.populationGrowthPct / 100, i / 12);
      const demand = Math.round(monthlyBase * seasonal * growth);
      const balance = Math.round(monthlySupply - demand);
      months.push({
        month: d.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        demand, supply: Math.round(monthlySupply), balance,
        deficit: monthlySupply < demand * DEFICIT_THRESHOLD,
        ramadan: ramadan > 0.15, hajj: hajj > 0.05,
      });
    }
    const peak = months.reduce((m, x) => (x.demand > m.demand ? x : m), months[0]);
    return {
      commodity: b.commodity,
      annualConsumptionMt: b.annualConsumptionMt, annualProductionMt: b.annualProductionMt, annualImportsMt: b.annualImportsMt,
      selfSufficiencyPct: b.annualConsumptionMt ? Math.round((b.annualProductionMt / b.annualConsumptionMt) * 100) : 0,
      months, peakMonth: peak.month, deficitMonths: months.filter((m) => m.deficit).map((m) => m.month),
    };
  }

  // fraction of a Gregorian month's days that fall in Ramadan (Hijri month 9) and in the
  // Hajj window (Hijri month 12, days 1–13), from the built-in Islamic calendar.
  private seasonFractions(monthStart: Date): { ramadan: number; hajj: number } {
    const y = monthStart.getUTCFullYear(), m = monthStart.getUTCMonth();
    const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
    let ram = 0, hajj = 0;
    for (let day = 1; day <= days; day++) {
      const parts = fmt.formatToParts(new Date(Date.UTC(y, m, day, 12)));
      const hMonth = Number(parts.find((p) => p.type === 'month')!.value);
      const hDay = Number(parts.find((p) => p.type === 'day')!.value);
      if (hMonth === 9) ram++;
      if (hMonth === 12 && hDay <= 13) hajj++;
    }
    return { ramadan: ram / days, hajj: hajj / days };
  }

  // ── refresh baselines from FAO FBS (consumption/production) + Comtrade imports ──
  async refresh() {
    const consumption = await this.faoFbs(EL_DOMESTIC_SUPPLY);
    const production = await this.faoFbs(EL_PRODUCTION);
    const imports = await this.importsByCommodity();
    let updated = 0;
    for (const c of SS_COMMODITIES) {
      const cons = consumption.get(c.fbsItem);
      if (cons == null) continue;
      const data = {
        commodity: c.name,
        annualConsumptionMt: Math.round(cons * 1000),           // FBS is in 1000 t
        annualProductionMt: Math.round((production.get(c.fbsItem) ?? 0) * 1000),
        annualImportsMt: Math.round(imports.get(c.name) ?? 0),
        year: new Date().getUTCFullYear() - 2,
      };
      await this.prisma.demandBaseline.upsert({ where: { commodity: c.name }, create: data, update: data });
      updated++;
    }
    this.logger.log(`Demand baselines refreshed for ${updated} commodities (FAO FBS + Comtrade)`);
    return { updated };
  }

  // fbsItem -> latest value for one FBS element (KSA). NB: never send an `element` filter — FAOSTAT
  // returns 0 rows with it; fetch all elements and filter client-side.
  private async faoFbs(element: string): Promise<Map<string, number>> {
    const token = await this.faoToken();
    const items = SS_COMMODITIES.map((c) => c.fbsItem).join(',');
    const now = new Date().getFullYear();
    const years = Array.from({ length: 4 }, (_, i) => now - 2 - i).join(',');
    const res = await fetch(`https://faostatservices.fao.org/api/v1/en/data/FBS?area=${KSA_AREA}&item=${items}&year=${years}&format=json`, {
      headers: { 'User-Agent': UA, Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`FBS ${res.status}`);
    const rows = (((await res.json()) as any).data || []).filter((r: any) => r['Element Code'] === element);
    const latest = new Map<string, { year: number; val: number }>();
    for (const r of rows) {
      const item = String(r['Item Code']); const yr = Number(r.Year); const v = Number(r.Value);
      if (!Number.isFinite(v)) continue;
      const cur = latest.get(item);
      if (!cur || yr > cur.year) latest.set(item, { year: yr, val: v });
    }
    return new Map([...latest].map(([k, { val }]) => [k, val]));
  }

  // commodity -> annual import MT, summed from the stored Comtrade supplier breakdown
  private async importsByCommodity(): Promise<Map<string, number>> {
    const rows = await this.prisma.supplierCountry.findMany({ select: { breakdown: true } });
    const out = new Map<string, number>();
    for (const r of rows) for (const b of (r.breakdown as any[]) || []) {
      if (b?.commodity && Number.isFinite(b.volumeMt)) out.set(b.commodity, (out.get(b.commodity) || 0) + b.volumeMt);
    }
    return out;
  }

  private async faoToken(): Promise<string> {
    const user = process.env.FAO_USERNAME?.trim(); const pass = process.env.FAO_PASSWORD?.trim();
    if (!user || !pass) throw new Error('FAO creds not set');
    const res = await fetch('https://faostatservices.fao.org/api/v1/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: new URLSearchParams({ username: user, password: pass }).toString(),
    });
    if (!res.ok) throw new Error(`FAO login ${res.status}`);
    return ((await res.json()) as any)?.AuthenticationResult?.AccessToken;
  }
}
