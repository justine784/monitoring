'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function TeacherLocation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);

  useEffect(() => {
    const loadRecentLocations = async () => {
      if (!user?.schoolId) {
        setLoading(false);
        return;
      }
      
      try {
        const snap = await getDocs(
          query(
            collection(firebaseDb, 'teacherLocations'),
            where('teacherId', '==', user.schoolId)
          )
        );
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by createdAt descending (most recent first)
        data.sort((a, b) => {
          const aTs = a.createdAt?.seconds ?? 0;
          const bTs = b.createdAt?.seconds ?? 0;
          return bTs - aTs;
        });
        setRecentLocations(data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load recent locations', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecentLocations();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!location.trim()) {
      setError('Location is required.');
      return;
    }

    if (!user?.schoolId) {
      setError('Unable to identify teacher. Please refresh the page.');
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(firebaseDb, 'teacherLocations'), {
        teacherId: user.schoolId,
        teacherName: user.name || null,
        location: location.trim(),
        reason: reason.trim() || null,
        createdAt: serverTimestamp(),
        createdById: user.schoolId,
        createdByName: user.name || 'Teacher',
      });

      const newItem = {
        id: docRef.id,
        teacherId: user.schoolId,
        teacherName: user.name || null,
        location: location.trim(),
        reason: reason.trim() || null,
        createdAt: { seconds: Date.now() / 1000 },
        createdById: user.schoolId,
        createdByName: user.name || 'Teacher',
      };

      setRecentLocations((prev) => [newItem, ...prev].slice(0, 5));
      setMessage('Location updated successfully. Employees can now see your location.');
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
      setRecentLocations((prev) => prev.filter((item) => item.id !== id));
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Update My Location
          </CardTitle>
          <p className="text-xs text-slate-600 mt-1">
            Share your current location so employees can find you
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Current Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                placeholder="e.g. Room 101, Faculty Office, Registrar, Library"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Reason / Note (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                rows={3}
                placeholder="e.g. Meeting with students, Office hours, Class observation"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-lime-600 hover:bg-lime-700"
              disabled={saving}
            >
              {saving ? 'Updating Location...' : 'Update Location'}
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
          </form>
        </CardContent>
      </Card>

      {/* Recent Locations */}
      {recentLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-700">
              Recent Location Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLocations.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-md bg-slate-50 px-3 py-2 text-xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {item.location}
                      </p>
                      {item.reason && (
                        <p className="text-slate-600 mt-1 italic">
                          {item.reason}
                        </p>
                      )}
                      {item.createdAt?.seconds && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(item.createdAt.seconds * 1000).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      title="Delete location entry"
                    >
                      {deletingId === item.id ? (
                        <span className="text-[10px]">Deleting...</span>
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

