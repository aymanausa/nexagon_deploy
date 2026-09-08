// Scenario Simulator — what-if stress tests. A template declares typed shocks that are applied
// to in-memory copies of live baselines; the service re-runs our own index/demand/procurement
// computations to show before→after impact. KSA-relevant, first-order shocks.

export interface Shocks {
  suppliersOffline?: string[];              // ISO2 codes whose import share is removed
  importCutPct?: Record<string, number>;    // commodity → % import reduction
  productionCutPct?: Record<string, number>;
  priceShockPct?: Record<string, number>;   // commodity → % price rise
  demandSurgePct?: number;                   // global demand rise (e.g. Hajj)
  transitDelayDays?: number;                 // narrative + supply-chain penalty
}

export interface ScenarioTemplate {
  key: string;
  name: string;
  category: string;
  severity: 'moderate' | 'high' | 'severe';
  description: string;
  triggerEvent: string;
  impactedCommodities: string[];
  shocks: Shocks;
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    key: 'red-sea-closure',
    name: 'Red Sea / Bab-el-Mandeb Closure',
    category: 'Logistics',
    severity: 'severe',
    description: 'Shipping through the Red Sea to Jeddah is blocked; cargoes reroute around Africa (+2 weeks), squeezing sea-borne grain supply.',
    triggerEvent: 'Escalation closes the Bab-el-Mandeb strait / Suez approaches.',
    impactedCommodities: ['Wheat', 'Rice', 'Barley', 'Corn'],
    shocks: { importCutPct: { Wheat: 20, Rice: 20, Barley: 20, Corn: 20 }, transitDelayDays: 14 },
  },
  {
    key: 'hormuz-dammam',
    name: 'Hormuz / Dammam Corridor Disruption',
    category: 'Logistics',
    severity: 'high',
    description: 'Tension in the Strait of Hormuz disrupts Arabian Gulf shipments into Dammam.',
    triggerEvent: 'Restricted maritime access near the Strait of Hormuz.',
    impactedCommodities: ['Rice'],
    shocks: { importCutPct: { Rice: 25 }, transitDelayDays: 10 },
  },
  {
    key: 'india-rice-ban',
    name: 'India Rice Export Ban',
    category: 'Trade Policy',
    severity: 'high',
    description: "India — a dominant rice supplier — halts exports, cutting KSA rice imports sharply.",
    triggerEvent: 'India extends a non-basmati rice export ban.',
    impactedCommodities: ['Rice'],
    shocks: { suppliersOffline: ['IN'], importCutPct: { Rice: 40 } },
  },
  {
    key: 'black-sea-disruption',
    name: 'Black Sea Grain Disruption',
    category: 'Geopolitical',
    severity: 'severe',
    description: 'Conflict/blockade takes Black Sea wheat & barley exporters (Russia, Ukraine, Romania) offline.',
    triggerEvent: 'Black Sea export corridor collapses.',
    impactedCommodities: ['Wheat', 'Barley'],
    shocks: { suppliersOffline: ['RU', 'UA', 'RO'], importCutPct: { Wheat: 30, Barley: 30 } },
  },
  {
    key: 'brazil-drought',
    name: 'Brazil Drought',
    category: 'Climate',
    severity: 'high',
    description: 'Severe drought cuts Brazilian output, hitting sugar and poultry-feed supply from a top KSA origin.',
    triggerEvent: 'Prolonged drought across Brazil’s crop belt.',
    impactedCommodities: ['Sugar', 'Chicken'],
    shocks: { suppliersOffline: ['BR'], productionCutPct: { Sugar: 15 }, priceShockPct: { Sugar: 20, Chicken: 12 } },
  },
  {
    key: 'hajj-surge',
    name: 'Peak Hajj / Umrah Surge',
    category: 'Demand',
    severity: 'moderate',
    description: 'A record pilgrimage season lifts national food demand beyond the usual seasonal uplift.',
    triggerEvent: 'Record Hajj + Umrah attendance.',
    impactedCommodities: ['Rice', 'Chicken', 'Wheat', 'Sugar'],
    shocks: { demandSurgePct: 15 },
  },
];

export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
