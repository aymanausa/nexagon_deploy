'use client';

import {
  Bell,
  Moon,
  Sun,
  Search,
  User,
  LogOut,
  Shield,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'High Risk: Wheat price surge detected', time: '2 min ago', read: false },
    { id: 2, title: 'Alert: Brazil supplier delay', time: '15 min ago', read: false },
    { id: 3, title: 'System: Daily report generated', time: '1 hour ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-[#0B1628]/80 backdrop-blur-md border-b border-[#1a2d45] flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="flex items-center gap-2 bg-[#0f1d2f] rounded-lg px-3 py-2 w-96 border border-[#1a2d45]">
        <Search className="w-4 h-4 text-[#94a3b8]" />
        <input
          type="text"
          placeholder="Search alerts, commodities, suppliers..."
          className="bg-transparent text-sm text-white placeholder-[#94a3b8] outline-none w-full"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/10 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 bg-[#0f1d2f] border border-[#1a2d45] rounded-lg shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1a2d45] flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">Notifications</h3>
                  <span className="text-xs text-[#94a3b8]">{unreadCount} unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-[#1a2d45]/50 hover:bg-white/5 cursor-pointer transition-colors ${
                        !n.read ? 'bg-[#c8a45c]/5' : ''
                      }`}
                    >
                      <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-[#94a3b8]'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-[#94a3b8] mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#c8a45c]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#c8a45c]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white leading-tight">{user?.fullName || 'User'}</p>
              <p className="text-xs text-[#94a3b8] leading-tight">{user?.role || 'Viewer'}</p>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-12 w-56 bg-[#0f1d2f] border border-[#1a2d45] rounded-lg shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1a2d45]">
                  <p className="font-medium text-sm text-white">{user?.fullName}</p>
                  <p className="text-xs text-[#94a3b8]">{user?.email || 'user@ews.gov.sa'}</p>
                </div>
                <button className="w-full px-4 py-2.5 text-left text-sm text-[#94a3b8] hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                  <Shield className="w-4 h-4" /> Profile
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
