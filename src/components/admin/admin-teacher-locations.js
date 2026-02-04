'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminTeacherLocations() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const [teacherId, setTeacherId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Load teachers for auto-population
        const teachersSnap = await getDocs(query(collection(firebaseDb, 'teachers'), orderBy('name')));
        const teachersData = teachersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeachers(teachersData);

        // Load locations
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
  }, []);

  // Auto-populate teacher name when teacher ID is entered
  useEffect(() => {
    if (teacherId.trim()) {
      const teacher = teachers.find((t) => t.schoolId === teacherId.trim());
      if (teacher) {
        setTeacherName(teacher.name || '');
      } else {
        setTeacherName('');
      }
    } else {
      setTeacherName('');
    }
  }, [teacherId, teachers]);

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
        createdById: user?.schoolId || user?.uid || 'admin',
        createdByName: user?.name || user?.email || 'Admin',
      });

      const newItem = {
        id: docRef.id,
        teacherId: teacherId.trim(),
        teacherName: teacherName.trim() || null,
        location: location.trim(),
        reason: reason.trim() || null,
        createdAt: { seconds: Date.now() / 1000 },
        createdById: user?.schoolId || user?.uid || 'admin',
        createdByName: user?.name || user?.email || 'Admin',
      };

      setItems((prev) => [newItem, ...prev]);
      setMessage('Location entry saved successfully.');
      setTeacherId('');
      setTeacherName('');
      setLocation('');
      setReason('');
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save location', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location entry? This cannot be undone.')) return;
    
    setDeletingId(id);
    setError('');
    setMessage('');
    try {
      const ref = doc(firebaseDb, 'teacherLocations', id);
      await deleteDoc(ref);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage('Location entry deleted successfully.');
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete location', err);
      setError('Failed to delete location. Please try again.');
    } finally {
      setDeletingId(null);
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
          Teacher Locations Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Location Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-4 items-start border-b pb-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Teacher ID *</label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="e.g. T-001"
                list="teacher-ids"
              />
              <datalist id="teacher-ids">
                {teachers.map((t) => (
                  <option key={t.id} value={t.schoolId}>
                    {t.name}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Teacher Name (auto-filled)</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="Auto-filled from Teacher ID"
                readOnly
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="e.g. Room 101, Registrar, Principal's Office"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Reason / Note (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                rows={3}
                placeholder="e.g. Meeting with parents, submitting forms"
              />
            </div>
            <Button
              type="submit"
              className="mt-1 bg-lime-600 hover:bg-lime-700"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Location Entry'}
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
                Search Location Entries
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="Search by name, ID, location, or reason..."
              />
            </div>

            <div className="max-h-96 overflow-y-auto border rounded-md bg-slate-50 p-2 space-y-2 text-xs text-slate-700">
              {loading ? (
                <p className="text-xs text-slate-500">Loading locations...</p>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-slate-500">No location entries found.</p>
              ) : (
                filtered.map((item) => (
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
                        <p className="text-[11px] text-slate-500">
                          Location:{' '}
                          <span className="font-medium text-slate-800">
                            {item.location}
                          </span>
                        </p>
                        {item.reason && (
                          <p className="text-[11px] text-slate-600">
                            Reason: <span className="italic">{item.reason}</span>
                          </p>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          {item.createdAt?.seconds && (
                            <span>
                              {new Date(item.createdAt.seconds * 1000).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                          {item.createdByName && (
                            <span className="ml-2">by {item.createdByName}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
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


