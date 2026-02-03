'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentLogbook({ schoolId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;

    const load = async () => {
      try {
        const q = query(collection(firebaseDb, 'dtr'), where('teacherId', '==', schoolId));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => d.data());
        // Sort locally by date desc to avoid requiring a Firestore composite index
        data.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
        });
        setEntries(data);
      } catch (err) {
        console.error('Failed to load logbook', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [schoolId]);

  if (!schoolId) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        {loading ? (
          <p className="text-xs text-slate-500">Loading logbook...</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-slate-500">No records yet.</p>
        ) : (
          <ul className="space-y-3 text-xs text-slate-700">
            {entries.map((rec) => (
              <li
                key={`${rec.teacherId}_${rec.date}`}
                className="border rounded-md px-3 py-2 bg-slate-50"
              >
                <p className="font-semibold text-slate-800">
                  {rec.date}{' '}
                  <span className="font-normal text-slate-500">
                    – First in:{' '}
                    {rec.firstIn
                      ? new Date(rec.firstIn).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                    , Last out:{' '}
                    {rec.lastOut
                      ? new Date(rec.lastOut).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}


