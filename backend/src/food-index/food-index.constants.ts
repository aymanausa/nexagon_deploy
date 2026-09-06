// 4-pillar KSA food-security composite index. Score 0-100, higher = healthier.
// Weights are fixed by the framework; each pillar re-normalises over its *active* sub-indicators.

export interface Pillar { key: string; label: string; weight: number; target: number }
export interface Indicator { pillar: string; key: string; label: string; weight: number; source: string }

export const PILLARS: Pillar[] = [
  { key: 'availability', label: 'Availability', weight: 0.30, target: 90 },
  { key: 'access', label: 'Access', weight: 0.25, target: 85 },
  { key: 'utilization', label: 'Utilization', weight: 0.20, target: 90 },
  { key: 'stability', label: 'Stability', weight: 0.25, target: 75 },
];

// weight = share within the pillar. source = human label of where the (proxy) data comes from.
export const INDICATORS: Indicator[] = [
  // Availability
  { pillar: 'availability', key: 'production', label: 'Domestic Production', weight: 0.25, source: 'FAOSTAT QCL' },
  { pillar: 'availability', key: 'reserves', label: 'Strategic Reserves', weight: 0.35, source: 'USDA PSD (proxy for SAGO)' },
  { pillar: 'availability', key: 'importCapacity', label: 'Import Capacity', weight: 0.25, source: 'UN Comtrade' },
  { pillar: 'availability', key: 'water', label: 'Water Availability', weight: 0.15, source: 'FAO AQUASTAT (static)' },
  // Access
  { pillar: 'access', key: 'affordability', label: 'Food Affordability', weight: 0.35, source: 'FAO FFPI / World Bank' },
  { pillar: 'access', key: 'safetyNet', label: 'Safety Net Coverage', weight: 0.25, source: 'pending (WB ASPIRE)' },
  { pillar: 'access', key: 'retailOsa', label: 'Retail On-Shelf Availability', weight: 0.25, source: 'pending (retail POS)' },
  { pillar: 'access', key: 'macroPower', label: 'Macro Purchasing Power', weight: 0.15, source: 'World Bank' },
  // Utilization
  { pillar: 'utilization', key: 'foodSafety', label: 'Food Safety Compliance', weight: 0.30, source: 'EU RASFF (proxy for SFDA)' },
  { pillar: 'utilization', key: 'nutrition', label: 'Nutritional Adequacy', weight: 0.25, source: 'FAOSTAT FS suite' },
  { pillar: 'utilization', key: 'diversity', label: 'Dietary Diversity', weight: 0.20, source: 'FAOSTAT FBS' },
  { pillar: 'utilization', key: 'healthCapacity', label: 'Health System Capacity', weight: 0.25, source: 'World Bank' },
  // Stability
  { pillar: 'stability', key: 'geoRisk', label: 'Geopolitical Risk', weight: 0.30, source: 'World Bank WGI' },
  { pillar: 'stability', key: 'climateVol', label: 'Climate Volatility', weight: 0.25, source: 'NASA POWER' },
  { pillar: 'stability', key: 'supplyChain', label: 'Supply Chain Integrity', weight: 0.30, source: 'UN Comtrade' },
  { pillar: 'stability', key: 'cyberResilience', label: 'Cyber Resilience', weight: 0.15, source: 'pending (NCA ECC)' },
];

export const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
