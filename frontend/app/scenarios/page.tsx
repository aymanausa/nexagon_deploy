'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrainCircuit, Play, Sparkles, ArrowRight, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { simulationApi } from '@/lib/api';

interface Template { key: string; name: string; category: string; severity: string; description: string; triggerEvent: string; impactedCommodities: string[] }
interface RunResult {
  scenario: { name: string; severity: string; description: string };
  index: { before: number; after: number; delta: number; pillars: { key: string; label: string; before: number | null; after: number | null }[] };
  commodities: { commodity: string; importChangePct: number; deficitBefore: number; deficitAfter: number; actionBefore: string; actionAfter: string }[];
  mitigations: string[];
  brief: string | null;
}

const sevStyle: Record<string, string> = {
  severe: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};
const actionStyle: Record<string, string> = { buy: 'text-red-400', hold: 'text-amber-400', defer: 'text-emerald-400' };

export default function ScenariosPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => { simulationApi.templates().then((r) => setTemplates(r.templates || [])).catch(() => {}); }, []);

  const run = async (key: string) => {
    setRunning(key); setResult(null);
    try { setResult(await simulationApi.run(key)); } catch {} finally { setRunning(null); }
  };

  return (
    <DashboardLayout>
      <p className="text-sm text-[#94a3b8] mb-4 flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-[#c8a45c]" /> What-if stress tests — apply a shock and re-run the food-security index, demand &amp; procurement to see the impact + mitigations.
      </p>

      {/* Scenario templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {templates.map((t) => (
          <div key={t.key} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#94a3b8] px-2 py-0.5 rounded bg-[#080e1a] border border-[#1a2d45]">{t.category}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sevStyle[t.severity]}`}>{t.severity.toUpperCase()}</span>
            </div>
            <h3 className="font-semibold text-white mb-1">{t.name}</h3>
            <p className="text-xs text-[#94a3b8] mb-2 flex-1">{t.description}</p>
            <p className="text-[11px] text-[#64748b] mb-3">Impacts: {t.impactedCommodities.join(', ')}</p>
            <button onClick={() => run(t.key)} disabled={!!running}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-[#c8a45c] text-[#0B1628] rounded-lg text-sm font-semibold hover:bg-[#d4b76a] transition-colors disabled:opacity-50">
              {running === t.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {running === t.key ? 'Simulating…' : 'Run simulation'}
            </button>
          </div>
        ))}
      </div>

      {/* Result panel */}
      {result && (
        <div className="bg-[#0f1d2f] border border-[#c8a45c]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{result.scenario.name} — projected impact</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded border ${sevStyle[result.scenario.severity]}`}>{result.scenario.severity.toUpperCase()}</span>
          </div>

          {/* Overall index before → after */}
          <div className="flex items-center gap-6 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{result.index.before}</p>
                <p className="text-[10px] text-[#94a3b8]">before</p>
              </div>
              <ArrowRight className="w-6 h-6 text-[#94a3b8]" />
              <div className="text-center">
                <p className={`text-3xl font-bold ${result.index.delta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{result.index.after}</p>
                <p className="text-[10px] text-[#94a3b8]">after</p>
              </div>
              <span className={`text-lg font-bold ${result.index.delta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {result.index.delta > 0 ? '+' : ''}{result.index.delta}
              </span>
            </div>
            <div className="flex-1 min-w-[240px] grid grid-cols-2 sm:grid-cols-4 gap-2">
              {result.index.pillars.map((p) => {
                const d = (p.after ?? 0) - (p.before ?? 0);
                return (
                  <div key={p.key} className="bg-[#080e1a] rounded-lg p-2 text-center">
                    <p className="text-[10px] text-[#94a3b8]">{p.label}</p>
                    <p className="text-sm text-white">{p.before ?? '—'} → <span className={d < 0 ? 'text-red-400' : d > 0 ? 'text-emerald-400' : 'text-white'}>{p.after ?? '—'}</span></p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI brief */}
          {result.brief && (
            <div className="bg-gradient-to-br from-[#c8a45c]/10 to-transparent border border-[#c8a45c]/20 rounded-lg p-4 mb-5">
              <p className="text-xs font-semibold text-[#c8a45c] flex items-center gap-1.5 mb-1"><Sparkles className="w-3.5 h-3.5" /> Crisis brief</p>
              <div className="text-sm text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">{result.brief}</div>
            </div>
          )}

          {/* Per-commodity impact */}
          {result.commodities.length > 0 && (
            <div className="mb-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#94a3b8] border-b border-[#1a2d45]">
                    <th className="pb-2 font-medium">Commodity</th>
                    <th className="pb-2 font-medium">Imports</th>
                    <th className="pb-2 font-medium">Deficit months</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {result.commodities.map((c) => (
                    <tr key={c.commodity} className="border-b border-[#1a2d45]/50">
                      <td className="py-2 text-white">{c.commodity}</td>
                      <td className="py-2 text-red-400">{c.importChangePct}%</td>
                      <td className="py-2 text-[#94a3b8]">{c.deficitBefore} → <span className={c.deficitAfter > c.deficitBefore ? 'text-red-400' : 'text-white'}>{c.deficitAfter}</span></td>
                      <td className="py-2">
                        <span className="text-[#94a3b8]">{c.actionBefore}</span> → <span className={`font-semibold ${actionStyle[c.actionAfter]}`}>{c.actionAfter.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mitigations */}
          <div>
            <p className="text-xs font-semibold text-white flex items-center gap-1.5 mb-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Recommended mitigations</p>
            <ul className="space-y-1.5">
              {result.mitigations.map((m, i) => (
                <li key={i} className="text-sm text-[#cbd5e1] flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span> {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!result && !running && (
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#c8a45c]" />
          <p className="text-sm text-[#94a3b8]">Pick a scenario above and run it — the impact is computed live from the current index, suppliers, demand and procurement data.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
