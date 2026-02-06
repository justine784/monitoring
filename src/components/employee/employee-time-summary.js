'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Calendar, TrendingUp } from 'lucide-react';

export default function EmployeeTimeSummary({ schoolId }) {
  const [summary, setSummary] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
    averageHours: 0,
    loading: true
  });

  useEffect(() => {
    loadTimeSummary();
  }, [schoolId]);

  const loadTimeSummary = async () => {
    try {
      // Get today's records
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Simple query by schoolId to avoid index requirement
      const timeRecordsQuery = query(
        collection(firebaseDb, 'timeRecords'),
        where('userId', '==', schoolId),
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

      // Calculate average hours (simplified - pairs check-ins with check-outs)
      let totalHours = 0;
      let pairedRecords = 0;
      
      for (const checkIn of recordsData.filter(r => r.type === 'check-in')) {
        const checkOut = recordsData.find(co => co.type === 'check-out' && co.timestamp > checkIn.timestamp);
        if (checkOut) {
          const hours = (checkOut.timestamp - checkIn.timestamp) / (1000 * 60 * 60);
          if (hours > 0 && hours < 24) { // Reasonable hours check
            totalHours += hours;
            pairedRecords++;
          }
        }
      }
      
      const avgHours = pairedRecords > 0 ? totalHours / pairedRecords : 0;

      setSummary({
        todayCheckIns,
        todayCheckOuts,
        totalCheckIns,
        totalCheckOuts,
        averageHours: avgHours,
        loading: false
      });
      
    } catch (err) {
      console.error('Failed to load time summary:', err);
    }
  };

  if (summary.loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-sm text-slate-600">Loading summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Check-ins */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <div className="text-3xl font-bold mb-1">{summary.todayCheckIns}</div>
          <div className="text-emerald-100 text-sm">Check-ins</div>
        </div>

        {/* Today's Check-outs */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <div className="text-3xl font-bold mb-1">{summary.todayCheckOuts}</div>
          <div className="text-orange-100 text-sm">Check-outs</div>
        </div>

        {/* Average Hours */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Average</span>
          </div>
          <div className="text-3xl font-bold mb-1">{summary.averageHours.toFixed(1)}</div>
          <div className="text-blue-100 text-sm">Hours/Day</div>
        </div>

        {/* Total Records */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">All Time</span>
          </div>
          <div className="text-3xl font-bold mb-1">{summary.totalCheckIns}</div>
          <div className="text-purple-100 text-sm">Total Records</div>
        </div>
      </div>

      {/* Today's Activity Detail */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">Today's Activity Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Check-ins</p>
                <p className="text-xs text-slate-500">Today's entries</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">{summary.todayCheckIns}</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Check-outs</p>
                <p className="text-xs text-slate-500">Today's exits</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-600">{summary.todayCheckOuts}</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Average Hours</p>
                <p className="text-xs text-slate-500">Per session</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">{summary.averageHours.toFixed(1)}h</div>
          </div>
        </CardContent>
      </Card>

      {/* All Time Stats */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-slate-900">All Time Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Total Check-ins</p>
                <p className="text-xs text-slate-500">All time entries</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{summary.totalCheckIns}</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Total Check-outs</p>
                <p className="text-xs text-slate-500">All time exits</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-pink-600">{summary.totalCheckOuts}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
