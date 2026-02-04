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
import { LogOut, Settings, Users, UserCheck, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AdminDashboard() {
  const { user, logout, initialising } = useAuth();
  const router = useRouter();
  const [adminTheme, setAdminTheme] = useState('light');
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalEmployees: 0,
    avgHours: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

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

  useEffect(() => {
    const loadStats = async () => {
      if (!user || user.role !== 'admin') return;
      
      setStatsLoading(true);
      try {
        const dateKey = getTodayKey();
        
        // Load all teachers (role = 'teacher')
        const teachersSnap = await getDocs(
          query(collection(firebaseDb, 'teachers'), orderBy('name'))
        );
        const allTeachers = teachersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        const teachers = allTeachers.filter((t) => t.role === 'teacher');
        const employees = allTeachers.filter((t) => t.role !== 'teacher');
        const totalTeachers = teachers.length;
        const totalEmployees = employees.length;

        // Load today's DTR records
        const dtrSnap = await getDocs(
          query(collection(firebaseDb, 'dtr'), where('date', '==', dateKey))
        );
        const dtrRecords = dtrSnap.docs.map((d) => d.data());
        
        // Calculate average hours
        let totalHours = 0;
        let hoursCount = 0;
        dtrRecords.forEach((rec) => {
          const teacher = teachers.find((t) => t.schoolId === rec.teacherId);
          if (teacher && rec.firstIn && rec.lastOut) {
            const timeIn = new Date(rec.firstIn);
            const timeOut = new Date(rec.lastOut);
            const hours = (timeOut - timeIn) / (1000 * 60 * 60); // Convert to hours
            if (hours > 0) {
              totalHours += hours;
              hoursCount++;
            }
          }
        });
        const avgHours = hoursCount > 0 ? totalHours / hoursCount : 0;

        setStats({
          totalTeachers,
          totalEmployees,
          avgHours: Math.round(avgHours * 10) / 10, // Round to 1 decimal place
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still try to redirect even if logout fails
      router.push('/login');
    }
  };

  const isDark = adminTheme === 'dark';

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
      <header className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg backdrop-blur-sm sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="School logo"
                  className="h-12 w-12 rounded-full border-2 border-white/20 object-cover shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Mindoro State University</h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                  Admin Dashboard - Monitor teachers and Employees
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30 hover:border-red-500/40 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Welcome back, Admin! 👋
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Here's what's happening with your teachers and employees today.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardTitle className="text-sm font-medium text-blue-900 mt-3">
                Total Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">
                {statsLoading ? '...' : stats.totalTeachers}
              </div>
              <p className="text-xs text-blue-700 mt-1 font-medium">
                Registered teachers
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-emerald-500 rounded-xl shadow-md">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardTitle className="text-sm font-medium text-emerald-900 mt-3">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {statsLoading ? '...' : stats.totalEmployees}
              </div>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                Registered employees
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardTitle className="text-sm font-medium text-purple-900 mt-3">
                Average Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {statsLoading ? '...' : (stats.avgHours || 0).toFixed(1)}
              </div>
              <p className="text-xs text-purple-700 mt-1 font-medium">
                Hours per day
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Teachers & Employees Management */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl border border-blue-100/50 p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Staff Management Center
                  </h2>
                  <p className="text-sm text-slate-600">
                    Manage teachers, employees, and monitor activities
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTeachers}</div>
                <div className="text-xs text-blue-600 font-medium">Teachers</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{stats.totalEmployees}</div>
                <div className="text-xs text-purple-600 font-medium">Employees</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Tabs */}
          <Tabs defaultValue="directory" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <TabsTrigger 
                value="directory" 
                className="group flex flex-col items-center gap-2 py-3 px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <div className="w-8 h-8 bg-blue-100 group-data-[state=active]:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Users className="w-4 h-4 text-blue-600 group-data-[state=active]:text-white" />
                </div>
                <span className="group-data-[state=active]:text-blue-600">Directory</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="add-teacher" 
                className="group flex flex-col items-center gap-2 py-3 px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <div className="w-8 h-8 bg-green-100 group-data-[state=active]:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                  <Users className="w-4 h-4 text-green-600 group-data-[state=active]:text-white" />
                </div>
                <span className="group-data-[state=active]:text-green-600">Add Teacher</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="add-employee" 
                className="group flex flex-col items-center gap-2 py-3 px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <div className="w-8 h-8 bg-purple-100 group-data-[state=active]:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                  <Users className="w-4 h-4 text-purple-600 group-data-[state=active]:text-white" />
                </div>
                <span className="group-data-[state=active]:text-purple-600">Add Employee</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="time" 
                className="group flex flex-col items-center gap-2 py-3 px-4 text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 rounded-xl transition-all duration-300 hover:bg-white/50"
              >
                <div className="w-8 h-8 bg-orange-100 group-data-[state=active]:bg-orange-600 rounded-lg flex items-center justify-center transition-colors">
                  <Clock className="w-4 h-4 text-orange-600 group-data-[state=active]:text-white" />
                </div>
                <span className="group-data-[state=active]:text-orange-600">Monitor Time</span>
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Tab Content */}
            <TabsContent value="directory" className="space-y-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Staff Directory</h3>
                    <p className="text-sm text-slate-600">View and manage all registered staff members</p>
                  </div>
                </div>
                <AdminTeacherDirectory />
              </div>
            </TabsContent>

            <TabsContent value="add-teacher" className="space-y-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Add New Teacher</h3>
                    <p className="text-sm text-slate-600">Register a new teacher in the system</p>
                  </div>
                </div>
                <AdminTeacherForm />
              </div>
            </TabsContent>

            <TabsContent value="add-employee" className="space-y-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Add New Employee</h3>
                    <p className="text-sm text-slate-600">Register a new employee in the system</p>
                  </div>
                </div>
                <AdminEmployeeForm />
              </div>
            </TabsContent>

            <TabsContent value="time" className="space-y-6 mt-8">
              <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Time Monitoring</h3>
                    <p className="text-sm text-slate-600">Track attendance and working hours</p>
                  </div>
                </div>
                <AdminTeachersList />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
