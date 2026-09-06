'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, Download, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const reportTemplates = [
  { id: 1, name: 'Executive Risk Summary', description: 'High-level risk overview for leadership', format: 'PDF', lastGenerated: '2 hours ago', schedule: 'Daily' },
  { id: 2, name: 'Commodity Price Report', description: 'Price trends and forecasts for all tracked commodities', format: 'Excel', lastGenerated: '4 hours ago', schedule: 'Daily' },
  { id: 3, name: 'Supplier Risk Assessment', description: 'Country and supplier risk rankings', format: 'PDF', lastGenerated: '1 day ago', schedule: 'Weekly' },
  { id: 4, name: 'Stock Level Dashboard', description: 'Current inventory vs targets with projections', format: 'PDF', lastGenerated: '6 hours ago', schedule: 'Daily' },
  { id: 5, name: 'Alert Analytics', description: 'Alert volume, response times, and trends', format: 'Excel', lastGenerated: '12 hours ago', schedule: 'Weekly' },
  { id: 6, name: 'Scenario Impact Report', description: 'Simulated impact of top risk scenarios', format: 'PDF', lastGenerated: '3 days ago', schedule: 'Monthly' },
  { id: 7, name: 'Data Source Health', description: 'API status, latency, and uptime report', format: 'Excel', lastGenerated: '1 hour ago', schedule: 'Daily' },
  { id: 8, name: 'Compliance Report', description: 'SFDA compliance and regulatory tracking', format: 'PDF', lastGenerated: '1 week ago', schedule: 'Monthly' },
];

const recentReports = [
  { id: 'RPT-2026-07-001', name: 'Executive Risk Summary', generated: '2026-07-01 08:00', format: 'PDF', size: '2.4 MB' },
  { id: 'RPT-2026-07-002', name: 'Commodity Price Report', generated: '2026-07-01 06:00', format: 'Excel', size: '4.1 MB' },
  { id: 'RPT-2026-06-030', name: 'Supplier Risk Assessment', generated: '2026-06-30 14:00', format: 'PDF', size: '8.7 MB' },
  { id: 'RPT-2026-06-029', name: 'Stock Level Dashboard', generated: '2026-06-30 12:00', format: 'PDF', size: '3.2 MB' },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<number | null>(null);
  const [generated, setGenerated] = useState<number | null>(null);

  const handleGenerate = (id: number) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      setGenerated(id);
      setTimeout(() => setGenerated(null), 3000);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#c8a45c]" /> Report Templates
          </h3>
          <div className="space-y-3">
            {reportTemplates.map((r) => (
              <div key={r.id} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 flex items-center gap-4 hover:border-[#c8a45c]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#c8a45c]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#c8a45c]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-[#94a3b8]">{r.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#94a3b8]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {r.schedule}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.lastGenerated}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#080e1a] text-[10px]">{r.format}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleGenerate(r.id)}
                  disabled={generating === r.id}
                  className="px-4 py-2 bg-[#c8a45c] text-[#0B1628] rounded-lg text-sm font-semibold hover:bg-[#d4b76a] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {generating === r.id ? 'Generating...' : generated === r.id ? 'Generated!' : 'Generate'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h3 className="font-semibold text-white mb-4">Recently Generated</h3>
          <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
            <div className="space-y-3">
              {recentReports.map((r) => (
                <div key={r.id} className="p-3 rounded-lg bg-[#080e1a] border border-[#1a2d45]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white truncate">{r.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0f1d2f] text-[#94a3b8]">{r.format}</span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mb-2">{r.id} • {r.size}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94a3b8]">{r.generated}</span>
                    <button className="flex items-center gap-1 text-xs text-[#c8a45c] hover:underline">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Auto-Schedule Active</span>
            </div>
            <p className="text-xs text-[#94a3b8]">8 reports are scheduled for automatic generation. Next: Executive Risk Summary at 18:00.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
