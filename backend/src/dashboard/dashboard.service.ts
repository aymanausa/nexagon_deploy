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
}
