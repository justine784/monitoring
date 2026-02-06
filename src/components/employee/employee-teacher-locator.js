'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Clock, Search, Activity, Navigation } from 'lucide-react';

export default function EmployeeTeacherLocator() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTeachers, setActiveTeachers] = useState([]);
  const [campusLocations, setCampusLocations] = useState([]);

  // Mindoro State University Bongabong Campus coordinates and details
  const campusCoordinates = {
    lat: 12.5978,
    lng: 121.4176,
    name: "Mindoro State University Bongabong Campus",
    address: "Bongabong, Oriental Mindoro, Philippines"
  };

  // Campus-specific locations for Oriental Mindoro State University Bongabong Campus
  const campusBuildingLocations = [
    'Main Building',
    'Administration Building',
    'Academic Building 1',
    'Academic Building 2',
    'Science Laboratory Building',
    'Computer Laboratory',
    'Library',
    'Gymnasium',
    'Cafeteria',
    'Student Center',
    'Faculty Room',
    'Guidance Office',
    'Clinic',
    'Auditorium',
    'Workshop Building',
    'Agricultural Building',
    'Engineering Building',
    'Nursing Building',
    'Hotel and Restaurant Management Building',
    'Campus Grounds',
    'Parking Area'
  ];

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        
        // Load teacher locations
        const locationSnap = await getDocs(
          query(collection(firebaseDb, 'teacherLocations'), orderBy('createdAt', 'desc'), limit(100))
        );
        const locationData = locationSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Load all teachers for active status
        const teacherSnap = await getDocs(collection(firebaseDb, 'teachers'));
        const teacherData = teacherSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Get most recent location for each teacher
        const teacherLocationMap = new Map();
        locationData.forEach((item) => {
          if (!teacherLocationMap.has(item.teacherId) || 
              (item.createdAt?.seconds ?? 0) > (teacherLocationMap.get(item.teacherId)?.createdAt?.seconds ?? 0)) {
            teacherLocationMap.set(item.teacherId, item);
          }
        });
        
        // Combine teacher data with locations
        const teachersWithLocations = teacherData.map(teacher => {
          const location = teacherLocationMap.get(teacher.schoolId);
          return {
            ...teacher,
            currentLocation: location?.location || 'Not specified',
            locationReason: location?.reason || '',
            locationTime: location?.createdAt,
            locationUpdatedBy: location?.createdByName,
            isActive: location ? true : false
          };
        });
        
        setItems(teachersWithLocations);
        
        // Filter active teachers (those with recent locations)
        const active = teachersWithLocations.filter(teacher => teacher.isActive);
        setActiveTeachers(active);
        
        // Filter teachers on campus
        const onCampus = active.filter(teacher => {
          const location = teacher.currentLocation.toLowerCase();
          return campusBuildingLocations.some(campus => 
            location.includes(campus.toLowerCase()) || 
            campus.toLowerCase().includes(location)
          );
        });
        setCampusLocations(onCampus);
        
      } catch (err) {
        console.error('Failed to load teacher data', err);
        setError('Failed to load teacher locations.');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadTeacherData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter teachers by search term
  const filtered = items.filter((teacher) => {
    if (!search.trim()) return false;
    const term = search.toLowerCase();
    return (
      (teacher.schoolId && String(teacher.schoolId).toLowerCase().includes(term)) ||
      (teacher.name && teacher.name.toLowerCase().includes(term)) ||
      (teacher.currentLocation && teacher.currentLocation.toLowerCase().includes(term))
    );
  });

  const displayItems = search.trim() ? filtered : activeTeachers;

  const isOnCampus = (location) => {
    if (!location) return false;
    const locationLower = location.toLowerCase();
    return campusBuildingLocations.some(campus => 
      locationLower.includes(campus.toLowerCase()) || 
      campus.toLowerCase().includes(locationLower)
    );
  };

  // Generate enhanced map URLs for campus navigation
  const generateMapUrl = (teacherLocation) => {
    const baseUrl = 'https://www.google.com/maps/search/?api=1&query=';
    
    if (isOnCampus(teacherLocation)) {
      // If on campus, search within the campus area
      return `${baseUrl}${encodeURIComponent(`${campusCoordinates.name} ${teacherLocation}`)}`;
    } else {
      // If off campus, show route from campus to teacher location
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(campusCoordinates.address)}&destination=${encodeURIComponent(teacherLocation)}`;
    }
  };

  // Generate campus overview map URL
  const generateCampusMapUrl = () => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campusCoordinates.name)}&z=17`;
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Total Teachers</p>
                <p className="text-xl font-bold text-blue-600">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Active Now</p>
                <p className="text-xl font-bold text-green-600">{activeTeachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">On Campus</p>
                <p className="text-xl font-bold text-purple-600">{campusLocations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Locator Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Navigation className="w-5 h-5 text-purple-600" />
              Teacher Location Detector
            </CardTitle>
            <a
              href={generateCampusMapUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              View Campus Map
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Search Teachers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search by name, ID, or location..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-sm text-slate-600">Loading teacher locations...</span>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  {search.trim() ? 'No teachers found matching your search.' : 'No active teachers with locations found.'}
                </p>
              </div>
            ) : (
              displayItems.map((teacher) => (
                <Card key={teacher.id} className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-800">{teacher.name}</h3>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            ID: {teacher.schoolId}
                          </span>
                          {teacher.isActive && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              Active
                            </span>
                          )}
                          {isOnCampus(teacher.currentLocation) && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              On Campus
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-slate-700">Location:</span>
                            <span className="text-slate-600">{teacher.currentLocation}</span>
                          </div>
                          
                          {teacher.locationTime && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                Last updated: {new Date(teacher.locationTime.seconds * 1000).toLocaleString()}
                              </span>
                              {teacher.locationUpdatedBy && (
                                <span>• by {teacher.locationUpdatedBy}</span>
                              )}
                            </div>
                          )}
                          
                          {teacher.locationReason && (
                            <div className="text-xs text-slate-600 italic">
                              Reason: {teacher.locationReason}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {teacher.currentLocation && teacher.currentLocation !== 'Not specified' && (
                        <div className="ml-4 space-y-2">
                          <a
                            href={generateMapUrl(teacher.currentLocation)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <MapPin className="w-3 h-3" />
                            {isOnCampus(teacher.currentLocation) ? 'Find on Campus' : 'Get Directions'}
                          </a>
                          {isOnCampus(teacher.currentLocation) && (
                            <p className="text-xs text-purple-600 italic">
                              Located within MSU Bongabong Campus
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


