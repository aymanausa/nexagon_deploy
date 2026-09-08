'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClipboardList, Sparkles, RefreshCw, Cog, ChevronRight, Check, X } from 'lucide-react';
import { initiativesApi } from '@/lib/api';

interface Initiative {
  id: string; title: string; category: string; priority: string; description: string; rationale: string | null;
  responsibleEntity: string | null; status: string; source: string | null; sourceKey: string | null;
  linkedCommodity: string | null; linkedPillar: string | null;
}

const STATUSES = ['suggested', 'approved', 'in_progress', 'completed', 'dismissed'];
const statusStyle: Record<string, string> = {
  suggested: 'text-[#c8a45c] bg-[#c8a45c]/10 border-[#c8a45c]/30',
  approved: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  in_progress: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  dismissed: 'text-[#64748b] bg-[#080e1a] border-[#1a2d45]',
};
const prioStyle: Record<string, string> = {
  critical: 'text-red-400', high: 'text-orange-400', medium: 'text-amber-400', low: 'text-[#94a3b8]',
};
const nextStatus: Record<string, string> = { suggested: 'approved', approved: 'in_progress', in_progress: 'completed' };

export default function InitiativesPage() {
  const [items, setItems] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => initiativesApi.list().then((r) => setItems(r.initiatives || [])).catch(() => {});
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const generate = async () => { setBusy(true); try { await initiativesApi.generate(); await load(); } finally { setBusy(false); } };
  const advance = async (i: Initiative, status: string) => { await initiativesApi.update(i.id, { status }); await load(); };

  const count = (s: string) => items.filter((i) => i.status === s).length;
  const shown = filter === 'all' ? items : items.filter((i) => i.status === filter);

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-[#94a3b8] flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#c8a45c]" /> Strategic initiatives — auto-suggested from live findings (procurement, suppliers, reserves, data gaps) + tracked to completion.
        </p>
        <button onClick={generate} disabled={busy}
          className="flex items-center gap-2 px-3 py-2 bg-[#c8a45c] text-[#0B1628] rounded-lg text-sm font-semibold hover:bg-[#d4b76a] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} /> {busy ? 'Generating…' : 'Generate suggestions'}
        </button>
      </div>

      {/* Status summary / filter */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
            className={`rounded-xl p-3 border text-left transition-colors ${filter === s ? statusStyle[s] : 'bg-[#0f1d2f] border-[#1a2d45]'}`}>
            <p className="text-2xl font-bold text-white">{count(s)}</p>
            <p className="text-xs text-[#94a3b8] capitalize">{s.replace('_', ' ')}</p>
          </button>
        ))}
      </div>

      {loading && <p className="text-[#94a3b8] text-sm">Loading…</p>}
      {!loading && !shown.length && <p className="text-[#94a3b8] text-sm">No initiatives{filter !== 'all' ? ` in "${filter}"` : ''} — try Generate suggestions.</p>}

      <div className="space-y-3">
        {shown.map((i) => (
          <div key={i.id} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-start gap-3">
                {i.sourceKey ? <Cog className="w-4 h-4 text-[#c8a45c] mt-1 shrink-0" title="Auto-suggested" /> : <Sparkles className="w-4 h-4 text-blue-400 mt-1 shrink-0" title="Manual" />}
                <div>
                  <p className="font-semibold text-white">{i.title}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    {i.category} · <span className={prioStyle[i.priority]}>{i.priority} priority</span>
                    {i.responsibleEntity && <> · owner {i.responsibleEntity}</>}
                    {i.linkedCommodity && <> · {i.linkedCommodity}</>}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded border capitalize shrink-0 ${statusStyle[i.status]}`}>{i.status.replace('_', ' ')}</span>
            </div>
            {i.description && <p className="text-sm text-[#cbd5e1] mb-1">{i.description}</p>}
            {i.rationale && <p className="text-xs text-[#64748b] mb-3">Why: {i.rationale}</p>}
            {i.status !== 'completed' && i.status !== 'dismissed' && (
              <div className="flex items-center gap-2">
                {nextStatus[i.status] && (
                  <button onClick={() => advance(i, nextStatus[i.status])}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-[#c8a45c] text-[#0B1628] font-semibold hover:bg-[#d4b76a] transition-colors">
                    {i.status === 'in_progress' ? <Check className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {i.status === 'suggested' ? 'Approve' : i.status === 'approved' ? 'Start' : 'Complete'}
                  </button>
                )}
                <button onClick={() => advance(i, 'dismissed')}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-[#080e1a] border border-[#1a2d45] text-[#94a3b8] hover:text-white transition-colors">
                  <X className="w-3 h-3" /> Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
