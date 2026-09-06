'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TrendingUp, TrendingDown, Minus, BarChart3, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { commoditiesApi, catalogApi } from '@/lib/api';
import { useInsightsFocus } from '@/hooks/useInsightsFocus';

// Linear-regression forecast of the next period + confidence from fit quality (R²).
interface Forecast { value: number; confidence: number; slope: number; n: number }
function forecastNext(series: { price: number }[]): Forecast | null {
  const n = series.length;
  if (n < 3) return null;
  const ys = series.map((s) => s.price);
  const mx = (n - 1) / 2;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0, ssTot = 0;
  for (let i = 0; i < n; i++) { num += (i - mx) * (ys[i] - my); den += (i - mx) ** 2; ssTot += (ys[i] - my) ** 2; }
  const slope = den ? num / den : 0;
  const intercept = my - slope * mx;
  let ssRes = 0;
  for (let i = 0; i < n; i++) { const pred = intercept + slope * i; ssRes += (ys[i] - pred) ** 2; }
  const r2 = ssTot ? 1 - ssRes / ssTot : 0;
  const value = Math.round((intercept + slope * n) * 100) / 100;
  const confidence = Math.max(0, Math.min(95, Math.round(r2 * 100)));
  return { value: Math.max(0, value), confidence, slope: Math.round(slope * 100) / 100, n };
}

interface PriceRow {
  commodity: string;
  priceUsd: number;
  changePercent: number;
  source: string;
  recordedAt: string;
  metadata?: { unit?: string; year?: string; period?: string; basis?: string };
}
interface CatalogRow { name: string; category: string; showOnDashboard: boolean; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (period?: string) => {
  if (!period) return '';
  const [y, m] = period.split('-');
  return `${MONTHS[Number(m) - 1]}${m === '01' ? ` '${y.slice(2)}` : ''}`;
};

export default function CommoditiesPage() {
  const [monthly, setMonthly] = useState<PriceRow[]>([]);
  const [yearly, setYearly] = useState<PriceRow[]>([]);
  const [shown, setShown] = useState<CatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState('');
  const [mode, setMode] = useState<'monthly' | 'yearly'>('monthly');
  const [showFcInfo, setShowFcInfo] = useState(false);
  const { setFocus } = useInsightsFocus();

  const selectCommodity = (name: string) => {
    setSelected(name);
    setFocus({ context: 'commodities', key: name, label: name }); // drill the AI panel into this commodity
  };

  useEffect(() => {
    Promise.all([
      commoditiesApi.getPrices(undefined, 'WorldBank'),
      commoditiesApi.getPrices(undefined, 'FAO'),
      catalogApi.list(),
    ])
      .then(([m, y, cat]) => {
        setMonthly(m.prices || []);
        setYearly(y.prices || []);
        setShown((cat.commodities || []).filter((c: CatalogRow) => c.showOnDashboard));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const latestOf = (rows: PriceRow[]) => {
    const map = new Map<string, PriceRow>();
    for (const r of rows) if (!map.has(r.commodity)) map.set(r.commodity, r);
    return map;
  };
  const latestMonthly = latestOf(monthly);
  const latestYearly = latestOf(yearly);

  const cards = shown.map((c) => {
    const m = latestMonthly.get(c.name);
    const y = latestYearly.get(c.name);
    const r = m || y;
    return {
      name: c.name,
      category: c.category,
      price: r?.priceUsd ?? null,
      unit: r?.metadata?.unit || 'USD/tonne',
      change: r?.changePercent ?? 0,
      basis: m ? 'MoM' : 'YoY',
      trend: (r?.changePercent ?? 0) > 0 ? 'up' : (r?.changePercent ?? 0) < 0 ? 'down' : 'stable',
      hasData: !!r,
    };
  });

  useEffect(() => {
    if (cards.length && !cards.some((c) => c.name === selected)) setSelected(cards[0].name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, monthly, yearly]);

  const monthlySeries = monthly
    .filter((r) => r.commodity === selected)
    .map((r) => ({ label: monthLabel(r.metadata?.period), price: r.priceUsd, sort: r.metadata?.period || r.recordedAt }))
    .sort((a, b) => (a.sort < b.sort ? -1 : 1));
  const yearlySeries = yearly
    .filter((r) => r.commodity === selected)
    .map((r) => ({ label: r.metadata?.year || String(new Date(r.recordedAt).getFullYear()), price: r.priceUsd }))
    .sort((a, b) => Number(a.label) - Number(b.label));

  const selRow = mode === 'monthly' ? latestMonthly.get(selected) : latestYearly.get(selected);
  const series = mode === 'monthly' ? monthlySeries : yearlySeries;
  const unit = selRow?.metadata?.unit || 'USD/tonne';

  // forecast + dashed projection appended to the chart
  const fc = forecastNext(series);
  const chartData: { label: string; price: number | null; forecast: number | null }[] =
    series.map((s) => ({ label: s.label, price: s.price, forecast: null }));
  if (fc && chartData.length) {
    chartData[chartData.length - 1].forecast = chartData[chartData.length - 1].price; // anchor the dashed line to the last actual
    chartData.push({ label: 'Forecast', price: null, forecast: fc.value });
  }

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Commodities</h1>
        <p className="text-sm text-[#94a3b8]">Global commodity price tracking and forecasts</p>
      </div>

      {loading && <p className="text-[#94a3b8] text-sm">Loading commodity prices…</p>}
      {error && <p className="text-red-400 text-sm">Failed to load prices: {error}</p>}
      {!loading && !error && cards.length === 0 && (
        <p className="text-[#94a3b8] text-sm">No commodities selected — enable some in Settings → Dashboard Commodities.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {cards.map((c) => {
          const active = c.name === selected;
          return (
            <button
              key={c.name}
              onClick={() => selectCommodity(c.name)}
              className={`text-left rounded-xl p-4 transition-all ${
                active ? 'bg-[#12233a] border border-[#c8a45c] shadow-[0_0_0_1px_rgba(200,164,92,0.4)]' : 'bg-[#0f1d2f] border border-[#1a2d45] hover:border-[#c8a45c]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#94a3b8] px-2 py-0.5 rounded bg-[#080e1a]">{c.category}</span>
                {c.trend === 'up' ? <TrendingUp className="w-4 h-4 text-red-400" /> : c.trend === 'down' ? <TrendingDown className="w-4 h-4 text-emerald-400" /> : <Minus className="w-4 h-4 text-[#94a3b8]" />}
              </div>
              <p className="text-sm text-[#94a3b8]">{c.name}</p>
              {c.hasData ? (
                <>
                  <p className="text-lg font-bold text-white mt-0.5">${c.price!.toLocaleString()}<span className="text-xs text-[#94a3b8] font-normal ml-1">{c.unit}</span></p>
                  <p className={`text-xs mt-1 font-medium ${c.change > 0 ? 'text-red-400' : c.change < 0 ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                    {c.change > 0 ? '+' : ''}{c.change}% {c.basis}
                  </p>
                </>
              ) : (
                <p className="text-xs text-[#94a3b8] mt-2">No data yet</p>
              )}
            </button>
          );
        })}
      </div>

      {cards.length > 0 && (
        <div className="bg-[#0b1728] border border-[#1a2d45] rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#c8a45c]" />
                {selected} — {mode === 'monthly' ? 'Monthly' : 'Annual'} Price Trend
              </h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {selRow ? `Current: $${selRow.priceUsd.toLocaleString()} ${unit} · ${selRow.changePercent > 0 ? '+' : ''}${selRow.changePercent}% ${mode === 'monthly' ? 'MoM' : 'YoY'}` : '—'}
                {fc && (
                  <span className="text-[#3b82f6] relative inline-flex items-center gap-1">
                    {' · '}Forecast: ${fc.value.toLocaleString()} (conf {fc.confidence}%)
                    <button onClick={() => setShowFcInfo((v) => !v)} className="text-[#3b82f6]/70 hover:text-[#3b82f6]" title="How is this forecast made?">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {showFcInfo && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowFcInfo(false)} />
                        <div className="absolute left-0 top-6 z-50 w-72 bg-[#0f1d2f] border border-[#1a2d45] rounded-lg p-3 text-xs text-[#cbd5e1] shadow-2xl leading-relaxed normal-case">
                          <p className="text-white font-medium mb-1">How this forecast is made</p>
                          <p className="mb-1.5">
                            A least-squares <span className="text-white">linear trend</span> over the last {fc.n}{' '}
                            {mode === 'monthly' ? 'months' : 'years'} of {mode === 'monthly' ? 'World Bank' : 'FAO'} data,
                            extended one period forward. Trend is {fc.slope > 0 ? 'rising' : fc.slope < 0 ? 'falling' : 'flat'}
                            {' '}~${Math.abs(fc.slope).toLocaleString()}/{mode === 'monthly' ? 'mo' : 'yr'}.
                          </p>
                          <p className="mb-1.5">
                            <span className="text-white">Confidence {fc.confidence}%</span> is the fit's R² — the share of past
                            price movement the straight line explains. The rest is volatility a line can't capture.
                          </p>
                          <p className="text-[#94a3b8]">Caveat: assumes the recent trend continues; it won't anticipate supply shocks, policy changes, or seasonality.</p>
                        </div>
                      </>
                    )}
                  </span>
                )}
                {' · '}{mode === 'monthly' ? 'World Bank Pink Sheet' : 'FAO producer prices'}
              </p>
            </div>
            <div className="flex rounded-lg border border-[#1a2d45] overflow-hidden text-xs">
              {(['monthly', 'yearly'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 capitalize ${mode === m ? 'bg-[#c8a45c] text-[#0b1728] font-semibold' : 'text-[#94a3b8] hover:text-white'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {series.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#0f1d2f', border: '1px solid #1a2d45', borderRadius: '8px' }} formatter={(v: number, n: string) => [`$${v.toLocaleString()} ${unit}`, n === 'forecast' ? 'Forecast' : selected]} />
                <Line type="monotone" dataKey="price" stroke="#c8a45c" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} connectNulls name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-[#94a3b8]">No {mode} data for {selected}.</div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
