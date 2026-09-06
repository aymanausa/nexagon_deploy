'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Globe, Ship, TrendingUp, Package } from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { suppliersApi } from '@/lib/api';
import { useInsightsFocus } from '@/hooks/useInsightsFocus';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface Breakdown { commodity: string; usd: number; volumeMt: number }
interface Supplier {
  id: string;
  name: string;
  countryCode: string;
  m49: number | null;
  flag: string | null;
  commodities: string[];
  breakdown: Breakdown[] | null;
  shareOfImports: number;
  totalVolumeMt: number;
  politicalRisk: string;
  economicRisk: string;
  riskScore: number;
  climateRisk: string;
  climateScore: number | null;
  diseaseEvents90d: number | null;
  diseaseTop: string[] | null;
  foodSafetyAlerts: number | null;
  healthExpPctGdp: number | null;
  healthScore: number | null;
}
// a supplier resolved for the current commodity filter
interface ViewRow extends Supplier { viewShare: number; viewVolume: number }

// share -> fill colour (choropleth)
function shadeFor(share: number): string {
  if (share >= 15) return '#c8a45c';
  if (share >= 8) return '#a8863f';
  if (share >= 3) return '#5c6b8a';
  if (share > 0) return '#33415c';
  return '#1a2436';
}
// risk score (0-100, higher = riskier) -> red scale
function riskShade(score: number): string {
  if (score >= 60) return '#dc2626';
  if (score >= 45) return '#d97706';
  if (score >= 30) return '#b0863a';
  if (score > 0) return '#0d8a5f';
  return '#1a2436';
}
// risk band -> text colour
const riskTextColor: Record<string, string> = {
  low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [commodity, setCommodity] = useState('all');
  const [shadeMode, setShadeMode] = useState<'share' | 'risk' | 'climate' | 'health'>('share');
  const [hovered, setHovered] = useState<ViewRow | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const { setFocus } = useInsightsFocus();

  useEffect(() => {
    suppliersApi.list()
      .then((r) => setSuppliers(r.suppliers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const commodities = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((s) => s.commodities.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [suppliers]);

  // resolve each supplier for the selected commodity (or the aggregate when "all")
  const view: ViewRow[] = useMemo(() => {
    if (commodity === 'all') {
      return [...suppliers]
        .map((s) => ({ ...s, viewShare: s.shareOfImports, viewVolume: s.totalVolumeMt }))
        .sort((a, b) => b.viewShare - a.viewShare);
    }
    const rows = suppliers
      .map((s) => {
        const b = (s.breakdown || []).find((x) => x.commodity === commodity);
        return b ? { s, usd: b.usd, vol: b.volumeMt } : null;
      })
      .filter(Boolean) as { s: Supplier; usd: number; vol: number }[];
    const total = rows.reduce((sum, r) => sum + r.usd, 0) || 1;
    return rows
      .map((r) => ({ ...r.s, viewShare: Math.round((r.usd / total) * 1000) / 10, viewVolume: r.vol }))
      .sort((a, b) => b.viewShare - a.viewShare);
  }, [suppliers, commodity]);

  const viewByM49 = useMemo(() => {
    const m = new Map<number, ViewRow>();
    view.forEach((v) => { if (v.m49) m.set(v.m49, v); });
    return m;
  }, [view]);

  const totalVolume = view.reduce((sum, s) => sum + s.viewVolume, 0);
  const topShare = view[0]?.viewShare ?? 0;
  const label = commodity === 'all' ? 'tracked commodities' : commodity;

  const focusCountry = (s: Supplier) =>
    setFocus({ context: 'suppliers', key: s.countryCode, label: s.name });

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-[#94a3b8] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#c8a45c]" /> KSA food-import partners for {label} — live from UN Comtrade (share by import value).
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94a3b8]">Commodity</span>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="bg-[#080e1a] border border-[#1a2d45] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#c8a45c]"
          >
            <option value="all">All commodities</option>
            {commodities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
          <Globe className="w-5 h-5 text-[#c8a45c] mb-2" />
          <p className="text-2xl font-bold text-white">{view.length}</p>
          <p className="text-xs text-[#94a3b8]">Partner Countries</p>
        </div>
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
          <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{topShare}%</p>
          <p className="text-xs text-[#94a3b8]">Top Partner Share</p>
        </div>
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
          <Ship className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">{(totalVolume / 1_000_000).toFixed(1)}M</p>
          <p className="text-xs text-[#94a3b8]">Total Volume (MT)</p>
        </div>
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
          <Package className="w-5 h-5 text-cyan-400 mb-2" />
          <p className="text-2xl font-bold text-white">{commodity === 'all' ? commodities.length : 1}</p>
          <p className="text-xs text-[#94a3b8]">{commodity === 'all' ? 'Tracked Commodities' : 'Commodity Selected'}</p>
        </div>
      </div>

      {/* Map */}
      <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#c8a45c]" /> Import Origins{commodity !== 'all' && <span className="text-[#c8a45c] font-normal">· {commodity}</span>}
          </h3>
          <div className="flex items-center gap-1 text-xs bg-[#080e1a] border border-[#1a2d45] rounded-lg p-0.5">
            <button onClick={() => setShadeMode('share')} className={`px-2.5 py-1 rounded ${shadeMode === 'share' ? 'bg-[#c8a45c] text-[#0B1628] font-semibold' : 'text-[#94a3b8]'}`}>Share</button>
            <button onClick={() => setShadeMode('risk')} className={`px-2.5 py-1 rounded ${shadeMode === 'risk' ? 'bg-[#c8a45c] text-[#0B1628] font-semibold' : 'text-[#94a3b8]'}`}>Risk</button>
            <button onClick={() => setShadeMode('climate')} className={`px-2.5 py-1 rounded ${shadeMode === 'climate' ? 'bg-[#c8a45c] text-[#0B1628] font-semibold' : 'text-[#94a3b8]'}`}>Climate</button>
            <button onClick={() => setShadeMode('health')} className={`px-2.5 py-1 rounded ${shadeMode === 'health' ? 'bg-[#c8a45c] text-[#0B1628] font-semibold' : 'text-[#94a3b8]'}`}>Health</button>
          </div>
        </div>
        <div className="w-full relative" onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
          <ComposableMap projectionConfig={{ scale: 145 }} height={380} style={{ width: '100%', height: 'auto' }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => {
                  const v = viewByM49.get(Number(geo.id));
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => v && focusCountry(v)}
                      onMouseEnter={() => setHovered(v ?? null)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        default: { fill: v ? (shadeMode === 'risk' ? riskShade(v.riskScore) : shadeMode === 'climate' ? (v.climateScore != null ? riskShade(v.climateScore) : '#243049') : shadeMode === 'health' ? (v.healthScore != null ? riskShade(v.healthScore) : '#243049') : shadeFor(v.viewShare)) : '#1a2436', stroke: '#0B1628', strokeWidth: 0.4, outline: 'none' },
                        hover: { fill: v ? '#e0c078' : '#243049', outline: 'none', cursor: v ? 'pointer' : 'default' },
                        pressed: { fill: '#e0c078', outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* hover data card */}
          {hovered && (
            <div
              className="fixed z-50 pointer-events-none w-60 bg-[#080e1a] border border-[#c8a45c]/40 rounded-lg p-3 shadow-xl"
              style={{ left: Math.min(pos.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 0) - 260), top: pos.y + 14 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{hovered.flag}</span>
                <span className="text-white font-semibold text-sm">{hovered.name}</span>
                <span className="ml-auto text-[11px] text-[#94a3b8]">#{view.findIndex((x) => x.id === hovered.id) + 1}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#94a3b8]">{commodity === 'all' ? 'Import share' : `${commodity} share`}</span>
                <span className="text-[#c8a45c] font-bold">{hovered.viewShare}%</span>
              </div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#94a3b8]">Volume</span>
                <span className="text-white">{hovered.viewVolume.toLocaleString()} MT</span>
              </div>
              <div className="flex justify-between text-xs mb-1 pt-2 border-t border-[#1a2d45]">
                <span className="text-[#94a3b8]">Risk (WGI)</span>
                <span className="text-white font-semibold">{hovered.riskScore}/100</span>
              </div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#64748b]">Political <span className={riskTextColor[hovered.politicalRisk]}>{hovered.politicalRisk}</span></span>
                <span className="text-[#64748b]">Economic <span className={riskTextColor[hovered.economicRisk]}>{hovered.economicRisk}</span></span>
              </div>
              <div className="flex justify-between text-[11px] mb-2">
                <span className="text-[#64748b]">Climate stress</span>
                <span>{hovered.climateScore != null ? <span className={riskTextColor[hovered.climateRisk]}>{hovered.climateRisk} ({hovered.climateScore})</span> : <span className="text-[#475569]">n/a</span>}</span>
              </div>
              {(hovered.diseaseEvents90d != null || hovered.foodSafetyAlerts != null || hovered.healthExpPctGdp != null) && (
                <div className="pt-2 mb-2 border-t border-[#1a2d45] space-y-1">
                  {hovered.healthScore != null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94a3b8]">Country health</span>
                      <span className={riskTextColor[hovered.healthScore >= 55 ? 'high' : hovered.healthScore >= 30 ? 'medium' : 'low']}>{hovered.healthScore}/100</span>
                    </div>
                  )}
                  {hovered.diseaseEvents90d != null && (
                    <div className="text-[11px] text-[#64748b]">Animal disease (90d): <span className="text-white">{hovered.diseaseEvents90d}</span>{hovered.diseaseTop?.length ? ` · ${hovered.diseaseTop[0]}` : ''}</div>
                  )}
                  {hovered.foodSafetyAlerts != null && (
                    <div className="text-[11px] text-[#64748b]">EU food-safety alerts (recent): <span className="text-white">{hovered.foodSafetyAlerts}</span></div>
                  )}
                  {hovered.healthExpPctGdp != null && (
                    <div className="text-[11px] text-[#64748b]">Health spend: <span className="text-white">{hovered.healthExpPctGdp}% GDP</span></div>
                  )}
                </div>
              )}
              <div className="text-[11px] text-[#94a3b8] leading-snug">
                <span className="text-[#64748b]">Commodities: </span>{hovered.commodities.join(', ') || '—'}
              </div>
              <p className="text-[10px] text-[#c8a45c]/70 mt-2">Click to explain with AI →</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-[#94a3b8]">
          {shadeMode === 'share' ? (
            <>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#c8a45c' }} /> ≥15%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#a8863f' }} /> 8–15%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#5c6b8a' }} /> 3–8%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#33415c' }} /> &lt;3%</span>
            </>
          ) : (
            <>
              <span className="text-[#64748b]">{shadeMode === 'risk' ? 'WGI risk:' : shadeMode === 'climate' ? 'Climate stress:' : 'Country health:'}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#0d8a5f' }} /> low</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#b0863a' }} /> moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#d97706' }} /> elevated</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#dc2626' }} /> high</span>
              {(shadeMode === 'climate' || shadeMode === 'health') && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#243049' }} /> n/a</span>}
            </>
          )}
        </div>
      </div>

      {/* Top Suppliers Table */}
      <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#c8a45c]" /> Top Suppliers{commodity !== 'all' && <span className="text-[#c8a45c] font-normal">· {commodity}</span>}
        </h3>
        {loading && <p className="text-[#94a3b8] text-sm">Loading suppliers…</p>}
        {!loading && view.length === 0 && <p className="text-[#94a3b8] text-sm">No supplier data for this selection.</p>}
        {view.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#94a3b8] border-b border-[#1a2d45]">
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Country</th>
                  <th className="pb-3 font-medium">Import Share</th>
                  <th className="pb-3 font-medium">Volume (MT)</th>
                  <th className="pb-3 font-medium">Risk (WGI)</th>
                  <th className="pb-3 font-medium">Commodities</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {view.slice(0, 15).map((s, i) => (
                  <tr
                    key={s.id}
                    onClick={() => focusCountry(s)}
                    className="border-b border-[#1a2d45]/50 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3 text-white font-mono">#{i + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s.flag}</span>
                        <span className="text-white font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-white font-semibold">{s.viewShare}%</td>
                    <td className="py-3 text-[#94a3b8]">{s.viewVolume.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`font-semibold ${riskShade(s.riskScore) === '#dc2626' ? 'text-red-400' : riskShade(s.riskScore) === '#d97706' ? 'text-orange-400' : riskShade(s.riskScore) === '#b0863a' ? 'text-amber-400' : 'text-emerald-400'}`}>{s.riskScore}</span>
                      <span className="text-[#64748b] text-xs"> ({s.politicalRisk})</span>
                    </td>
                    <td className="py-3 text-[#94a3b8]">{s.commodities.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
