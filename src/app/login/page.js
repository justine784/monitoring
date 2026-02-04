'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { loginWithAutoDetect, loginAdmin } = useAuth();
  const router = useRouter();

  const [schoolId, setSchoolId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithAutoDetect({ schoolId });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin({ email: adminEmail, password: adminPassword });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lime-dancing-bg flex items-center justify-center px-4">
      {/* subtle overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />

      <div className="relative max-w-3xl w-full">
        <Card className="shadow-xl border-lime-300/60 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="px-0 text-slate-500 hover:text-slate-700"
                onClick={() => router.push('/')}
              >
                ← Back to home
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img
                src="/logo.jpg"
                alt="School Monitor Logo"
                className="w-16 h-16 rounded-full shadow-lg logo-animate object-cover"
              />
              <CardTitle className="text-center text-lime-700 text-base md:text-lg title-animate">
                Mindoro State University Monitor Login
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </div>
            )}

            {!showAdminLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">School ID</label>
                  <input
                    type="text"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder="Enter your School ID"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your School ID to automatically access your dashboard
                  </p>
                </div>

                <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(true)}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Admin Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder="admin@school.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in as Admin'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminEmail('');
                      setAdminPassword('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Back to regular login
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


