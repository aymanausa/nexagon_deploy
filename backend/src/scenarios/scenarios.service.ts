import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScenarioDto } from './dto/scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where = category ? { category } : {};
    const scenarios = await this.prisma.scenario.findMany({ where });
    return { scenarios, count: scenarios.length };
  }

  async create(dto: CreateScenarioDto) {
    return this.prisma.scenario.create({ data: { ...dto, createdAt: new Date() } });
  }

  async findById(id: string) {
    const s = await this.prisma.scenario.findUnique({ where: { id } });
    if (!s) throw new NotFoundException();
    return s;
  }

  async getRiskDomains() {
    const domains = await this.prisma.riskDomain.findMany();
    return { domains, count: domains.length };
  }

  async getInitiatives(category?: string) {
    const where = category ? { category } : {};
    const initiatives = await this.prisma.initiative.findMany({ where });
    return { initiatives, count: initiatives.length };
  }
}
