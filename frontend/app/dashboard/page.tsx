'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useInsightsFocus } from '@/hooks/useInsightsFocus';
import { selfSufficiencyApi, commoditiesApi, catalogApi } from '@/lib/api';
import {
  AlertTriangle,
  TrendingUp,
  Globe,
  Activity,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Hexagon,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from 'recharts';

const kpiCards = [
  {
    title: 'Active Alerts',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    title: 'Risk Score',
    value: '68.4',
    change: '-2.1',
    trend: 'down',
    icon: Activity,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
  {
    title: 'Commodities Tracked',
    value: '156',
    change: '+12',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    title: 'Supplier Countries',
    value: '157',
    change: '0',
    trend: 'neutral',
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    title: 'System Health',
    value: '99.2%',
    change: '+0.1',
    trend: 'up',
    icon: ShieldCheck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    title: 'Avg Response',
    value: '4.2h',
    change: '-0.8h',
    trend: 'up',
    icon: Clock,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

const alertTrend = [
  { day: 'Mon', critical: 3, high: 5, medium: 8 },
  { day: 'Tue', critical: 2, high: 7, medium: 6 },
  { day: 'Wed', critical: 4, high: 4, medium: 9 },
  { day: 'Thu', critical: 1, high: 6, medium: 7 },
  { day: 'Fri', critical: 3, high: 8, medium: 5 },
  { day: 'Sat', critical: 2, high: 5, medium: 6 },
  { day: 'Sun', critical: 1, high: 4, medium: 8 },
];

const recentAlerts = [
  { id: 1, level: 'CRITICAL', category: 'Price Spike', title: 'Wheat futures up 8.3% in 48h', source: 'CBOT', time: '12 min ago' },
  { id: 2, level: 'HIGH', category: 'Supply Chain', title: 'Brazil soybean shipment delayed 14 days', source: 'SANTOS_PORT', time: '34 min ago' },
  { id: 3, level: 'HIGH', category: 'Geopolitical', title: 'Trade route disruption: Red Sea', source: 'REUTERS', time: '1h ago' },
  { id: 4, level: 'MEDIUM', category: 'Weather', title: 'Drought alert: Australian wheat belt', source: 'NOAA', time: '2h ago' },
  { id: 5, level: 'MEDIUM', category: 'Policy', title: 'India extends rice export ban', source: 'GOI', time: '3h ago' },
];

const levelStyles: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function DashboardPage() {
  const { setFocus } = useInsightsFocus();
  const [selfSufficiency, setSelfSufficiency] = useState<any[]>([]);
  const [ssYear, setSsYear] = useState<number | null>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [priceCommodities, setPriceCommodities] = useState<string[]>([]);
  // null = show all. Otherwise the set of commodities to display.
  const [visibleSeries, setVisibleSeries] = useState<Set<string> | null>(null);

  const clickSeries = (name: string) =>
    setVisibleSeries((prev) => {
      if (prev === null) return new Set([name]); // first click → isolate to just this one
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name); // add / remove
      return next.size === 0 ? null : next; // emptied → back to all
    });
  const isHidden = (name: string) => visibleSeries !== null && !visibleSeries.has(name);

  useEffect(() => {
    selfSufficiencyApi.list()
      .then((r) => {
        setSelfSufficiency(r.commodities || []);
        setSsYear((r.commodities || []).map((c: any) => c.year).filter(Boolean).sort().pop() || null);
      })
      .catch(() => {});

    // live monthly prices (World Bank) for the commodities SELECTED in Settings
    // (catalog showOnDashboard), rebased to an index (100 = first month) so different
    // price levels share one scale. Only those with a monthly series draw a line.
    catalogApi.list()
      .then((cat) => (cat.commodities || []).filter((c: any) => c.showOnDashboard).map((c: any) => c.name))
      .then((names: string[]) =>
        Promise.all(names.map((c) => commoditiesApi.getPrices(c, 'WorldBank').then((r) => ({ c, rows: r.prices || [] })).catch(() => ({ c, rows: [] })))),
      )
      .then((results) => {
        const withData = results.filter((r) => r.rows.length);
        const commodities = withData.map((r) => r.c);
        const raw: Record<string, Record<string, number>> = {}; // commodity -> period -> price
        const periodSet = new Set<string>();
        for (const { c, rows } of withData) {
          raw[c] = {};
          for (const row of rows) {
            const p = row.metadata?.period || String(row.recordedAt).slice(0, 7);
            raw[c][p] = row.priceUsd;
            periodSet.add(p);
          }
        }
        const periods = [...periodSet].sort().slice(-12);
        const base: Record<string, number> = {};
        for (const c of commodities) base[c] = raw[c][periods[0]] ?? Object.values(raw[c])[0];
        const data = periods.map((p) => {
          const [y, m] = p.split('-');
          const o: any = { period: p, month: new Date(Number(y), Number(m) - 1).toLocaleString('en', { month: 'short' }) };
          for (const c of commodities) {
            const v = raw[c][p];
            o[c] = v != null && base[c] ? Math.round((v / base[c]) * 1000) / 10 : null;
          }
          return o;
        });
        setPriceCommodities(commodities);
        setPriceData(data);
      });
  }, []);

  const PRICE_COLORS = ['#c8a45c', '#0d8a5f', '#7c3aed', '#3b82f6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

  return (
    <DashboardLayout>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.title}
            className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4 hover:border-[#c8a45c]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs ${kpi.trend === 'up' ? 'text-emerald-400' : kpi.trend === 'down' ? 'text-red-400' : 'text-[#94a3b8]'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : kpi.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                {kpi.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-[#94a3b8] mt-1">{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {/* Price Trends */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c8a45c]" /> Commodity Price Trends
            </h3>
            <div className="flex items-center gap-3">
              {visibleSeries !== null && (
                <button onClick={() => setVisibleSeries(null)} className="text-xs text-[#c8a45c] hover:underline">Show all</button>
              )}
              <span className="text-xs text-[#94a3b8]">Indexed to 100 · click a legend item to focus</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#0f1d2f', border: '1px solid #1a2d45', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(v: number, name: string) => [v, name]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, cursor: 'pointer' }}
                onClick={(o: any) => clickSeries(o.dataKey || o.value)}
                formatter={(value: string) => (
                  <span style={{ color: isHidden(value) ? '#475569' : '#cbd5e1', textDecoration: isHidden(value) ? 'line-through' : 'none' }}>{value}</span>
                )}
              />
              {priceCommodities.map((c, i) => (
                <Line key={c} type="monotone" dataKey={c} name={c} stroke={PRICE_COLORS[i % PRICE_COLORS.length]} strokeWidth={2} dot={false} connectNulls hide={isHidden(c)} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Trend */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c8a45c]" /> Alert Distribution
            </h3>
            <span className="text-xs text-[#94a3b8]">This week</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={alertTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#0f1d2f', border: '1px solid #1a2d45', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="critical" fill="#dc2626" radius={[4, 4, 0, 0]} name="Critical" />
              <Bar dataKey="high" fill="#d97706" radius={[4, 4, 0, 0]} name="High" />
              <Bar dataKey="medium" fill="#0d8a5f" radius={[4, 4, 0, 0]} name="Medium" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Self-Sufficiency Radar — click to explain in the AI panel */}
        <div
          onClick={() => setFocus({ context: 'self-sufficiency', key: 'radar', label: 'Self-Sufficiency Radar' })}
          className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 cursor-pointer hover:border-[#c8a45c]/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Hexagon className="w-4 h-4 text-[#c8a45c]" /> Self-Sufficiency Radar
            </h3>
            <span className="text-[10px] text-[#94a3b8] px-1.5 py-0.5 rounded bg-[#080e1a] border border-[#1a2d45]">FAO FBS{ssYear ? ` ${ssYear}` : ''} · click for insights</span>
          </div>
          <p className="text-xs text-[#94a3b8] mb-2">KSA vs GCC average (live) · target (strategic) — % self-sufficiency</p>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={selfSufficiency} outerRadius="72%">
              <PolarGrid stroke="#1a2d45" />
              <PolarAngleAxis dataKey="commodity" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Target" dataKey="target" stroke="#3b82f6" strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
              <Radar name="GCC Avg" dataKey="gcc" stroke="#dc2626" fill="none" strokeWidth={1.5} />
              <Radar name="KSA" dataKey="ksa" stroke="#c8a45c" fill="#c8a45c" fillOpacity={0.35} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f1d2f', border: '1px solid #1a2d45', borderRadius: '8px' }} formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#c8a45c]" /> Recent Alerts
            </h3>
            <button className="text-xs text-[#c8a45c] hover:underline">View All</button>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-[#080e1a] border border-[#1a2d45] hover:border-[#c8a45c]/30 transition-colors"
              >
                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${levelStyles[alert.level]}`}>
                  {alert.level}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{alert.title}</p>
                  <p className="text-xs text-[#94a3b8]">{alert.category} • {alert.source}</p>
                </div>
                <span className="text-xs text-[#94a3b8] shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#c8a45c]" /> System Status
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Data Sources Online', value: '85/88', pct: 97, color: 'bg-emerald-500' },
              { label: 'API Response Time', value: '< 200ms', pct: 95, color: 'bg-cyan-500' },
              { label: 'Model Accuracy', value: '91.4%', pct: 91, color: 'bg-[#c8a45c]' },
              { label: 'Storage Used', value: '68%', pct: 68, color: 'bg-blue-500' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#94a3b8]">{stat.label}</span>
                  <span className="text-white font-medium">{stat.value}</span>
                </div>
                <div className="h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full transition-all`} style={{ width: `${stat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#1a2d45]">
            <p className="text-xs text-[#94a3b8] mb-2">Last Data Refresh</p>
            <p className="text-sm text-white font-mono">{new Date().toLocaleString('en-SA')}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
