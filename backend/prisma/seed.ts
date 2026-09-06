import { PrismaClient, UserRole, AlertLevel, AlertCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EWS database...');

  // Idempotency guard: the docker CMD runs this on every boot. Without it, every
  // non-upsert insert below duplicates the whole dataset each start.
  if ((await prisma.dataSource.count()) > 0) {
    console.log('Already seeded — skipping.');
    return;
  }

  // Seed users
  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ews.sa' },
    update: {},
    create: { email: 'admin@ews.sa', password: hashed, fullName: 'System Administrator', role: UserRole.SUPER_ADMIN, permissions: ['*'] },
  });
  await prisma.user.upsert({
    where: { email: 'a.ali@salic.com' },
    update: {},
    create: { email: 'a.ali@salic.com', password: hashed, fullName: 'Dr. Ayman Al-Ali', role: UserRole.INSTITUTION_ADMIN, institution: 'SALIC', department: 'Strategic Planning', permissions: ['dashboard.read','alerts.read','alerts.acknowledge','reports.read','reports.generate','scenarios.read','scenarios.simulate','suppliers.read','prices.read','risk.read','analytics.read','news.read','chat.read'] },
  });

  // Seed alerts
  const alerts = [
    { level: AlertLevel.RED, category: AlertCategory.SUPPLY, title: 'Brazil Export Ban Alert', description: 'Temporary wheat export restriction by Brazilian authorities', source: 'Reuters', metric: 'Wheat Export', currentValue: 0, thresholdValue: 1000, unit: 'MT', recommendedAction: 'Activate alternative suppliers' },
    { level: AlertLevel.AMBER, category: AlertCategory.LOGISTICS, title: 'Bab al-Mandeb Route Congestion', description: '18% increase in transit time through Bab al-Mandeb', source: 'MarineTraffic', metric: 'Transit Time', currentValue: 8.2, thresholdValue: 7.0, unit: 'days', recommendedAction: 'Reroute 30% via Cape of Good Hope' },
    { level: AlertLevel.AMBER, category: AlertCategory.PRICE, title: 'Wheat Price Forecast Updated', description: 'AI model shows +2.3% due to Australian drought', source: 'EWS AI', metric: 'Wheat Price', currentValue: 285, thresholdValue: 280, unit: 'USD/MT', recommendedAction: 'Consider forward contracts' },
    { level: AlertLevel.GREEN, category: AlertCategory.SYSTEM, title: 'System Upgrade Complete', description: 'EWS v9.0 deployed successfully', source: 'System' },
    { level: AlertLevel.GREEN, category: AlertCategory.SUPPLY, title: 'SAGO Strategic Reserve Update', description: 'Wheat reserves at 8.2 months (target: 6)', source: 'SAGO', metric: 'Reserve Months', currentValue: 8.2, thresholdValue: 6.0, unit: 'months' },
  ];
  for (const a of alerts) await prisma.alert.create({ data: a as any });

  // Seed data sources
  const sources = [
    { name: 'FAO (Food and Agriculture Organization)', shortName: 'FAO', category: 'INTERNATIONAL' as any, status: 'ACTIVE' as any, url: 'https://www.fao.org', apiEndpoint: 'https://fenixservices.fao.org/faostat/api/v1/', updateFrequency: 'Daily', uptimePercent: 99.8, latencyMs: 245, reliabilityScore: 98, recordsCount: 45200, errorRate: 0.02 },
    { name: 'USDA (US Agriculture)', shortName: 'USDA', category: 'INTERNATIONAL' as any, status: 'ACTIVE' as any, url: 'https://www.usda.gov', apiEndpoint: 'https://quickstats.nass.usda.gov/api/', updateFrequency: 'Daily', uptimePercent: 99.9, latencyMs: 189, reliabilityScore: 99, recordsCount: 38400, errorRate: 0.01 },
    { name: 'World Bank WITS', shortName: 'WITS', category: 'INTERNATIONAL' as any, status: 'ACTIVE' as any, url: 'https://wits.worldbank.org', apiEndpoint: 'https://wits.worldbank.org/API/V1/', updateFrequency: 'Weekly', uptimePercent: 99.5, latencyMs: 312, reliabilityScore: 96, recordsCount: 21500, errorRate: 0.04 },
    { name: 'SFDA (Saudi Food & Drug)', shortName: 'SFDA', category: 'GOVERNMENT' as any, status: 'ACTIVE' as any, updateFrequency: 'Real-time', uptimePercent: 99.9, latencyMs: 56, reliabilityScore: 99, recordsCount: 67800, errorRate: 0.01 },
    { name: 'GFSA (Food Security Auth)', shortName: 'GFSA', category: 'GOVERNMENT' as any, status: 'ACTIVE' as any, updateFrequency: 'Real-time', uptimePercent: 99.6, latencyMs: 89, reliabilityScore: 98, recordsCount: 52100, errorRate: 0.02 },
    { name: 'Mawani (Saudi Ports)', shortName: 'Mawani', category: 'GOVERNMENT' as any, status: 'WARNING' as any, updateFrequency: 'Real-time', uptimePercent: 97.2, latencyMs: 445, reliabilityScore: 92, recordsCount: 28900, errorRate: 1.2 },
    { name: 'MarineTraffic', shortName: 'MarineTraffic', category: 'SHIPPING' as any, status: 'ACTIVE' as any, updateFrequency: 'Real-time', uptimePercent: 99.3, latencyMs: 356, reliabilityScore: 95, recordsCount: 156000, errorRate: 0.08 },
    { name: "Lloyd's List", shortName: "Lloyd's", category: 'SHIPPING' as any, status: 'DEGRADED' as any, updateFrequency: 'Daily', uptimePercent: 94.5, latencyMs: 892, reliabilityScore: 88, recordsCount: 12300, errorRate: 3.5 },
    { name: 'Reuters News API', shortName: 'Reuters', category: 'NEWS' as any, status: 'ACTIVE' as any, updateFrequency: 'Real-time', uptimePercent: 99.7, latencyMs: 234, reliabilityScore: 98, recordsCount: 45600, errorRate: 0.03 },
    { name: 'Open-Meteo', shortName: 'Open-Meteo', category: 'WEATHER' as any, status: 'ACTIVE' as any, url: 'https://open-meteo.com', apiEndpoint: 'https://api.open-meteo.com/v1/', updateFrequency: 'Hourly', uptimePercent: 99.8, latencyMs: 145, reliabilityScore: 98, recordsCount: 45600, errorRate: 0.02 },
    { name: 'UN Comtrade', shortName: 'UN Comtrade', category: 'INTERNATIONAL' as any, status: 'ERROR' as any, updateFrequency: 'Monthly', uptimePercent: 82.3, latencyMs: 2345, reliabilityScore: 75, recordsCount: 18900, errorRate: 8.5 },
  ];
  for (const s of sources) await prisma.dataSource.create({ data: s });

  // Seed stock levels
  const stocks = [
    { commodity: 'Wheat', currentStockMt: 2850000, targetStockMt: 2100000, daysOfSupply: 247, capacityMt: 3500000, utilizationPercent: 81.4, silosCount: 184, status: 'green' },
    { commodity: 'Rice', currentStockMt: 980000, targetStockMt: 700000, daysOfSupply: 156, capacityMt: 1200000, utilizationPercent: 81.7, silosCount: 92, status: 'green' },
    { commodity: 'Sugar', currentStockMt: 620000, targetStockMt: 450000, daysOfSupply: 189, capacityMt: 800000, utilizationPercent: 77.5, silosCount: 45, status: 'green' },
    { commodity: 'Palm Oil', currentStockMt: 280000, targetStockMt: 200000, daysOfSupply: 134, capacityMt: 400000, utilizationPercent: 70.0, silosCount: 28, status: 'green' },
  ];
  for (const s of stocks) await prisma.stockLevel.create({ data: s });

  // Seed risk domains
  const domains = [
    { name: 'External Trade', description: 'Import/export volumes, tariffs, trade agreements', status: 'green', owner: 'GFSA', indicators: [{name:'Trade Volume',value:78},{name:'Tariff Changes',value:82}], currentScore: 78, targetScore: 90 },
    { name: 'Maritime & Logistics', description: 'Shipping routes, port congestion, freight rates', status: 'amber', owner: 'Mawani', indicators: [{name:'BDI Index',value:62},{name:'Port Wait Time',value:55}], currentScore: 62, targetScore: 85 },
    { name: 'Strategic Reserves', description: 'Wheat, rice, and other commodity reserve levels', status: 'green', owner: 'SAGO', indicators: [{name:'Days of Supply',value:85},{name:'Silo Utilization',value:82}], currentScore: 85, targetScore: 90 },
    { name: 'Production & Water', description: 'Local agricultural output, water availability', status: 'amber', owner: 'MEWA', indicators: [{name:'Rainfall',value:55},{name:'Dam Levels',value:58}], currentScore: 55, targetScore: 80 },
    { name: 'Market Prices', description: 'Global and domestic commodity prices', status: 'amber', owner: 'GFSA', indicators: [{name:'Price Index',value:58},{name:'FX Rate',value:72}], currentScore: 58, targetScore: 80 },
    { name: 'Safety Net', description: 'Subsidy programs, vulnerable population coverage', status: 'green', owner: 'MEWA', indicators: [{name:'Coverage Rate',value:72},{name:'Disbursement Speed',value:78}], currentScore: 72, targetScore: 85 },
    { name: 'Hajj & Umrah', description: 'Food supply for pilgrimage seasons', status: 'green', owner: 'SFDA', indicators: [{name:'Hajj Forecast',value:80},{name:'Food Contracts',value:85}], currentScore: 80, targetScore: 90 },
    { name: 'Retail Inventory', description: 'Supermarket stock levels, supply chain efficiency', status: 'green', owner: 'SFDA', indicators: [{name:'SKU Availability',value:75},{name:'Turnover Rate',value:78}], currentScore: 75, targetScore: 85 },
    { name: 'Macroeconomic', description: 'GDP, inflation, unemployment, fiscal health', status: 'green', owner: 'MOF', indicators: [{name:'Inflation',value:70},{name:'GDP Growth',value:75}], currentScore: 70, targetScore: 80 },
    { name: 'Geopolitical', description: 'Regional conflicts, sanctions, diplomatic relations', status: 'amber', owner: 'NCA', indicators: [{name:'Conflict Index',value:60},{name:'Diplomatic Score',value:68}], currentScore: 60, targetScore: 75 },
    { name: 'Food Security (Overall)', description: 'Composite food security index', status: 'green', owner: 'GFSA', indicators: [{name:'GFSI Score',value:82},{name:'Access Index',value:85}], currentScore: 82, targetScore: 90 },
    { name: 'Cybersecurity', description: 'IT infrastructure, data integrity, system availability', status: 'green', owner: 'NCA', indicators: [{name:'Incidents',value:88},{name:'Recovery Time',value:92}], currentScore: 88, targetScore: 95 },
  ];
  for (const d of domains) await prisma.riskDomain.create({ data: d as any });

  console.log('Seed complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
