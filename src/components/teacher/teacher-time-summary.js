'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function TeacherTimeSummary({ teacherId }) {
  const [summary, setSummary] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
    loading: true
  });

  useEffect(() => {
    loadTimeSummary();
  }, [teacherId]);

  const loadTimeSummary = async () => {
    try {
      // Get today's records
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Simple query by userId only to avoid index requirement
      const timeRecordsQuery = query(
        collection(firebaseDb, 'timeRecords'),
        where('userId', '==', teacherId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(timeRecordsQuery);
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));

      // Filter today's records on client side
      const todayRecords = recordsData.filter(record => {
        const recordDate = record.timestamp;
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });

      const todayCheckIns = todayRecords.filter(r => r.type === 'check-in').length;
      const todayCheckOuts = todayRecords.filter(r => r.type === 'check-out').length;
      const totalCheckIns = recordsData.filter(r => r.type === 'check-in').length;
      const totalCheckOuts = recordsData.filter(r => r.type === 'check-out').length;

      setSummary({
        todayCheckIns,
        todayCheckOuts,
        totalCheckIns,
        totalCheckOuts,
        loading: false
      });

    } catch (err) {
      console.error('Failed to load time summary:', err);
      setSummary(prev => ({ ...prev, loading: false }));
    }
  };

  if (summary.loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-sm text-slate-600">Loading summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Today's Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-900">Today's Activity</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-700">Time In</span>
            </div>
            <span className="text-sm font-semibold text-green-600">{summary.todayCheckIns}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-slate-700">Time Out</span>
            </div>
            <span className="text-sm font-semibold text-red-600">{summary.todayCheckOuts}</span>
          </div>
        </div>
      </div>

      {/* All Time Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-purple-900">All Time Summary</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-700">Total Time In</span>
            </div>
            <span className="text-sm font-semibold text-green-600">{summary.totalCheckIns}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-slate-700">Total Time Out</span>
            </div>
            <span className="text-sm font-semibold text-red-600">{summary.totalCheckOuts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
