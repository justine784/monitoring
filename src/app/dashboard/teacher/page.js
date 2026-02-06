'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherClock from '@/components/teacher/teacher-clock';
import TeacherLocation from '@/components/teacher/teacher-location';
import TeacherTimeSummary from '@/components/teacher/teacher-time-summary';
import TeacherTimeList from '@/components/teacher/teacher-time-list';
import IncidentReport from '@/components/shared/incident-report';
import { LogOut, Clock, MapPin, Users, ChevronDown, Settings, HelpCircle, TrendingUp, Menu, X, Calendar, AlertTriangle } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('time-tracking');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Add authentication check effect
  useEffect(() => {
    if (!initialising && (!user || user.role !== 'teacher')) {
      router.push('/login');
    }
  }, [user, initialising, router]);

  // Add error boundary fallback - MUST be called before any early returns
  const [hasError, setHasError] = useState(false);

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

  const handleProfile = () => {
    // Navigate to profile page or show profile modal
    router.push('/profile');
  };

  const handleSettings = () => {
    // Navigate to settings page
    router.push('/settings');
  };

  const handleHelpSupport = () => {
    // Navigate to help page or open help modal
    router.push('/help');
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
        <header className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg backdrop-blur-sm sticky top-0 z-50 border-b border-blue-700 overflow-visible">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left side - Menu toggle and Logo */}
              <div className="flex items-center gap-4">
                {/* Menu Toggle Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                {/* Logo and Title */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Teacher Dashboard</h1>
                    <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">
                      Welcome back, {user.name}!
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Profile Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/30 group-hover:ring-4 group-hover:ring-white/50 transition-all">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold text-white truncate max-w-[140px] group-hover:text-blue-100 transition-colors">
                            {user.name}
                          </span>
                          <span className="text-xs text-blue-100 font-medium truncate max-w-[140px] flex items-center gap-1">
                            <span className="opacity-75">ID:</span>
                            {user.schoolId}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors flex-shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border border-blue-200 bg-white overflow-visible z-[60]" 
                      sideOffset={8} 
                      side="bottom" 
                      alignOffset={0}
                      collisionPadding={{ right: 16, left: 16, top: 8, bottom: 8 }}
                    >
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
                        <DropdownMenuItem 
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={handleProfile}
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">Profile</div>
                            <div className="text-xs text-slate-500">View your profile</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={handleSettings}
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">Settings</div>
                            <div className="text-xs text-slate-500">Account preferences</div>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={handleHelpSupport}
                        >
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
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 cursor-pointer transition-colors group border-t border-red-100"
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
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out`}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Navigation</h2>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                <button
                  onClick={() => setActiveSection('time-tracking')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'time-tracking' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Time Tracking</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('location-tracking')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'location-tracking' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Location Tracking</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('time-summary')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'time-summary' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Time Summary</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('time-list')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'time-list' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Time List</span>
                </button>

                <button
                  onClick={() => setActiveSection('incident-reporting')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'incident-reporting' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Incident Reporting</span>
                </button>
              </nav>

              <div className="p-4 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  <p>MSU Monitoring System</p>
                  <p className="mt-1">© 2024 All rights reserved</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-sm mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                      Ready to teach today? 📚
                    </h2>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-5xl">🎓</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Content Based on Active Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg backdrop-blur-sm">
                {activeSection === 'time-tracking' && (
                  <div>
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
                )}

                {activeSection === 'location-tracking' && (
                  <div>
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
                )}

                {activeSection === 'time-summary' && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Time Summary</h3>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <TeacherTimeSummary teacherId={user.schoolId} />
                    </div>
                  </div>
                )}

                {activeSection === 'time-list' && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Time List</h3>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <TeacherTimeList teacherId={user.schoolId} />
                    </div>
                  </div>
                )}

                {activeSection === 'incident-reporting' && (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Incident Reporting</h3>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <IncidentReport />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Teacher dashboard rendering error:', error);
    
    // On critical errors (like auth issues), redirect to login
    // On rendering errors, show error state but allow refresh
    if (error.message && error.message.includes('Authentication')) {
      router.push('/login');
    } else {
      setHasError(true);
    }
    return null;
  }
}
