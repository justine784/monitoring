'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Teachers &amp; Employees – Time In / Time Out (Today)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-slate-500">
            No teachers or employees yet. Add them above to start monitoring.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, role, or employment type..."
                className="w-full sm:max-w-sm px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600">Filter role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="teacher">Teacher</option>
                  <option value="employee">Employee</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Summary tables: per role and per employment type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-3 bg-slate-50">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  By Role (with time record today)
                </p>
                {Object.keys(roleCounts).length === 0 ? (
                  <p className="text-[11px] text-slate-500">No time records yet today.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b">
                        <th className="py-1 pr-2 text-left">Role</th>
                        <th className="py-1 pr-2 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(roleCounts).map(([role, count]) => (
                        <tr key={role} className="border-b last:border-0">
                          <td className="py-1 pr-2 capitalize text-slate-700">{role}</td>
                          <td className="py-1 pr-2 text-right font-medium text-slate-800">
                            {count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="border rounded-md p-3 bg-slate-50">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  By Employment Type (with time record today)
                </p>
                {Object.keys(employmentCounts).length === 0 ? (
                  <p className="text-[11px] text-slate-500">No time records yet today.</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b">
                        <th className="py-1 pr-2 text-left">Employment Type</th>
                        <th className="py-1 pr-2 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(employmentCounts).map(([type, count]) => (
                        <tr key={type} className="border-b last:border-0">
                          <td className="py-1 pr-2 text-slate-700">{type}</td>
                          <td className="py-1 pr-2 text-right font-medium text-slate-800">
                            {count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Employment Type</th>
                    <th className="py-2 pr-4">Time In</th>
                    <th className="py-2 pr-4">Time Out</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
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
                    .map((t) => (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{t.name}</td>
                        <td className="py-2 pr-4 text-slate-600 capitalize">{t.role}</td>
                        <td className="py-2 pr-4 text-slate-600">
                          {t.employmentType && t.employmentType.trim().length > 0
                            ? t.employmentType
                            : '-'}
                        </td>
                        <td className="py-2 pr-4">{t.timeIn}</td>
                        <td className="py-2 pr-4">{t.timeOut}</td>
                        <td
                          className={`py-2 pr-4 font-medium ${
                            t.status === 'Present' || t.status === 'In campus'
                              ? 'text-green-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {t.status}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
