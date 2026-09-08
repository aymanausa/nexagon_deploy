import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Action-tracking layer: auto-suggests initiatives from live findings (procurement, suppliers,
// reserves, pending data) and tracks them (manual + auto) through a status lifecycle.
// Closes the loop: detect → recommend → track → improve.
@Injectable()
export class InitiativesService implements OnModuleInit {
  private logger = new Logger('InitiativesService');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    this.generate().catch((e) => this.logger.error(`initial initiative generation failed: ${e.message}`));
  }

  async list(status?: string) {
    const order = ['suggested', 'approved', 'in_progress', 'completed', 'dismissed'];
    const prio = ['critical', 'high', 'medium', 'low'];
    const rows = await this.prisma.initiative.findMany({ where: status ? { status } : {} });
    rows.sort((a, b) => (order.indexOf(a.status) - order.indexOf(b.status)) || (prio.indexOf(a.priority) - prio.indexOf(b.priority)));
    return { initiatives: rows, count: rows.length };
  }

  async create(dto: any) {
    return this.prisma.initiative.create({
      data: {
        title: dto.title, category: dto.category || 'Strategic', targetSector: dto.targetSector || 'Food Security',
        actionType: dto.actionType || 'manual', priority: dto.priority || 'medium', description: dto.description || '',
        rationale: dto.rationale, responsibleEntity: dto.responsibleEntity, status: 'approved',
      },
    });
  }

  async update(id: string, dto: { status?: string; priority?: string; responsibleEntity?: string }) {
    const existing = await this.prisma.initiative.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Initiative not found');
    return this.prisma.initiative.update({ where: { id }, data: { ...dto } });
  }

  // Derive auto-suggestions from current findings. Deduped by sourceKey; never clobbers an
  // initiative a human has advanced (only refreshes ones still 'suggested').
  async generate() {
    const [procs, suppliers, stocks, indicators] = await Promise.all([
      this.prisma.procurementRecommendation.findMany(),
      this.prisma.supplierCountry.findMany(),
      this.prisma.stockLevel.findMany(),
      this.prisma.indexIndicator.findMany(),
    ]);
    const suggestions: any[] = [];

    // 1) procurement BUYs → secure supply
    for (const p of procs.filter((x) => x.action === 'buy')) {
      suggestions.push({
        sourceKey: `procure:${p.commodity}`, source: `procurement`, linkedCommodity: p.commodity,
        title: `Secure ${p.commodity} supply ahead of projected deficit`,
        category: 'Procurement', targetSector: 'Strategic Reserves', actionType: 'forward-purchase',
        priority: p.urgency >= 60 ? 'critical' : p.urgency >= 30 ? 'high' : 'medium',
        description: `Procurement optimizer flags ${p.commodity} as BUY (urgency ${p.urgency}, ${p.timingWindow}).`,
        rationale: (p.reasoning || []).slice(0, 2).join(' '),
        responsibleEntity: 'SAGO / SALIC',
      });
    }

    // 2) supplier concentration / high-risk dominant origin → diversify
    const byCommodity = new Map<string, { hhi: number; topRisk: number; top: string }>();
    const volByCom = new Map<string, { total: number; parts: { name: string; vol: number; risk: number }[] }>();
    for (const s of suppliers) for (const b of ((s.breakdown as any[]) || [])) {
      if (!b?.commodity || !b.volumeMt) continue;
      const e = volByCom.get(b.commodity) || { total: 0, parts: [] };
      e.total += b.volumeMt; e.parts.push({ name: s.name, vol: b.volumeMt, risk: s.riskScore ?? 0 });
      volByCom.set(b.commodity, e);
    }
    for (const [commodity, e] of volByCom) {
      if (e.total <= 0 || e.parts.length === 0) continue;
      const hhi = e.parts.reduce((a, p) => a + Math.pow(p.vol / e.total, 2), 0);
      const dominant = e.parts.sort((a, b) => b.vol - a.vol)[0];
      if (hhi >= 0.30 || dominant.risk >= 55) {
        byCommodity.set(commodity, { hhi, topRisk: dominant.risk, top: dominant.name });
        suggestions.push({
          sourceKey: `diversify:${commodity}`, source: 'suppliers', linkedCommodity: commodity, linkedPillar: 'stability',
          title: `Diversify ${commodity} sourcing`,
          category: 'Supply Chain', targetSector: 'Trade', actionType: 'diversification',
          priority: dominant.risk >= 60 ? 'high' : 'medium',
          description: `${commodity} sourcing is concentrated (HHI ${(hhi * 100).toFixed(0)}), led by ${dominant.name}${dominant.risk >= 55 ? ` (high risk ${dominant.risk})` : ''}.`,
          rationale: 'High supplier concentration is a single-point-of-failure for imports; add low-risk backup origins.',
          responsibleEntity: 'SALIC',
        });
      }
    }

    // 3) low reserves → replenish
    for (const s of stocks.filter((x) => x.status === 'low')) {
      suggestions.push({
        sourceKey: `reserve:${s.commodity}`, source: 'stock-levels', linkedCommodity: s.commodity, linkedPillar: 'availability',
        title: `Replenish ${s.commodity} strategic reserve`,
        category: 'Reserves', targetSector: 'Strategic Reserves', actionType: 'reserve-buildup',
        priority: 'high',
        description: `${s.commodity} reserve is low: ${s.daysOfSupply} days of supply.`,
        rationale: `Below the strategic buffer; build back toward target to absorb shocks.`,
        responsibleEntity: 'SAGO',
      });
    }

    // 4) pending index data → onboard source
    for (const i of indicators.filter((x) => x.status === 'pending')) {
      suggestions.push({
        sourceKey: `data:${i.key}`, source: 'food-index', linkedPillar: i.pillar,
        title: `Onboard data source: ${i.label}`,
        category: 'Data', targetSector: 'Data Governance', actionType: 'data-onboarding',
        priority: 'medium',
        description: `The ${i.label} sub-indicator has no live source (${i.pillar} pillar).`,
        rationale: `Sourcing it removes a blind spot and sharpens the food-security index.`,
        responsibleEntity: 'SDAIA + relevant authority',
      });
    }

    // upsert, preserving human-advanced status
    let created = 0, refreshed = 0;
    for (const s of suggestions) {
      const existing = await this.prisma.initiative.findUnique({ where: { sourceKey: s.sourceKey } });
      if (!existing) { await this.prisma.initiative.create({ data: { ...s, status: 'suggested' } }); created++; }
      else if (existing.status === 'suggested') { await this.prisma.initiative.update({ where: { sourceKey: s.sourceKey }, data: s }); refreshed++; }
    }
    this.logger.log(`Initiatives generated: ${created} new, ${refreshed} refreshed (${suggestions.length} suggestions)`);
    return { created, refreshed, total: suggestions.length };
  }
}
