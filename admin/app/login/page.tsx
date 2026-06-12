'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const resolveCallbackUrl = (value: string) => {
    try {
      const decoded = decodeURIComponent(value);
      const parsed = decoded.startsWith('http://') || decoded.startsWith('https://')
        ? new URL(decoded)
        : new URL(decoded, 'http://localhost');

      if (parsed.pathname === '/login' || parsed.pathname === '/api/auth/signin') {
        const nested = parsed.searchParams.get('callbackUrl');
        return nested ? resolveCallbackUrl(nested) : '/dashboard';
      }

      return parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return value.startsWith('/login') || value.startsWith('/api/auth/signin') ? '/dashboard' : value;
    }
  };

  const callbackUrl = resolveCallbackUrl(rawCallbackUrl);

  const [email, setEmail] = useState('admin@studyvault.pk');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Try credentials login first (email/password)
    try {
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1') + '/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const token = data.data?.tokens?.accessToken;
        const user = data.data?.user;

        if (token && user?.role === 'admin') {
          // Sign in via dev-login provider which will store the backend token
          const result = await signIn('dev-login', {
            email,
            redirect: false,
            callbackUrl,
          });

          if (result?.ok) {
            router.push(callbackUrl);
            router.refresh();
            return;
          }
        } else if (user?.role !== 'admin') {
          setError('Access denied. Admin role required.');
          setLoading(false);
          return;
        }
      }

      // Fallback to dev-login provider
      const result = await signIn('dev-login', {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Invalid credentials or backend unavailable. Check backend is running.');
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Connection failed. Is the backend running on port 4000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">StudyVault Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to the admin control panel</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="admin@studyvault.pk"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-xs text-slate-500">
              Default credentials: <span className="text-slate-400 font-mono">admin@studyvault.pk</span> / <span className="text-slate-400 font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
