'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentClock from '@/components/student/student-clock';
import EmployeeTimeSummary from '@/components/employee/employee-time-summary';
import EmployeeTimeList from '@/components/employee/employee-time-list';
import EmployeeLocation from '@/components/employee/employee-location';
import IncidentReport from '@/components/shared/incident-report';
import { LogOut, Clock, MapPin, Users, ChevronDown, Settings, HelpCircle, TrendingUp, Menu, X, Calendar, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EmployeeDashboard() {
  const { user, logout, initialising } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('time-tracking');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Listen for profile updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleProfileUpdate = (event) => {
        console.log('Profile updated event received:', event.detail);
        window.location.reload();
      };

      window.addEventListener('profile-updated', handleProfileUpdate);
      
      return () => {
        window.removeEventListener('profile-updated', handleProfileUpdate);
      };
    }
  }, []);

  // Handle loading state
  if (initialising) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-slate-800">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm bg-white border rounded-xl shadow-lg p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-2">Access Denied</p>
          <p className="text-xs text-slate-600 mb-4">
            {!user ? 'Please log in to access the employee dashboard.' : 'You are not authorized to view this page.'}
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
      router.push('/login');
    }
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleHelpSupport = () => {
    router.push('/help');
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
      <header className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg backdrop-blur-sm sticky top-0 z-50 border-b border-emerald-700 overflow-visible">
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
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Mindoro State University</h1>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
                    Employee Dashboard - Welcome back, {user?.name || 'Guest'}! 👋
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - User Profile Dropdown */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold border-2 border-white/30">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" side="bottom">
                  <DropdownMenuLabel className="p-0">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold border-2 border-white/30">
                            {user?.name?.charAt(0).toUpperCase() || 'G'}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-base truncate">{user?.name || 'Guest'}</div>
                          <div className="text-emerald-100 text-sm font-medium truncate">
                            Employee ID: {user?.schoolId || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-400/20 text-green-100 border border-green-400/30">
                              Active
                            </span>
                            <span className="text-emerald-200 text-xs">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-emerald-100" />
                  <div className="p-2 space-y-1">
                    <DropdownMenuItem 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                      onClick={handleProfile}
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">Profile</div>
                        <div className="text-xs text-slate-500">View your profile</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
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
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                      onClick={handleHelpSupport}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">Help & Support</div>
                        <div className="text-xs text-slate-500">Get assistance</div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-emerald-100" />
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
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Time Tracking</span>
              </button>
              
              <button
                onClick={() => setActiveSection('time-summary')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'time-summary' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
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
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Time List</span>
              </button>

              <button
                onClick={() => setActiveSection('location-tracking')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'location-tracking' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Location Tracking</span>
              </button>

              <button
                onClick={() => setActiveSection('incident-reporting')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === 'incident-reporting' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Incident Reporting</span>
              </button>
            </nav>
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
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Ready for today's tasks? 🚀
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Track your time, view your summary, and manage your work efficiently.
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="text-5xl">💼</div>
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
                    <StudentClock schoolId={user.schoolId} />
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
                    <EmployeeTimeSummary schoolId={user.schoolId} />
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
                    <EmployeeTimeList schoolId={user.schoolId} />
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
                    <EmployeeLocation />
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
}


