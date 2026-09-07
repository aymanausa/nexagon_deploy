'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ShoppingCart, Sparkles, TrendingUp, TrendingDown, Minus, MapPin, AlertTriangle } from 'lucide-react';
import { procurementApi } from '@/lib/api';
import { useInsightsFocus } from '@/hooks/useInsightsFocus';

interface Origin { country: string; flag: string | null; share: number; riskScore: number; impliedUsdPerMt: number | null; score: number }
interface Rec {
  commodity: string; action: string; urgency: number; quantitySignal: string; quantityMt: number;
  timingWindow: string | null; priceTrend: string | null; origins: Origin[] | null; reasoning: string[];
}
interface Brief { content: string; createdAt: string }

const actionStyle: Record<string, string> = {
  buy: 'bg-red-500/15 text-red-400 border-red-500/40',
  hold: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  defer: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
};
const actionLabel: Record<string, string> = { buy: 'BUY NOW', hold: 'HOLD', defer: 'DEFER' };

export default function ProcurementPage() {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const { setFocus } = useInsightsFocus();

  useEffect(() => {
    procurementApi.get().then((r) => { setRecs(r.recommendations || []); setBrief(r.brief || null); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const trendIcon = (t: string | null) =>
    t?.startsWith('rising') ? <TrendingUp className="w-3.5 h-3.5 text-red-400" /> :
    t?.startsWith('falling') ? <TrendingDown className="w-3.5 h-3.5 text-emerald-400" /> :
    <Minus className="w-3.5 h-3.5 text-[#94a3b8]" />;

  return (
    <DashboardLayout>
      <p className="text-sm text-[#94a3b8] mb-4 flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-[#c8a45c]" /> Buy / hold / defer per commodity — synthesises demand, price forecast, reserves, supplier risk &amp; news. Reasoning shown for every call.
      </p>

      {loading && <p className="text-[#94a3b8] text-sm">Computing recommendations…</p>}

      {brief && (
        <div className="bg-gradient-to-br from-[#c8a45c]/10 to-[#0f1d2f] border border-[#c8a45c]/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#c8a45c]" /> Procurement Brief</h3>
          </div>
          <div className="text-sm text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">{brief.content}</div>
          <p className="text-[10px] text-[#64748b] mt-3">AI summary of the rule-based recommendations below — verify before acting.</p>
        </div>
      )}

      <div className="space-y-4">
        {recs.map((r) => (
          <div key={r.commodity} onClick={() => setFocus({ context: 'procurement', key: r.commodity, label: `${r.commodity} procurement` })}
            className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 cursor-pointer hover:border-[#c8a45c]/40 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${actionStyle[r.action]}`}>{actionLabel[r.action]}</span>
                <div>
                  <p className="font-semibold text-white">{r.commodity}</p>
                  <p className="text-xs text-[#94a3b8] flex items-center gap-2">
                    {trendIcon(r.priceTrend)} price {r.priceTrend} · {r.timingWindow}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[#94a3b8]">Urgency</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.urgency >= 60 ? 'bg-red-500' : r.urgency >= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${r.urgency}%` }} />
                  </div>
                  <span className="text-sm font-bold text-white">{r.urgency}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="bg-[#080e1a] rounded-lg p-3">
                <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide">Quantity</p>
                <p className="text-sm text-white">{r.quantityMt.toLocaleString()} MT <span className="text-[#94a3b8]">({r.quantitySignal})</span></p>
              </div>
              <div className="md:col-span-2 bg-[#080e1a] rounded-lg p-3">
                <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" /> Recommended origins</p>
                <p className="text-sm text-white">
                  {(r.origins || []).length
                    ? (r.origins || []).map((o) => `${o.flag || ''} ${o.country} (risk ${o.riskScore}${o.impliedUsdPerMt ? `, ~$${o.impliedUsdPerMt}/MT` : ''})`).join('  ·  ')
                    : '—'}
                </p>
              </div>
            </div>

            <div className="border-t border-[#1a2d45] pt-3">
              <p className="text-[10px] text-[#94a3b8] uppercase tracking-wide mb-1">Why</p>
              <ul className="space-y-1">
                {r.reasoning.map((why, i) => (
                  <li key={i} className="text-xs text-[#cbd5e1] flex items-start gap-1.5">
                    <span className="text-[#c8a45c] mt-0.5">•</span> {why}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {!loading && !recs.length && (
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <p className="text-sm text-[#94a3b8]">No recommendations yet — they compute from demand, price, reserves and supplier data on the server.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
