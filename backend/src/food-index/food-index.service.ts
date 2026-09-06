import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PILLARS, INDICATORS, clamp } from './food-index.constants';
import {
  productionSub, diversitySub, nutritionSub, healthCapacitySub, macroPowerSub, affordabilitySub, waterSub, Sub,
} from './food-index.sources';

// Computes the 4-pillar KSA food-security composite index (0-100, higher = healthier) by
// composing the modules already ingested (stock levels, self-sufficiency, suppliers, prices)
// plus free national fetchers. Pending sub-indicators re-normalise their pillar's weights.
@Injectable()
export class FoodIndexService implements OnModuleInit {
  private logger = new Logger('FoodIndexService');

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seed();
    this.compute().catch((e) => this.logger.error(`initial food-index compute failed: ${e.message}`));
  }

  private async seed() {
    for (const ind of INDICATORS) {
      const existing = await this.prisma.indexIndicator.findUnique({ where: { key: ind.key } });
      if (!existing) {
        await this.prisma.indexIndicator.create({
          data: { pillar: ind.pillar, key: ind.key, label: ind.label, weight: ind.weight, source: ind.source, status: 'pending' },
        });
      } else {
        await this.prisma.indexIndicator.update({
          where: { key: ind.key },
          data: { pillar: ind.pillar, label: ind.label, weight: ind.weight, source: ind.source },
        });
      }
    }
  }

  async list() {
    const indicators = await this.prisma.indexIndicator.findMany();
    const byKey = new Map(indicators.map((i) => [i.key, i]));
    const pillars = PILLARS.map((p) => {
      const subs = INDICATORS.filter((i) => i.pillar === p.key).map((i) => byKey.get(i.key)).filter(Boolean) as any[];
      const active = subs.filter((s) => s.status === 'active' && s.score != null);
      const wsum = active.reduce((s, i) => s + i.weight, 0);
      const score = wsum > 0 ? Math.round(active.reduce((s, i) => s + i.score * i.weight, 0) / wsum) : null;
      return {
        key: p.key, label: p.label, weight: p.weight, target: p.target, score,
        activeCount: active.length, total: subs.length,
        indicators: subs.map((s) => ({ key: s.key, label: s.label, weight: s.weight, score: s.score, rawValue: s.rawValue, source: s.source, status: s.status })),
      };
    });
    const withScore = pillars.filter((p) => p.score != null);
    const owSum = withScore.reduce((s, p) => s + p.weight, 0);
    const overall = owSum > 0 ? Math.round(withScore.reduce((s, p) => s + (p.score as number) * p.weight, 0) / owSum) : 0;
    const overallTarget = Math.round(PILLARS.reduce((s, p) => s + p.target * p.weight, 0));
    const history = await this.prisma.indexSnapshot.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });
    return { overall, overallTarget, pillars, history: history.reverse() };
  }

  async compute() {
    // 1) proxies from already-ingested modules
    const scores: Record<string, Sub | null> = {};
    scores.reserves = await this.reservesSub();
    scores.importCapacity = await this.importCapacitySub();
    scores.supplyChain = await this.supplyChainSub();
    scores.geoRisk = await this.weightedInvertSub('riskScore', 'political/economic risk (WGI)');
    scores.climateVol = await this.weightedInvertSub('climateScore', 'climate stress (NASA POWER)');
    scores.foodSafety = await this.foodSafetySub();

    // 2) free national fetchers
    const [prod, diversity, nutrition, health, macro, afford] = await Promise.all([
      productionSub(), diversitySub(), nutritionSub(), healthCapacitySub(), macroPowerSub(), affordabilitySub(),
    ]);
    scores.production = prod;
    scores.diversity = diversity;
    scores.nutrition = nutrition;
    scores.healthCapacity = health;
    scores.macroPower = macro;
    scores.affordability = afford ?? (await this.affordabilityFallback());
    scores.water = waterSub();

    // 3) persist each indicator (active if we produced a score, else leave pending)
    for (const ind of INDICATORS) {
      const s = scores[ind.key];
      if (s == null) continue; // pending sub-indicators (safetyNet, retailOsa, cyberResilience) stay untouched
      await this.prisma.indexIndicator.update({
        where: { key: ind.key },
        data: { score: Math.round(s.score), rawValue: s.raw, status: 'active' },
      });
    }

    // 4) snapshot the rolled-up pillars + overall
    const { overall, pillars } = await this.list();
    const pv = (k: string) => pillars.find((p) => p.key === k)?.score ?? null;
    await this.prisma.indexSnapshot.create({
      data: { overall, availability: pv('availability'), access: pv('access'), utilization: pv('utilization'), stability: pv('stability') },
    });
    const activeN = Object.values(scores).filter(Boolean).length;
    this.logger.log(`Food-index computed: overall ${overall}/100, ${activeN} active sub-indicators`);
    return { overall, active: activeN };
  }

  // ── proxy sub-indicators (from existing tables) ──
  private async reservesSub(): Promise<Sub | null> {
    const rows = await this.prisma.stockLevel.findMany();
    const vals = rows.filter((r) => r.targetStockMt > 0).map((r) => clamp((r.currentStockMt / r.targetStockMt) * 100));
    if (!vals.length) return null;
    const score = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { score, raw: `${Math.round(score)}% of strategic reserve targets across ${vals.length} grains` };
  }

  private async importCapacitySub(): Promise<Sub | null> {
    const n = await this.prisma.supplierCountry.count();
    if (!n) return null;
    return { score: clamp((n / 60) * 100), raw: `${n} active supplier countries (sourcing breadth)` };
  }

  private async supplyChainSub(): Promise<Sub | null> {
    const rows = await this.prisma.supplierCountry.findMany({ select: { shareOfImports: true } });
    if (!rows.length) return null;
    const hhi = rows.reduce((s, r) => s + Math.pow(r.shareOfImports / 100, 2), 0); // 0..1 (1 = monopoly)
    return { score: clamp((1 - hhi) * 100), raw: `import concentration HHI ${(hhi * 100).toFixed(0)}/100 (diversified = resilient)` };
  }

  private async foodSafetySub(): Promise<Sub | null> {
    const rows = await this.prisma.supplierCountry.findMany({ where: { foodSafetyAlerts: { not: null } }, select: { shareOfImports: true, foodSafetyAlerts: true } });
    if (!rows.length) return null;
    const wsum = rows.reduce((s, r) => s + r.shareOfImports, 0) || 1;
    const wAlerts = rows.reduce((s, r) => s + (r.foodSafetyAlerts as number) * r.shareOfImports, 0) / wsum;
    // normalise: ~60 import-weighted alerts ≈ worst → 0; none → 100
    return { score: clamp(100 - (wAlerts / 60) * 100), raw: `import-weighted ${wAlerts.toFixed(1)} recent EU food-safety alerts` };
  }

  // 100 − import-weighted supplier risk metric (invert: our overlays are higher = worse)
  private async weightedInvertSub(field: 'riskScore' | 'climateScore', label: string): Promise<Sub | null> {
    const rows = await this.prisma.supplierCountry.findMany({ select: { shareOfImports: true, riskScore: true, climateScore: true } });
    const valid = rows.filter((r) => (r as any)[field] != null && (r as any)[field] > 0);
    if (!valid.length) return null;
    const wsum = valid.reduce((s, r) => s + r.shareOfImports, 0) || 1;
    const w = valid.reduce((s, r) => s + ((r as any)[field] as number) * r.shareOfImports, 0) / wsum;
    return { score: clamp(100 - w), raw: `import-weighted ${label} ${w.toFixed(0)}/100` };
  }

  // fallback affordability from our own World Bank monthly basket (commodityPrice) if FFPI unreachable
  private async affordabilityFallback(): Promise<Sub | null> {
    const rows = await this.prisma.commodityPrice.findMany({ where: { source: 'WorldBank' }, orderBy: { recordedAt: 'desc' }, take: 400 });
    if (!rows.length) return null;
    const byCom: Record<string, any[]> = {};
    for (const r of rows) (byCom[r.commodity] ||= []).push(r);
    const changes: number[] = [];
    for (const list of Object.values(byCom)) {
      const latest = list[0]; const yearAgo = list.find((r) => (Date.now() - new Date(r.recordedAt).getTime()) >= 330 * 864e5);
      if (latest && yearAgo && yearAgo.priceUsd) changes.push(((latest.priceUsd - yearAgo.priceUsd) / yearAgo.priceUsd) * 100);
    }
    if (!changes.length) return null;
    const pct = changes.reduce((a, b) => a + b, 0) / changes.length;
    return { score: clamp(100 - pct * 2.5), raw: `basket ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% y/y (World Bank monthly)` };
  }
}
