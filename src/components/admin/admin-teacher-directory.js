'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Edit, Trash2, Save, X, Briefcase, GraduationCap, UserCheck, Clock } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, role, position, or employment type..."
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="employee">Employees</option>
              <option value="other">Others</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading staff directory...</p>
          </div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600">No staff members added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="group bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                        {t.photoURL ? (
                          <img
                            src={t.photoURL}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                            {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        t.role === 'teacher' ? 'bg-green-400' : 
                        t.role === 'employee' ? 'bg-blue-400' : 'bg-purple-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate">
                        {t.name || 'Unknown'}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {t.role === 'teacher' ? 'Teacher' : t.role === 'employee' ? 'Employee' : 'Other'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-4">
                  {editingId === t.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">School ID</label>
                        <input
                          type="text"
                          value={editForm.schoolId}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, schoolId: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          placeholder="Enter school ID"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={editForm.position}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, position: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter position (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Employment Type</label>
                        <select
                          value={editForm.employmentType}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, employmentType: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select employment type</option>
                          <option value="Permanent">Permanent</option>
                          <option value="Temporary">Temporary</option>
                          <option value="Contract of service (COS) - full time">Contract of service (COS) - full time</option>
                          <option value="Contract of service (COS) - part time">Contract of service (COS) - part time</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-600 font-mono">ID: {t.schoolId}</p>
                        </div>
                      </div>
                      
                      {t.position && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-sm text-slate-700">{t.position}</p>
                        </div>
                      )}
                      
                      {t.employmentType && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-xs text-slate-600">{t.employmentType}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    {editingId === t.id ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={savingId === t.id}
                          className="flex-1 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveEdit(t.id)}
                          disabled={savingId === t.id}
                          className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                          {savingId === t.id ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(t)}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTeacher(t.id)}
                          disabled={deletingId === t.id}
                          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === t.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}


