'use client';

import { useState } from 'react';
import { Hexagon, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (!res?.accessToken) throw new Error('No token returned');
      localStorage.setItem('ews-token', res.accessToken);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080e1a] flex items-center justify-center p-4">
      {/* Background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c8a45c]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c8a45c]/10 border border-[#c8a45c]/30 mb-4">
            <Hexagon className="w-8 h-8 text-[#c8a45c]" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-white tracking-wider">Nexagon</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Food Security Intelligence</p>
          <p className="text-xs text-[#94a3b8]/70 mt-0.5">Saudi Food Security Intelligence Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f1d2f] border border-[#1a2d45] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome Back</h2>
          <p className="text-sm text-[#94a3b8] mb-6">Sign in to access the dashboard</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@ews.gov.sa"
                  className="w-full bg-[#080e1a] border border-[#1a2d45] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-[#94a3b8] outline-none focus:border-[#c8a45c] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#080e1a] border border-[#1a2d45] rounded-lg pl-10 pr-10 py-3 text-sm text-white placeholder-[#94a3b8] outline-none focus:border-[#c8a45c] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#c8a45c] text-[#0B1628] rounded-lg font-semibold hover:bg-[#d4b76a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#1a2d45]">
            <p className="text-xs text-[#94a3b8] text-center">
              Demo Credentials: admin@ews.sa / admin123
            </p>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-[#94a3b8]/50 mt-6">Nexagon v1.0 • K3 Technology</p>
      </div>
    </div>
  );
}
