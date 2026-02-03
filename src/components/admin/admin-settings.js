'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [showLiveAnimation, setShowLiveAnimation] = useState(true);
  const [defaultRole, setDefaultRole] = useState('teacher');

  const handleSave = (e) => {
    e.preventDefault();
    // For now this is just UI; you can wire to Firestore later.
  };

  return (
    <Card className="border-dashed border-lime-300/70">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Email alerts</p>
              <p className="text-xs text-slate-500">
                Receive email notifications for teacher attendance issues.
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  emailAlerts ? 'bg-lime-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    emailAlerts ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Animated background</p>
              <p className="text-xs text-slate-500">
                Toggle subtle background animation for this dashboard.
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={showLiveAnimation}
                onChange={(e) => setShowLiveAnimation(e.target.checked)}
              />
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  showLiveAnimation ? 'bg-sky-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    showLiveAnimation ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </span>
            </label>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-800">Default role for new accounts</p>
            <p className="text-xs text-slate-500">
              Choose which role is pre-selected when adding a new person.
            </p>
            <select
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value)}
              className="mt-1 w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white"
            >
              <option value="teacher">Teacher</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <Button
            type="submit"
            className="mt-2 bg-lime-600 hover:bg-lime-700"
            variant="default"
          >
            Save (UI only)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


