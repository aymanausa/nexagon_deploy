// Demand-seasonality engine assumptions. KSA demand is baseline (FAO FBS consumption) plus
// deterministic Islamic-calendar spikes (Ramadan, Hajj). The magnitudes below are ESTIMATES —
// exposed as tunable coefficients so an analyst / GASTAT / SAGO can review and adjust them.
export const DEMAND_ASSUMPTIONS_KEY = 'demand-assumptions';

export interface DemandAssumptions {
  ramadanUpliftPct: number;    // default general food demand rise during Ramadan
  hajjUpliftPct: number;       // national demand rise during the Hajj month (pilgrim influx)
  populationGrowthPct: number; // annual, scales future months
}
export const DEFAULT_ASSUMPTIONS: DemandAssumptions = {
  ramadanUpliftPct: 25,
  hajjUpliftPct: 12,
  populationGrowthPct: 1.6,
};

// Per-commodity Ramadan uplift % (overrides the general default). Estimates pending GASTAT review.
// Staples that spike most during Ramadan (rice, sugar, poultry, red meat) carry higher values.
export const RAMADAN_PROFILE: Record<string, number> = {
  Rice: 35, Sugar: 45, Chicken: 40, Beef: 35, Wheat: 20, Barley: 10, 'Palm Oil': 25, 'Milk Powder': 30,
};

// deficit flag when projected supply covers less than this share of projected demand in a month
export const DEFICIT_THRESHOLD = 0.95;
