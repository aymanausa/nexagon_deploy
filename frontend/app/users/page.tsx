'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, Shield, UserPlus, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';

const mockUsers = [
  { id: 1, name: 'Dr. Ayman Al-Ali', email: 'a.ali@salic.gov.sa', role: 'INSTITUTION_ADMIN', institution: 'SALIC', status: 'active', lastActive: '2 min ago' },
  { id: 2, name: 'Eng. Faisal Al-Rashid', email: 'f.rashid@salic.gov.sa', role: 'ANALYST', institution: 'SALIC', status: 'active', lastActive: '15 min ago' },
  { id: 3, name: 'Dr. Noura Al-Farsi', email: 'n.farsi@mewa.gov.sa', role: 'DEPARTMENT_MANAGER', institution: 'MEWA', status: 'active', lastActive: '1 hour ago' },
  { id: 4, name: 'Mr. Khalid Al-Mutairi', email: 'k.mutairi@sfda.gov.sa', role: 'VIEWER', institution: 'SFDA', status: 'active', lastActive: '3 hours ago' },
  { id: 5, name: 'Dr. Hana Al-Sheikh', email: 'h.sheikh@mot.gov.sa', role: 'ANALYST', institution: 'MOT', status: 'inactive', lastActive: '2 days ago' },
  { id: 6, name: 'Eng. Omar Al-Harbi', email: 'o.harbi@ncsa.gov.sa', role: 'VIEWER', institution: 'NCSA', status: 'active', lastActive: '5 hours ago' },
  { id: 7, name: 'Ms. Reem Al-Qahtani', email: 'r.qahtani@mofa.gov.sa', role: 'VIEWER', institution: 'MOFA', status: 'active', lastActive: '30 min ago' },
  { id: 8, name: 'System Admin', email: 'admin@ews.gov.sa', role: 'SUPER_ADMIN', institution: 'EWS', status: 'active', lastActive: 'Just now' },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'text-red-400 bg-red-500/10',
  INSTITUTION_ADMIN: 'text-purple-400 bg-purple-500/10',
  DEPARTMENT_MANAGER: 'text-blue-400 bg-blue-500/10',
  ANALYST: 'text-cyan-400 bg-cyan-500/10',
  VIEWER: 'text-[#94a3b8] bg-[#1a2d45]',
};

export default function UsersPage() {
  const [users] = useState(mockUsers);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-4">
            <Users className="w-5 h-5 text-[#c8a45c] mb-2" />
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-[#94a3b8]">Total Users</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <Shield className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-white">{users.filter((u) => u.status === 'active').length}</p>
            <p className="text-xs text-[#94a3b8]">Active Users</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <Users className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">6</p>
            <p className="text-xs text-[#94a3b8]">Institutions</p>
          </div>
        </div>
        <button className="ml-4 px-4 py-2 bg-[#c8a45c] text-[#0B1628] rounded-lg text-sm font-semibold hover:bg-[#d4b76a] transition-colors flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[#94a3b8] border-b border-[#1a2d45]">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Institution</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#1a2d45]/50 hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c8a45c]/20 flex items-center justify-center text-[#c8a45c] font-bold text-xs">
                        {u.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-xs text-[#94a3b8] flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-[#94a3b8]">{u.institution}</td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1 text-xs ${u.status === 'active' ? 'text-emerald-400' : 'text-[#94a3b8]'}`}>
                      <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-[#94a3b8]'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#94a3b8] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {u.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
