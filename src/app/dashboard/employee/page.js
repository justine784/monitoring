'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentClock from '@/components/student/student-clock';
import StudentLogbook from '@/components/student/student-logbook';
import EmployeeTeacherLocator from '@/components/employee/employee-teacher-locator';
import { LogOut } from 'lucide-react';

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
            <h1 className="text-2xl font-bold text-slate-900">Mindoro State University</h1>
            <p className="text-sm text-slate-600 mt-1">Welcome, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">School ID: {user.schoolId}</p>
              <p className="text-xs text-slate-600">Class {user.class}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Tabs */}
          <Tabs defaultValue="clock" className="bg-white rounded-lg border p-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="clock">Clock & Hours</TabsTrigger>
              <TabsTrigger value="logbook">My Logbook</TabsTrigger>
              <TabsTrigger value="locate">Locate Teacher</TabsTrigger>
            </TabsList>

            <TabsContent value="clock" className="space-y-4">
              <StudentClock schoolId={user.schoolId} />
            </TabsContent>

            <TabsContent value="logbook" className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-4">My Logbook</h2>
                <StudentLogbook schoolId={user.schoolId} />
              </div>
            </TabsContent>

            <TabsContent value="locate" className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-4">Locate Teacher</h2>
                <EmployeeTeacherLocator />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}


