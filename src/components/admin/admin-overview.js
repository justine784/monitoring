'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-700">Today&apos;s Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-1">
          <p>All systems operational.</p>
          <p>No critical alerts reported.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-700">Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>Use this dashboard to monitor attendance and teacher activity.</p>
        </CardContent>
      </Card>
    </div>
  );
}


