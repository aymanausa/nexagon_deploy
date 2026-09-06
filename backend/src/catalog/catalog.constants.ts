// Curated core commodities seeded on boot. The original 10 are shown by default;
// the rest give admins an immediate richer catalog. A refresh pulls the full FAO
// food list on top of these.
export interface CoreCommodity {
  name: string;
  category: string;
  faoItemCode: string;
  wbColumn: string | null; // World Bank Pink Sheet column, null = no monthly source
  hsCode?: string | null;  // HS 4-digit code(s) for Comtrade trade flows, comma-separated; null = no clean mapping
}

// original 10 that ship visible on the dashboard
export const DEFAULT_VISIBLE = new Set([
  'Wheat', 'Rice', 'Barley', 'Corn', 'Soybean', 'Palm Oil', 'Sugar', 'Chicken', 'Beef', 'Milk Powder',
]);

export const CORE_COMMODITIES: CoreCommodity[] = [
  { name: 'Wheat', category: 'Grains', faoItemCode: '15', wbColumn: 'Wheat, US HRW', hsCode: '1001' },
  { name: 'Rice', category: 'Grains', faoItemCode: '27', wbColumn: 'Rice, Thai 5%', hsCode: '1006' },
  { name: 'Barley', category: 'Grains', faoItemCode: '44', wbColumn: null, hsCode: '1003' }, // WB discontinued ~2020
  { name: 'Corn', category: 'Grains', faoItemCode: '56', wbColumn: 'Maize', hsCode: '1005' },
  { name: 'Sorghum', category: 'Grains', faoItemCode: '83', wbColumn: 'Sorghum', hsCode: '1007' },
  { name: 'Oats', category: 'Grains', faoItemCode: '75', wbColumn: null, hsCode: '1004' },
  { name: 'Millet', category: 'Grains', faoItemCode: '79', wbColumn: null, hsCode: '1008' },
  { name: 'Soybean', category: 'Oilseeds', faoItemCode: '236', wbColumn: 'Soybeans', hsCode: '1201' },
  { name: 'Groundnuts', category: 'Oilseeds', faoItemCode: '242', wbColumn: 'Groundnuts', hsCode: '1202' },
  { name: 'Sunflower Seed', category: 'Oilseeds', faoItemCode: '267', wbColumn: null, hsCode: '1206' },
  { name: 'Rapeseed', category: 'Oilseeds', faoItemCode: '270', wbColumn: null, hsCode: '1205' },
  { name: 'Palm Oil', category: 'Oils', faoItemCode: '257', wbColumn: 'Palm oil', hsCode: '1511' },
  { name: 'Olives', category: 'Oils', faoItemCode: '260', wbColumn: null, hsCode: '1509' }, // olive oil
  { name: 'Beef', category: 'Livestock', faoItemCode: '867', wbColumn: 'Beef', hsCode: '0201,0202' },
  { name: 'Chicken', category: 'Livestock', faoItemCode: '1058', wbColumn: 'Chicken', hsCode: '0207' },
  { name: 'Lamb', category: 'Livestock', faoItemCode: '977', wbColumn: 'Lamb', hsCode: '0204' },
  { name: 'Pork', category: 'Livestock', faoItemCode: '1035', wbColumn: null, hsCode: '0203' },
  { name: 'Milk Powder', category: 'Dairy', faoItemCode: '882', wbColumn: null, hsCode: '0402' },
  { name: 'Sugar', category: 'Softs', faoItemCode: '156', wbColumn: 'Sugar, world', hsCode: '1701' },
  { name: 'Coffee', category: 'Softs', faoItemCode: '656', wbColumn: 'Coffee, Arabica', hsCode: '0901' },
  { name: 'Cocoa', category: 'Softs', faoItemCode: '661', wbColumn: 'Cocoa', hsCode: '1801' },
  { name: 'Tea', category: 'Softs', faoItemCode: '667', wbColumn: 'Tea, avg 3 auctions', hsCode: '0902' },
  { name: 'Banana', category: 'Fruits', faoItemCode: '486', wbColumn: 'Banana, US', hsCode: '0803' },
  { name: 'Orange', category: 'Fruits', faoItemCode: '490', wbColumn: 'Orange', hsCode: '0805' },
  { name: 'Apple', category: 'Fruits', faoItemCode: '515', wbColumn: null, hsCode: '0808' },
  { name: 'Grapes', category: 'Fruits', faoItemCode: '560', wbColumn: null, hsCode: '0806' },
  { name: 'Potato', category: 'Vegetables', faoItemCode: '116', wbColumn: null, hsCode: '0701' },
  { name: 'Tomato', category: 'Vegetables', faoItemCode: '388', wbColumn: null, hsCode: '0702' },
];

// FAO item code -> World Bank column, for auto-mapping monthly onto items discovered by a refresh.
export const FAO_TO_WB: Record<string, string> = Object.fromEntries(
  CORE_COMMODITIES.filter((c) => c.wbColumn).map((c) => [c.faoItemCode, c.wbColumn as string]),
);

// exclude non-food PP items when pulling the FAO catalog
export const NON_FOOD =
  /hemp|fibre|fiber|tobacco|rubber|silk|jute|sisal|kapok|coir|flax|hop\b|manila|abaca|agave|hide|skin|wool|beeswax|gutta|balata|guayule|pyrethrum|ramie|stillingia|tallow|jojoba|castor|\(biological\)|n\.e\.c\.|nes\b/i;

// crude category guess for items discovered by a refresh
const CAT: [RegExp, string][] = [
  [/wheat|rice|maize|corn|barley|sorghum|millet|oat|rye|fonio|triticale|quinoa|buckwheat|cereal|canary|mixed grain/i, 'Grains'],
  [/soya|soybean|sunflower|rape|colza|groundnut|sesame|linseed|safflower|mustard|melonseed|poppy|karite|tung|oil seed/i, 'Oilseeds'],
  [/palm|olive|coconut|copra/i, 'Oils'],
  [/meat|cattle|chicken|pig|pork|sheep|lamb|goat|buffalo|camel|horse|duck|goose|turkey|rabbit|game|egg|snail|honey/i, 'Livestock'],
  [/milk/i, 'Dairy'],
  [/sugar/i, 'Softs'],
  [/coffee|cocoa|tea|mate|vanilla|cinnamon|clove|ginger|nutmeg|pepper|chilli|spice|anise/i, 'Softs'],
  [/banana|orange|apple|grape|mango|pineapple|lemon|lime|pear|peach|plum|cherry|berry|melon|fig|date|kiwi|papaya|avocado|citrus|fruit|plantain|pomelo|grapefruit|tangerine|persimmon|quince|watermelon|currant|gooseberry|cranberry|apricot/i, 'Fruits'],
  [/almond|cashew|walnut|hazelnut|pistachio|chestnut|brazil|pecan|\bnut|kola|areca/i, 'Nuts'],
  [/tomato|potato|onion|garlic|cabbage|carrot|lettuce|spinach|\bpea|bean|lentil|chickpea|pumpkin|cucumber|eggplant|okra|mushroom|leek|cauliflower|broccoli|artichoke|asparagus|vegetable|taro|yam|cassava|sweet potato|pulse|lupin|vetch/i, 'Vegetables'],
];
export const categoryFor = (label: string): string => CAT.find(([re]) => re.test(label))?.[1] ?? 'Other';
