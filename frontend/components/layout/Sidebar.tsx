'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  TrendingUp,
  Globe,
  Warehouse,
  BrainCircuit,
  BotMessageSquare,
  FileText,
  Database,
  Newspaper,
  Settings,
  Activity,
  ClipboardList,
  Users,
  ShieldAlert,
  Radio,
  CalendarClock,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Hexagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navSections = [
  {
    label: 'MAIN',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: ShieldAlert, label: 'Risk Heatmap', href: '/risk-heatmap' },
      { icon: AlertTriangle, label: 'Alert Center', href: '/alerts' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { icon: TrendingUp, label: 'Commodity Prices', href: '/commodities' },
      { icon: Globe, label: 'Supplier Map', href: '/suppliers' },
      { icon: Warehouse, label: 'Stock Levels', href: '/stock-levels' },
      { icon: CalendarClock, label: 'Demand Forecast', href: '/demand' },
      { icon: ShoppingCart, label: 'Procurement', href: '/procurement' },
      { icon: BrainCircuit, label: 'Scenarios', href: '/scenarios' },
    ],
  },
  {
    label: 'AI & REPORTS',
    items: [
      { icon: BotMessageSquare, label: 'AI Assistant', href: '/ai-assistant' },
      { icon: FileText, label: 'Reports', href: '/reports' },
    ],
  },
  {
    label: 'DATA',
    items: [
      { icon: Radio, label: 'Live Data', href: '/live-data' },
      { icon: Database, label: 'Data Sources', href: '/data-sources' },
      { icon: Newspaper, label: 'Live News', href: '/news' },
      { icon: Activity, label: 'Monitoring', href: '/monitoring' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { icon: ClipboardList, label: 'Initiatives', href: '/initiatives' },
      { icon: Users, label: 'Users', href: '/users' },
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-[#0B1628] border-r border-[#1a2d45] flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[#1a2d45]">
        <Hexagon className="w-8 h-8 text-[#c8a45c] shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-orbitron text-lg font-bold text-white tracking-wider">
              Nexagon
            </h1>
            <p className="text-[10px] text-[#94a3b8] tracking-widest uppercase">
              Food Security Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="px-4 text-[10px] font-semibold text-[#94a3b8] tracking-widest mb-2">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group relative',
                    isActive
                      ? 'text-[#c8a45c] bg-[#c8a45c]/10 border-r-2 border-[#c8a45c]'
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-[#c8a45c]')} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-14 bg-[#1a2d45] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-[#2a3d55]">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-[#1a2d45] text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
