'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const { loginTeacherOrEmployee, loginAdmin } = useAuth();
  const router = useRouter();

  const [schoolId, setSchoolId] = useState('');
  const [teacherOrEmployeeRole, setTeacherOrEmployeeRole] = useState('teacher');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTeacherEmployeeLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      loginTeacherOrEmployee({ schoolId, role: teacherOrEmployeeRole });
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
      loginAdmin({ email: adminEmail, password: adminPassword });
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
            <Tabs defaultValue="teacher-employee" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4 bg-lime-50">
                <TabsTrigger value="teacher-employee">Teacher / Employee</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <TabsContent value="teacher-employee">
                <form onSubmit={handleTeacherEmployeeLogin} className="space-y-4">
                  <div className="flex gap-2 text-sm">
                    <button
                      type="button"
                      className={`flex-1 border rounded-md px-3 py-2 ${
                        teacherOrEmployeeRole === 'teacher'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 text-slate-700'
                      }`}
                      onClick={() => setTeacherOrEmployeeRole('teacher')}
                    >
                      Teacher
                    </button>
                    <button
                      type="button"
                      className={`flex-1 border rounded-md px-3 py-2 ${
                        teacherOrEmployeeRole === 'employee'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-300 text-slate-700'
                      }`}
                      onClick={() => setTeacherOrEmployeeRole('employee')}
                    >
                      Employee
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">School ID</label>
                    <input
                      type="text"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Enter your School ID"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="admin@school.com"
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
                    />
                  </div>

                  <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in as Admin'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


