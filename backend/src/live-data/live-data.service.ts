import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LIVE_DATASETS } from './live-data.constants';

// Enriches the curated dataset registry with live health (from DataSource) and
// real record counts (from the ingested rows).
@Injectable()
export class LiveDataService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const sources = await this.prisma.dataSource.findMany();
    const datasets = await Promise.all(
      LIVE_DATASETS.map(async (ds) => {
        const providers = await Promise.all(
          ds.providers.map(async (p) => {
            // datasets sourced outside the integration DataSource table (e.g. FAO FBS)
            if (p.countModel === 'selfSufficiency') {
              const rows = await this.prisma.selfSufficiency.findMany();
              const withData = rows.filter((r) => r.ksa != null);
              return {
                name: p.name, granularity: p.granularity, note: p.note,
                status: withData.length ? 'ACTIVE' : 'DEGRADED',
                updateFrequency: 'Quarterly',
                lastUpdate: rows.reduce<Date | null>((m, r) => (!m || r.updatedAt > m ? r.updatedAt : m), null),
                endpoint: 'https://faostatservices.fao.org/api/v1/en/data/FBS',
                records: rows.length,
                commodities: rows.length,
              };
            }
            if (p.countModel === 'stockLevel') {
              const rows = await this.prisma.stockLevel.findMany();
              return {
                name: p.name, granularity: p.granularity, note: p.note,
                status: rows.length ? 'ACTIVE' : 'DEGRADED',
                updateFrequency: 'Monthly',
                lastUpdate: rows.reduce<Date | null>((m, r) => (!m || r.recordedAt > m ? r.recordedAt : m), null),
                endpoint: 'https://apps.fas.usda.gov/psdonline',
                records: rows.length,
                commodities: rows.length,
              };
            }
            if (p.countModel === 'supplier') {
              const rows = await this.prisma.supplierCountry.findMany();
              return {
                name: p.name, granularity: p.granularity, note: p.note,
                status: rows.length ? 'ACTIVE' : 'DEGRADED',
                updateFrequency: 'Annual',
                lastUpdate: rows.reduce<Date | null>((m, r) => (!m || r.lastUpdated > m ? r.lastUpdated : m), null),
                endpoint: 'https://comtradeapi.un.org',
                records: rows.length,
                commodities: rows.length,
              };
            }
            if (p.countModel === 'supplierRisk') {
              const scored = await this.prisma.supplierCountry.count({ where: { riskScore: { gt: 0 } } });
              return {
                name: p.name, granularity: p.granularity, note: p.note,
                status: scored ? 'ACTIVE' : 'DEGRADED',
                updateFrequency: 'Annual',
                lastUpdate: null,
                endpoint: 'https://api.worldbank.org/v2',
                records: scored,
                commodities: scored,
              };
            }
            if (p.countModel === 'supplierClimate') {
              const scored = await this.prisma.supplierCountry.count({ where: { climateScore: { not: null } } });
              return {
                name: p.name, granularity: p.granularity, note: p.note,
                status: scored ? 'ACTIVE' : 'DEGRADED',
                updateFrequency: 'Monthly',
                lastUpdate: null,
                endpoint: 'https://power.larc.nasa.gov',
                records: scored,
                commodities: scored,
              };
            }
            if (p.countModel === 'newsSignal') {
              const rows = await this.prisma.newsSignal.findMany({ select: { publishedAt: true } });
              return {
                name: p.name, granularity: p.granularity, note: p.note,
                status: rows.length ? 'ACTIVE' : 'DEGRADED',
                updateFrequency: 'Continuous',
                lastUpdate: rows.reduce<Date | null>((m, r) => (!m || r.publishedAt > m ? r.publishedAt : m), null),
                endpoint: 'https://api.gdeltproject.org',
                records: rows.length,
                commodities: rows.length,
              };
            }
            if (p.countModel === 'supplierDisease' || p.countModel === 'supplierFoodSafety' || p.countModel === 'supplierHealthExp') {
              const field =
                p.countModel === 'supplierDisease' ? 'diseaseEvents90d'
                : p.countModel === 'supplierFoodSafety' ? 'foodSafetyAlerts'
                : 'healthExpPctGdp';
              const scored = await this.prisma.supplierCountry.count({ where: { [field]: { not: null } } as any });
              const endpoint =
                p.countModel === 'supplierDisease' ? 'https://api.data.apps.fao.org'
                : p.countModel === 'supplierFoodSafety' ? 'https://webgate.ec.europa.eu/rasff-window'
                : 'https://api.worldbank.org/v2';
              return {
                name: p.name, granularity: p.granularity, note: p.note,
                status: scored ? 'ACTIVE' : 'DEGRADED',
                updateFrequency: p.countModel === 'supplierHealthExp' ? 'Annual' : 'Weekly',
                lastUpdate: null,
                endpoint,
                records: scored,
                commodities: scored,
              };
            }
            const src = sources.find((s) => (s.config as any)?.provider === p.provider);
            const rows = await this.prisma.commodityPrice.findMany({
              where: { source: p.sourceTag },
              select: { commodity: true },
            });
            return {
              name: p.name,
              granularity: p.granularity,
              note: p.note,
              status: src?.status ?? 'UNKNOWN',
              updateFrequency: src?.updateFrequency ?? '—',
              lastUpdate: src?.lastUpdate ?? null,
              endpoint: src?.apiEndpoint ?? null,
              records: rows.length,
              commodities: new Set(rows.map((r) => r.commodity)).size,
            };
          }),
        );
        return { key: ds.key, name: ds.name, category: ds.category, description: ds.description, providers, consumers: ds.consumers };
      }),
    );
    return { datasets };
  }
}
