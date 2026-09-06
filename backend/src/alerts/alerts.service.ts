import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/alert.dto';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { level?: string; category?: string; isRead?: boolean }) {
    const where: any = {};
    if (filters.level) where.level = filters.level;
    if (filters.category) where.category = filters.category;
    if (filters.isRead !== undefined) where.isRead = filters.isRead;
    const alerts = await this.prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
    return { alerts, count: alerts.length };
  }

  async create(dto: CreateAlertDto) {
    return this.prisma.alert.create({ data: { ...dto, createdAt: new Date() } });
  }

  async getCounts() {
    const counts = await this.prisma.alert.groupBy({ by: ['level'], _count: { level: true } });
    const unread = await this.prisma.alert.count({ where: { isRead: false } });
    return { counts: Object.fromEntries(counts.map(c => [c.level, c._count.level])), unread };
  }

  async acknowledge(id: string, by: string) {
    const alert = await this.prisma.alert.update({
      where: { id },
      data: { isAcknowledged: true, acknowledgedBy: by, acknowledgedAt: new Date() },
    });
    return { status: 'acknowledged', alert };
  }

  async markRead(id: string) {
    await this.prisma.alert.update({ where: { id }, data: { isRead: true } });
    return { status: 'read' };
  }
}
