'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeTeacherLocator() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(firebaseDb, 'teacherLocations'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const aTs = a.createdAt?.seconds ?? 0;
          const bTs = b.createdAt?.seconds ?? 0;
          return bTs - aTs;
        });
        setItems(data);
      } catch (err) {
        console.error('Failed to load teacher locations', err);
        setError('Failed to load locations.');
      } finally {
        setLoading(false);
      }
    };

    load();
    // Auto-refresh every 30 seconds to get latest locations
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter by teacher ID or name only (not location/reason)
  const filtered = items.filter((item) => {
    if (!search.trim()) return false;
    const term = search.toLowerCase();
    return (
      (item.teacherId && String(item.teacherId).toLowerCase().includes(term)) ||
      (item.teacherName && item.teacherName.toLowerCase().includes(term))
    );
  });

  // Get most recent location for each matching teacher
  const displayItems = search.trim() 
    ? (() => {
        const teacherMap = new Map();
        filtered.forEach((item) => {
          if (!teacherMap.has(item.teacherId) || 
              (item.createdAt?.seconds ?? 0) > (teacherMap.get(item.teacherId)?.createdAt?.seconds ?? 0)) {
            teacherMap.set(item.teacherId, item);
          }
        });
        return Array.from(teacherMap.values()).sort((a, b) => {
          const aTs = a.createdAt?.seconds ?? 0;
          const bTs = b.createdAt?.seconds ?? 0;
          return bTs - aTs;
        });
      })()
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Locate Teacher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            Search by Teacher ID or Name
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            placeholder="Enter teacher name or ID to see location..."
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        <div className="max-h-80 overflow-y-auto border rounded-md bg-slate-50 p-2 space-y-2 text-xs text-slate-700">
          {loading ? (
            <p className="text-xs text-slate-500">Loading locations...</p>
          ) : !search.trim() ? (
            <p className="text-xs text-slate-500 text-center py-8">
              Enter a teacher name or ID above to see their location.
            </p>
          ) : displayItems.length === 0 ? (
            <p className="text-xs text-slate-500">
              No location found for this teacher. The teacher may not have updated their location yet.
            </p>
          ) : (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="border rounded-md bg-white px-3 py-2 flex flex-col gap-1"
              >
                <div className="flex justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      {item.teacherName || 'Unknown teacher'}{' '}
                      <span className="text-[10px] font-normal text-slate-500">
                        ({item.teacherId})
                      </span>
                    </p>
                    {item.location && (
                      <>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Location:{' '}
                          <span className="font-medium text-slate-800">
                            {item.location}
                          </span>
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            item.location,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-sky-600 hover:text-sky-800 mt-1"
                        >
                          Open in Maps
                        </a>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    {item.createdAt?.seconds && (
                      <div>
                        <span>
                          {new Date(item.createdAt.seconds * 1000).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {item.createdByName && (
                          <p className="mt-1 text-[9px]">by {item.createdByName}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {item.reason && (
                  <p className="text-[11px] text-slate-600 mt-1">
                    Reason: <span className="italic">{item.reason}</span>
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


