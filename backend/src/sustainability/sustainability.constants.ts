// Sustainability sourcing lens. Virtual water = the freshwater embedded in imported food ("KSA
// imports water through food"), the most material sustainability metric for a water-scarce nation.

// Virtual water content, m³ per tonne — global averages (Water Footprint Network / Mekonnen & Hoekstra).
export const VIRTUAL_WATER_M3_PER_T: Record<string, number> = {
  Wheat: 1827, Rice: 2497, Barley: 1423, Corn: 1222, Soybean: 2145,
  'Palm Oil': 4971, Sugar: 1782, Chicken: 4325, Beef: 15415, 'Milk Powder': 4745,
};

// KSA total renewable water resources ≈ 2.4 billion m³/yr (FAO AQUASTAT) — the scarcity denominator.
export const KSA_RENEWABLE_WATER_M3 = 2.4e9;

// Sea-freight carbon intensity — bulk carrier ≈ 0.008 kg CO₂ per tonne-km.
export const FREIGHT_KG_CO2_PER_T_KM = 0.008;

// KSA main discharge port (Jeddah, Red Sea) for food-miles distance.
export const KSA_PORT = { lat: 21.49, lon: 39.19 };

// Origin coordinates (crop/export regions) for the major suppliers — reused for the distance proxy.
// ponytail: same curated set as the climate overlay; long-tail suppliers get no CO₂ estimate (blank).
export const ORIGIN_COORDS: Record<string, [number, number]> = {
  BR: [-13.5, -56], IN: [28, 77], AR: [-34, -61], RU: [47, 41], ID: [0, 101],
  RO: [44.5, 27], US: [42, -93], AU: [-33, 147], FR: [48, 2], UA: [49, 32],
  CA: [51, -106], TH: [15, 100], PK: [31, 72], EG: [30.8, 31], TR: [38, 33],
  DE: [52, 11], NL: [52, 5], PL: [52, 19], UY: [-33, -57], BG: [43.5, 25],
  NZ: [-43.7, 172], ES: [39, -4], IT: [45, 9], SD: [14.4, 33], ET: [9, 38],
  ZA: [-28, 27], MX: [25, -108], VN: [10, 105.7], KZ: [52, 67], GB: [52, -1],
};

// great-circle distance (km)
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
