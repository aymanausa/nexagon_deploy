// National KSA fetchers for the food-security index sub-indicators that come from free
// public sources (FAOSTAT, World Bank). Each returns { score 0-100, raw } or null (→ pending).
// ponytail: best-effort; a failed fetch degrades one sub-indicator, never the whole index.
import { clamp } from './food-index.constants';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const KSA_FAO = '194'; // FAOSTAT area code
const WB = 'https://api.worldbank.org/v2/country/SAU/indicator';

export interface Sub { score: number; raw: string }

async function faoToken(): Promise<string> {
  const user = process.env.FAO_USERNAME?.trim();
  const pass = process.env.FAO_PASSWORD?.trim();
  if (!user || !pass) throw new Error('FAO creds not set');
  const res = await fetch('https://faostatservices.fao.org/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: new URLSearchParams({ username: user, password: pass }).toString(),
  });
  if (!res.ok) throw new Error(`FAO login ${res.status}`);
  return ((await res.json()) as any)?.AuthenticationResult?.AccessToken;
}

async function faoData(domain: string, params: string, token: string): Promise<any[]> {
  // NB: never pass an `element` filter — FAOSTAT domains return 0 rows with it; filter client-side.
  const res = await fetch(`https://faostatservices.fao.org/api/v1/en/data/${domain}?area=${KSA_FAO}&${params}&format=json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`FAO ${domain} ${res.status}`);
  return ((await res.json()) as any).data || [];
}

async function wbLatest(indicator: string): Promise<number | null> {
  const res = await fetch(`${WB}/${indicator}?format=json&mrv=5&per_page=10`, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const body = (await res.json()) as any[];
  for (const r of body?.[1] || []) if (r.value != null) return r.value; // newest-first
  return null;
}

// ── Availability: Domestic Production (3-yr CAGR of total KSA production, FAOSTAT QCL) ──
export async function productionSub(): Promise<Sub | null> {
  try {
    const token = await faoToken();
    const now = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => now - 2 - i).join(','); // recent available window
    const rows = await faoData('QCL', `year=${years}`, token);
    const byYear: Record<number, number> = {};
    for (const r of rows) {
      if (r['Element Code'] !== '5510') continue; // Production (tonnes)
      const y = Number(r.Year); const v = Number(r.Value);
      if (Number.isFinite(y) && Number.isFinite(v)) byYear[y] = (byYear[y] || 0) + v;
    }
    const ys = Object.keys(byYear).map(Number).sort();
    if (ys.length < 2) return null;
    const first = byYear[ys[0]], last = byYear[ys[ys.length - 1]], span = ys[ys.length - 1] - ys[0];
    if (!first || span < 1) return null;
    const cagr = (Math.pow(last / first, 1 / span) - 1) * 100; // %/yr
    return { score: clamp(50 + cagr * 5), raw: `${cagr.toFixed(1)}%/yr production CAGR (${ys[0]}–${ys[ys.length - 1]})` };
  } catch { return null; }
}

// ── Utilization: Dietary Diversity (Shannon index over FBS food-supply items) ──
export async function diversitySub(): Promise<Sub | null> {
  try {
    const token = await faoToken();
    const now = new Date().getFullYear();
    const years = Array.from({ length: 4 }, (_, i) => now - 2 - i).join(',');
    const rows = await faoData('FBS', `year=${years}`, token);
    // element 645 = Food supply quantity (kg/capita/yr); take the latest year present
    const supply = rows.filter((r) => r['Element Code'] === '645' && Number(r.Value) > 0);
    if (!supply.length) return null;
    const latest = Math.max(...supply.map((r) => Number(r.Year)));
    const items = supply.filter((r) => Number(r.Year) === latest).map((r) => Number(r.Value));
    const total = items.reduce((a, b) => a + b, 0);
    if (total <= 0 || items.length < 2) return null;
    const H = -items.reduce((s, v) => { const p = v / total; return s + (p > 0 ? p * Math.log(p) : 0); }, 0);
    const norm = H / Math.log(items.length); // 0..1
    return { score: clamp(norm * 100), raw: `Shannon diversity ${norm.toFixed(2)} over ${items.length} food groups (${latest})` };
  } catch { return null; }
}

// ── Utilization: Nutritional Adequacy (FAO FS suite — avg dietary energy supply adequacy %) ──
export async function nutritionSub(): Promise<Sub | null> {
  try {
    const token = await faoToken();
    const now = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => now - 2 - i).join(',');
    const rows = await faoData('FS', `year=${years}`, token);
    // Item = Average dietary energy supply adequacy (%); take latest. FS "Year" is a 3-yr range
    // label like "2020-2022" → sort by its trailing year.
    const endYear = (r: any) => Number(String(r.Year).slice(-4));
    const adesa = rows
      .filter((r) => /dietary energy supply adequacy/i.test(r.Item || '') && Number(r.Value) > 0)
      .sort((a, b) => endYear(b) - endYear(a))[0];
    if (!adesa) return null;
    const v = Number(adesa.Value); // ~100 = adequate, >100 = surplus
    return { score: clamp(v - 32), raw: `Dietary energy supply adequacy ${v}% (${String(adesa.Year).slice(-4)})` };
  } catch { return null; }
}

// ── Utilization: Health System Capacity (World Bank health-exp %GDP + hospital beds/1k) ──
export async function healthCapacitySub(): Promise<Sub | null> {
  try {
    const [hexp, beds] = await Promise.all([wbLatest('SH.XPD.CHEX.GD.ZS'), wbLatest('SH.MED.BEDS.ZS')]);
    if (hexp == null && beds == null) return null;
    const parts: number[] = [];
    if (hexp != null) parts.push(clamp((hexp / 8) * 100));   // 8% GDP = full
    if (beds != null) parts.push(clamp((beds / 4) * 100));   // 4 beds/1k = full
    const score = parts.reduce((a, b) => a + b, 0) / parts.length;
    return { score, raw: `${hexp != null ? `health spend ${hexp.toFixed(1)}% GDP` : ''}${hexp != null && beds != null ? ', ' : ''}${beds != null ? `${beds.toFixed(1)} beds/1k` : ''}` };
  } catch { return null; }
}

// ── Access: Macro Purchasing Power (World Bank GDP growth + FX reserves) ──
export async function macroPowerSub(): Promise<Sub | null> {
  try {
    const [growth, reserves] = await Promise.all([wbLatest('NY.GDP.MKTP.KD.ZG'), wbLatest('FI.RES.TOTL.CD')]);
    if (growth == null && reserves == null) return null;
    const parts: number[] = [];
    if (growth != null) parts.push(clamp(50 + growth * 5));            // +10%/yr → 100
    if (reserves != null) parts.push(clamp((reserves / 6e11) * 100));  // $600B → 100
    const score = 0.6 * (parts[0] ?? 0) + (parts.length > 1 ? 0.4 * parts[1] : 0);
    const denom = (growth != null ? 0.6 : 0) + (reserves != null ? 0.4 : 0);
    return {
      score: clamp(score / (denom || 1)),
      raw: `${growth != null ? `GDP growth ${growth.toFixed(1)}%` : ''}${growth != null && reserves != null ? ', ' : ''}${reserves != null ? `reserves $${(reserves / 1e9).toFixed(0)}B` : ''}`,
    };
  } catch { return null; }
}

// ── Access: Food Affordability (FAO Food Price Index 12m change; higher prices = less affordable) ──
// Primary: FAO FFPI xlsx. Fallback handled by the service using our commodityPrice basket.
export async function affordabilitySub(): Promise<Sub | null> {
  try {
    const res = await fetch('https://www.fao.org/images/worldfood/FoodPriceIndexNominal.csv', { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const text = await res.text();
    const rows = text.split(/\r?\n/).map((l) => l.split(',')).filter((c) => /^\d{4}-\d{2}/.test(c[0] || ''));
    if (rows.length < 13) return null;
    const idxCol = 1; // Food Price Index column
    const latest = Number(rows[rows.length - 1][idxCol]);
    const yearAgo = Number(rows[rows.length - 13][idxCol]);
    if (!Number.isFinite(latest) || !Number.isFinite(yearAgo) || !yearAgo) return null;
    const pct = ((latest - yearAgo) / yearAgo) * 100;
    return { score: clamp(100 - pct * 2.5), raw: `FAO Food Price Index ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% y/y` };
  } catch { return null; }
}

// ── Availability: Water (FAO AQUASTAT total renewable water per capita — KSA is critically scarce) ──
// Static value: KSA ~75 m³/cap/yr (world's lowest tier; scarcity line 1000, absolute scarcity 500).
export function waterSub(): Sub {
  const perCapita = 75;
  return { score: clamp((perCapita / 1000) * 100), raw: `~${perCapita} m³ renewable water/capita/yr (AQUASTAT, extreme scarcity)` };
}
