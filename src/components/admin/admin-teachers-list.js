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
            role: t.role || 'teacher',
            department: t.department || '',
            position: t.position || '',
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Position</th>
                  <th className="py-2 pr-4">Time In</th>
                  <th className="py-2 pr-4">Time Out</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{t.name}</td>
                    <td className="py-2 pr-4 text-slate-600 capitalize">{t.role}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {t.department && t.department.trim().length > 0 ? t.department : '-'}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {t.position && t.position.trim().length > 0 ? t.position : '-'}
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
        )}
      </CardContent>
    </Card>
  );
}
