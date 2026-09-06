// USDA PSD (Production, Supply & Distribution) — keyless bulk CSV of ending stocks.
export const PSD_GRAINS_URL = 'https://apps.fas.usda.gov/psdonline/downloads/psd_grains_pulses_csv.zip';
export const PSD_GRAINS_CSV = 'psd_grains_pulses.csv';
export const SAUDI_CODE = 'SA';
export const ATTR_ENDING_STOCKS = '176';
export const ATTR_DOMESTIC_CONSUMPTION = '125';

// Status colour bands by days of supply. No universal standard — national reserves use
// months of consumption (~90d working min, ~180d strategic buffer); admin-tunable in Settings.
export const THRESHOLDS_KEY = 'stock-level-thresholds';
export const DEFAULT_THRESHOLDS = { adequateDays: 90, watchDays: 45 };
export interface StockThresholds { adequateDays: number; watchDays: number }

// Grains Saudi actually stockpiles. Ending stocks + days-of-supply are live from USDA;
// target / capacity / silos have no open source — configured estimates.
export interface StockCommodity { name: string; psd: string; target: number; capacity: number; silos: number }
export const STOCK_COMMODITIES: StockCommodity[] = [
  { name: 'Wheat', psd: 'Wheat', target: 3_500_000, capacity: 4_500_000, silos: 184 },
  { name: 'Rice', psd: 'Rice, Milled', target: 1_200_000, capacity: 1_500_000, silos: 92 },
  { name: 'Barley', psd: 'Barley', target: 1_800_000, capacity: 2_200_000, silos: 110 },
  { name: 'Corn', psd: 'Corn', target: 2_000_000, capacity: 2_500_000, silos: 80 },
];
