import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';

// Per-dashboard AI insights. Gathers the real data behind a page, then asks Claude
// to explain it — falling back to a deterministic summary when no API key is set.
@Injectable()
export class InsightsService {
  private logger = new Logger('InsightsService');
  // identity-linked API keys require the workspace id as a header
  private anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({
        defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID
          ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID }
          : undefined,
      })
    : null;

  constructor(private prisma: PrismaService) {}

  async getInsights(context: string, focus?: string) {
    const { title, facts } = await this.gather(context, focus);
    if (facts.length === 0) {
      return { context, focus, title, source: 'none', insights: ['No data available yet.'] };
    }
    if (this.anthropic) {
      try {
        return { context, focus, title, source: 'ai', insights: await this.ask(title, facts) };
      } catch (e: any) {
        this.logger.error(`AI insights failed: ${e.message}`);
      }
    }
    return { context, focus, title, source: 'fallback', insights: this.heuristic(facts) };
  }

  // --- real data per dashboard (optionally focused on a specific entity) ---
  private async gather(context: string, focus?: string): Promise<{ title: string; facts: string[] }> {
    // focused: a single commodity clicked from the grid
    if (context === 'commodities' && focus) {
      const rows = await this.prisma.commodityPrice.findMany({
        where: { commodity: focus },
        orderBy: { recordedAt: 'desc' },
        take: 40,
      });
      if (rows.length === 0) return { title: focus, facts: [] };
      const monthly = rows.filter((r) => r.source === 'WorldBank');
      const yearly = rows.filter((r) => r.source === 'FAO');
      const facts: string[] = [];
      if (monthly[0]) facts.push(`Latest monthly (World Bank): $${monthly[0].priceUsd} ${(monthly[0].metadata as any)?.unit}, ${monthly[0].changePercent}% MoM`);
      if (yearly[0]) facts.push(`Latest annual (FAO): $${yearly[0].priceUsd}/tonne, ${yearly[0].changePercent}% YoY`);
      if (monthly.length > 1) facts.push(`Recent monthly trend: ${monthly.slice(0, 6).reverse().map((r) => r.priceUsd).join(' → ')}`);
      if (yearly.length > 1) facts.push(`Annual trend: ${yearly.slice(0, 5).reverse().map((r) => `${(r.metadata as any)?.year}:$${r.priceUsd}`).join(', ')}`);
      return { title: `${focus} — price detail`, facts };
    }
    // self-sufficiency radar (live FAO Food Balance Sheet ratios)
    if (context === 'self-sufficiency') {
      const rows = await this.prisma.selfSufficiency.findMany();
      if (rows.length === 0) return { title: 'Self-Sufficiency Radar', facts: [] };
      return {
        title: 'Self-Sufficiency Radar',
        facts: rows.map(
          (r) => `${r.commodity}: KSA ${r.ksa ?? '—'}% self-sufficient (target ${r.target ?? '—'}%, GCC avg ${r.gcc ?? '—'}%)${r.year ? ` [${r.year}]` : ''}`,
        ),
      };
    }
    // strategic reserves (USDA PSD ending stocks) — whole page or one clicked commodity
    if (context === 'stock-levels') {
      const stocks = await this.prisma.stockLevel.findMany();
      const pct = (s: any) => Math.round((s.currentStockMt / s.targetStockMt) * 100);
      if (focus) {
        const s = stocks.find((x) => x.commodity === focus);
        if (!s) return { title: `${focus} — reserves`, facts: [`${focus} is watched but USDA PSD has no strategic-reserve data for Saudi Arabia.`] };
        return {
          title: `${focus} — strategic reserve`,
          facts: [
            `Current ending stocks: ${s.currentStockMt.toLocaleString()} MT (USDA PSD)`,
            `Days of supply: ${s.daysOfSupply} days of domestic consumption`,
            `Strategic target: ${s.targetStockMt.toLocaleString()} MT (${pct(s)}% of target)`,
            `Status: ${s.status}`,
          ],
        };
      }
      if (stocks.length === 0) return { title: 'Strategic Reserves', facts: [] };
      return {
        title: 'Strategic Reserves',
        facts: stocks.map((s) => `${s.commodity}: ${s.currentStockMt.toLocaleString()} MT, ${s.daysOfSupply} days of supply, ${pct(s)}% of target (${s.status})`),
      };
    }
    // supplier countries (UN Comtrade import flows) — whole page or one clicked country
    if (context === 'suppliers') {
      const suppliers = await this.prisma.supplierCountry.findMany({ orderBy: { shareOfImports: 'desc' } });
      if (suppliers.length === 0) return { title: 'Supplier Countries', facts: [] };
      if (focus) {
        const s = suppliers.find((x) => x.countryCode === focus || x.name === focus);
        if (!s) return { title: `${focus} — supplier`, facts: [`${focus} is not among current KSA food-import partners.`] };
        return {
          title: `${s.name} — food supplier`,
          facts: [
            `Share of tracked KSA food imports: ${s.shareOfImports}%`,
            `Import volume: ${s.totalVolumeMt.toLocaleString()} MT`,
            `Commodities sourced: ${s.commodities.join(', ') || '—'}`,
            `Rank: #${suppliers.findIndex((x) => x.id === s.id) + 1} of ${suppliers.length} partners`,
            `Risk (World Bank WGI): political ${s.politicalRisk}, economic ${s.economicRisk}, composite score ${s.riskScore}/100`,
            s.climateScore != null ? `Climate stress (NASA POWER, crop region): ${s.climateRisk} (${s.climateScore}/100 drought+heat)` : 'Climate stress: not assessed',
            s.diseaseEvents90d != null ? `Animal disease (FAO EMPRES-i, 90d): ${s.diseaseEvents90d} confirmed events${s.diseaseTop?.length ? ` — ${s.diseaseTop.join(', ')}` : ''}` : 'Animal disease: none reported/assessed',
            s.foodSafetyAlerts != null ? `Food-safety alerts (EU RASFF, recent): ${s.foodSafetyAlerts}` : '',
            s.healthExpPctGdp != null ? `Health expenditure: ${s.healthExpPctGdp}% of GDP (capacity proxy)` : '',
          ].filter(Boolean),
        };
      }
      return {
        title: 'Supplier Countries',
        facts: suppliers.slice(0, 12).map(
          (s) => `${s.name}: ${s.shareOfImports}% of imports, ${s.totalVolumeMt.toLocaleString()} MT (${s.commodities.join(', ')})`,
        ),
      };
    }
    switch (context) {
      case 'commodities': {
        const rows = await this.prisma.commodityPrice.findMany({ orderBy: { recordedAt: 'desc' }, take: 300 });
        const latest = new Map<string, any>();
        for (const r of rows) if (!latest.has(r.commodity)) latest.set(r.commodity, r);
        const facts = [...latest.values()].map(
          (r) => `${r.commodity}: $${r.priceUsd} ${(r.metadata as any)?.unit || 'USD/tonne'}, change ${r.changePercent}% (${r.source})`,
        );
        return { title: 'Commodity Prices', facts };
      }
      case 'dashboard': {
        const [alerts, prices, sources] = await Promise.all([
          this.prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
          this.prisma.commodityPrice.findMany({ orderBy: { recordedAt: 'desc' }, take: 40 }),
          this.prisma.dataSource.findMany(),
        ]);
        const facts = [
          `Active alerts: ${alerts.length} recent — ${alerts.map((a) => `${a.level} ${a.title}`).join('; ') || 'none'}`,
          `Data sources: ${sources.length}, ${sources.filter((s) => s.status === 'ACTIVE').length} active`,
          `Latest prices tracked: ${new Set(prices.map((p) => p.commodity)).size} commodities`,
        ];
        return { title: 'Dashboard Overview', facts };
      }
      case 'alerts': {
        const alerts = await this.prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, take: 15 });
        return {
          title: 'Alert Center',
          facts: alerts.map((a) => `${a.level}/${a.category}: ${a.title} — ${a.description}`),
        };
      }
      case 'data-sources': {
        const sources = await this.prisma.dataSource.findMany();
        return {
          title: 'Data Sources',
          facts: sources.map((s) => `${s.shortName} (${s.category}): ${s.status}, uptime ${s.uptimePercent}%, latency ${s.latencyMs}ms`),
        };
      }
      default:
        return { title: 'Overview', facts: [] };
    }
  }

  // --- Claude ---
  private async ask(title: string, facts: string[]): Promise<string[]> {
    const res = await this.anthropic!.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 600,
      system:
        'You are an analyst for a Saudi food-security early-warning system. Given the current data (a dashboard, ' +
        'a specific commodity, or a chart), produce 3-5 short, decision-useful insights in plain language — what it ' +
        'means, notable moves, risks, and what to watch. One insight per line, no preamble, no numbering, each ' +
        'under 25 words. Respond with only the insight lines.',
      messages: [{ role: 'user', content: `Topic: ${title}\n\nData:\n${facts.join('\n')}` }],
    });
    const text = res.content.filter((b) => b.type === 'text').map((b: any) => b.text).join('\n');
    return text.split('\n').map((l) => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean).slice(0, 5);
  }

  // --- deterministic fallback (no API key) ---
  private heuristic(facts: string[]): string[] {
    const withChange = facts
      .map((f) => ({ f, m: f.match(/change (-?\d+(?:\.\d+)?)%/) }))
      .filter((x) => x.m)
      .map((x) => ({ f: x.f, pct: Number(x.m![1]) }));
    const out: string[] = [];
    if (withChange.length) {
      const up = [...withChange].sort((a, b) => b.pct - a.pct)[0];
      const down = [...withChange].sort((a, b) => a.pct - b.pct)[0];
      if (up.pct > 0) out.push(`Biggest gainer: ${up.f.split(':')[0]} (+${up.pct}%).`);
      if (down.pct < 0) out.push(`Biggest drop: ${down.f.split(':')[0]} (${down.pct}%).`);
      const rising = withChange.filter((x) => x.pct > 0).length;
      out.push(`${rising} of ${withChange.length} tracked series are rising.`);
    }
    // pad with the raw facts so the panel is always informative
    for (const f of facts) {
      if (out.length >= 5) break;
      out.push(f);
    }
    return out.slice(0, 5);
  }
}
