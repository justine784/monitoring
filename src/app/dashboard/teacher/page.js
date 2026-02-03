'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherClock from '@/components/teacher/teacher-clock';
import { LogOut } from 'lucide-react';
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
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
            
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-lime-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                      {user.schoolId}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-xl border border-slate-200">
                <DropdownMenuLabel className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-lime-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-600 font-mono truncate">
                        ID: {user.schoolId}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">Role: Teacher</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs text-red-600 focus:text-red-700 cursor-pointer flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Logout from Teacher account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs text-slate-600 mt-1">In Class 10-A</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Present Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">3</div>
                <p className="text-xs text-slate-600 mt-1">60% attendance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Logbook Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5</div>
                <p className="text-xs text-slate-600 mt-1">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Clock Section */}
          <div className="bg-white rounded-lg border p-6">
            <TeacherClock teacherId={user.schoolId} />
          </div>
        </div>
      </main>
    </div>
  );
}
