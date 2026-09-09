import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CONFIG_KEY = 'impact-config';
const DEFAULT = { captureRate: 0.25, highRiskThreshold: 55 }; // capture: fraction of price swing timing can realistically capture

// Quantifies the platform's economic value from live data: the addressable import spend, the value
// exposed to high-risk origins, sourcing concentration, and the estimated annual optimization
// opportunity from better-timed procurement. Real bases + one clearly-labelled estimate.
@Injectable()
export class ImpactService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    const row = await this.prisma.appConfig.findUnique({ where: { key: CONFIG_KEY } });
    return { ...DEFAULT, ...((row?.value as any) || {}) };
  }
  async setConfig(input: { captureRate?: number; highRiskThreshold?: number }) {
    const merged = { ...(await this.getConfig()), ...input };
    if (merged.captureRate < 0 || merged.captureRate > 1) throw new BadRequestException('captureRate 0–1');
    await this.prisma.appConfig.upsert({ where: { key: CONFIG_KEY }, create: { key: CONFIG_KEY, value: merged }, update: { value: merged } });
    return merged;
  }

  async summary() {
    const cfg = await this.getConfig();
    const [suppliers, prices] = await Promise.all([
      this.prisma.supplierCountry.findMany(),
      this.prisma.commodityPrice.findMany({ where: { source: 'WorldBank' }, orderBy: { recordedAt: 'asc' } }),
    ]);

    // ── real bases from Comtrade import value ──
    let totalUsd = 0, atRiskUsd = 0;
    const perCountry = new Map<string, number>();
    const perCommodityUsd = new Map<string, number>();
    for (const s of suppliers) {
      const cUsd = ((s.breakdown as any[]) || []).reduce((a, b) => a + (b.usd || 0), 0);
      totalUsd += cUsd;
      perCountry.set(s.name, (perCountry.get(s.name) || 0) + cUsd);
      if ((s.riskScore ?? 0) >= cfg.highRiskThreshold) atRiskUsd += cUsd;
      for (const b of ((s.breakdown as any[]) || [])) if (b.commodity) perCommodityUsd.set(b.commodity, (perCommodityUsd.get(b.commodity) || 0) + (b.usd || 0));
    }
    const top = [...perCountry.entries()].sort((a, b) => b[1] - a[1])[0];
    const topOrigin = top ? { name: top[0], pct: Math.round((top[1] / (totalUsd || 1)) * 1000) / 10 } : null;

    // ── price volatility per commodity (coefficient of variation over last 12 monthly WB prices) ──
    const byCom: Record<string, number[]> = {};
    for (const p of prices) (byCom[p.commodity] ||= []).push(p.priceUsd);
    const cv = (arr: number[]) => {
      const a = arr.slice(-12); if (a.length < 3) return 0;
      const m = a.reduce((x, y) => x + y, 0) / a.length;
      const sd = Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length);
      return m ? sd / m : 0;
    };

    // ── estimated addressable saving from optimized timing ──
    // per commodity: import value × price volatility × capture rate (fraction of the swing captured)
    let estSaving = 0;
    const drivers: { commodity: string; importUsd: number; volatilityPct: number; savingUsd: number }[] = [];
    for (const [commodity, importUsd] of perCommodityUsd) {
      const vol = cv(byCom[commodity] || []);
      const saving = importUsd * vol * cfg.captureRate;
      if (saving > 0) drivers.push({ commodity, importUsd: Math.round(importUsd), volatilityPct: Math.round(vol * 1000) / 10, savingUsd: Math.round(saving) });
      estSaving += saving;
    }
    drivers.sort((a, b) => b.savingUsd - a.savingUsd);

    return {
      totalImportValueUsd: Math.round(totalUsd),
      valueAtRiskUsd: Math.round(atRiskUsd),
      valueAtRiskPct: totalUsd ? Math.round((atRiskUsd / totalUsd) * 1000) / 10 : 0,
      topOrigin,
      estimatedAnnualSavingUsd: Math.round(estSaving),
      captureRate: cfg.captureRate,
      drivers: drivers.slice(0, 6),
      methodology: 'Bases are live UN Comtrade import values; value-at-risk = import value from origins with WGI risk ≥ ' + cfg.highRiskThreshold + '. Estimated saving = Σ(commodity import value × 12-month price volatility × ' + cfg.captureRate + ' capture) — an addressable timing opportunity, not booked savings.',
    };
  }
}
