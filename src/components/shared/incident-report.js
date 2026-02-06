'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Camera, Send, History, CheckCircle2, Clock } from 'lucide-react';

export default function IncidentReport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'damaged-equipment',
    priority: 'medium'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadMyReports();
  }, [user]);

  const loadMyReports = async () => {
    if (!user?.schoolId) return;
    try {
      const q = query(
        collection(firebaseDb, 'incidents'),
        where('reporterId', '==', user.schoolId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
    } catch (err) {
      console.error('Failed to load incident history', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const reportData = {
        ...formData,
        reporterId: user.schoolId,
        reporterName: user.name,
        reporterRole: user.role,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(firebaseDb, 'incidents'), reportData);
      
      setMessage({ type: 'success', text: 'Incident reported successfully. Admin has been notified.' });
      setFormData({
        title: '',
        description: '',
        location: '',
        category: 'damaged-equipment',
        priority: 'medium'
      });
      loadMyReports();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Failed to report incident', err);
      setMessage({ type: 'error', text: 'Failed to submit report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Report Form */}
      <Card className="border-red-100 shadow-lg">
        <CardHeader className="bg-red-50/50 border-b border-red-100">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <CardTitle className="text-lg">Report an Incident</CardTitle>
          </div>
          <p className="text-sm text-slate-500">Report issues, damages, or equipment concerns</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 text-sm"
                >
                  <option value="damaged-equipment">Damaged Equipment</option>
                  <option value="facility-issue">Facility Issue</option>
                  <option value="security-concern">Security Concern</option>
                  <option value="other">Other Issue</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 text-sm"
                >
                  <option value="low">Low - General Improvement</option>
                  <option value="medium">Medium - Action Required</option>
                  <option value="high">High - Urgent / Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Subject / Title *</label>
              <input
                type="text"
                placeholder="Briefly describe the issue"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Location *</label>
              <input
                type="text"
                placeholder="Room number, building, or area"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Detailed Description *</label>
              <textarea
                placeholder="Explain the problem in detail..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-slate-50 text-sm resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 h-11 shadow-md transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Report
                </>
              )}
            </Button>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border-slate-200 shadow-lg flex flex-col h-full">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <History className="w-5 h-5" />
            <CardTitle className="text-lg">Recent Reports</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 max-h-[600px]">
          {fetchingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-sm">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No incident reports found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.priority === 'high' ? 'bg-red-100 text-red-700' : 
                        item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
