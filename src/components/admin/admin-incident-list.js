'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, MapPin, User, Tag, AlertTriangle } from 'lucide-react';

export default function AdminIncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const q = query(collection(firebaseDb, 'incidents'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const docRef = doc(firebaseDb, 'incidents', id);
      await updateDoc(docRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setIncidents(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-red-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Incident Reports</h2>
          <p className="text-sm text-slate-500">Manage equipment damages and facility issues</p>
        </div>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold border border-red-200">
          {incidents.filter(i => i.status === 'pending').length} Pending Reports
        </div>
      </div>

      {incidents.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
            <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No reports yet</p>
            <p className="text-sm">Everything seems to be working correctly.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className={`border-l-4 ${
              incident.status === 'resolved' ? 'border-l-green-500' : 
              incident.priority === 'high' ? 'border-l-red-500' : 'border-l-amber-500'
            } shadow-sm hover:shadow-md transition-all`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        incident.priority === 'high' ? 'bg-red-100 text-red-700' : 
                        incident.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {incident.priority} Priority
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        incident.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {incident.status}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {incident.createdAt?.seconds ? new Date(incident.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{incident.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{incident.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{incident.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium truncate">{incident.reporterName} ({incident.reporterRole})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                        <Tag className="w-4 h-4 text-purple-500" />
                        <span className="font-medium capitalize">{incident.category.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 justify-end min-w-[140px]">
                    {incident.status !== 'resolved' && (
                      <Button
                        onClick={() => handleUpdateStatus(incident.id, 'resolved')}
                        disabled={updatingId === incident.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 h-10 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Resolve
                      </Button>
                    )}
                    {incident.status === 'resolved' && (
                      <Button
                        onClick={() => handleUpdateStatus(incident.id, 'pending')}
                        disabled={updatingId === incident.id}
                        variant="outline"
                        className="flex-1 border-slate-200 text-slate-600 gap-2 h-10"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Re-open
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
