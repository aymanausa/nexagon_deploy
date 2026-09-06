import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KSA_AREA, GCC_AREAS, SS_COMMODITIES, EL_PRODUCTION, EL_DOMESTIC_SUPPLY } from './self-sufficiency.constants';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Self-sufficiency ratios from FAO Food Balance Sheets: SSR = production / domestic supply.
@Injectable()
export class SelfSufficiencyService implements OnModuleInit {
  private logger = new Logger('SelfSufficiencyService');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // ensure the radar always has data, then refresh from FAO in the background
    if ((await this.prisma.selfSufficiency.count()) === 0) {
      for (const c of SS_COMMODITIES) {
        await this.prisma.selfSufficiency.create({ data: { commodity: c.name, category: c.category, target: c.target } });
      }
    }
    this.refresh().catch((e) => this.logger.error(`initial SSR refresh failed: ${e.message}`));
  }

  async list() {
    const order = SS_COMMODITIES.map((c) => c.name);
    const rows = await this.prisma.selfSufficiency.findMany();
    rows.sort((a, b) => order.indexOf(a.commodity) - order.indexOf(b.commodity));
    return { commodities: rows };
  }

  // Pull FBS for the GCC, compute SSR per commodity for KSA and the GCC average, and store.
  async refresh() {
    const token = await this.faoToken();
    const items = SS_COMMODITIES.map((c) => c.fbsItem).join(',');
    const years = [2018, 2019, 2020, 2021, 2022].join(',');
    // NOTE: FBS breaks if an `element` filter is sent — fetch all elements and filter here.
    const url = `https://faostatservices.fao.org/api/v1/en/data/FBS?area=${GCC_AREAS.join(',')}&item=${items}&year=${years}&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`FBS HTTP ${res.status}`);
    const data = ((await res.json()) as any).data || [];

    // index: item|area|year -> {prod, supply}
    const rec: Record<string, { y: number; prod?: number; supply?: number }> = {};
    for (const r of data) {
      const k = `${r['Item Code']}|${r['Area Code']}|${r.Year}`;
      const e = (rec[k] = rec[k] || { y: Number(r.Year) });
      if (r['Element Code'] === EL_PRODUCTION) e.prod = Number(r.Value);
      if (r['Element Code'] === EL_DOMESTIC_SUPPLY) e.supply = Number(r.Value);
    }
    // latest SSR per item|area (production may be absent → treated as 0 when supply exists)
    const ssr: Record<string, { y: number; val: number }> = {};
    for (const k in rec) {
      const m = rec[k];
      if (!m.supply) continue;
      const val = Math.min(100, Math.round(((m.prod || 0) / m.supply) * 1000) / 10);
      const [item, area] = k.split('|');
      const kk = `${item}|${area}`;
      if (!ssr[kk] || m.y > ssr[kk].y) ssr[kk] = { y: m.y, val };
    }

    let updated = 0;
    for (const c of SS_COMMODITIES) {
      const ksa = ssr[`${c.fbsItem}|${KSA_AREA}`];
      const gccVals = GCC_AREAS.filter((a) => a !== KSA_AREA)
        .map((a) => ssr[`${c.fbsItem}|${a}`]?.val)
        .filter((v): v is number => v != null);
      const gcc = gccVals.length ? Math.round((gccVals.reduce((a, b) => a + b, 0) / gccVals.length) * 10) / 10 : null;
      await this.prisma.selfSufficiency.upsert({
        where: { commodity: c.name },
        update: { ksa: ksa?.val ?? null, gcc, year: ksa?.y ?? null, category: c.category, target: c.target },
        create: { commodity: c.name, category: c.category, target: c.target, ksa: ksa?.val ?? null, gcc, year: ksa?.y ?? null },
      });
      updated++;
    }
    this.logger.log(`Self-sufficiency refreshed for ${updated} commodities`);
    return { updated };
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
