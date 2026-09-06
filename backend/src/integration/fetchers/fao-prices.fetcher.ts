import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Fetcher } from './fetcher.interface';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

interface FaoConfig {
  element: string;
  sarPerUsd: number;
}

interface FaoRow {
  Year: string;
  Unit: string;
  Value: string | number;
  'Item Code': string;
}

@Injectable()
export class FaoPricesFetcher implements Fetcher {
  private logger = new Logger('FaoPricesFetcher');
  private token: string | null = null; // cached bearer, re-fetched on 401

  constructor(private prisma: PrismaService) {}

  // Get a bearer token: an explicit FAO_ACCESS_TOKEN wins, else log in with
  // username/password. Cached so we don't log in every run.
  private async getToken(base: string, force = false): Promise<string> {
    if (!force && this.token) return this.token;
    const override = process.env.FAO_ACCESS_TOKEN?.trim();
    if (override) {
      this.token = override;
      return override;
    }
    const user = process.env.FAO_USERNAME?.trim();
    const pass = process.env.FAO_PASSWORD?.trim();
    if (!user || !pass) throw new Error('Set FAO_ACCESS_TOKEN, or FAO_USERNAME + FAO_PASSWORD');
    const res = await fetch(`${base}auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': BROWSER_UA },
      body: new URLSearchParams({ username: user, password: pass }).toString(),
    });
    if (!res.ok) throw new Error(`FAO login failed: HTTP ${res.status}`);
    const raw = await res.text();
    // FAO returns Cognito-style { AuthenticationResult: { AccessToken } }; also tolerate
    // {access_token|accessToken|token} or a bare token string.
    let tok = raw.trim().replace(/^"|"$/g, '');
    try {
      const j = JSON.parse(raw);
      tok = j?.AuthenticationResult?.AccessToken || j.access_token || j.accessToken || j.token || tok;
    } catch { /* bare string */ }
    if (!tok) throw new Error('FAO login returned no token');
    this.token = tok;
    return tok;
  }

  // GET with the cached token; on 401, log in fresh once and retry.
  private async authedGet(url: string, base: string): Promise<Response> {
    let token = await this.getToken(base);
    let res = await fetch(url, {
      headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      token = await this.getToken(base, true); // force re-login
      res = await fetch(url, {
        headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
    }
    return res;
  }

  async run(source: DataSource): Promise<number> {
    const cfg = source.config as unknown as FaoConfig;
    // items come from the admin-managed catalog (commodities shown on the dashboard)
    const catalog = await this.prisma.commodity.findMany({
      where: { showOnDashboard: true, faoItemCode: { not: null } },
    });
    const items = catalog.map((c) => ({ code: c.faoItemCode as string, name: c.name }));
    if (items.length === 0) return 0;
    const base = (source.apiEndpoint || 'https://faostatservices.fao.org/api/v1/').replace(/\/?$/, '/');
    const sarPerUsd = cfg.sarPerUsd || 3.75;
    // FAO producer prices are annual and lag ~1-2yr; pull a multi-year window for the trend.
    const now = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => now - i).join(','); // now-6 .. now

    let written = 0;
    for (const item of items) {
      const url = `${base}en/data/PP?item=${item.code}&element=${cfg.element}&year=${years}&format=json`;
      const res = await this.authedGet(url, base);
      if (res.status === 401) throw new Error('FAO auth failed (401) — check FAO_USERNAME/FAO_PASSWORD');
      if (!res.ok) throw new Error(`FAOSTAT HTTP ${res.status}`);
      const rows = ((await res.json()) as { data?: FaoRow[] }).data || [];

      // Aggregate across all reporting countries into one representative price per year.
      const byYear = new Map<string, { sum: number; n: number; unit: string }>();
      for (const r of rows) {
        const v = Number(r.Value);
        if (!Number.isFinite(v)) continue;
        const y = byYear.get(r.Year) || { sum: 0, n: 0, unit: r.Unit };
        y.sum += v;
        y.n += 1;
        byYear.set(r.Year, y);
      }
      const series = [...byYear.entries()]
        .map(([year, a]) => ({ year, price: a.sum / a.n, unit: a.unit }))
        .sort((x, y) => Number(x.year) - Number(y.year)); // oldest -> newest
      if (series.length === 0) continue;

      // Replace this commodity's FAO history so repeated runs stay idempotent.
      await this.prisma.commodityPrice.deleteMany({ where: { source: 'FAO', commodity: item.name } });
      await this.prisma.commodityPrice.createMany({
        data: series.map((s, i) => {
          const prev = series[i - 1];
          const changePercent = prev ? ((s.price - prev.price) / prev.price) * 100 : 0;
          return {
            commodity: item.name,
            priceUsd: Math.round(s.price * 100) / 100,
            priceSar: Math.round(s.price * sarPerUsd * 100) / 100, // ponytail: SAR via fixed peg 3.75
            changePercent: Math.round(changePercent * 100) / 100,
            source: 'FAO',
            metadata: { unit: s.unit, itemCode: item.code, year: s.year, basis: `avg of ${byYear.get(s.year)!.n} countries` },
            recordedAt: new Date(Number(s.year), 0, 1), // Jan 1 of the data year, so the chart plots by year
          };
        }),
      });
      written += series.length;
    }

    if (written === 0) throw new Error('FAOSTAT data had no usable rows for configured items');
    this.logger.log(`Wrote ${written} FAO commodity-price rows (${items.length} commodities)`);
    return written;
    // ponytail: annual global-average producer price; swap to a monthly market source (GIEWS FPMA) for intra-year trends
  }
}
