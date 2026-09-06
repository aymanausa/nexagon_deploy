import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Fetcher } from './fetchers/fetcher.interface';
import { FaoPricesFetcher } from './fetchers/fao-prices.fetcher';
import { WorldBankPricesFetcher } from './fetchers/worldbank-prices.fetcher';

// Default ingestion config attached to the seeded FAO DataSource row on boot.
const FAO_ENDPOINT = 'https://faostatservices.fao.org/api/v1/';
const FAO_DEFAULT_CONFIG = {
  provider: 'fao',
  intervalMinutes: 1440,
  sarPerUsd: 3.75,
  element: '5532', // Producer Price (USD/tonne)
  // No fixed area: prices are aggregated (averaged) across all reporting countries,
  // since commodities like palm oil are produced in only a handful of nations.
  items: [
    { code: '15', name: 'Wheat' },
    { code: '27', name: 'Rice' },
    { code: '44', name: 'Barley' },
    { code: '56', name: 'Corn' },
    { code: '236', name: 'Soybean' },
    { code: '257', name: 'Palm Oil' },
    { code: '156', name: 'Sugar' },
    { code: '1058', name: 'Chicken' },
    { code: '867', name: 'Beef' },
    { code: '882', name: 'Milk Powder' }, // FAO producer price is Raw milk of cattle (nearest available)
  ],
};

// World Bank "Pink Sheet" monthly prices. URL rotates monthly — edit here / in the DB row when it 404s.
const WB_URL =
  'https://thedocs.worldbank.org/en/doc/18675f1d1639c7a34d463f59263ba0a2-0050012025/related/CMO-Historical-Data-Monthly.xlsx';
const WB_DEFAULT_CONFIG = {
  provider: 'worldbank',
  intervalMinutes: 1440,
  sarPerUsd: 3.75,
  url: WB_URL,
  sheet: 'Monthly Prices',
  months: 12,
  // Pink Sheet column header -> our commodity name + unit (no dairy in the Pink Sheet, so no Milk Powder)
  map: [
    { col: 'Wheat, US HRW', name: 'Wheat', unit: '$/mt' },
    { col: 'Rice, Thai 5%', name: 'Rice', unit: '$/mt' },
    { col: 'Barley', name: 'Barley', unit: '$/mt' },
    { col: 'Maize', name: 'Corn', unit: '$/mt' },
    { col: 'Soybeans', name: 'Soybean', unit: '$/mt' },
    { col: 'Sugar, world', name: 'Sugar', unit: '$/kg' },
    { col: 'Palm oil', name: 'Palm Oil', unit: '$/mt' },
    { col: 'Chicken', name: 'Chicken', unit: '$/kg' },
    { col: 'Beef', name: 'Beef', unit: '$/kg' },
  ],
};

@Injectable()
export class IngestionService implements OnModuleInit {
  private logger = new Logger('IngestionService');
  // registry: config.provider -> fetcher. Add a source = register one fetcher here.
  private fetchers: Record<string, Fetcher>;

  constructor(private prisma: PrismaService, fao: FaoPricesFetcher, worldbank: WorldBankPricesFetcher) {
    this.fetchers = { fao, worldbank };
  }

  // Attach default ingestion config to the existing FAO row (create if missing).
  // Never overwrites an already-configured row — DB stays source of truth after first boot.
  async onModuleInit() {
    const faoRows = await this.prisma.dataSource.findMany({ where: { shortName: 'FAO' } });
    if (faoRows.length === 0) {
      await this.prisma.dataSource.create({
        data: {
          name: 'FAO (Food and Agriculture Organization)',
          shortName: 'FAO',
          category: 'INTERNATIONAL',
          apiEndpoint: FAO_ENDPOINT,
          updateFrequency: 'Daily',
          config: FAO_DEFAULT_CONFIG,
        },
      });
      this.logger.log('Created FAO data source with ingestion config');
      return;
    }
    // seed.ts has no idempotency guard so FAO can appear multiple times. Normalise every
    // row to the canonical host + config so any of them is runnable. This is a
    // code-owned seeded source, so overwriting its config on boot is intentional.
    await this.prisma.dataSource.updateMany({
      where: { shortName: 'FAO' },
      data: { apiEndpoint: FAO_ENDPOINT, config: FAO_DEFAULT_CONFIG },
    });
    this.logger.log(`Normalised ${faoRows.length} FAO data source row(s) to ${FAO_ENDPOINT}`);

    await this.ensureWorldBankSource();
  }

  // Create/normalise the World Bank Pink Sheet source (code-owned defaults).
  private async ensureWorldBankSource() {
    const rows = await this.prisma.dataSource.findMany({ where: { shortName: 'WorldBank' } });
    if (rows.length === 0) {
      await this.prisma.dataSource.create({
        data: {
          name: 'World Bank (Pink Sheet)',
          shortName: 'WorldBank',
          category: 'INTERNATIONAL',
          apiEndpoint: WB_URL,
          updateFrequency: 'Monthly',
          config: WB_DEFAULT_CONFIG,
        },
      });
      this.logger.log('Created World Bank data source with ingestion config');
    } else {
      await this.prisma.dataSource.updateMany({
        where: { shortName: 'WorldBank' },
        data: { apiEndpoint: WB_URL, config: WB_DEFAULT_CONFIG },
      });
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sweep() {
    const sources = await this.prisma.dataSource.findMany();
    const now = Date.now();
    for (const s of sources) {
      const cfg = s.config as any;
      if (!cfg?.provider || !this.fetchers[cfg.provider]) continue;
      const intervalMs = (cfg.intervalMinutes || 1440) * 60_000;
      if (now - new Date(s.lastUpdate).getTime() < intervalMs) continue; // not due yet
      await this.runSource(s.id);
    }
  }

  // Runs one source, records health, and never throws from the sweep path.
  async runSource(id: string): Promise<{ written: number }> {
    const source = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('Data source not found');
    const provider = (source.config as any)?.provider;
    const fetcher = provider && this.fetchers[provider];
    if (!fetcher) throw new NotFoundException(`No fetcher registered for provider "${provider}"`);

    const started = Date.now();
    try {
      const written = await fetcher.run(source);
      await this.prisma.dataSource.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          latencyMs: Date.now() - started,
          lastUpdate: new Date(),
          errorRate: 0,
          recordsCount: source.recordsCount + written,
        },
      });
      return { written };
    } catch (err: any) {
      this.logger.error(`Source ${source.shortName} failed: ${err.message}`);
      await this.prisma.dataSource.update({
        where: { id },
        data: { status: 'DEGRADED', latencyMs: Date.now() - started, errorRate: source.errorRate + 1 },
      });
      return { written: 0 };
    }
  }
}
