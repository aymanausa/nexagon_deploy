'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings, Bell, Shield, Globe, Moon, Sun, Save, LineChart, RefreshCw, Search, Check, Warehouse } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { catalogApi, stockLevelsApi } from '@/lib/api';

interface CatalogRow {
  id: string;
  name: string;
  category: string;
  hasYearly: boolean;
  hasMonthly: boolean;
  hsCode: string | null;
  showOnDashboard: boolean;
  isNew: boolean;
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({ email: true, push: true, criticalOnly: false, dailyDigest: true });
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);

  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [query, setQuery] = useState('');
  const [enabledOnly, setEnabledOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const [adequateDays, setAdequateDays] = useState(90);
  const [watchDays, setWatchDays] = useState(45);
  const [savingTh, setSavingTh] = useState(false);
  const [thNote, setThNote] = useState('');

  const load = () => catalogApi.list().then((r) => setRows(r.commodities || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    stockLevelsApi.getThresholds().then((t) => { setAdequateDays(t.adequateDays); setWatchDays(t.watchDays); }).catch(() => {});
  }, []);

  const saveThresholds = async () => {
    setThNote('');
    if (adequateDays <= watchDays || watchDays < 1) { setThNote('Adequate must be greater than watch, and watch at least 1.'); return; }
    setSavingTh(true);
    try {
      await stockLevelsApi.setThresholds(adequateDays, watchDays);
      setThNote('Thresholds saved — reserves re-coloured.');
    } catch {
      setThNote('Save failed (admin only).');
    } finally {
      setSavingTh(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setNote('');
    try {
      const res = await catalogApi.refresh();
      await load();
      setNote(`Catalog refreshed — ${res.added} new commodit${res.added === 1 ? 'y' : 'ies'} found (${res.total} total).`);
    } catch {
      setNote('Refresh failed.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleShow = async (row: CatalogRow) => {
    const next = !row.showOnDashboard;
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, showOnDashboard: next, isNew: false } : r)));
    setBusy(row.id);
    try { await catalogApi.setShow(row.id, next); } catch { load(); } finally { setBusy(null); }
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const filtered = rows.filter((r) => {
    if (enabledOnly && !r.showOnDashboard) return false;
    return r.name.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase());
  });
  const shownCount = rows.filter((r) => r.showOnDashboard).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        {/* Appearance */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6 mb-4">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-[#c8a45c]" /> Appearance</h3>
          <div className="flex items-center justify-between py-3 border-b border-[#1a2d45]">
            <div><p className="text-sm text-white font-medium">Theme</p><p className="text-xs text-[#94a3b8]">Choose between dark and light mode</p></div>
            <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 bg-[#080e1a] border border-[#1a2d45] rounded-lg text-sm text-white hover:border-[#c8a45c]/50 transition-colors">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div><p className="text-sm text-white font-medium">Language</p><p className="text-xs text-[#94a3b8]">Interface language preference</p></div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#94a3b8]" />
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-[#080e1a] border border-[#1a2d45] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#c8a45c]">
                <option value="en">English</option><option value="ar">Arabic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Commodities */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2"><LineChart className="w-4 h-4 text-[#c8a45c]" /> Dashboard Commodities</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">{shownCount} shown · {rows.length} in catalog. Tick a commodity to add it to the dashboard (data is fetched on enable).</p>
            </div>
            <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-3 py-2 bg-[#080e1a] border border-[#1a2d45] rounded-lg text-xs text-white hover:border-[#c8a45c]/50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Refreshing…' : 'Check FAO for new'}
            </button>
          </div>
          {note && <p className="text-xs text-emerald-400 mb-3">{note}</p>}

          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search commodities…"
                className="w-full bg-[#080e1a] border border-[#1a2d45] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#94a3b8] outline-none focus:border-[#c8a45c]" />
            </div>
            <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
              <input type="checkbox" checked={enabledOnly} onChange={(e) => setEnabledOnly(e.target.checked)} /> Enabled only
            </label>
          </div>

          <div className="border border-[#1a2d45] rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-3 py-2 text-[11px] uppercase tracking-wide text-[#94a3b8] bg-[#080e1a]">
              <span>Commodity</span><span className="w-20 text-center">Category</span><span className="w-14 text-center">Yearly</span><span className="w-14 text-center">Monthly</span><span className="w-20 text-center">HS / Trade</span><span className="w-16 text-center">Show</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filtered.map((r) => (
                <div key={r.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-3 py-2 items-center border-t border-[#1a2d45] text-sm">
                  <span className="text-white flex items-center gap-2">{r.name}{r.isNew && <span className="text-[10px] text-[#c8a45c] px-1.5 py-0.5 rounded bg-[#c8a45c]/10">new</span>}</span>
                  <span className="w-20 text-center text-xs text-[#94a3b8]">{r.category}</span>
                  <span className="w-14 text-center">{r.hasYearly ? <Check className="w-4 h-4 text-emerald-400 inline" /> : <span className="text-[#3a4a5f]">—</span>}</span>
                  <span className="w-14 text-center">{r.hasMonthly ? <Check className="w-4 h-4 text-emerald-400 inline" /> : <span className="text-[#3a4a5f]">—</span>}</span>
                  <span className="w-20 text-center font-mono text-[11px]" title="UN Comtrade HS code(s) — enables supplier trade-flow tracking">{r.hsCode ? <span className="text-emerald-400">{r.hsCode}</span> : <span className="text-[#3a4a5f]">—</span>}</span>
                  <span className="w-16 flex justify-center">
                    <button onClick={() => toggleShow(r)} disabled={busy === r.id || (!r.hasYearly && !r.hasMonthly)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${r.showOnDashboard ? 'bg-[#c8a45c] text-[#0B1628]' : 'border border-[#1a2d45]'} ${busy === r.id ? 'opacity-50' : ''} ${!r.hasYearly && !r.hasMonthly ? 'opacity-30 cursor-not-allowed' : ''}`}>
                      {r.showOnDashboard ? <Check className="w-3.5 h-3.5" /> : ''}
                    </button>
                  </span>
                </div>
              ))}
              {filtered.length === 0 && <p className="px-3 py-4 text-sm text-[#94a3b8]">No commodities match.</p>}
            </div>
          </div>
        </div>

        {/* Stock Level Thresholds */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6 mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2"><Warehouse className="w-4 h-4 text-[#c8a45c]" /> Stock Level Thresholds</h3>
          <p className="text-xs text-[#94a3b8] mt-0.5 mb-4">
            Colour bands by days of supply. No universal standard — national reserves typically use ~90 days (3 months) as a working minimum and ~180 days (6 months) as a strategic buffer.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Adequate ≥ (days)</label>
              <input type="number" min={2} value={adequateDays} onChange={(e) => setAdequateDays(Number(e.target.value))}
                className="w-32 bg-[#080e1a] border border-[#1a2d45] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#c8a45c]" />
            </div>
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Watch ≥ (days)</label>
              <input type="number" min={1} value={watchDays} onChange={(e) => setWatchDays(Number(e.target.value))}
                className="w-32 bg-[#080e1a] border border-[#1a2d45] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#c8a45c]" />
            </div>
            <button onClick={saveThresholds} disabled={savingTh}
              className="flex items-center gap-2 px-4 py-2 bg-[#c8a45c] text-[#0B1628] rounded-lg text-sm font-semibold hover:bg-[#d4b76a] transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {savingTh ? 'Saving…' : 'Save thresholds'}
            </button>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#94a3b8]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Adequate ≥ {adequateDays}d</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Watch {watchDays}–{adequateDays - 1}d</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Low &lt; {watchDays}d</span>
          </div>
          {thNote && <p className="text-xs text-emerald-400 mt-2">{thNote}</p>}
        </div>

        {/* Notifications */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6 mb-4">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-[#c8a45c]" /> Notifications</h3>
          {[
            { key: 'email', label: 'Email Alerts', desc: 'Receive alerts via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'criticalOnly', label: 'Critical Only', desc: 'Only notify for critical alerts' },
            { key: 'dailyDigest', label: 'Daily Digest', desc: 'Receive daily summary email' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#1a2d45] last:border-0">
              <div><p className="text-sm text-white font-medium">{item.label}</p><p className="text-xs text-[#94a3b8]">{item.desc}</p></div>
              <button onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? 'bg-[#c8a45c]' : 'bg-[#1a2d45]'}`}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ left: notifications[item.key as keyof typeof notifications] ? '26px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#c8a45c] text-[#0B1628] rounded-lg font-semibold hover:bg-[#d4b76a] transition-colors">
            <Save className="w-4 h-4" /> Save Settings
          </button>
          {saved && <span className="text-sm text-emerald-400">Settings saved successfully!</span>}
        </div>
      </div>
    </DashboardLayout>
  );
}
