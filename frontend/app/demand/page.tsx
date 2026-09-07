'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarClock, Moon, Sparkles, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea,
} from 'recharts';
import { demandApi } from '@/lib/api';
import { useInsightsFocus } from '@/hooks/useInsightsFocus';

interface MonthPoint { month: string; demand: number; supply: number; balance: number; deficit: boolean; ramadan: boolean; hajj: boolean }
interface CommodityDemand {
  commodity: string; annualConsumptionMt: number; annualProductionMt: number; annualImportsMt: number;
  selfSufficiencyPct: number; months: MonthPoint[]; peakMonth: string; deficitMonths: string[];
}

export default function DemandPage() {
  const [data, setData] = useState<CommodityDemand[]>([]);
  const [assumptions, setAssumptions] = useState<any>(null);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { setFocus } = useInsightsFocus();

  useEffect(() => {
    demandApi.get().then((r) => {
      setData(r.commodities || []);
      setAssumptions(r.assumptions || null);
      if ((r.commodities || []).length) setSelected(r.commodities[0].commodity);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => data.find((d) => d.commodity === selected), [data, selected]);

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-[#94a3b8] flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-[#c8a45c]" /> 12-month demand projection — FAO FBS consumption baseline shaped by Ramadan/Hajj seasonality &amp; population growth, vs supply.
        </p>
        {data.length > 0 && (
          <select value={selected} onChange={(e) => { setSelected(e.target.value); setFocus({ context: 'demand', key: e.target.value, label: `${e.target.value} demand` }); }}
            className="bg-[#080e1a] border border-[#1a2d45] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#c8a45c]">
            {data.map((d) => <option key={d.commodity} value={d.commodity}>{d.commodity}</option>)}
          </select>
        )}
      </div>

      {loading && <p className="text-[#94a3b8] text-sm">Computing demand projection…</p>}
      {!loading && !data.length && <p className="text-[#94a3b8] text-sm">No demand baselines yet.</p>}

      {active && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{(active.annualConsumptionMt / 1e6).toFixed(2)}M</p>
              <p className="text-xs text-[#94a3b8]">Annual consumption (MT)</p>
            </div>
            <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{active.selfSufficiencyPct}%</p>
              <p className="text-xs text-[#94a3b8]">Domestic self-sufficiency</p>
            </div>
            <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
              <p className="text-2xl font-bold text-white flex items-center gap-1"><Sparkles className="w-4 h-4 text-[#c8a45c]" /> {active.peakMonth}</p>
              <p className="text-xs text-[#94a3b8]">Peak demand month</p>
            </div>
            <div className={`rounded-xl p-4 border ${active.deficitMonths.length ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <p className="text-2xl font-bold text-white flex items-center gap-1">
                {active.deficitMonths.length ? <TrendingDown className="w-4 h-4 text-red-400" /> : null}{active.deficitMonths.length}
              </p>
              <p className="text-xs text-[#94a3b8]">Projected deficit months</p>
            </div>
          </div>

          {/* Demand vs supply chart */}
          <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><CalendarClock className="w-4 h-4 text-[#c8a45c]" /> {active.commodity} — monthly demand vs supply (MT)</h3>
              <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-[#c8a45c]" /> Ramadan</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Hajj</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={active.months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={{ background: '#0f1d2f', border: '1px solid #1a2d45', borderRadius: '8px' }} labelStyle={{ color: '#e2e8f0' }} formatter={(v: number) => `${v.toLocaleString()} MT`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {/* highlight Ramadan / Hajj months */}
                {active.months.map((m, i) => m.ramadan ? <ReferenceArea key={`r${i}`} x1={m.month} x2={m.month} fill="#c8a45c" fillOpacity={0.12} /> : null)}
                {active.months.map((m, i) => m.hajj ? <ReferenceArea key={`h${i}`} x1={m.month} x2={m.month} fill="#a855f7" fillOpacity={0.12} /> : null)}
                <Area type="monotone" dataKey="supply" name="Supply capacity" stroke="#0d8a5f" fill="#0d8a5f" fillOpacity={0.15} strokeWidth={2} />
                <Line type="monotone" dataKey="demand" name="Projected demand" stroke="#c8a45c" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-[#64748b] mt-2">
              Supply = (production + imports) ÷ 12 (steady). Demand = consumption baseline × seasonal uplift (Ramadan {assumptions?.ramadanUpliftPct}% / Hajj {assumptions?.hajjUpliftPct}%) × population growth {assumptions?.populationGrowthPct}%/yr. Coefficients are estimates — tunable in Settings, pending GASTAT/SAGO review.
            </p>
          </div>

          {/* Deficit callout */}
          {active.deficitMonths.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Projected demand exceeds steady supply in: {active.deficitMonths.join(', ')}</p>
                <p className="text-xs text-[#94a3b8] mt-1">Recommended action: pre-position stock or accelerate forward purchases ahead of these months (esp. the Ramadan/Hajj peak), and draw on strategic reserves if imports can't scale in time.</p>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
