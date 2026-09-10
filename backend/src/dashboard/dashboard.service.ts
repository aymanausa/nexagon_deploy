import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const [unreadAlerts, totalSources, activeSources, stockLevels] = await Promise.all([
      this.prisma.alert.count({ where: { isRead: false } }),
      this.prisma.dataSource.count(),
      this.prisma.dataSource.count({ where: { status: 'ACTIVE' } }),
      this.prisma.stockLevel.findMany(),
    ]);
    return {
      activeAlerts: unreadAlerts,
      dataSourcesTotal: totalSources,
      dataSourcesActive: activeSources,
      stockLevels,
      timestamp: new Date().toISOString(),
    };
  }

  async getLatestPrices() {
    const commodities = ['Wheat', 'Rice', 'Corn', 'Barley', 'Sugar', 'Palm Oil', 'Soybean', 'Beef', 'Chicken', 'Milk'];
    const prices = [];
    for (const c of commodities) {
      const p = await this.prisma.commodityPrice.findFirst({
        where: { commodity: c },
        orderBy: { recordedAt: 'desc' },
      });
      if (p) prices.push(p);
    }
    return { prices, count: prices.length };
  }

  async getRecentAlerts() {
    const alerts = await this.prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { alerts, count: alerts.length, timestamp: new Date().toISOString() };
  }

  // Automation status: the last time each self-running pipeline produced data, vs its schedule.
  // Powers the "runs itself" durability strip. freshWithinHrs = the cron interval + a grace margin.
  async getAutomationStatus() {
    const [news, procurement, autoScenario, index] = await Promise.all([
      this.prisma.newsSignal.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
      this.prisma.procurementRecommendation.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      this.prisma.scenario.findFirst({ where: { isActive: 'auto' }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
      this.prisma.indexSnapshot.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
    ]);

    const now = Date.now();
    const build = (label: string, schedule: string, ts: Date | null | undefined, freshWithinHrs: number) => {
      const last = ts ? new Date(ts) : null;
      const ageHours = last ? (now - last.getTime()) / 3.6e6 : null;
      return {
        label,
        schedule,
        lastRunAt: last ? last.toISOString() : null,
        ageHours: ageHours === null ? null : Math.round(ageHours * 10) / 10,
        fresh: ageHours !== null && ageHours <= freshWithinHrs,
      };
    };

    const pipelines = [
      build('News AI signals', 'every 3 hours', news?.createdAt, 6),
      build('Procurement recompute', 'every 6 hours', procurement?.updatedAt, 12),
      build('Autonomous scenarios', 'daily 06:00', autoScenario?.createdAt, 30),
      build('Food-security index', 'every 30 min', index?.createdAt, 2),
    ];

    return {
      pipelines,
      healthy: pipelines.filter((p) => p.fresh).length,
      total: pipelines.length,
      timestamp: new Date().toISOString(),
    };
  }
}
