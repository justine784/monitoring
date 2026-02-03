'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple static log entries for now; you can wire this to real data later
const MOCK_ACTIVITY = [
  { id: 1, time: '08:15', user: 'John Doe', action: 'Clocked in', details: 'Room 201' },
  { id: 2, time: '09:05', user: 'Jane Smith', action: 'Entered faculty room', details: 'Faculty Room A' },
  { id: 3, time: '12:30', user: 'John Doe', action: 'Clocked out', details: 'Room 201' },
];

export default function AdminActivityLog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {MOCK_ACTIVITY.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between border-b last:border-0 pb-2 last:pb-0"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {entry.user}{' '}
                  <span className="font-normal text-slate-500">• {entry.action}</span>
                </p>
                <p className="text-xs text-slate-500">{entry.details}</p>
              </div>
              <span className="text-xs text-slate-400 ml-4 whitespace-nowrap">{entry.time}</span>
            </div>
          ))}
          {MOCK_ACTIVITY.length === 0 && (
            <p className="text-sm text-slate-500">No recent activity to display.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


