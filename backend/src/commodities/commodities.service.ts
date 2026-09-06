import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceDto } from './dto/commodity.dto';

@Injectable()
export class CommoditiesService {
  constructor(private prisma: PrismaService) {}

  async getPrices(commodity?: string, source?: string) {
    const where: any = {};
    if (commodity) where.commodity = commodity;
    if (source) where.source = source;
    const prices = await this.prisma.commodityPrice.findMany({ where, orderBy: { recordedAt: 'desc' }, take: 500 });
    return { prices, count: prices.length };
  }

  // distinct commodities we have price data for — the catalog users pick from in Settings
  async getAvailable() {
    const rows = await this.prisma.commodityPrice.findMany({
      distinct: ['commodity'],
      select: { commodity: true },
      orderBy: { commodity: 'asc' },
    });
    return { commodities: rows.map((r) => r.commodity) };
  }

  async createPrice(dto: CreatePriceDto) {
    return this.prisma.commodityPrice.create({ data: { ...dto, recordedAt: new Date() } });
  }

  async getStocks() {
    const stocks = await this.prisma.stockLevel.findMany();
    return { stocks, count: stocks.length };
  }

  async getSuppliers(continent?: string, riskLevel?: string) {
    const where: any = {};
    if (continent) where.continent = continent;
    if (riskLevel) {
      if (riskLevel === 'low') where.riskScore = { lte: 40 };
      else if (riskLevel === 'medium') where.riskScore = { lte: 70 };
      else where.riskScore = { gt: 70 };
    }
    const suppliers = await this.prisma.supplierCountry.findMany({ where });
    return { suppliers, count: suppliers.length };
  }

  async getSupplier(code: string) {
    const s = await this.prisma.supplierCountry.findUnique({ where: { countryCode: code.toUpperCase() } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }
}
