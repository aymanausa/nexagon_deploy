// Procurement optimizer — tunable config. Synthesises demand, price forecast, reserves,
// supplier cost/risk and news into a buy/hold/defer call. Rule-based & auditable.
export const PROCUREMENT_CONFIG_KEY = 'procurement-config';

export interface ProcurementConfig {
  leadTimeWeeks: number;      // how far ahead a deficit/peak must be to trigger pre-positioning
  priceSlopeThreshold: number; // % change vs latest that counts as "rising"/"falling"
  minForecastConfidence: number; // R² below which we treat the price trend as flat/uncertain
  reserveWatchDays: number;   // reserves below this → push BUY
}
export const DEFAULT_CONFIG: ProcurementConfig = {
  leadTimeWeeks: 8,
  priceSlopeThreshold: 2,     // ±2% projected move = meaningful
  minForecastConfidence: 0.3, // R²
  reserveWatchDays: 60,
};

export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
