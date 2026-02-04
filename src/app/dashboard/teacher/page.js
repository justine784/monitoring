'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherClock from '@/components/teacher/teacher-clock';
import TeacherLocation from '@/components/teacher/teacher-location';
import { LogOut, Clock, BookOpen, MapPin, Users, TrendingUp, ChevronDown, Settings, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeacherDashboard() {
  const { user, logout, initialising } = useAuth();
  const router = useRouter();
  
  // Add error boundary fallback - MUST be called before any early returns
  const [hasError, setHasError] = useState(false);

  // Add authentication check effect
  useEffect(() => {
    if (!initialising && (!user || user.role !== 'teacher')) {
      router.push('/login');
    }
  }, [user, initialising, router]);

  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-lg p-6 text-center">
          <img src="/globe.svg" alt="Loading" className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Loading Teacher Dashboard</p>
          <p className="text-xs text-slate-500 mt-1">Please wait...</p>
          <div className="mt-4 flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-lime-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-2">Access Denied</p>
          <p className="text-xs text-slate-600 mb-4">
            {!user ? 'Please log in to access the teacher dashboard.' : 'You are not authorized to view this page.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
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

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-2">Something went wrong</p>
          <p className="text-xs text-slate-600 mb-4">
            There was an error loading the teacher dashboard. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`,
          }}></div>
        </div>

        {/* Header */}
        <header className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg backdrop-blur-sm sticky top-0 z-50 border-b border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Teacher Dashboard</h1>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">
                    Welcome back, {user.name}! 👋 Manage your class efficiently
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="group flex items-center gap-2 sm:gap-3 rounded-full border border-white/20 bg-white/10 px-3 sm:px-4 py-2 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/30 group-hover:ring-4 group-hover:ring-white/50 transition-all">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-semibold text-white truncate max-w-[140px] group-hover:text-blue-100 transition-colors">
                          {user.name}
                        </span>
                        <span className="text-xs text-blue-100 font-medium truncate max-w-[140px] flex items-center gap-1">
                          <span className="opacity-75">ID:</span>
                          {user.schoolId}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-2xl border border-blue-200 bg-white overflow-hidden">
                    <DropdownMenuLabel className="p-0">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold border-2 border-white/30">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-base truncate">{user.name}</div>
                            <div className="text-blue-100 text-sm font-medium truncate">
                              Teacher ID: {user.schoolId}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-400/20 text-green-100 border border-green-400/30">
                                Active
                              </span>
                              <span className="text-blue-200 text-xs">Online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-blue-100" />
                    <div className="p-2 space-y-1">
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">Profile</div>
                          <div className="text-xs text-slate-500">View your profile</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">Settings</div>
                          <div className="text-xs text-slate-500">Account preferences</div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900">Help & Support</div>
                          <div className="text-xs text-slate-500">Get assistance</div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="bg-blue-100" />
                    <DropdownMenuItem
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer transition-colors group"
                      onClick={handleLogout}
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-600 group-hover:text-red-700">Logout</div>
                        <div className="text-xs text-red-500">Sign out from account</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  Ready to teach today? 📚
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  Track your class attendance, manage your schedule, and monitor student activities.
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="text-5xl">🎓</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-slate-900">5</p>
                <p className="text-xs text-blue-600 mt-1">Class 10-A</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Present Today</p>
                <p className="text-2xl font-bold text-emerald-600">3</p>
                <p className="text-xs text-emerald-600 mt-1">60% attendance</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <TrendingUp className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Logbook Entries</p>
                <p className="text-2xl font-bold text-purple-600">5</p>
                <p className="text-xs text-purple-600 mt-1">This week</p>
              </div>
            </div>
          </div>

          {/* Main Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clock Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Time Tracking</h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <TeacherClock teacherId={user.schoolId} />
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Location Tracking</h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <TeacherLocation />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Teacher dashboard rendering error:', error);
    setHasError(true);
    return null;
  }
}
