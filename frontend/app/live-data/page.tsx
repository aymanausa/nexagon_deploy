'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Radio, Database, ArrowRight, Clock } from 'lucide-react';
import { liveDataApi } from '@/lib/api';

interface Provider {
  name: string; granularity: string; note?: string;
  status: string; updateFrequency: string; lastUpdate: string | null;
  endpoint: string | null; records: number; commodities: number;
}
interface Consumer { module: string; path: string; note: string }
interface Dataset {
  key: string; name: string; category: string; description: string;
  providers: Provider[]; consumers: Consumer[];
}

const statusColor = (s: string) =>
  s === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  : s === 'DEGRADED' || s === 'WARNING' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  : s === 'ERROR' ? 'text-red-400 bg-red-500/10 border-red-500/30'
  : 'text-[#94a3b8] bg-[#080e1a] border-[#1a2d45]';

const ago = (iso: string | null) => {
  if (!iso) return '—';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default function LiveDataPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liveDataApi.list()
      .then((r) => setDatasets(r.datasets || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <p className="text-sm text-[#94a3b8] mb-5 flex items-center gap-2">
        <Radio className="w-4 h-4 text-[#c8a45c]" /> The live external data we fetch, and which modules use it.
      </p>

      {loading && <p className="text-[#94a3b8] text-sm">Loading…</p>}
      {error && <p className="text-red-400 text-sm">Failed to load: {error}</p>}

      <div className="space-y-5">
        {datasets.map((ds) => (
          <div key={ds.key} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{ds.name}</h3>
                <p className="text-sm text-[#94a3b8]">{ds.description}</p>
              </div>
              <span className="text-xs text-[#94a3b8] px-2 py-1 rounded bg-[#080e1a] border border-[#1a2d45]">{ds.category}</span>
            </div>

            {/* Fetched from */}
            <p className="text-[11px] uppercase tracking-wide text-[#94a3b8] mb-2">Fetched from</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
              {ds.providers.map((p) => (
                <div key={p.name} className="bg-[#080e1a] border border-[#1a2d45] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm flex items-center gap-2"><Database className="w-4 h-4 text-[#c8a45c]" />{p.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded border ${statusColor(p.status)}`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">{p.granularity}{p.note ? ` · ${p.note}` : ''}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-[#94a3b8]">
                    <span className="text-white font-mono">{p.records.toLocaleString()}</span> rows
                    <span>· {p.commodities} commodities</span>
                    <span>· {p.updateFrequency}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ago(p.lastUpdate)}</span>
                  </div>
                  {p.endpoint && <p className="text-[10px] text-[#94a3b8]/60 mt-1 truncate">{p.endpoint}</p>}
                </div>
              ))}
            </div>

            {/* Used by */}
            <p className="text-[11px] uppercase tracking-wide text-[#94a3b8] mb-2">Used by</p>
            <div className="flex flex-wrap gap-2">
              {ds.consumers.map((c) => (
                <Link
                  key={c.module + c.path}
                  href={c.path}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-[#12233a] border border-[#1a2d45] hover:border-[#c8a45c]/50 transition-colors"
                  title={c.note}
                >
                  <span className="text-sm text-white">{c.module}</span>
                  <span className="text-[11px] text-[#94a3b8]">{c.note}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#c8a45c]" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
