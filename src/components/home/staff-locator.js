'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Clock, Search, Activity, Navigation, UserCheck } from 'lucide-react';

export default function StaffLocator() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPosted, setFilterPosted] = useState('all');
  const [activeStaff, setActiveStaff] = useState([]);

  // Campus coordinates for MSU Bongabong
  const campusCoordinates = {
    lat: 12.5978,
    lng: 121.4176,
    name: "Mindoro State University Bongabong Campus",
    address: "Bongabong, Oriental Mindoro, Philippines"
  };

  useEffect(() => {
    const loadStaffData = async () => {
      try {
        setLoading(true);
        
        // 1. Load teacher locations
        const tLocSnap = await getDocs(
          query(collection(firebaseDb, 'teacherLocations'), orderBy('createdAt', 'desc'), limit(50))
        );
        const tLocData = tLocSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: 'teacher' }));
        
        // 2. Load employee locations
        const eLocSnap = await getDocs(
          query(collection(firebaseDb, 'employeeLocations'), orderBy('createdAt', 'desc'), limit(50))
        );
        const eLocData = eLocSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: 'employee' }));
        
        // 3. Load all users/teachers for full info
        const teachersSnap = await getDocs(collection(firebaseDb, 'teachers'));
        const teachersBase = teachersSnap.docs.map(d => ({ id: d.id, ...d.data(), role: 'teacher' }));
        
        const usersSnap = await getDocs(collection(firebaseDb, 'users'));
        const employeesBase = usersSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.role === 'employee');

        // Create mapping for most recent locations
        const staffLocationMap = new Map();
        
        // Process teacher locations
        tLocData.forEach((item) => {
          const id = item.teacherId;
          if (id && (!staffLocationMap.has(id) || (item.createdAt?.seconds ?? 0) > (staffLocationMap.get(id)?.createdAt?.seconds ?? 0))) {
            // Priority given to the role explicitly set in the location post
            staffLocationMap.set(id, { ...item, staffType: item.role || 'teacher' });
          }
        });

        // Process employee locations
        eLocData.forEach((item) => {
          const id = item.employeeId;
          if (id && (!staffLocationMap.has(id) || (item.createdAt?.seconds ?? 0) > (staffLocationMap.get(id)?.createdAt?.seconds ?? 0))) {
            // Priority given to the role explicitly set in the location post
            staffLocationMap.set(id, { ...item, staffType: item.role || 'employee' });
          }
        });

        // Combine data
        const combinedTeachers = teachersBase.map(t => {
          const loc = staffLocationMap.get(t.schoolId);
          return {
            ...t,
            currentLocation: loc?.location || 'Not specified',
            locationReason: loc?.reason || '',
            locationTime: loc?.createdAt,
            isActive: !!loc,
            staffType: 'teacher'
          };
        });

        const combinedEmployees = employeesBase.map(e => {
          const loc = staffLocationMap.get(e.schoolId);
          return {
            ...e,
            currentLocation: loc?.location || 'Not specified',
            locationReason: loc?.reason || '',
            locationTime: loc?.createdAt,
            isActive: !!loc,
            staffType: 'employee'
          };
        });

        const allStaff = [...combinedTeachers, ...combinedEmployees];
        
        // Final deduplication by schoolId to ensure each user only appears once
        const uniqueStaffMap = new Map();
        allStaff.forEach(staff => {
          const loc = staffLocationMap.get(staff.schoolId);
          // If we have a live location post, use the role from that post
          const displayRole = loc?.role || staff.staffType;
          
          const staffWithCorrectRole = {
            ...staff,
            staffType: displayRole
          };

          if (!uniqueStaffMap.has(staff.schoolId)) {
            uniqueStaffMap.set(staff.schoolId, staffWithCorrectRole);
          } else {
            // If they exist in both, prefer the 'teacher' role only if no live location role is set
            if (displayRole === 'teacher') {
              uniqueStaffMap.set(staff.schoolId, staffWithCorrectRole);
            }
          }
        });

        const finalStaffList = Array.from(uniqueStaffMap.values());
        setItems(finalStaffList);
        setActiveStaff(finalStaffList.filter(s => s.isActive));
        
      } catch (err) {
        console.error('Failed to load staff locator data', err);
      } finally {
        setLoading(false);
      }
    };

    loadStaffData();
    const interval = setInterval(loadStaffData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = items.filter((staff) => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (staff.schoolId && String(staff.schoolId).toLowerCase().includes(term)) ||
      (staff.name && staff.name.toLowerCase().includes(term)) ||
      (staff.currentLocation && staff.currentLocation.toLowerCase().includes(term));
    
    const matchesRole = filterRole === 'all' || staff.staffType === filterRole;
    
    const isExpired = staff.expiresAt && new Date(staff.expiresAt) < new Date();
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && !isExpired) || 
      (filterStatus === 'expired' && isExpired);

    const matchesPosted = filterPosted === 'all' || 
      (filterPosted === 'posted' && staff.isActive) || 
      (filterPosted === 'not-posted' && !staff.isActive);

    return matchesSearch && matchesRole && matchesStatus && matchesPosted;
  });

  const displayItems = (search.trim() || filterRole !== 'all' || filterStatus !== 'all' || filterPosted !== 'all') ? filtered : activeStaff;

  const generateMapUrl = (loc) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${campusCoordinates.name} ${loc}`)}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Total Staff</p>
                <h3 className="text-2xl font-bold mt-1">{items.length}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Active Now</p>
                <h3 className="text-2xl font-bold mt-1">{activeStaff.length}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-xs font-medium uppercase tracking-wider">Teachers</p>
                <h3 className="text-2xl font-bold mt-1">{items.filter(i => i.staffType === 'teacher').length}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Navigation className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-100 text-xs font-medium uppercase tracking-wider">Employees</p>
                <h3 className="text-2xl font-bold mt-1">{items.filter(i => i.staffType === 'employee').length}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-red-500" />
                  Live Staff Locator
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">Real-time location of all university staff members</p>
              </div>
              <div className="relative md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, ID, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role:</span>
                <select 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="employee">Employees</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</span>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Posted:</span>
                <select 
                  value={filterPosted} 
                  onChange={(e) => setFilterPosted(e.target.value)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Staff</option>
                  <option value="posted">Has Posted</option>
                  <option value="not-posted">Not Posted</option>
                </select>
              </div>

              {(search || filterRole !== 'all' || filterStatus !== 'all' || filterPosted !== 'all') && (
                <button 
                  onClick={() => {
                    setSearch('');
                    setFilterRole('all');
                    setFilterStatus('all');
                    setFilterPosted('all');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-slate-50/50">
          <div className="max-h-[600px] overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 mt-4 font-medium">Updating staff directory...</p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <MapPin className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900">No Locations Found</h4>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                  {search ? "We couldn't find any staff matching your search." : "There are currently no staff members with an active location update."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayItems.map((staff) => (
                  <div key={`${staff.staffType}-${staff.schoolId}`} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            staff.staffType === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {staff.staffType}
                          </span>
                          {staff.isActive && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                              Active
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 truncate">{staff.name}</h4>
                        <p className="text-xs text-slate-500 font-mono mb-3">ID: {staff.schoolId}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="truncate">{staff.currentLocation}</span>
                          </div>
                          {staff.locationReason && (
                            <p className="text-xs text-slate-600 italic px-2">"{staff.locationReason}"</p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 px-2 pt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {staff.locationTime?.seconds 
                                ? new Date(staff.locationTime.seconds * 1000).toLocaleString([], {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })
                                : 'Just now'}
                            </span>
                            {staff.expiresAt && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded-md font-bold ${
                                new Date(staff.expiresAt) > new Date() 
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                  : 'bg-red-50 text-red-600 border border-red-100'
                              }`}>
                                {new Date(staff.expiresAt) > new Date() 
                                  ? `Until ${new Date(staff.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                  : 'EXPIRED'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={generateMapUrl(staff.currentLocation)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:bg-blue-500 group-hover:text-white"
                      >
                        <Navigation className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
