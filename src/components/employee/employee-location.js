'use client';

import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, MapPin, Clock } from 'lucide-react';

export default function EmployeeLocation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('30');
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
            collection(firebaseDb, 'employeeLocations'),
            where('employeeId', '==', user.schoolId)
          )
        );
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
      setError('Unable to identify employee. Please refresh the page.');
      return;
    }

    if (user.role !== 'employee') {
      setError('Unauthorized: Only employees can update employee locations.');
      return;
    }

    setSaving(true);
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + parseInt(duration) * 60000);

      const docRef = await addDoc(collection(firebaseDb, 'employeeLocations'), {
        employeeId: user.schoolId,
        employeeName: user.name || null,
        location: location.trim(),
        reason: reason.trim() || null,
        durationMinutes: parseInt(duration),
        expiresAt: expiresAt.toISOString(),
        createdAt: serverTimestamp(),
        createdById: user.schoolId,
        createdByName: user.name || 'Employee',
        role: 'employee',
      });

      const newItem = {
        id: docRef.id,
        employeeId: user.schoolId,
        employeeName: user.name || null,
        location: location.trim(),
        reason: reason.trim() || null,
        durationMinutes: parseInt(duration),
        expiresAt: expiresAt.toISOString(),
        createdAt: { seconds: Date.now() / 1000 },
        createdById: user.schoolId,
        createdByName: user.name || 'Employee',
        role: 'employee',
      };

      setRecentLocations((prev) => [newItem, ...prev].slice(0, 5));
      setMessage('Location updated successfully.');
      setLocation('');
      setReason('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save location', err);
      setError('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (user.role !== 'employee') {
      setError('Unauthorized: Only employees can delete employee locations.');
      return;
    }
    if (!window.confirm('Delete this location entry?')) return;
    
    setDeletingId(id);
    setError('');
    setMessage('');
    try {
      const ref = doc(firebaseDb, 'employeeLocations', id);
      await deleteDoc(ref);
      setRecentLocations((prev) => prev.filter((item) => item.id !== id));
      setMessage('Location entry deleted successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete location', err);
      setError('Failed to delete location. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-700">
            <MapPin className="w-5 h-5" />
            <CardTitle className="text-lg">Update My Location</CardTitle>
          </div>
          <p className="text-sm text-slate-500">
            Share your current location within the campus
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Current Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
                placeholder="e.g. Admin Office, Room 204, Library"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Notes (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 resize-none"
                rows={3}
                placeholder="e.g. Processing documents, meeting with faculty..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Estimated Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 text-sm"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
                <option value="240">4 Hours</option>
                <option value="480">8 Hours</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update My Location'}
            </Button>

            {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            {message && <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">{message}</p>}
          </form>
        </CardContent>
      </Card>

      {recentLocations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 px-1">Recent Updates</h3>
          <div className="grid gap-3">
            {recentLocations.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <MapPin className="w-4 h-4" />
                      <p className="font-bold">{item.location}</p>
                    </div>
                    {item.reason && <p className="text-sm text-slate-600">{item.reason}</p>}
                    <p className="text-[10px] text-slate-400">
                      {item.createdAt?.seconds && new Date(item.createdAt.seconds * 1000).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
