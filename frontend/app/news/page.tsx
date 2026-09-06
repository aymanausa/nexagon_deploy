'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Newspaper, ExternalLink, Clock, Tag } from 'lucide-react';

const newsItems = [
  { id: 1, title: 'Wheat prices surge to 18-month high on Ukraine supply concerns', source: 'Reuters', category: 'Price', time: '15 min ago', impact: 'High', summary: 'Chicago wheat futures jumped 3.2% as renewed concerns over Ukrainian grain exports emerged following Black Sea tensions.' },
  { id: 2, title: 'India confirms rice export ban extension through December 2026', source: 'Bloomberg', category: 'Policy', time: '45 min ago', impact: 'High', summary: 'Indian government announces continuation of rice export restrictions, affecting global supply chains.' },
  { id: 3, title: 'Brazil soybean harvest forecast raised by CONAB', source: 'Agriculture.com', category: 'Supply', time: '1 hour ago', impact: 'Medium', summary: 'Brazilian crop agency CONAB raised its 2026 soybean production estimate to 156.2 million tonnes.' },
  { id: 4, title: 'Red Sea shipping delays extend to 15 days average', source: 'Lloyd\'s List', category: 'Logistics', time: '2 hours ago', impact: 'High', summary: 'Maritime intelligence shows average delays through Red Sea now at 15 days, up from 12 last week.' },
  { id: 5, title: 'SFDA announces new import requirements for poultry', source: 'SFDA', category: 'Regulation', time: '3 hours ago', impact: 'Medium', summary: 'New cold chain documentation requirements for poultry imports effective August 1, 2026.' },
  { id: 6, title: 'Australia declares El Nino watch as ocean temperatures rise', source: 'BOM', category: 'Weather', time: '4 hours ago', impact: 'Medium', summary: 'Australian Bureau of Meteorology issues El Nino watch, potential impact on wheat production.' },
  { id: 7, title: 'SALIC signs 3-year barley supply agreement with Ukraine', source: 'SALIC', category: 'Trade', time: '5 hours ago', impact: 'Medium', summary: 'Strategic grain reserve operator secures long-term barley supply deal with Ukrainian exporters.' },
  { id: 8, title: 'EU dairy production down 4.3% year-on-year', source: 'Eurostat', category: 'Supply', time: '6 hours ago', impact: 'Low', summary: 'European dairy output continues decline due to farmer protests and environmental regulations.' },
];

const impactColors: Record<string, string> = {
  High: 'text-red-400 bg-red-500/10',
  Medium: 'text-amber-400 bg-amber-500/10',
  Low: 'text-blue-400 bg-blue-500/10',
};

export default function NewsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {newsItems.map((news) => (
          <div key={news.id} className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-5 hover:border-[#c8a45c]/30 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded text-xs bg-[#080e1a] text-[#94a3b8] flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {news.category}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${impactColors[news.impact]}`}>
                  {news.impact} Impact
                </span>
              </div>
              <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {news.time}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{news.title}</h3>
            <p className="text-sm text-[#94a3b8] mb-3">{news.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94a3b8]">Source: {news.source}</span>
              <button className="flex items-center gap-1 text-xs text-[#c8a45c] hover:underline">
                <ExternalLink className="w-3 h-3" /> Read Full Article
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
