'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EmployeeLocator from '@/components/employee/employee-locator';
import StaffLocator from '@/components/home/staff-locator';
import { BookOpen, Users, BarChart3, Shield, Search, LogOut, GraduationCap, Award, Clock, MapPin, TrendingUp, ChevronRight, Menu, X, Briefcase, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [teachers, setTeachers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeAction, setTimeAction] = useState(''); // 'time-in' or 'time-out'
  const [employeeId, setEmployeeId] = useState('');

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
            (item.role && item.role.toLowerCase().includes(term)) ||
            (item.position && item.position.toLowerCase().includes(term))
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Floating Icons */}
      <div className="absolute top-10 left-10 text-blue-200/30 animate-bounce">
        <GraduationCap className="w-16 h-16" />
      </div>
      <div className="absolute top-20 right-20 text-purple-200/30 animate-bounce delay-300">
        <BookOpen className="w-12 h-12" />
      </div>
      <div className="absolute bottom-20 left-20 text-indigo-200/30 animate-bounce delay-700">
        <Award className="w-14 h-14" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src="/logo.jpg"
                    alt="School Monitor Logo"
                    className="w-12 h-12 rounded-xl shadow-lg object-cover border-2 border-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">MINSU - MBC</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2 shadow-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  {mounted && (
                    <input
                      type="text"
                      placeholder="Search Facultys..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 outline-none text-sm bg-transparent"
                    />
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView('locator')}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Locate Staff</span>
                  </Button>
                </div>
                
                {/* User Menu */}
                {mounted && (user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{user.name?.charAt(0)}</span>
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-900 truncate max-w-[100px]">{user.name}</p>
                        <p className="text-[11px] text-slate-600">ID: {user.schoolId}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logout()}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700">
                    Login
                  </Button>
                ))}
                
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="School Monitor Logo"
                  className="w-10 h-10 rounded-lg shadow-lg object-cover"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">MSU Monitor</h1>
                  <p className="text-sm text-slate-600">System</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  setActiveView('home');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">Home</p>
                  <p className="text-xs text-slate-500">Overview</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setActiveView('teachers');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-slate-900">Teachers</p>
                  <p className="text-xs text-slate-500">{teachers.length} registered</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setActiveView('employees');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-slate-900">Employees</p>
                  <p className="text-xs text-slate-500">{employees.length} registered</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setActiveView('locator');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-slate-900">Locate Staff</p>
                  <p className="text-xs text-slate-500">Live directory</p>
                </div>
              </button>
              
              {user && (
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-slate-900">Logout</p>
                    <p className="text-xs text-slate-500">Sign out</p>
                  </div>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Search Bar */}
          <div className="md:hidden mb-6">
            <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              {mounted && (
                <input
                  type="text"
                  placeholder="Search teachers, employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

            {/* Enhanced Search Results */}
            {searchQuery && (
              <div className="mt-6">
                <div className="bg-white rounded-2xl border border-blue-100 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        {searchLoading ? (
                          'Searching...'
                        ) : (
                          `Found ${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`
                        )}
                      </h3>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-slate-600">Searching staff directory...</p>
                        </div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600">No staff members found matching your search.</p>
                        <p className="text-sm text-slate-500 mt-2">Try different keywords or browse all staff.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                          >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                                    {item.photoURL ? (
                                      <img
                                        src={item.photoURL}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                        {item.name ? item.name.charAt(0).toUpperCase() : '?'}
                                      </div>
                                    )}
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    item.role === 'teacher' ? 'bg-green-400' : 
                                    item.role === 'employee' ? 'bg-blue-400' : 'bg-purple-400'
                                  }`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold text-lg truncate">
                                    {item.name || 'Unknown'}
                                  </h4>
                                  <p className="text-blue-100 text-sm">
                                    {item.role === 'teacher' ? 'Teacher' : item.role === 'employee' ? 'Employee' : 'Other'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                                  <p className="text-xs text-slate-600 font-mono">ID: {item.schoolId}</p>
                                </div>
                              </div>
                              
                              {item.position && (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-4 h-4 text-green-600" />
                                  </div>
                                  <p className="text-sm text-slate-700">{item.position}</p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => {
                                    setActiveView(item.role === 'teacher' ? 'teachers' : 'employees');
                                    setSearchQuery('');
                                  }}
                                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={() => {
                                    if (user) {
                                      goToDashboard(item.role);
                                    } else {
                                      router.push('/login');
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors"
                                >
                                  Dashboard
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Enhanced Teachers List View */}
          {activeView === 'teachers' && (
            <section>
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        All Teachers
                      </h2>
                      <p className="text-slate-600">
                        {teachers.length} {teachers.length === 1 ? 'teacher' : 'teachers'} registered in the system
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveView('home')}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced Teacher Search Box */}
              <div className="mb-8">
                <div className="bg-white rounded-2xl border border-green-100 shadow-lg p-6">
                  <div className="relative max-w-2xl mx-auto">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search teachers by name, ID, or position..."
                      value={teacherSearchQuery}
                      onChange={(e) => setTeacherSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                    {teacherSearchQuery && (
                      <button
                        onClick={() => setTeacherSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {listLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading teachers...</p>
                  </div>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">No teachers found in the system.</p>
                </div>
              ) : (
                <>
                  {(() => {
                    const filteredTeachers = teachers.filter((teacher) => {
                      if (!teacherSearchQuery.trim()) return true;
                      const term = teacherSearchQuery.toLowerCase();
                      return (
                        (teacher.name && teacher.name.toLowerCase().includes(term)) ||
                        (teacher.schoolId && String(teacher.schoolId).toLowerCase().includes(term)) ||
                        (teacher.position && teacher.position.toLowerCase().includes(term))
                      );
                    });

                    return filteredTeachers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600">No teachers match your search.</p>
                        <p className="text-sm text-slate-500 mt-2">Try different keywords.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeachers.map((teacher) => (
                          <div key={teacher.id} className="group bg-white rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                                    {teacher.photoURL ? (
                                      <img
                                        src={teacher.photoURL}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                        {teacher.name ? teacher.name.charAt(0).toUpperCase() : '?'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-semibold text-lg truncate">
                                    {teacher.name || 'Unknown'}
                                  </h4>
                                  <p className="text-green-100 text-sm">Teacher</p>
                                </div>
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Users className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{teacher.name}</p>
                                  <p className="text-xs text-slate-600 font-mono">ID: {teacher.schoolId}</p>
                                </div>
                              </div>
                              
                              {teacher.position && (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <p className="text-sm text-slate-700">{teacher.position}</p>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => {
                                    if (user && user.role === 'admin') {
                                      router.push('/dashboard/admin');
                                    } else if (user && user.role === 'teacher') {
                                      router.push('/dashboard/teacher');
                                    } else {
                                      router.push('/login');
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={() => {
                                    if (user) {
                                      goToDashboard('teacher');
                                    } else {
                                      router.push('/login');
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 border border-green-200 text-green-600 hover:bg-green-50 text-sm font-medium rounded-lg transition-colors"
                                >
                                  Dashboard
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </section>
          )}

          {/* Enhanced Staff Locator View */}
          {activeView === 'locator' && (
            <section className="space-y-8">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      Staff Locator
                    </h2>
                    <p className="text-slate-600">
                      Find teachers and employees across Mindoro State University campuses in real-time.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveView('home')}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Home
                  </Button>
                </div>
              </div>

              <StaffLocator />
            </section>
          )}

          {/* Enhanced Employees List View */}
          {activeView === 'employees' && (
            <section className="space-y-8">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      Employees Directory
                    </h2>
                    <p className="text-slate-600">
                      {employees.length} {employees.length === 1 ? 'employee' : 'employees'} registered in the system
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveView('home')}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Home
                  </Button>
                </div>
              </div>

              {/* Employee Location Map Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <EmployeeLocator />
                </div>
                <div className="lg:col-span-2">
                  {listLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading employees...</p>
                      </div>
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600">No employees found in the system.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {employees.map((employee) => (
                        <div key={employee.id} className="group bg-white rounded-2xl border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                          {/* Card Header */}
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                                  {employee.photoURL ? (
                                    <img
                                      src={employee.photoURL}
                                      alt={employee.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                      {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                  )}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-purple-400`}></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold text-lg truncate">
                                  {employee.name || 'Unknown'}
                                </h4>
                                <p className="text-purple-100 text-sm capitalize">
                                  {employee.role || 'employee'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{employee.name}</p>
                                <p className="text-xs text-slate-600 font-mono">ID: {employee.schoolId}</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => {
                                  if (user && (user.role === 'admin' || user.role === 'employee')) {
                                    router.push(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/employee');
                                  } else {
                                    router.push('/login');
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                View Profile
                              </button>
                              <button
                                onClick={() => {
                                  if (user) {
                                    goToDashboard('employee');
                                  } else {
                                    router.push('/login');
                                  }
                                }}
                                className="flex-1 px-3 py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 text-sm font-medium rounded-lg transition-colors"
                              >
                                Dashboard
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Enhanced Hero Section with Clock */}
          {activeView === 'home' && (
            <section className="text-center py-16">
              <div className="max-w-6xl mx-auto">
                {/* Enhanced Welcome Message */}
                <div className="mb-12">
                  <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
                    Welcome to Mindoro State University Faculty Monitoring System
                  </h2>
                </div>

                {/* Clock and Date Display */}
                <div className="mb-12">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto">
                    <div className="text-center space-y-4">
                      {/* Date Display */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-6 py-3 inline-block">
                        <p className="text-lg font-semibold">
                          {mounted && currentTime.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      {/* Clock Display */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl px-12 py-8 shadow-2xl">
                          <div className="flex items-center justify-center gap-4">
                            <Clock className="w-8 h-8 text-blue-400 animate-pulse" />
                            <div className="text-6xl md:text-7xl font-bold font-mono tracking-wider">
                              {mounted && currentTime.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true 
                              })}
                            </div>
                            <Clock className="w-8 h-8 text-indigo-400 animate-pulse" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Time Info */}
                      <div className="flex justify-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Live Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Timezone: {mounted && Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee ID Input Section */}
                <div className="mb-12">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Employee ID Entry
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Employee ID
                          </label>
                          <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="Enter your Employee ID"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Note: Location (teacher or employee)
                          </label>
                          <textarea
                            value=""
                            onChange={(e) => {
                              // Handle location note change
                              console.log('Location note:', e.target.value);
                            }}
                            placeholder="Specify location: teacher or employee"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                            rows="2"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (employeeId.trim()) {
                                setTimeAction('time-in');
                                setShowTimeModal(true);
                              } else {
                                alert('Please enter your Employee ID');
                              }
                            }}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Time In
                          </button>
                          <button
                            onClick={() => {
                              if (employeeId.trim()) {
                                setTimeAction('time-out');
                                setShowTimeModal(true);
                              } else {
                                alert('Please enter your Employee ID');
                              }
                            }}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Time Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Global Footer */}
          <footer className="border-t bg-white rounded-2xl shadow-sm mt-auto">
            <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
              <p className="text-sm text-slate-600"> 2026 Mindoro State University. All rights reserved.</p>
              <p className="text-sm text-slate-600">Demo System • No Real Data</p>
            </div>
          </footer>
        </main>
      </div>

      {/* Employee ID Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowTimeModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <button
              onClick={() => setShowTimeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                timeAction === 'time-in' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}>
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {timeAction === 'time-in' ? 'Time In' : 'Time Out'}
              </h3>
              <p className="text-slate-600">
                Enter your Employee ID to {timeAction === 'time-in' ? 'clock in' : 'clock out'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your Employee ID"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTimeModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (employeeId.trim()) {
                      // Handle time in/out logic here
                      alert(`${timeAction === 'time-in' ? 'Time In' : 'Time Out'} recorded for Employee ID: ${employeeId}`);
                      setShowTimeModal(false);
                      setEmployeeId('');
                    } else {
                      alert('Please enter your Employee ID');
                    }
                  }}
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-colors ${
                    timeAction === 'time-in'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  {timeAction === 'time-in' ? 'Time In' : 'Time Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
