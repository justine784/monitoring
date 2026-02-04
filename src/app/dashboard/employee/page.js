'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentClock from '@/components/student/student-clock';
import StudentLogbook from '@/components/student/student-logbook';
import EmployeeTeacherLocator from '@/components/employee/employee-teacher-locator';
import { LogOut, Clock, BookOpen, MapPin, User } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user, logout, initialising } = useAuth();
  const router = useRouter();

  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-lg p-6 text-center">
          <img src="/globe.svg" alt="Loading" className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Loading Employee Dashboard</p>
          <p className="text-xs text-slate-500 mt-1">Please wait...</p>
          <div className="mt-4 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-lime-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'employee') {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`,
        }}></div>
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg backdrop-blur-sm sticky top-0 z-50 border-b border-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Mindoro State University</h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
                  Employee Dashboard - Welcome back, {user.name}! 👋
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <p className="text-xs text-emerald-100">School ID</p>
                <p className="text-sm font-semibold text-white">{user.schoolId}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <p className="text-xs text-emerald-100">Class</p>
                <p className="text-sm font-semibold text-white">{user.class}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-red-500/20 border-red-400/30 text-red-100 hover:bg-red-500/30 hover:border-red-400/40 transition-all duration-200"
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
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Ready for today's tasks? 🚀
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Track your time, view your logbook, and locate teachers efficiently.
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="text-5xl">💼</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Current Time</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Today's Status</p>
                <p className="text-lg font-semibold text-emerald-600">Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Location</p>
                <p className="text-lg font-semibold text-purple-600">Campus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Employee Tools</h2>
            <p className="text-sm text-slate-600">Manage your daily activities and track your progress</p>
          </div>
          
          <Tabs defaultValue="clock" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <TabsTrigger 
                value="clock" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                ⏰ Clock & Hours
              </TabsTrigger>
              <TabsTrigger 
                value="logbook" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                📖 My Logbook
              </TabsTrigger>
              <TabsTrigger 
                value="locate" 
                className="text-xs sm:text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
              >
                📍 Locate Teacher
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clock" className="space-y-4 mt-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Time Tracking</h3>
                </div>
                <StudentClock schoolId={user.schoolId} />
              </div>
            </TabsContent>

            <TabsContent value="logbook" className="space-y-4 mt-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-slate-900">My Logbook</h3>
                </div>
                <StudentLogbook schoolId={user.schoolId} />
              </div>
            </TabsContent>

            <TabsContent value="locate" className="space-y-4 mt-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Locate Teacher</h3>
                </div>
                <EmployeeTeacherLocator />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}


