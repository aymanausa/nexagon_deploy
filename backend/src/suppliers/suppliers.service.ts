import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  COMTRADE_BASE, COMTRADE_PARTNER_AREAS, KSA_REPORTER, FLOW_IMPORT,
  CANDIDATE_YEARS, flagEmoji, WGI_BASE, WGI_POLITICAL, WGI_ECONOMIC, riskBand,
  NASA_POWER_CLIMATOLOGY, NASA_POWER_MONTHLY, CROP_COORDS, CLIMATE_TOP_N, climateBand,
  EMPRESI_API, EMPRESI_SQL, RASFF_SEARCH, RASFF_PAGE_SIZE, RASFF_MAX, WB_HEALTH_EXP,
  EMPRESI_NAME_ALIAS, normCountry, healthScoreOf, healthBand,
} from './suppliers.constants';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// split a CSV line honouring double-quoted fields (EMPRES-i location strings contain commas)
function splitCsv(line: string): string[] {
  const out: string[] = []; let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

interface PartnerRef { name: string; iso2: string; iso3: string; isGroup: boolean }

// Ingests KSA food-import flows from UN Comtrade and normalises them into SupplierCountry.
@Injectable()
export class SuppliersService implements OnModuleInit {
  private logger = new Logger('SuppliersService');
  private partners: Map<number, PartnerRef> | null = null;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    if (!process.env.COMTRADE_API_KEY) {
      this.logger.warn('COMTRADE_API_KEY not set — supplier ingestion skipped');
      return;
    }
    this.refreshFull().catch((e) => this.logger.error(`initial supplier refresh failed: ${e.message}`));
  }

  // trade flows first (creates the rows), then enrich with WGI risk scores.
  // Used by the per-toggle auto-refresh — fast, no slow-moving climate calls.
  async refreshAll() {
    const trade = await this.refresh();
    await this.refreshRisk();
    return trade;
  }

  // everything incl. slow-moving overlays (climate, country-health) — boot + admin refresh, not per-toggle
  async refreshFull() {
    const trade = await this.refreshAll();
    await this.refreshClimate();
    await this.refreshHealth();
    return trade;
  }

  // Country-health overlay: animal disease (EMPRES-i) + food-safety alerts (RASFF) + health capacity (World Bank).
  async refreshHealth() {
    const [disease, alerts, hexp] = await Promise.all([
      this.fetchDiseaseByIso2().catch((e) => { this.logger.warn(`EMPRES-i: ${e.message}`); return null; }),
      this.fetchRasffByIso2().catch((e) => { this.logger.warn(`RASFF: ${e.message}`); return null; }),
      this.fetchWgi(WB_HEALTH_EXP).catch((e) => { this.logger.warn(`WB health-exp: ${e.message}`); return null; }),
    ]);
    const rows = await this.prisma.supplierCountry.findMany();
    let updated = 0;
    for (const s of rows) {
      const events = disease?.get(s.countryCode)?.count ?? null;
      const top = disease?.get(s.countryCode)?.top ?? [];
      const alertN = alerts?.get(s.countryCode) ?? null;
      const he = s.iso3 ? hexp?.get(s.iso3) ?? null : null;
      if (events == null && alertN == null && he == null) continue;
      const score = healthScoreOf(events, alertN, he);
      await this.prisma.supplierCountry.update({
        where: { id: s.id },
        data: {
          diseaseEvents90d: events, diseaseTop: top,
          foodSafetyAlerts: alertN,
          healthExpPctGdp: he != null ? Math.round(he * 100) / 100 : null,
          healthScore: score,
        },
      });
      updated++;
    }
    this.logger.log(`Supplier country-health refreshed: ${updated} countries (EMPRES-i + RASFF + World Bank)`);
    return { updated };
  }

  // ISO2 -> { count, top diseases } of confirmed animal-disease events in the last 90 days (FAO EMPRES-i CSV)
  private async fetchDiseaseByIso2(): Promise<Map<string, { count: number; top: string[] }>> {
    const end = new Date();
    const start = new Date(end.getTime() - 90 * 864e5);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const url = `${EMPRESI_API}?sql_url=${EMPRESI_SQL}&country=all&disease=all&diagnosis_status=Confirmed&animal_type=all&start_date=${iso(start)}&end_date=${iso(end)}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csv = await res.text();
    const lines = csv.split(/\r?\n/);
    const header = lines[0].split(',');
    const ci = header.indexOf('country');
    const di = header.indexOf('disease');
    // reuse the Comtrade partner reference (name→iso2) + EMPRES-i aliases to resolve country names
    const refs = await this.partnerRef();
    const normToIso = new Map<string, string>();
    for (const r of refs.values()) if (r.iso2) normToIso.set(normCountry(r.name), r.iso2.toUpperCase());
    const agg = new Map<string, { count: number; diseases: Record<string, number> }>();
    for (let i = 1; i < lines.length; i++) {
      const f = splitCsv(lines[i]);
      if (f.length <= Math.max(ci, di)) continue;
      const norm = normCountry(f[ci]);
      const iso2 = EMPRESI_NAME_ALIAS[norm] || normToIso.get(norm);
      if (!iso2) continue;
      const a = agg.get(iso2) || { count: 0, diseases: {} };
      a.count++;
      const dz = f[di]; if (dz) a.diseases[dz] = (a.diseases[dz] || 0) + 1;
      agg.set(iso2, a);
    }
    const out = new Map<string, { count: number; top: string[] }>();
    for (const [iso2, a] of agg) {
      const top = Object.entries(a.diseases).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([d]) => d);
      out.set(iso2, { count: a.count, top });
    }
    return out;
  }

  // ISO2 origin-country -> count of recent EU RASFF food/feed notifications (unofficial SPA backend)
  private async fetchRasffByIso2(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    let page = 1;
    while ((page - 1) * RASFF_PAGE_SIZE < RASFF_MAX) {
      const body = { parameters: { pageNumber: page, pageSize: RASFF_PAGE_SIZE, sortColumn: 'NOTIFICATION_DATE', sortOrder: 'DESC' } };
      const res = await fetch(RASFF_SEARCH, {
        method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) break;
      const j = (await res.json()) as any;
      const rows = j.notifications || [];
      if (!rows.length) break;
      for (const n of rows) for (const o of n.originCountries || []) {
        const iso2 = (o.isoCode || '').toUpperCase();
        if (iso2) counts.set(iso2, (counts.get(iso2) || 0) + 1);
      }
      if (rows.length < RASFF_PAGE_SIZE) break;
      page++;
    }
    return counts;
  }

  // Growing-season weather stress (drought + heat) per top supplier, from NASA POWER.
  // Compares the trailing ~12 months to the long-term climatology at the crop-region point.
  async refreshClimate() {
    const top = await this.prisma.supplierCountry.findMany({
      orderBy: { shareOfImports: 'desc' },
      take: CLIMATE_TOP_N,
    });
    let updated = 0;
    for (const s of top) {
      const coord = CROP_COORDS[s.countryCode];
      if (!coord) continue; // no curated crop point → leave climate blank
      try {
        const score = await this.climateStress(coord[0], coord[1]);
        if (score == null) continue;
        await this.prisma.supplierCountry.update({
          where: { id: s.id },
          data: { climateScore: score, climateRisk: climateBand(score) },
        });
        updated++;
      } catch (e: any) {
        this.logger.warn(`climate ${s.countryCode}: ${e.message}`);
      }
    }
    this.logger.log(`Supplier climate refreshed: ${updated} countries (NASA POWER)`);
    return { updated };
  }

  // 0-100 stress score at a point: rainfall deficit vs climatology (drought) + heat anomaly.
  private async climateStress(lat: number, lon: number): Promise<number | null> {
    const now = new Date();
    const y = now.getFullYear();
    // NASA POWER monthly lags ~a year; y-2..y-1 is always available. Trailing 12 = most recent full year.
    const [clim, recent] = await Promise.all([
      this.nasaPoint(NASA_POWER_CLIMATOLOGY, lat, lon, ''),
      this.nasaPoint(NASA_POWER_MONTHLY, lat, lon, `&start=${y - 2}&end=${y - 1}`),
    ]);
    if (!clim || !recent) return null;
    const climPrecip = clim.PRECTOTCORR?.ANN;
    const climTemp = clim.T2M?.ANN;
    if (climPrecip == null || climTemp == null) return null;

    // trailing 12 monthly values (skip the yearly '13' aggregate keys and sentinel -999)
    const months = (obj: any) =>
      Object.entries(obj || {})
        .filter(([k, v]) => !k.endsWith('13') && typeof v === 'number' && (v as number) > -900)
        .map(([, v]) => v as number)
        .slice(-12);
    const rp = months(recent.PRECTOTCORR);
    const rt = months(recent.T2M);
    if (!rp.length || !rt.length) return null;
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;

    const precipDeficit = Math.max(0, (climPrecip - mean(rp)) / (climPrecip || 1)); // fraction below normal
    const tempAnomaly = Math.max(0, mean(rt) - climTemp); // °C above normal
    const droughtScore = Math.min(100, (precipDeficit / 0.4) * 100); // 40% below normal = max
    const heatScore = Math.min(100, (tempAnomaly / 2) * 100); // +2°C = max
    return Math.round(0.6 * droughtScore + 0.4 * heatScore);
  }

  private async nasaPoint(base: string, lat: number, lon: number, extra: string): Promise<any> {
    const url = `${base}?parameters=PRECTOTCORR,T2M&community=AG&latitude=${lat}&longitude=${lon}&format=json${extra}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    return ((await res.json()) as any)?.properties?.parameter || null;
  }

  // Enrich supplier rows with World Bank WGI political & economic risk (keyed by ISO3).
  async refreshRisk() {
    const [political, economic] = await Promise.all([
      this.fetchWgi(WGI_POLITICAL),
      this.fetchWgi(WGI_ECONOMIC),
    ]);
    const rows = await this.prisma.supplierCountry.findMany();
    let updated = 0;
    for (const s of rows) {
      if (!s.iso3) continue;
      const pv = political.get(s.iso3);
      const ge = economic.get(s.iso3);
      if (pv == null && ge == null) continue;
      // composite risk 0-100 (higher = riskier) = 100 - avg governance score
      const scores = [pv, ge].filter((v): v is number => v != null);
      const riskScore = Math.round(100 - scores.reduce((a, b) => a + b, 0) / scores.length);
      await this.prisma.supplierCountry.update({
        where: { id: s.id },
        data: {
          politicalRisk: pv != null ? riskBand(pv) : s.politicalRisk,
          economicRisk: ge != null ? riskBand(ge) : s.economicRisk,
          riskScore,
        },
      });
      updated++;
    }
    this.logger.log(`Supplier risk refreshed: ${updated} countries (World Bank WGI)`);
    return { updated };
  }

  // iso3 -> most-recent WGI score (0-100) for one indicator
  // iso3 -> most-recent non-null value for a World Bank indicator. mrv=5 because some
  // indicators (e.g. health expenditure) lag — the latest single year covers few countries.
  private async fetchWgi(indicator: string): Promise<Map<string, number>> {
    const url = `${WGI_BASE}/country/all/indicator/${indicator}?format=json&mrv=5&per_page=2000`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    const best = new Map<string, { v: number; d: number }>();
    if (!res.ok) { this.logger.warn(`WB ${indicator} HTTP ${res.status}`); return new Map(); }
    const body = (await res.json()) as any[];
    for (const r of body?.[1] || []) {
      if (r.value == null || !r.countryiso3code) continue;
      const iso = String(r.countryiso3code).toUpperCase(), d = Number(r.date);
      const cur = best.get(iso);
      if (!cur || d > cur.d) best.set(iso, { v: r.value, d });
    }
    return new Map([...best].map(([k, { v }]) => [k, v]));
  }

  async list() {
    const suppliers = await this.prisma.supplierCountry.findMany({ orderBy: { shareOfImports: 'desc' } });
    return { suppliers, count: suppliers.length };
  }

  // code -> country ref (name, ISO codes, group flag); cached after first fetch
  private async partnerRef(): Promise<Map<number, PartnerRef>> {
    if (this.partners) return this.partners;
    const res = await fetch(COMTRADE_PARTNER_AREAS, { headers: { 'User-Agent': UA } });
    const rows = ((await res.json()) as any).results || [];
    const map = new Map<number, PartnerRef>();
    for (const r of rows) {
      map.set(Number(r.PartnerCode), {
        name: r.PartnerDesc,
        iso2: r.PartnerCodeIsoAlpha2 || '',
        iso3: r.PartnerCodeIsoAlpha3 || '',
        isGroup: !!r.isGroup,
      });
    }
    this.partners = map;
    return map;
  }

  async refresh() {
    const key = process.env.COMTRADE_API_KEY;
    if (!key) throw new Error('COMTRADE_API_KEY not set');
    const refs = await this.partnerRef();

    // follow the watched commodities that have an HS mapping (coherent with the rest of the app)
    const watched = await this.prisma.commodity.findMany({
      where: { showOnDashboard: true, hsCode: { not: null } },
    });
    const hsToName: Record<string, string> = {};
    for (const c of watched) for (const code of c.hsCode!.split(',')) hsToName[code.trim()] = c.name;
    const hsCodes = Object.keys(hsToName).join(',');
    if (!hsCodes) { this.logger.warn('No watched commodities with HS codes — supplier refresh skipped'); return { updated: 0, year: 0 }; }

    // pick the latest year with a healthy row count
    let data: any[] = [];
    let year = 0;
    for (const y of CANDIDATE_YEARS()) {
      const rows = await this.fetchYear(y, key, hsCodes);
      if (rows.length > 20) { data = rows; year = y; break; }
    }
    if (!data.length) throw new Error('Comtrade returned no usable data');

    // aggregate per partner country, keeping a per-commodity breakdown for the map filter
    const byPartner = new Map<number, { usd: number; kg: number; perCommodity: Record<string, { usd: number; kg: number }> }>();
    for (const r of data) {
      const code = Number(r.partnerCode);
      if (!code) continue; // 0 = World
      const ref = refs.get(code);
      if (!ref || ref.isGroup || !ref.iso2) continue; // skip region aggregates / unmapped
      const agg = byPartner.get(code) || { usd: 0, kg: 0, perCommodity: {} };
      agg.usd += r.primaryValue || 0;
      agg.kg += r.netWgt || 0;
      const name = hsToName[String(r.cmdCode)];
      if (name) {
        const pc = agg.perCommodity[name] || { usd: 0, kg: 0 };
        pc.usd += r.primaryValue || 0;
        pc.kg += r.netWgt || 0;
        agg.perCommodity[name] = pc;
      }
      byPartner.set(code, agg);
    }

    const totalUsd = [...byPartner.values()].reduce((s, a) => s + a.usd, 0) || 1;
    const seen: string[] = [];
    for (const [code, agg] of byPartner) {
      const ref = refs.get(code)!;
      const iso2 = ref.iso2.toUpperCase();
      const breakdown = Object.entries(agg.perCommodity)
        .map(([commodity, v]) => ({ commodity, usd: Math.round(v.usd), volumeMt: Math.round(v.kg / 1000) }))
        .sort((a, b) => b.usd - a.usd);
      const data2 = {
        name: ref.name,
        countryCode: iso2,
        iso3: ref.iso3 ? ref.iso3.toUpperCase() : null,
        m49: code,
        flag: flagEmoji(iso2),
        commodities: breakdown.map((b) => b.commodity),
        breakdown,
        shareOfImports: Math.round((agg.usd / totalUsd) * 1000) / 10,
        totalVolumeMt: Math.round(agg.kg / 1000),
        lastUpdated: new Date(),
      };
      await this.prisma.supplierCountry.upsert({
        where: { countryCode: iso2 },
        create: data2,
        update: data2,
      });
      seen.push(iso2);
    }
    // drop partners that fell out of the latest dataset
    await this.prisma.supplierCountry.deleteMany({ where: { countryCode: { notIn: seen } } });
    this.logger.log(`Suppliers refreshed: ${seen.length} partner countries (Comtrade ${year})`);
    return { updated: seen.length, year };
  }

  private async fetchYear(year: number, key: string, hsCodes: string): Promise<any[]> {
    const url = `${COMTRADE_BASE}?reporterCode=${KSA_REPORTER}&flowCode=${FLOW_IMPORT}&period=${year}&cmdCode=${hsCodes}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Ocp-Apim-Subscription-Key': key } });
    if (!res.ok) { this.logger.warn(`Comtrade ${year} HTTP ${res.status}`); return []; }
    return ((await res.json()) as any).data || [];
  }
}
