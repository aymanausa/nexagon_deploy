import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class DatasourcesService {
  constructor(private prisma: PrismaService) {}
  async getHealth() {
    const sources = await this.prisma.dataSource.findMany();
    const counts = { ACTIVE: 0, WARNING: 0, ERROR: 0, DEGRADED: 0 };
    sources.forEach(s => counts[s.status] = (counts[s.status] || 0) + 1);
    const avgUptime = sources.reduce((a, s) => a + s.uptimePercent, 0) / (sources.length || 1);
    const avgLatency = sources.reduce((a, s) => a + s.latencyMs, 0) / (sources.length || 1);
    return { total: sources.length, statusCounts: counts, avgUptime: Math.round(avgUptime * 10) / 10, avgLatency: Math.round(avgLatency), sources };
  }
  async findAll(category?: string, status?: string) {
    const where: any = {}; if (category) where.category = category; if (status) where.status = status;
    const sources = await this.prisma.dataSource.findMany({ where });
    return { sources, count: sources.length };
  }
}
