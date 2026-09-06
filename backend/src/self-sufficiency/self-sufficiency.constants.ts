// FAO area codes for the GCC; KSA is the focus, the rest form the GCC average.
export const KSA_AREA = '194';
export const GCC_AREAS = ['194', '225', '118', '179', '12', '221']; // Saudi, UAE, Kuwait, Qatar, Bahrain, Oman

// commodity → FAO Food Balance Sheet item code + display category + strategic target (policy input).
// KSA & GCC values are live from FAO FBS; target is a policy goal, not measured data.
export interface SsCommodity { name: string; fbsItem: string; category: string; target: number }
export const SS_COMMODITIES: SsCommodity[] = [
  { name: 'Wheat', fbsItem: '2511', category: 'Grains', target: 20 },
  { name: 'Rice', fbsItem: '2807', category: 'Grains', target: 5 },
  { name: 'Barley', fbsItem: '2513', category: 'Grains', target: 15 },
  { name: 'Palm Oil', fbsItem: '2577', category: 'Oils', target: 5 },
  { name: 'Sugar', fbsItem: '2542', category: 'Softs', target: 40 },
  { name: 'Chicken', fbsItem: '2734', category: 'Livestock', target: 80 },
];

// FBS element codes
export const EL_PRODUCTION = '5511';
export const EL_DOMESTIC_SUPPLY = '5301';
