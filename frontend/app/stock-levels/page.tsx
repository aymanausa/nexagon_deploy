'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Warehouse, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { stockLevelsApi } from '@/lib/api';
import { useInsightsFocus } from '@/hooks/useInsightsFocus';

interface Stock {
  commodity: string;
  category: string;
  hasData: boolean;
  currentStockMt: number | null;
  targetStockMt: number | null;
  daysOfSupply: number | null;
  status: string; // adequate | watch | low | nodata
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'low':
      return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'LOW' };
    case 'watch':
      return { icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', label: 'WATCH' };
    default:
      return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'ADEQUATE' };
  }
}

export default function StockLevelsPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const { setFocus } = useInsightsFocus();

  useEffect(() => {
    stockLevelsApi.list()
      .then((r) => setStocks(r.stocks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = (s: string) => stocks.filter((x) => x.status === s).length;

  return (
    <DashboardLayout>
      <p className="text-sm text-[#94a3b8] mb-4 flex items-center gap-2">
        <Warehouse className="w-4 h-4 text-[#c8a45c]" /> Watched commodities — current stock &amp; days of supply from USDA PSD (targets are strategic estimates). Commodities without USDA coverage are shown blank.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">{count('adequate')}</p>
          <p className="text-xs text-[#94a3b8]">Adequate Stock Levels</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <TrendingDown className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{count('watch')}</p>
          <p className="text-xs text-[#94a3b8]">Watch List Items</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-white">{count('low')}</p>
          <p className="text-xs text-[#94a3b8]">Low Stock Alert</p>
        </div>
      </div>

      {loading && <p className="text-[#94a3b8] text-sm">Loading stock levels…</p>}
      {!loading && stocks.length === 0 && <p className="text-[#94a3b8] text-sm">No stock data yet.</p>}

      <div className="space-y-4">
        {stocks.map((item) => {
          if (!item.hasData) {
            return (
              <div key={item.commodity} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 opacity-70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Warehouse className="w-5 h-5 text-[#475569]" />
                    <div>
                      <p className="font-semibold text-white">{item.commodity}</p>
                      <p className="text-xs text-[#64748b]">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748b] italic">No USDA PSD stock data</span>
                </div>
              </div>
            );
          }
          const config = getStatusConfig(item.status);
          const Icon = config.icon;
          const pct = item.targetStockMt ? Math.round((item.currentStockMt! / item.targetStockMt) * 100) : 0;
          return (
            <div
              key={item.commodity}
              onClick={() => setFocus({ context: 'stock-levels', key: item.commodity, label: item.commodity })}
              className={`bg-[#0f1d2f] border rounded-xl p-5 cursor-pointer hover:border-[#c8a45c]/50 transition-colors ${config.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Warehouse className={`w-5 h-5 ${config.color}`} />
                  <div>
                    <p className="font-semibold text-white">{item.commodity}</p>
                    <p className="text-xs text-[#94a3b8]">Target: {item.targetStockMt!.toLocaleString()} MT</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${config.color} bg-[#080e1a]`}>
                    <Icon className="w-3 h-3" /> {config.label}
                  </span>
                  <span className="text-xs text-[#94a3b8]">{item.daysOfSupply} days remaining</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-[#1a2d45] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{item.currentStockMt!.toLocaleString()} MT</p>
                  <p className="text-xs text-[#94a3b8]">{pct}% of target</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
