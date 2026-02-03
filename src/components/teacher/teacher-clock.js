'use client';

import { useEffect, useState } from 'react';
import { firebaseDb } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function TeacherClock({ teacherId }) {
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  // live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // load today's DTR record
  useEffect(() => {
    if (!teacherId) return;

    const fetchRecord = async () => {
      setError('');
      const dateKey = getTodayKey();
      const ref = doc(firebaseDb, 'dtr', `${teacherId}_${dateKey}`);
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRecord(snap.data());
        } else {
          setRecord(null);
        }
      } catch (err) {
        console.error('Failed to load DTR record', err);
        setError('Failed to load today record.');
      }
    };

    fetchRecord();
  }, [teacherId]);

  const handleClock = async (type) => {
    if (!teacherId) return;
    setLoading(true);
    setError('');
    const dateKey = getTodayKey();
    const ref = doc(firebaseDb, 'dtr', `${teacherId}_${dateKey}`);

    const currentLocalTime = new Date().toISOString();

    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        // create new record
        const initial = {
          teacherId,
          date: dateKey,
          firstIn: type === 'in' ? currentLocalTime : null,
          lastOut: type === 'out' ? currentLocalTime : null,
          logs: [
            {
              type,
              at: currentLocalTime,
            },
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(ref, initial);
        setRecord(initial);
      } else {
        // update existing record
        const data = snap.data();
        const update = {
          logs: arrayUnion({
            type,
            at: currentLocalTime,
          }),
          updatedAt: serverTimestamp(),
        };

        if (type === 'in' && !data.firstIn) {
          update.firstIn = currentLocalTime;
        }
        if (type === 'out') {
          update.lastOut = currentLocalTime;
        }

        await updateDoc(ref, update);
        setRecord({
          ...data,
          ...update,
        });
      }
    } catch (err) {
      console.error('Failed to save DTR record', err);
      setError('Failed to save record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = now.toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Time Record</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-slate-500">{dateString}</p>
            <p className="text-3xl font-bold text-slate-900">{timeString}</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>Teacher ID: <span className="font-semibold">{teacherId}</span></p>
            {record && (
              <>
                <p>First In: {record.firstIn ? new Date(record.firstIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                <p>Last Out: {record.lastOut ? new Date(record.lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => handleClock('in')}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Clock In'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleClock('out')}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Clock Out'}
          </Button>
        </div>

        {record && record.logs && record.logs.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-slate-600 mb-1">Today Logs</p>
            <ul className="max-h-32 overflow-y-auto text-xs text-slate-700 space-y-1">
              {record.logs
                .slice()
                .sort((a, b) => new Date(a.at) - new Date(b.at))
                .map((log, index) => (
                  <li key={index}>
                    {log.type.toUpperCase()} –{' '}
                    {new Date(log.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


