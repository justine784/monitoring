'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminTeacherDirectory() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', schoolId: '', position: '', employmentType: '' });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const q = query(collection(firebaseDb, 'teachers'), orderBy('name'));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeachers(data);
      } catch (err) {
        console.error('Failed to load teachers', err);
      } finally {
        setLoading(false);
      }
    };

    loadTeachers();
  }, []);
  const startEdit = (teacher) => {
    setEditingId(teacher.id);
    setEditForm({
      name: teacher.name || '',
      schoolId: teacher.schoolId || '',
      position: teacher.position || '',
      employmentType: teacher.employmentType || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', schoolId: '', position: '', employmentType: '' });
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.schoolId.trim()) {
      return;
    }
    setSavingId(id);
    try {
      const ref = doc(firebaseDb, 'teachers', id);
      const updateData = {
        name: editForm.name.trim(),
        schoolId: editForm.schoolId.trim(),
        position: editForm.position.trim() || null,
        employmentType: editForm.employmentType.trim() || null,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(ref, updateData);
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updateData } : t,
        ),
      );
      cancelEdit();
    } catch (err) {
      console.error('Failed to update teacher', err);
    } finally {
      setSavingId(null);
    }
  };

  const deleteTeacher = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const ref = doc(firebaseDb, 'teachers', id);
      await deleteDoc(ref);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete teacher', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Teacher / Employee Directory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, role, position, or employment type..."
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
        {loading ? (
          <p className="text-xs text-slate-500">Loading teachers...</p>
        ) : teachers.length === 0 ? (
          <p className="text-xs text-slate-500">No teachers added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers
              .filter((t) => {
                const matchesSearch = (() => {
                  if (!search.trim()) return true;
                  const term = search.toLowerCase();
                  return (
                    (t.name && t.name.toLowerCase().includes(term)) ||
                    (t.schoolId && String(t.schoolId).toLowerCase().includes(term)) ||
                    (t.role && t.role.toLowerCase().includes(term)) ||
                    (t.position && t.position.toLowerCase().includes(term)) ||
                    (t.employmentType && t.employmentType.toLowerCase().includes(term))
                  );
                })();

                const role = (t.role || '').toLowerCase();
                const matchesRole =
                  roleFilter === 'all' ? true : role === roleFilter.toLowerCase();

                return matchesSearch && matchesRole;
              })
              .sort((a, b) => {
                const an = (a.name || '').trim();
                const bn = (b.name || '').trim();
                if (!an && !bn) return 0;
                if (!an) return 1;
                if (!bn) return -1;
                return an.localeCompare(bn, undefined, { sensitivity: 'base' });
              })
              .map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-2 border rounded-md px-3 py-2 bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    {t.photoURL ? (
                      <img
                        src={t.photoURL}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingId === t.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-transparent"
                          placeholder="Full name"
                        />
                        <input
                          type="text"
                          value={editForm.schoolId}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, schoolId: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-transparent font-mono"
                          placeholder="School ID"
                        />
                        <input
                          type="text"
                          value={editForm.position}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, position: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-transparent"
                          placeholder="Position (optional)"
                        />
                        <select
                          value={editForm.employmentType}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, employmentType: e.target.value }))
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-lime-500 focus:border-transparent bg-white"
                        >
                          <option value="">Employment type (optional)</option>
                          <option value="Permanent">Permanent</option>
                          <option value="Temporary">Temporary</option>
                          <option value="Contract of service (COS) - full time">Contract of service (COS) - full time</option>
                          <option value="Contract of service (COS) - part time">Contract of service (COS) - part time</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
                        <p className="text-xs text-slate-500">
                          ID: <span className="font-mono">{t.schoolId}</span>
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {t.role}
                        </p>
                        {t.position && (
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            {t.position}
                          </p>
                        )}
                        {t.employmentType && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t.employmentType}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  {editingId === t.id ? (
                    <>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        className="text-xs px-2 py-1"
                        onClick={cancelEdit}
                        disabled={savingId === t.id}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        className="text-xs px-2 py-1 bg-lime-600 hover:bg-lime-700"
                        onClick={() => saveEdit(t.id)}
                        disabled={savingId === t.id}
                      >
                        {savingId === t.id ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        className="text-xs px-2 py-1"
                        onClick={() => startEdit(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        className="text-xs px-2 py-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => deleteTeacher(t.id)}
                        disabled={deletingId === t.id}
                      >
                        {deletingId === t.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


