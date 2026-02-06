'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Clock, Search, Activity, Navigation } from 'lucide-react';

export default function EmployeeLocator() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeEmployees, setActiveEmployees] = useState([]);

  // Campus coordinates for MSU Bongabong
  const campusCoordinates = {
    lat: 12.5978,
    lng: 121.4176,
    name: "Mindoro State University Bongabong Campus",
    address: "Bongabong, Oriental Mindoro, Philippines"
  };

  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoading(true);
        
        // Load employee locations
        const locationSnap = await getDocs(
          query(collection(firebaseDb, 'employeeLocations'), orderBy('createdAt', 'desc'), limit(100))
        );
        const locationData = locationSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Load all users with employee role
        const usersSnap = await getDocs(collection(firebaseDb, 'users'));
        const employeeData = usersSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(u => u.role === 'employee');
        
        // Get most recent location for each employee
        const employeeLocationMap = new Map();
        locationData.forEach((item) => {
          if (!employeeLocationMap.has(item.employeeId) || 
              (item.createdAt?.seconds ?? 0) > (employeeLocationMap.get(item.employeeId)?.createdAt?.seconds ?? 0)) {
            employeeLocationMap.set(item.employeeId, item);
          }
        });
        
        // Combine data
        const employeesWithLocations = employeeData.map(emp => {
          const loc = employeeLocationMap.get(emp.schoolId);
          return {
            ...emp,
            currentLocation: loc?.location || 'Not specified',
            locationReason: loc?.reason || '',
            locationTime: loc?.createdAt,
            isActive: !!loc
          };
        });
        
        setItems(employeesWithLocations);
        setActiveEmployees(employeesWithLocations.filter(e => e.isActive));
        
      } catch (err) {
        console.error('Failed to load employee data', err);
        setError('Failed to load employee locations.');
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
    const interval = setInterval(loadEmployeeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = items.filter((emp) => {
    if (!search.trim()) return false;
    const term = search.toLowerCase();
    return (
      (emp.schoolId && String(emp.schoolId).toLowerCase().includes(term)) ||
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.currentLocation && emp.currentLocation.toLowerCase().includes(term))
    );
  });

  const displayItems = search.trim() ? filtered : activeEmployees;

  const generateMapUrl = (loc) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${campusCoordinates.name} ${loc}`)}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Navigation className="w-5 h-5 text-emerald-600" />
              Employee Locator
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              placeholder="Search by name, ID, or location..."
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm">No employee locations found.</p>
              </div>
            ) : (
              displayItems.map((emp) => (
                <div key={emp.id} className="border-l-4 border-l-emerald-500 bg-slate-50 rounded-r-xl p-4 transition-all hover:bg-slate-100 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{emp.name}</h4>
                        <span className="text-[10px] bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-100 font-mono">
                          {emp.schoolId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                        <MapPin className="w-3 h-3" />
                        {emp.currentLocation}
                      </div>
                      {emp.locationReason && (
                        <p className="text-xs text-slate-600 italic">"{emp.locationReason}"</p>
                      )}
                      {emp.locationTime && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                          <Clock className="w-2 h-2" />
                          <span>{new Date(emp.locationTime.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                    <a
                      href={generateMapUrl(emp.currentLocation)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 border border-emerald-100 shadow-sm transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
