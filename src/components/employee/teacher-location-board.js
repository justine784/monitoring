'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TeacherLocationBoard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(firebaseDb, 'teacherLocations'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by createdAt desc (most recent first) if available
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!teacherId.trim() || !location.trim()) {
      setError('Teacher ID and location are required.');
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(firebaseDb, 'teacherLocations'), {
        teacherId: teacherId.trim(),
        teacherName: teacherName.trim() || null,
        location: location.trim(),
        reason: reason.trim() || null,
        createdAt: serverTimestamp(),
        createdById: user?.schoolId || user?.uid || null,
        createdByName: user?.name || user?.email || null,
      });

      const newItem = {
        id: docRef.id,
        teacherId: teacherId.trim(),
        teacherName: teacherName.trim() || null,
        location: location.trim(),
        reason: reason.trim() || null,
        createdAt: { seconds: Date.now() / 1000 },
        createdById: user?.schoolId || user?.uid || null,
        createdByName: user?.name || user?.email || null,
      };

      setItems((prev) => [newItem, ...prev]);
      setMessage('Location note saved.');
      setTeacherId('');
      setTeacherName('');
      setLocation('');
      setReason('');
    } catch (err) {
      console.error('Failed to save location', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (item.teacherId && String(item.teacherId).toLowerCase().includes(term)) ||
      (item.teacherName && item.teacherName.toLowerCase().includes(term)) ||
      (item.location && item.location.toLowerCase().includes(term)) ||
      (item.reason && item.reason.toLowerCase().includes(term))
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Teacher Locations (Faculty / Outside)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-4 items-start"
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Teacher ID</label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="e.g. T-001"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Teacher Name (optional)</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="e.g. Juan Dela Cruz"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="e.g. Registrar, Principal's Office, Room 201"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Reason / Note (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                rows={3}
                placeholder="e.g. Meeting with parents, submitting forms, class observation"
              />
            </div>
            <Button
              type="submit"
              className="mt-1 bg-lime-600 hover:bg-lime-700"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Location'}
            </Button>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded px-3 py-2">
                {message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Search teacher locations
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="Search by name, ID, location, or reason..."
              />
            </div>

            <div className="max-h-72 overflow-y-auto border rounded-md bg-slate-50 p-2 space-y-2 text-xs text-slate-700">
              {loading ? (
                <p className="text-xs text-slate-500">Loading locations...</p>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-slate-500">No location notes yet.</p>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-md bg-white px-3 py-2 flex flex-col gap-1"
                  >
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.teacherName || 'Unknown teacher'}{' '}
                          <span className="text-[10px] font-normal text-slate-500">
                            ({item.teacherId})
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Location:{' '}
                          <span className="font-medium text-slate-800">
                            {item.location}
                          </span>
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        {item.createdAt?.seconds && (
                          <span>
                            {new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {item.createdByName && (
                          <p className="mt-1">by {item.createdByName}</p>
                        )}
                      </div>
                    </div>
                    {item.reason && (
                      <p className="text-[11px] text-slate-600">
                        Reason: <span className="italic">{item.reason}</span>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


