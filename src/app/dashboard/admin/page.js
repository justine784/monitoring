'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTeacherDirectory from '@/components/admin/admin-teacher-directory';
import AdminTeacherForm from '@/components/admin/admin-teacher-form';
import AdminEmployeeForm from '@/components/admin/admin-employee-form';
import AdminTeachersList from '@/components/admin/admin-teachers-list';
import AdminTimeRecords from '@/components/admin/admin-time-records';
import AdminIncidentList from '@/components/admin/admin-incident-list';
import AdminUserManagement from '@/components/admin/admin-user-management';
import StaffLocator from '@/components/home/staff-locator';
import { LogOut, Settings, Users, UserCheck, Clock, TrendingUp, AlertTriangle, Menu, X, GraduationCap, Calendar, BarChart3, Shield, MapPin } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('directory');
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className={isDark ? 'min-h-screen bg-slate-950 text-slate-50' : 'min-h-screen bg-slate-50'}>
      {/* Header */}
      <header className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg backdrop-blur-sm sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="School logo"
                  className="h-10 w-10 rounded-full border-2 border-white/20 object-cover shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white hidden sm:block">Mindoro State University</h1>
              <h1 className="text-lg font-bold text-white sm:hidden">MINSU</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out flex flex-col`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation</h2>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveSection('directory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'directory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold text-sm">Directory</span>
            </button>
            <button
              onClick={() => setActiveSection('user-management')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'user-management' ? 'bg-slate-600 text-white shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-semibold text-sm">User Management</span>
            </button>
            <button
              onClick={() => setActiveSection('add-teacher')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'add-teacher' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-semibold text-sm">Add Teacher</span>
            </button>
            <button
              onClick={() => setActiveSection('add-employee')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'add-employee' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-semibold text-sm">Add Employee</span>
            </button>
            <div className="my-4 border-t border-slate-100 pt-4">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Monitoring</h2>
              <button
                onClick={() => setActiveSection('time')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'time' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-semibold text-sm">Monitor Time</span>
              </button>
              <button
                onClick={() => setActiveSection('time-records')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'time-records' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold text-sm">Time Records</span>
              </button>
              <button
                onClick={() => setActiveSection('locator')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'locator' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <MapPin className="w-5 h-5" />
                <span className="font-semibold text-sm">Staff Locator</span>
              </button>
              <button
                onClick={() => setActiveSection('incidents')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === 'incidents' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold text-sm">Incidents</span>
              </button>
            </div>
          </nav>
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[10px] text-slate-500">
              <p className="font-bold text-slate-700 mb-1">MINSU Bongabong</p>
              <p> 2026 Admin Panel v2.0</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-white overflow-hidden group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teachers</p>
                    <h3 className="text-2xl font-black text-slate-900">{statsLoading ? '...' : stats.totalTeachers}</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white overflow-hidden group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employees</p>
                    <h3 className="text-2xl font-black text-slate-900">{statsLoading ? '...' : stats.totalEmployees}</h3>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white overflow-hidden group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Hours</p>
                    <h3 className="text-2xl font-black text-slate-900">{statsLoading ? '...' : stats.avgHours}h</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Content */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-xl shadow-slate-200/50">
              {activeSection === 'directory' && <AdminTeacherDirectory />}
              {activeSection === 'user-management' && <AdminUserManagement />}
              {activeSection === 'add-teacher' && <AdminTeacherForm />}
              {activeSection === 'add-employee' && <AdminEmployeeForm />}
              {activeSection === 'time' && <AdminTeachersList />}
              {activeSection === 'time-records' && <AdminTimeRecords />}
              {activeSection === 'locator' && <StaffLocator />}
              {activeSection === 'incidents' && <AdminIncidentList />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
