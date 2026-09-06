'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Shield, ChevronDown, ChevronRight, Target } from 'lucide-react';
import { foodIndexApi } from '@/lib/api';
import { useInsightsFocus } from '@/hooks/useInsightsFocus';

interface Indicator { key: string; label: string; weight: number; score: number | null; rawValue: string | null; source: string; status: string }
interface Pillar { key: string; label: string; weight: number; target: number; score: number | null; activeCount: number; total: number; indicators: Indicator[] }
interface IndexData { overall: number; overallTarget: number; pillars: Pillar[] }

// score (0-100, higher = healthier) vs target → colour
function scoreColor(score: number | null, target: number): string {
  if (score == null) return 'bg-[#334155]';
  if (score >= target) return 'bg-emerald-500';
  if (score >= target - 15) return 'bg-amber-500';
  if (score >= target - 30) return 'bg-orange-500';
  return 'bg-red-500';
}
function scoreText(score: number | null, target: number): string {
  if (score == null) return 'text-[#64748b]';
  if (score >= target) return 'text-emerald-400';
  if (score >= target - 15) return 'text-amber-400';
  if (score >= target - 30) return 'text-orange-400';
  return 'text-red-400';
}

export default function RiskHeatmapPage() {
  const [data, setData] = useState<IndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { setFocus } = useInsightsFocus();

  useEffect(() => {
    foodIndexApi.get().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  return (
    <DashboardLayout>
      <p className="text-sm text-[#94a3b8] mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#c8a45c]" /> KSA Food-Security Index — 4 pillars, 16 sub-indicators (0–100, higher = healthier). Pending sub-indicators are excluded and weights re-normalised.
      </p>

      {loading && <p className="text-[#94a3b8] text-sm">Computing index…</p>}

      {data && (
        <>
          {/* Overall hero */}
          <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6 mb-6 flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                <path d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32" fill="none" stroke="#1a2d45" strokeWidth="3" />
                <path d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32" fill="none"
                  stroke={data.overall >= data.overallTarget ? '#10b981' : data.overall >= data.overallTarget - 15 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3" strokeDasharray={`${data.overall}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{data.overall}</span>
                <span className="text-[10px] text-[#94a3b8]">/ 100</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Overall Food-Security Score</h2>
              <p className="text-sm text-[#94a3b8] flex items-center gap-1.5 mt-1"><Target className="w-3.5 h-3.5" /> Target {data.overallTarget} · {data.overall >= data.overallTarget ? 'on target' : `${data.overallTarget - data.overall} below target`}</p>
              <p className="text-xs text-[#64748b] mt-2 max-w-md">Composite of Availability (30%), Access (25%), Utilization (20%) and Stability (25%).</p>
            </div>
          </div>

          {/* Pillar cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.pillars.map((p) => (
              <div key={p.key} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl overflow-hidden">
                <button
                  onClick={() => { toggle(p.key); setFocus({ context: 'food-index', key: p.key, label: `${p.label} pillar` }); }}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors text-left"
                >
                  {open[p.key] ? <ChevronDown className="w-4 h-4 text-[#94a3b8]" /> : <ChevronRight className="w-4 h-4 text-[#94a3b8]" />}
                  <div className={`w-14 h-14 rounded-lg bg-[#080e1a] flex items-center justify-center ${scoreText(p.score, p.target)}`}>
                    <span className="text-xl font-bold">{p.score ?? '—'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{p.label}</p>
                      <span className="text-[10px] text-[#94a3b8] px-1.5 py-0.5 rounded bg-[#080e1a] border border-[#1a2d45]">{Math.round(p.weight * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${scoreColor(p.score, p.target)}`} style={{ width: `${p.score ?? 0}%` }} />
                      </div>
                      <span className="text-[10px] text-[#64748b] shrink-0">t{p.target}</span>
                    </div>
                    <p className="text-[11px] text-[#64748b] mt-1">{p.activeCount}/{p.total} sub-indicators active</p>
                  </div>
                </button>

                {open[p.key] && (
                  <div className="border-t border-[#1a2d45] divide-y divide-[#1a2d45]/60">
                    {p.indicators.map((ind) => (
                      <div
                        key={ind.key}
                        onClick={() => setFocus({ context: 'food-index', key: ind.key, label: ind.label })}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-10 text-center">
                          {ind.status === 'active' && ind.score != null
                            ? <span className={`text-sm font-bold ${scoreText(ind.score, p.target)}`}>{ind.score}</span>
                            : <span className="text-[10px] text-[#64748b] px-1 py-0.5 rounded bg-[#080e1a]">pending</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white truncate">{ind.label}</p>
                            <span className="text-[10px] text-[#64748b]">{Math.round(ind.weight * 100)}%</span>
                          </div>
                          <p className="text-[11px] text-[#64748b] truncate">{ind.rawValue || ind.source}</p>
                        </div>
                        {ind.status === 'active' && ind.score != null && (
                          <div className="w-20 h-1.5 bg-[#1a2d45] rounded-full overflow-hidden shrink-0">
                            <div className={`h-full rounded-full ${scoreColor(ind.score, p.target)}`} style={{ width: `${ind.score}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
