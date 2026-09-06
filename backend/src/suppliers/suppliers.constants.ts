// UN Comtrade (comtradeapi.un.org) — Saudi food-import trade flows by partner country.
export const COMTRADE_BASE = 'https://comtradeapi.un.org/data/v1/get/C/A/HS';
export const COMTRADE_PARTNER_AREAS = 'https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json';
export const KSA_REPORTER = '682'; // Saudi Arabia (M49)
export const FLOW_IMPORT = 'M';

// HS codes + commodity names are now read live from the watched catalog (Commodity.hsCode),
// so Suppliers follows whatever's enabled on the dashboard.

// years to try (descending); first with a healthy row count wins — skips sparse partial years
export const CANDIDATE_YEARS = (): number[] => {
  const y = new Date().getFullYear();
  return [y - 1, y - 2, y - 3];
};

// World Bank Worldwide Governance Indicators (WGI) — political & economic risk overlay.
// .SC codes are 0-100 percentile scores (higher = better governance = lower risk).
export const WGI_BASE = 'https://api.worldbank.org/v2';
export const WGI_POLITICAL = 'GOV_WGI_PV.SC'; // Political Stability & Absence of Violence
export const WGI_ECONOMIC = 'GOV_WGI_GE.SC';  // Government Effectiveness (economic-governance proxy)

// governance score (0-100, higher = better) -> risk band
export function riskBand(score: number): string {
  if (score >= 60) return 'low';
  if (score >= 40) return 'medium';
  return 'high';
}

// NASA POWER — growing-season weather stress (drought + heat) at each supplier's main crop region.
export const NASA_POWER_CLIMATOLOGY = 'https://power.larc.nasa.gov/api/temporal/climatology/point';
export const NASA_POWER_MONTHLY = 'https://power.larc.nasa.gov/api/temporal/monthly/point';

// Curated crop-region coordinates (lat, lon) for the major KSA food suppliers — a country
// centroid is misleading (Brazil's centroid isn't the soy belt), so we point at the breadbasket.
// ponytail: top exporters only; long-tail suppliers get no climate score (blank) until curated.
export const CROP_COORDS: Record<string, [number, number]> = {
  BR: [-13.5, -56], IN: [28, 77], AR: [-34, -61], RU: [47, 41], ID: [0, 101],
  RO: [44.5, 27], US: [42, -93], AU: [-33, 147], FR: [48, 2], UA: [49, 32],
  CA: [51, -106], TH: [15, 100], PK: [31, 72], EG: [30.8, 31], TR: [38, 33],
  DE: [52, 11], NL: [52, 5], PL: [52, 19], UY: [-33, -57], BG: [43.5, 25],
  NZ: [-43.7, 172], ES: [39, -4], IT: [45, 9], SD: [14.4, 33], ET: [9, 38],
  ZA: [-28, 27], MX: [25, -108], VN: [10, 105.7], KZ: [52, 67], GB: [52, -1],
};

// how many top suppliers (by import share) to compute climate for — bounds NASA POWER calls
export const CLIMATE_TOP_N = 30;

// ── Country-health overlay ──
// FAO EMPRES-i — confirmed animal-disease events (HPAI/ASF/FMD etc.) → export-ban risk.
export const EMPRESI_API = 'https://api.data.apps.fao.org/api/v2/bigquery';
export const EMPRESI_SQL = 'https://data.apps.fao.org/catalog/dataset/3ff164cd-8b44-46d3-8f88-92b0361c7878/resource/137a69a0-ad5f-48c3-b927-3a61d2c9a2ce/download/animal-major-disease-parameterized-query.sql';
// EU RASFF food/feed alerts — unofficial SPA backend (may change without notice).
// The endpoint hard-caps pageSize at 10 and ignores unknown filters, so we scan a bounded
// window of the most-recent notifications and count by origin country (a recent-alerts sample,
// not a full-year track record). ponytail: proper per-country filter needs the internal
// country-ID DTO reverse-engineered — deferred.
export const RASFF_SEARCH = 'https://webgate.ec.europa.eu/rasff-window/backend/public/notification/search/consolidated/en/';
export const RASFF_PAGE_SIZE = 10; // endpoint's hard cap
export const RASFF_MAX = 1000;      // 100 pages of the most-recent notifications
// World Bank current health expenditure % of GDP — system-capacity proxy (same API as WGI).
export const WB_HEALTH_EXP = 'SH.XPD.CHEX.GD.ZS';

// EMPRES-i uses full FAO country names; map the ones that don't normalise to a Comtrade name → ISO2.
export const EMPRESI_NAME_ALIAS: Record<string, string> = {
  'united states of america': 'US', 'viet nam': 'VN', 'russian federation': 'RU',
  'netherlands': 'NL', 'lao peoples democratic republic': 'LA', 'republic of korea': 'KR',
  'korea republic of': 'KR', 'iran islamic republic of': 'IR', 'tanzania united republic of': 'TZ',
  'bolivia plurinational state of': 'BO', 'moldova republic of': 'MD', 'syrian arab republic': 'SY',
  'turkiye': 'TR', 'turkey': 'TR', 'czechia': 'CZ', 'cote divoire': 'CI',
  'united kingdom of great britain and northern ireland': 'GB', 'united kingdom': 'GB',
  'venezuela bolivarian republic of': 'VE',
};

// normalise a country name for loose matching (lowercase, strip accents/parentheticals/punct)
export function normCountry(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
}

// composite 0-100 country-health risk (higher = worse) from the three sub-signals (any may be absent)
export function healthScoreOf(events: number | null, alerts: number | null, hexp: number | null): number | null {
  const parts: [number, number][] = []; // [component 0-100, weight]
  if (events != null) parts.push([Math.min(100, (events / 30) * 100), 0.45]);        // 30+ events/90d = max
  if (alerts != null) parts.push([Math.min(100, (alerts / 40) * 100), 0.30]);         // 40+ recent alerts = max
  if (hexp != null) parts.push([Math.max(0, Math.min(100, ((10 - hexp) / 10) * 100)), 0.25]); // <=0% = max, >=10% = 0
  if (!parts.length) return null;
  const wsum = parts.reduce((s, [, w]) => s + w, 0);
  return Math.round(parts.reduce((s, [v, w]) => s + v * w, 0) / wsum);
}

export function healthBand(score: number): string {
  if (score >= 55) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// climate stress score (0-100, higher = worse) -> band
export function climateBand(score: number): string {
  if (score >= 60) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

// flag emoji from ISO alpha-2 (regional indicator symbols)
export function flagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '';
  return String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
