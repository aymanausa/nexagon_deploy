// GDELT DOC 2.0 API — free global news. Rate-limited to ~1 request / 5s, so we run a small
// set of themed queries sequentially rather than one-per-commodity.
export const GDELT_DOC = 'https://api.gdeltproject.org/api/v2/doc/doc';
export const GDELT_GAP_MS = 10000; // GDELT throttles aggressively — space calls out generously

// Themed queries covering the food-security shock types that move KSA imports.
// Kept broad; Claude does the precise commodity/country/severity classification downstream.
// Two broad queries keep GDELT pressure low (it throttles hard). Claude does the fine classification.
export const NEWS_QUERIES: { theme: string; query: string }[] = [
  { theme: 'supply-shocks', query: '(wheat OR rice OR corn OR maize OR soybean OR "palm oil" OR sugar OR barley OR grain OR poultry) ("export ban" OR "export restriction" OR tariff OR drought OR "harvest failure" OR flood OR shortage OR "food prices" OR "price surge")' },
  { theme: 'logistics-disease', query: '(grain OR food OR shipping OR freight OR poultry OR livestock) ("Red Sea" OR Suez OR "port congestion" OR "port strike" OR "shipping delay" OR blockade OR "bird flu" OR "avian influenza" OR "African swine fever")' },
];

export const EVENT_TYPES = ['export-ban', 'drought', 'conflict', 'logistics', 'policy', 'disease', 'price', 'other'] as const;

// Context handed to the classifier so it scores relevance from KSA's perspective.
export const KSA_CONTEXT =
  'Saudi Arabia imports ~80% of its food. Top suppliers: Brazil, India, Argentina, Russia, ' +
  'Romania, Ukraine, Australia, USA, Indonesia (palm oil). Tracked commodities: Wheat, Rice, ' +
  'Barley, Corn, Soybean, Palm Oil, Sugar, Chicken, Beef, Milk Powder. Key routes: Red Sea / ' +
  'Bab-el-Mandeb / Suez into Jeddah, and the Arabian Gulf into Dammam.';

export const RELEVANCE_MIN = 40; // drop signals below this KSA-relevance score
