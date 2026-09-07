import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { DemandService } from '../demand/demand.service';
import { PROCUREMENT_CONFIG_KEY, DEFAULT_CONFIG, ProcurementConfig, clamp } from './procurement.constants';

const WEEKS_PER_MONTH = 4.345;

// Synthesises demand projection + price forecast + reserves + supplier cost/risk + news signals
// into a transparent buy/hold/defer recommendation per commodity. Rule-based & auditable.
@Injectable()
export class ProcurementService implements OnModuleInit {
  private logger = new Logger('ProcurementService');
  private anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID } : undefined })
    : null;

  constructor(private prisma: PrismaService, private demand: DemandService) {}

  async onModuleInit() {
    this.compute().catch((e) => this.logger.error(`initial procurement compute failed: ${e.message}`));
  }

  @Cron('0 */6 * * *')
  async scheduled() {
    await this.compute().catch((e) => this.logger.warn(`scheduled procurement compute failed: ${e.message}`));
  }

  // ── config (tunable, reviewable) ──
  async getConfig(): Promise<ProcurementConfig> {
    const row = await this.prisma.appConfig.findUnique({ where: { key: PROCUREMENT_CONFIG_KEY } });
    return { ...DEFAULT_CONFIG, ...((row?.value as any) || {}) };
  }
  async setConfig(input: Partial<ProcurementConfig>): Promise<ProcurementConfig> {
    const merged = { ...(await this.getConfig()), ...input };
    if (merged.leadTimeWeeks < 1 || merged.leadTimeWeeks > 52) throw new BadRequestException('leadTimeWeeks 1–52');
    await this.prisma.appConfig.upsert({ where: { key: PROCUREMENT_CONFIG_KEY }, create: { key: PROCUREMENT_CONFIG_KEY, value: merged }, update: { value: merged } });
    await this.compute();
    return merged;
  }

  async list() {
    const [recs, brief, config] = await Promise.all([
      this.prisma.procurementRecommendation.findMany({ orderBy: { urgency: 'desc' } }),
      this.prisma.procurementBrief.findFirst({ orderBy: { createdAt: 'desc' } }),
      this.getConfig(),
    ]);
    return { recommendations: recs, brief, config };
  }

  async compute() {
    const cfg = await this.getConfig();
    const [{ commodities: demand }, stocks, suppliers, news] = await Promise.all([
      this.demand.list(),
      this.prisma.stockLevel.findMany(),
      this.prisma.supplierCountry.findMany(),
      this.prisma.newsSignal.findMany({ where: { severity: 'high' }, orderBy: { publishedAt: 'desc' }, take: 60 }),
    ]);
    const stockBy = new Map(stocks.map((s) => [s.commodity, s]));

    const results: any[] = [];
    for (const d of demand) {
      const rec = await this.recommend(d, stockBy.get(d.commodity), suppliers, news, cfg);
      await this.prisma.procurementRecommendation.upsert({ where: { commodity: d.commodity }, create: rec, update: rec });
      results.push(rec);
    }
    if (this.anthropic) await this.buildBrief(results);
    this.logger.log(`Procurement recomputed: ${results.length} commodities (${results.filter((r) => r.action === 'buy').length} buy)`);
    return { count: results.length };
  }

  private async recommend(d: any, stock: any, suppliers: any[], news: any[], cfg: ProcurementConfig) {
    const reasoning: string[] = [];
    let urgency = 0, buy = false, defer = false;

    // ── reserves ──
    if (stock) {
      if (stock.daysOfSupply != null && stock.daysOfSupply < cfg.reserveWatchDays) {
        urgency += 30; buy = true;
        reasoning.push(`Reserves low: ${stock.daysOfSupply} days (< ${cfg.reserveWatchDays}) — replenish toward target.`);
      } else {
        reasoning.push(`Reserves adequate: ${stock.daysOfSupply} days of supply.`);
      }
    } else {
      reasoning.push('No strategic reserve tracked for this commodity.');
    }

    // ── demand timing (deficit / peak within lead time) ──
    const deficitIdx = (d.months as any[]).findIndex((m) => m.deficit);
    if (deficitIdx >= 0) {
      const weeks = Math.round(deficitIdx * WEEKS_PER_MONTH);
      const label = d.months[deficitIdx].month;
      if (weeks <= cfg.leadTimeWeeks) {
        urgency += 30; buy = true;
        reasoning.push(`Projected demand deficit in ${label} (~${weeks}w out, within ${cfg.leadTimeWeeks}w lead time) — pre-position now.`);
      } else {
        reasoning.push(`Next deficit ${label} (~${weeks}w out) — beyond lead time, monitor.`);
      }
    }
    if (d.peakMonth) reasoning.push(`Seasonal demand peak: ${d.peakMonth}.`);

    // ── price forecast ──
    const fc = await this.priceForecast(d.commodity);
    let priceTrend = 'unknown';
    if (fc) {
      if (fc.confidence >= cfg.minForecastConfidence && fc.pctMove >= cfg.priceSlopeThreshold) {
        priceTrend = `rising`; urgency += 20; buy = true;
        reasoning.push(`Price forecast rising (~${fc.pctMove.toFixed(1)}% over 3mo, R² ${fc.confidence.toFixed(2)}) — lock in before increase.`);
      } else if (fc.confidence >= cfg.minForecastConfidence && fc.pctMove <= -cfg.priceSlopeThreshold) {
        priceTrend = `falling`; defer = true;
        reasoning.push(`Price forecast falling (~${fc.pctMove.toFixed(1)}% over 3mo) — defer to await a lower entry.`);
      } else {
        priceTrend = `flat`;
        reasoning.push(`Price forecast flat/uncertain (~${fc.pctMove.toFixed(1)}%, R² ${fc.confidence.toFixed(2)}).`);
      }
    }

    // ── news override ──
    const shock = news.find((n) => (n.commodity === d.commodity) && ['export-ban', 'drought', 'logistics', 'disease', 'policy'].includes(n.eventType));
    if (shock) {
      urgency += 25; buy = true;
      reasoning.push(`News shock (${shock.eventType}): ${shock.summary || shock.title} — accelerate procurement.`);
    }

    // ── origins (risk-adjusted ranking for this commodity) ──
    const origins = this.rankOrigins(d.commodity, suppliers);
    if (origins.length) {
      const dominant = origins[0];
      if (dominant.riskScore >= 55) reasoning.push(`Dominant origin ${dominant.country} is high-risk (${dominant.riskScore}/100) — diversify.`);
    }

    // ── action + quantity + timing ──
    const action = buy ? 'buy' : (defer && !buy ? 'defer' : 'hold');
    urgency = clamp(action === 'buy' ? urgency : action === 'defer' ? Math.min(urgency, 25) : Math.min(urgency, 40));

    const deficitVol = (d.months as any[]).filter((m) => m.deficit).reduce((s, m) => s + Math.max(0, -m.balance), 0);
    const reserveGap = stock ? Math.max(0, Math.round(stock.targetStockMt - stock.currentStockMt)) : 0;
    const quantityMt = Math.round(deficitVol + (action === 'buy' ? reserveGap : 0));
    const monthlyDemand = d.annualConsumptionMt / 12;
    const quantitySignal = quantityMt > monthlyDemand ? 'high' : quantityMt > monthlyDemand * 0.3 ? 'medium' : 'low';

    const timingWindow = action === 'buy' ? `Next ${cfg.leadTimeWeeks} weeks`
      : action === 'defer' ? 'Defer — await forecast trough' : 'Monitor';

    return {
      commodity: d.commodity, action, urgency, quantitySignal, quantityMt, timingWindow, priceTrend,
      origins, reasoning,
    };
  }

  // implied-price + risk-adjusted origin ranking for one commodity, from the Comtrade breakdown
  private rankOrigins(commodity: string, suppliers: any[]) {
    const rows = suppliers
      .map((s) => {
        const b = ((s.breakdown as any[]) || []).find((x) => x.commodity === commodity);
        if (!b || !b.volumeMt) return null;
        return {
          country: s.name, iso2: s.countryCode, flag: s.flag,
          volumeMt: b.volumeMt, impliedUsdPerMt: b.usd && b.volumeMt ? Math.round(b.usd / b.volumeMt) : null,
          riskScore: s.riskScore ?? 0, climateScore: s.climateScore ?? 0, foodSafetyAlerts: s.foodSafetyAlerts ?? 0,
        };
      })
      .filter(Boolean) as any[];
    const totalVol = rows.reduce((s, r) => s + r.volumeMt, 0) || 1;
    for (const r of rows) {
      r.share = Math.round((r.volumeMt / totalVol) * 1000) / 10;
      // risk-adjusted desirability: availability (share) up, risk/climate/safety down
      r.score = Math.round(clamp(50 + r.share * 0.4 - r.riskScore * 0.4 - r.climateScore * 0.2 - Math.min(20, r.foodSafetyAlerts)));
    }
    return rows.sort((a, b) => b.score - a.score).slice(0, 3)
      .map((r) => ({ country: r.country, flag: r.flag, share: r.share, riskScore: r.riskScore, impliedUsdPerMt: r.impliedUsdPerMt, score: r.score }));
  }

  // OLS on the last ≤12 monthly World Bank prices → 3-month projected % move + R² confidence
  private async priceForecast(commodity: string): Promise<{ pctMove: number; confidence: number } | null> {
    const rows = await this.prisma.commodityPrice.findMany({
      where: { commodity, source: 'WorldBank' }, orderBy: { recordedAt: 'asc' }, take: 24,
    });
    const ys = rows.slice(-12).map((r) => r.priceUsd);
    const n = ys.length;
    if (n < 4) return null;
    const xs = ys.map((_, i) => i);
    const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
    const slope = den ? num / den : 0, intercept = my - slope * mx;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) { const yh = intercept + slope * xs[i]; ssRes += (ys[i] - yh) ** 2; ssTot += (ys[i] - my) ** 2; }
    const r2 = ssTot ? 1 - ssRes / ssTot : 0;
    const latest = ys[n - 1];
    const pctMove = latest ? ((slope * 3) / latest) * 100 : 0; // projected 3-month move
    return { pctMove, confidence: Math.max(0, r2) };
  }

  private async buildBrief(recs: any[]) {
    const priority = recs.filter((r) => r.action !== 'hold').sort((a, b) => b.urgency - a.urgency).slice(0, 8);
    if (!priority.length) return;
    const facts = priority.map((r) => `- ${r.commodity}: ${r.action.toUpperCase()} (urgency ${r.urgency}) — ${r.reasoning.slice(0, 2).join(' ')}`).join('\n');
    try {
      const res = await this.anthropic!.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 600,
        system:
          'You are a procurement strategist for Saudi Arabia\'s food reserves. Given per-commodity buy/hold/defer ' +
          'recommendations, write a concise portfolio brief in markdown: a one-sentence overall stance, then the ' +
          'top 3-5 priority actions with the single clearest reason each. Under 160 words. No preamble.',
        messages: [{ role: 'user', content: `Recommendations:\n${facts}` }],
      });
      const content = res.content.filter((b) => b.type === 'text').map((b: any) => b.text).join('').trim();
      await this.prisma.procurementBrief.create({ data: { content } });
    } catch (e: any) { this.logger.warn(`procurement brief failed: ${e.message}`); }
  }
}
