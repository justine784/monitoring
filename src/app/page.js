'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, BarChart3, Shield, Search, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [teachers, setTeachers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const teachersCol = collection(firebaseDb, 'teachers');
        const q = query(teachersCol, orderBy('name'));
        const snap = await getDocs(q);
        const allData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const term = searchQuery.toLowerCase().trim();
        const filtered = allData.filter((item) => {
          return (
            (item.name && item.name.toLowerCase().includes(term)) ||
            (item.schoolId && String(item.schoolId).toLowerCase().includes(term)) ||
            (item.department && item.department.toLowerCase().includes(term)) ||
            (item.role && item.role.toLowerCase().includes(term))
          );
        });

        setSearchResults(filtered);
      } catch (err) {
        console.error('Search failed', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const loadLists = async () => {
      if (activeView === 'home') return;

      setListLoading(true);
      try {
        const teachersCol = collection(firebaseDb, 'teachers');
        const q = query(teachersCol, orderBy('name'));
        const snap = await getDocs(q);
        const allData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (activeView === 'teachers') {
          const teacherList = allData.filter((item) => item.role === 'teacher');
          setTeachers(teacherList);
        } else if (activeView === 'employees') {
          const employeeList = allData.filter((item) => 
            item.role === 'employee' || item.role === 'student' || item.role === 'parent' || item.role === 'other'
          );
          setEmployees(employeeList);
        }
      } catch (err) {
        console.error('Failed to load list', err);
      } finally {
        setListLoading(false);
      }
    };

    loadLists();
  }, [activeView]);

  const goToDashboard = (targetRole) => {
    // If not logged in, always go to login first
    if (!user) {
      router.push('/login');
      return;
    }

    // Only allow navigation to the dashboard that matches the logged-in role
    // to avoid blank pages (those dashboards guard by role).
    const role = user.role;

    if (role === 'admin') router.push('/dashboard/admin');
    else if (role === 'teacher') router.push('/dashboard/teacher');
    else if (role === 'employee') router.push('/dashboard/employee');
    else router.push('/login');
  };

  return (
    <div className="min-h-screen bg-lime-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6 min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:flex-col h-full w-64 rounded-2xl bg-white shadow-md border border-slate-100 px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                setSearchQuery('');
                setTeacherSearchQuery('');
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.jpg"
                alt="School Monitor Logo"
                className="w-12 h-12 rounded-lg shadow-md logo-animate object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                setSearchQuery('');
                setTeacherSearchQuery('');
              }}
              className="title-animate cursor-pointer hover:opacity-80 transition-opacity text-left"
            >
              <h1 className="text-lg font-bold text-slate-900">Mindoro State University</h1>
              <p className="text-[11px] text-slate-500"></p>
            </button>
          </div>

          {user && (
            <div className="mb-6 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900 truncate max-w-[130px]">{user.name}</p>
                <p className="text-[11px] text-slate-600">ID: {user.schoolId}</p>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1 text-sm">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Dashboards
            </p>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-left"
              onClick={() => goToDashboard('admin')}
            >
              <Shield className="w-4 h-4" />
              <span className="truncate">Admin</span>
            </button>
            <button
              type="button"
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${
                activeView === 'teachers'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
              onClick={() => {
                setActiveView('teachers');
                setSearchQuery(''); // Clear main search when viewing teachers
              }}
            >
              <Users className="w-4 h-4" />
              <span className="truncate">Teacher</span>
            </button>
            <button
              type="button"
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${
                activeView === 'employees'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
              onClick={() => {
                setActiveView('employees');
                setSearchQuery(''); // Clear main search when viewing employees
              }}
            >
              <Users className="w-4 h-4" />
              <span className="truncate">Employee</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col h-full">
          {/* Top bar (search, fallback login on mobile) */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3 mb-4 md:hidden">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setActiveView('home');
                  setSearchQuery('');
                  setTeacherSearchQuery('');
                }}
              >
                <img
                  src="/logo.jpg"
                  alt="School Monitor Logo"
                  className="w-10 h-10 rounded-lg shadow-md logo-animate object-cover"
                />
                <div className="title-animate">
                  <h1 className="text-base font-bold text-slate-900">School Monitor</h1>
                  <p className="text-[11px] text-slate-600">Attendance &amp; Logbook System</p>
                </div>
              </div>
              {!user && (
                <Button size="sm" onClick={() => router.push('/login')}>
                  Login
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search teachers, employees, students, or records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {searchLoading ? (
                        'Searching...'
                      ) : (
                        `Search Results (${searchResults.length})`
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchLoading ? (
                      <p className="text-sm text-slate-500">Loading results...</p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-sm text-slate-500">No results found.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                              {item.photoURL ? (
                                <img
                                  src={item.photoURL}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                                  {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {item.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-slate-600">
                                ID: <span className="font-mono">{item.schoolId}</span>
                              </p>
                              <p className="text-xs text-slate-500 capitalize">
                                {item.role}
                                {item.department ? ` • ${item.department}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Teachers List View */}
          {activeView === 'teachers' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">All Teachers</h2>
                  <p className="text-sm text-slate-600">
                    {teachers.length} {teachers.length === 1 ? 'teacher' : 'teachers'} registered
                  </p>
                </div>
                <Button variant="outline" onClick={() => setActiveView('home')}>
                  Back to Home
                </Button>
              </div>

              {/* Teacher Search Box */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search teachers by name, ID, or department..."
                    value={teacherSearchQuery}
                    onChange={(e) => setTeacherSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {listLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-slate-500">Loading teachers...</p>
                  </CardContent>
                </Card>
              ) : teachers.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-slate-500">No teachers found.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {(() => {
                    const filteredTeachers = teachers.filter((teacher) => {
                      if (!teacherSearchQuery.trim()) return true;
                      const term = teacherSearchQuery.toLowerCase();
                      return (
                        (teacher.name && teacher.name.toLowerCase().includes(term)) ||
                        (teacher.schoolId && String(teacher.schoolId).toLowerCase().includes(term)) ||
                        (teacher.department && teacher.department.toLowerCase().includes(term))
                      );
                    });

                    return filteredTeachers.length === 0 ? (
                      <Card>
                        <CardContent className="py-8">
                          <p className="text-center text-slate-500">No teachers match your search.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTeachers.map((teacher) => (
                          <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                  {teacher.photoURL ? (
                                    <img
                                      src={teacher.photoURL}
                                      alt={teacher.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-500">
                                      {teacher.name ? teacher.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-base font-semibold text-slate-900 truncate">
                                    {teacher.name || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-1">
                                    ID: <span className="font-mono">{teacher.schoolId}</span>
                                  </p>
                                  <p className="text-xs text-slate-500 capitalize mt-1">
                                    {teacher.department || 'No department'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </section>
          )}

          {/* Employees List View */}
          {activeView === 'employees' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Employees Directory</h2>
                  <p className="text-sm text-slate-600">View all registered employees, students, and parents</p>
                </div>
                <Button variant="outline" onClick={() => setActiveView('home')}>
                  Back to Home
                </Button>
              </div>

              {listLoading ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-slate-500">Loading employees...</p>
                  </CardContent>
                </Card>
              ) : employees.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-slate-500">No employees found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map((employee) => (
                    <Card key={employee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                            {employee.photoURL ? (
                              <img
                                src={employee.photoURL}
                                alt={employee.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-500">
                                {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-slate-900 truncate">
                              {employee.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              ID: <span className="font-mono">{employee.schoolId}</span>
                            </p>
                            <p className="text-xs text-slate-500 capitalize mt-1">
                              {employee.role || 'employee'}
                              {employee.department ? ` • ${employee.department}` : ''}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Hero Section */}
          {activeView === 'home' && (
            <section>
              <div className="text-left mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  MINDORO STATE UNIVERSITY MONITORING SYSTEM
                </h2>
                <p className="text-sm md:text-base text-slate-600 mb-6 max-w-2xl">
                  Track attendance, manage logbooks, and monitor academic progress for teachers, employees,
                  students, and parents in one unified dashboard.
                </p>
                <Button size="lg" onClick={() => router.push('/login')}>
                  Get Started
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">Attendance Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Real-time attendance monitoring with detailed records and analytics for each person.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">Logbook Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Digital logbook for recording achievements, behavior, and performance notes for each student.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">Multi-role Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Dedicated dashboards for teachers, employees, students, parents, and admins.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">Secure Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Role-based access control with School ID authentication and Firebase security.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Global Footer */}
          <footer className="border-t bg-white rounded-2xl shadow-sm mt-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
              <p className="text-sm text-slate-600">© 2026 Mindoro State University. All rights reserved.</p>
              <p className="text-sm text-slate-600">Demo System • No Real Data</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
