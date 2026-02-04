'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, Users, Briefcase, CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AdminTeachersList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        // Load all teachers/employees
        const teacherSnap = await getDocs(
          query(collection(firebaseDb, 'teachers'), orderBy('name')),
        );
        const teachers = teacherSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Load today's DTR records
        const dateKey = getTodayKey();
        const dtrSnap = await getDocs(
          query(collection(firebaseDb, 'dtr'), where('date', '==', dateKey)),
        );
        const dtrByTeacherId = {};
        dtrSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.teacherId) {
            dtrByTeacherId[data.teacherId] = data;
          }
        });

        const combined = teachers.map((t) => {
          const rec = dtrByTeacherId[t.schoolId];
          let timeIn = '-';
          let timeOut = '-';
          let status = 'No record today';

          if (rec) {
            if (rec.firstIn) {
              timeIn = new Date(rec.firstIn).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
            }
            if (rec.lastOut) {
              timeOut = new Date(rec.lastOut).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
            }

            if (rec.firstIn && rec.lastOut) {
              status = 'Present';
            } else if (rec.firstIn && !rec.lastOut) {
              status = 'In campus';
            } else {
              status = 'Incomplete';
            }
          }

          return {
            id: t.id,
            name: t.name || t.schoolId,
            schoolId: t.schoolId,
            role: t.role || 'teacher',
            // Column is "Employment Type" – prefer employmentType, then position, then department
            employmentType: t.employmentType || t.position || t.department || '',
            timeIn,
            timeOut,
            status,
          };
        });

        setRows(combined);
      } catch (err) {
        console.error('Failed to load monitoring data', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Summaries per role and per employment type (for entries with any DTR record today)
  const rowsWithDtr = rows.filter((r) => r.status !== 'No record today');

  const roleCounts = rowsWithDtr.reduce((acc, row) => {
    const key = row.role || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const employmentCounts = rowsWithDtr.reduce((acc, row) => {
    const key = row.employmentType || 'Unspecified';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Time Monitoring Dashboard</h2>
            <p className="text-sm text-slate-600">Today's attendance and time tracking for all staff</p>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, role, or employment type..."
              className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-orange-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="employee">Employees</option>
              <option value="other">Others</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading time monitoring data...</p>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600">No staff members added yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-orange-100 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">By Role (Today)</h3>
                </div>
              </div>
              <div className="p-4">
                {Object.keys(roleCounts).length === 0 ? (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No time records yet today.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(roleCounts).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 capitalize">{role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600">{count}</span>
                          <span className="text-xs text-slate-500">staff</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-purple-100 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">By Employment Type (Today)</h3>
                </div>
              </div>
              <div className="p-4">
                {Object.keys(employmentCounts).length === 0 ? (
                  <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No time records yet today.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(employmentCounts).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-purple-600">{count}</span>
                          <span className="text-xs text-slate-500">staff</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Staff Time Records
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Employment Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time In
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Out
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {rows
                    .filter((t) => {
                      const matchesSearch = (() => {
                        if (!search.trim()) return true;
                        const term = search.toLowerCase();
                        return (
                          (t.name && t.name.toLowerCase().includes(term)) ||
                          (t.schoolId && String(t.schoolId).toLowerCase().includes(term)) ||
                          (t.role && t.role.toLowerCase().includes(term)) ||
                          (t.employmentType && t.employmentType.toLowerCase().includes(term))
                        );
                      })();

                      const role = (t.role || '').toLowerCase();
                      const matchesRole =
                        roleFilter === 'all' ? true : role === roleFilter.toLowerCase();

                      return matchesSearch && matchesRole;
                    })
                    .map((t, index) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-slate-600">
                                {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{t.name}</div>
                              <div className="text-xs text-slate-500 font-mono">ID: {t.schoolId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {t.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">
                            {t.employmentType && t.employmentType.trim().length > 0
                              ? t.employmentType
                              : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-slate-400 mr-2" />
                            <span className="text-sm text-slate-900 font-mono">{t.timeIn}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-slate-400 mr-2" />
                            <span className="text-sm text-slate-900 font-mono">{t.timeOut}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            t.status === 'Present' 
                              ? 'bg-green-100 text-green-800'
                              : t.status === 'In campus'
                              ? 'bg-blue-100 text-blue-800'
                              : t.status === 'Incomplete'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {t.status === 'Present' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {t.status === 'In campus' && <Clock className="w-3 h-3 mr-1" />}
                            {t.status === 'Incomplete' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {t.status === 'No record today' && <XCircle className="w-3 h-3 mr-1" />}
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
