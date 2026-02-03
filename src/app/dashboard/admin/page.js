'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTeachersList from '@/components/admin/admin-teachers-list';
import AdminTeacherForm from '@/components/admin/admin-teacher-form';
import AdminEmployeeForm from '@/components/admin/admin-employee-form';
import AdminTeacherDirectory from '@/components/admin/admin-teacher-directory';
import AdminTeacherLocations from '@/components/admin/admin-teacher-locations';
import { LogOut, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { user, logout, initialising } = useAuth();
  const router = useRouter();
  const [adminTheme, setAdminTheme] = useState('light');

  useEffect(() => {
    if (initialising) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
    }
  }, [user, initialising, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('adminTheme');
    if (stored === 'dark' || stored === 'light') {
      setAdminTheme(stored);
    }
  }, []);

  if (initialising) {
    return (
      <div className="min-h-screen admin-animated-bg flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
        <div className="relative w-full max-w-sm bg-white/90 border rounded-xl shadow-lg p-6 text-center">
          <img src="/globe.svg" alt="Loading" className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Loading Admin Dashboard</p>
          <p className="text-xs text-slate-500 mt-1">Please wait...</p>
          <div className="mt-4 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-lime-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isDark = adminTheme === 'dark';

  return (
    <div
      className={
        isDark
          ? 'min-h-screen bg-slate-950 text-slate-50'
          : 'min-h-screen admin-animated-bg'
      }
    >
      {/* overlay to keep content readable over animated bg */}
      <div
        className={
          isDark
            ? 'fixed inset-0 bg-slate-950/90 pointer-events-none'
            : 'fixed inset-0 bg-white/80 backdrop-blur-sm pointer-events-none'
        }
      />

      {/* Header */}
      <header className="relative bg-white/80 border-b shadow-sm backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Monitor teachers and system activity</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className={
              isDark
                ? 'shadow-md border-slate-800 bg-slate-900'
                : 'shadow-md shadow-sky-100 border-sky-100 bg-white/90'
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">5</div>
              <p className="text-xs text-slate-500 mt-1">Active today</p>
            </CardContent>
          </Card>

          <Card
            className={
              isDark
                ? 'shadow-md border-slate-800 bg-slate-900'
                : 'shadow-md shadow-emerald-100 border-emerald-100 bg-white/90'
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Present Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">5</div>
              <p className="text-xs text-slate-500 mt-1">100% attendance</p>
            </CardContent>
          </Card>

          <Card
            className={
              isDark
                ? 'shadow-md border-slate-800 bg-slate-900'
                : 'shadow-md shadow-blue-100 border-blue-100 bg-white/90'
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">6.6</div>
              <p className="text-xs text-slate-500 mt-1">Hours per day</p>
            </CardContent>
          </Card>

          <Card
            className={
              isDark
                ? 'shadow-md border-slate-800 bg-slate-900'
                : 'shadow-md shadow-purple-100 border-purple-100 bg-white/90'
            }
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Faculty Room</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">3</div>
              <p className="text-xs text-slate-500 mt-1">Entries today</p>
            </CardContent>
          </Card>
        </div>

        {/* Teachers & Employees management */}
        <div
          className={
            isDark
              ? 'bg-slate-900 rounded-lg border border-slate-800 p-6 shadow-md space-y-4'
              : 'bg-white/90 rounded-lg border p-6 shadow-md shadow-slate-100 backdrop-blur-sm space-y-4'
          }
        >
          <h2 className="text-sm font-semibold text-slate-700">
            Teachers &amp; Employees
          </h2>
          <Tabs defaultValue="directory" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="directory">Directory</TabsTrigger>
              <TabsTrigger value="add-teacher">Add Teacher</TabsTrigger>
              <TabsTrigger value="add-employee">Add Employee</TabsTrigger>
              <TabsTrigger value="time">Monitor Time</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>

            <TabsContent value="directory" className="space-y-4">
              <AdminTeacherDirectory />
            </TabsContent>

            <TabsContent value="add-teacher" className="space-y-4">
              <AdminTeacherForm />
            </TabsContent>

            <TabsContent value="add-employee" className="space-y-4">
              <AdminEmployeeForm />
            </TabsContent>

            <TabsContent value="time" className="space-y-4">
              <AdminTeachersList />
            </TabsContent>

            <TabsContent value="locations" className="space-y-4">
              <AdminTeacherLocations />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
