'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const router = useRouter();
  const [adminTheme, setAdminTheme] = useState('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('adminTheme');
    if (stored === 'dark' || stored === 'light') {
      setAdminTheme(stored);
    }
  }, []);

  const handleAdminTheme = (value) => {
    setAdminTheme(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('adminTheme', value);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Design Settings</h1>
            <p className="text-sm text-slate-600 mt-1">
              Adjust the look and feel of Teacher and Employee dashboards.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="bg-white/90 border rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700">
              Dashboard Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="teacher" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="teacher">Teacher Dashboard</TabsTrigger>
                <TabsTrigger value="employee">Employee Dashboard</TabsTrigger>
              </TabsList>

              <TabsContent value="teacher" className="space-y-3 text-sm text-slate-700">
                <p className="text-xs text-slate-500">
                  Choose how the Admin / Teacher dashboard should look.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Theme</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={adminTheme === 'light' ? 'default' : 'outline'}
                        onClick={() => handleAdminTheme('light')}
                      >
                        Light
                      </Button>
                      <Button
                        size="sm"
                        variant={adminTheme === 'dark' ? 'default' : 'outline'}
                        onClick={() => handleAdminTheme('dark')}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Accent color</p>
                    <div className="flex gap-2">
                      <Button size="icon" className="h-7 w-7 rounded-full bg-lime-500" />
                      <Button size="icon" className="h-7 w-7 rounded-full bg-sky-500" />
                      <Button size="icon" className="h-7 w-7 rounded-full bg-purple-500" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="employee" className="space-y-3 text-sm text-slate-700">
                <p className="text-xs text-slate-500">
                  (Demo only) These controls are visual and do not yet persist.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Header style</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Compact
                      </Button>
                      <Button size="sm" variant="outline">
                        Spacious
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Background</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Solid
                      </Button>
                      <Button size="sm" variant="outline">
                        Gradient
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


