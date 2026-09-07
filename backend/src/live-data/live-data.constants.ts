// Registry of the live datasets we ingest and where each is used. Curated lineage:
// add an entry (with its providers + consumers) when a new live feed is wired.
// ponytail: hand-maintained lineage; fine at this scale.
export interface LiveDataset {
  key: string;
  name: string;
  category: string;
  description: string;
  providers: { provider: string; name: string; sourceTag: string; granularity: string; note?: string; countModel?: 'commodityPrice' | 'selfSufficiency' | 'stockLevel' | 'supplier' | 'supplierRisk' | 'supplierClimate' | 'supplierDisease' | 'supplierFoodSafety' | 'supplierHealthExp' | 'newsSignal' }[];
  consumers: { module: string; path: string; note: string }[];
}

export const LIVE_DATASETS: LiveDataset[] = [
  {
    key: 'commodity-prices',
    name: 'Commodity Prices',
    category: 'Markets',
    description: 'Producer & market prices for tracked food commodities.',
    providers: [
      { provider: 'fao', name: 'FAO (FAOSTAT)', sourceTag: 'FAO', granularity: 'Annual · producer prices', note: 'Averaged across reporting countries' },
      { provider: 'worldbank', name: 'World Bank (Pink Sheet)', sourceTag: 'WorldBank', granularity: 'Monthly · market prices', note: 'Global benchmark quotes' },
    ],
    consumers: [
      { module: 'Commodity Prices', path: '/commodities', note: 'Cards + monthly/yearly trend' },
      { module: 'Procurement', path: '/procurement', note: 'Price forecast → buy/hold/defer timing' },
      { module: 'Dashboard Overview', path: '/dashboard', note: 'KPIs & latest prices' },
      { module: 'AI Insights', path: '/commodities', note: 'Right-panel insights' },
      { module: 'Settings', path: '/settings', note: 'Dashboard Commodities catalog' },
      { module: 'Risk Heatmap', path: '/risk-heatmap', note: 'Access › Affordability sub-indicator' },
    ],
  },
  {
    key: 'self-sufficiency',
    name: 'Self-Sufficiency',
    category: 'Food Security',
    description: 'KSA vs GCC self-sufficiency ratios (production ÷ domestic supply).',
    providers: [
      { provider: 'fao-fbs', name: 'FAO (Food Balance Sheets)', sourceTag: '', granularity: 'Annual · production vs supply', note: 'Saudi Arabia + GCC', countModel: 'selfSufficiency' },
    ],
    consumers: [
      { module: 'Dashboard Overview', path: '/dashboard', note: 'Self-Sufficiency Radar' },
      { module: 'AI Insights', path: '/dashboard', note: 'Radar explanation' },
      { module: 'Risk Heatmap', path: '/risk-heatmap', note: 'Availability › Production sub-indicator' },
    ],
  },
  {
    key: 'stock-levels',
    name: 'Strategic Reserves',
    category: 'Food Security',
    description: 'Grain reserve ending stocks & days of supply.',
    providers: [
      { provider: 'usda-psd', name: 'USDA (PSD)', sourceTag: '', granularity: 'Annual · ending stocks', note: 'Saudi Arabia', countModel: 'stockLevel' },
    ],
    consumers: [
      { module: 'Stock Levels', path: '/stock-levels', note: 'Reserve levels & days of supply' },
      { module: 'AI Insights', path: '/stock-levels', note: 'Reserve insights' },
      { module: 'Risk Heatmap', path: '/risk-heatmap', note: 'Availability › Reserves sub-indicator' },
      { module: 'Procurement', path: '/procurement', note: 'Reserve buffer → buy urgency' },
    ],
  },
  {
    key: 'suppliers',
    name: 'Supplier Countries',
    category: 'Trade',
    description: 'KSA food-import flows by partner country (share, volume, commodities).',
    providers: [
      { provider: 'comtrade', name: 'UN Comtrade', sourceTag: '', granularity: 'Annual · imports by partner', note: 'Saudi Arabia, tracked HS food codes', countModel: 'supplier' },
      { provider: 'wgi', name: 'World Bank WGI', sourceTag: '', granularity: 'Annual · governance scores', note: 'Political & economic risk overlay', countModel: 'supplierRisk' },
      { provider: 'nasapower', name: 'NASA POWER', sourceTag: '', granularity: 'Monthly · crop-region weather', note: 'Climate stress (drought + heat) overlay', countModel: 'supplierClimate' },
      { provider: 'empresi', name: 'FAO EMPRES-i', sourceTag: '', granularity: 'Event · animal disease (90d)', note: 'HPAI/ASF/FMD → export-ban risk', countModel: 'supplierDisease' },
      { provider: 'rasff', name: 'EU RASFF', sourceTag: '', granularity: 'Event · food-safety alerts', note: 'Recent alerts by origin country (unofficial endpoint)', countModel: 'supplierFoodSafety' },
      { provider: 'wb-health', name: 'World Bank (Health)', sourceTag: '', granularity: 'Annual · health expenditure %GDP', note: 'System-capacity proxy', countModel: 'supplierHealthExp' },
    ],
    consumers: [
      { module: 'Suppliers', path: '/suppliers', note: 'Map + top supplier table + risk, climate & country-health overlays' },
      { module: 'Risk Heatmap', path: '/risk-heatmap', note: 'GeoRisk, Climate, SupplyChain, FoodSafety, ImportCapacity sub-indicators' },
      { module: 'AI Insights', path: '/suppliers', note: 'Supplier insights' },
      { module: 'Procurement', path: '/procurement', note: 'Risk-adjusted origin ranking' },
    ],
  },
  {
    key: 'news-signals',
    name: 'News Signals',
    category: 'Intelligence',
    description: 'World food-security news classified by Claude into KSA-relevant signals.',
    providers: [
      { provider: 'gdelt', name: 'GDELT + Claude', sourceTag: '', granularity: 'Continuous · classified headlines', note: 'Export bans, drought, logistics, disease, prices', countModel: 'newsSignal' },
    ],
    consumers: [
      { module: 'Live News', path: '/news', note: 'Signal feed + daily AI brief' },
      { module: 'AI Insights', path: '/news', note: 'Leading-indicator signals' },
    ],
  },
];
