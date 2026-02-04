'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);
  const router = useRouter();

  // Keep local user in sync with Firebase Auth user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setInitialising(false);
        return;
      }

      // Try to read extra profile (role, schoolId, name) from Firestore
      try {
        const profileRef = doc(firebaseDb, 'users', fbUser.uid);
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
          const profile = snap.data();
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            ...profile,
          });
        } else {
          // Fallback: just basic info, default to admin if using email login
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            role: 'admin',
            name: fbUser.email ?? 'Admin',
            schoolId: 'ADMIN',
          });
        }
      } catch (err) {
        console.error('Error loading user profile', err);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          role: 'admin',
          name: fbUser.email ?? 'Admin',
          schoolId: 'ADMIN',
        });
      } finally {
        setInitialising(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-detect role based on school ID
  const loginWithAutoDetect = async ({ schoolId }) => {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    // First, check the teachers collection to determine role
    const teacherRef = doc(firebaseDb, 'teachers', schoolId);
    const teacherSnap = await getDoc(teacherRef);
    
    let detectedRole = 'employee'; // Default to employee
    let name = 'Employee';
    
    if (teacherSnap.exists()) {
      const teacherData = teacherSnap.data();
      // If role is 'teacher', it's a teacher, otherwise it's an employee
      detectedRole = teacherData.role === 'teacher' ? 'teacher' : 'employee';
      name = teacherData.name || (detectedRole === 'teacher' ? 'Teacher' : 'Employee');
    } else {
      // Check users collection for existing profile
      const userRef = doc(firebaseDb, 'users', schoolId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        detectedRole = userData.role === 'teacher' ? 'teacher' : 'employee';
        name = userData.name || (detectedRole === 'teacher' ? 'Teacher' : 'Employee');
      }
    }

    // Now use the detected role to login
    return loginTeacherOrEmployee({ schoolId, role: detectedRole });
  };

  const loginTeacherOrEmployee = async ({ schoolId, role }) => {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    // This uses documents like: users/{schoolId} with fields { role, name, schoolId }.
    // If it does not exist yet, we create it automatically.
    const userRef = doc(firebaseDb, 'users', schoolId);
    const snap = await getDoc(userRef);

    // Helper: try to read name from teachers collection when logging in as teacher
    const getTeacherName = async () => {
      try {
        if (role !== 'teacher') return null;
        const teacherRef = doc(firebaseDb, 'teachers', schoolId);
        const teacherSnap = await getDoc(teacherRef);
        if (teacherSnap.exists()) {
          const teacherData = teacherSnap.data();
          return teacherData.name || null;
        }
      } catch (err) {
        console.error('Failed to load teacher profile for login', err);
      }
      return null;
    };

    if (!snap.exists()) {
      // Auto-create a simple profile so first-time login does not crash.
      // If admin already added this teacher in the admin dashboard, use that name.
      let name = role === 'teacher' ? 'Teacher' : 'Employee';
      const teacherName = await getTeacherName();
      if (teacherName) {
        name = teacherName;
      }

      const defaultProfile = {
        name,
        role,
        schoolId,
      };
      await setDoc(userRef, defaultProfile);
      
      const newUser = {
        uid: schoolId,
        ...defaultProfile,
      };

      setUser(newUser);

      if (role === 'teacher') {
        router.push('/dashboard/teacher');
      } else if (role === 'employee') {
        router.push('/dashboard/employee');
      }
      return;
    }

    let data = snap.data();

    // If teacher profile exists in teachers collection, prefer that name
    if (role === 'teacher') {
      const teacherName = await getTeacherName();
      if (teacherName && teacherName !== data.name) {
        const updatedProfile = {
          ...data,
          name: teacherName,
        };
        await setDoc(userRef, updatedProfile, { merge: true });
        data = updatedProfile;
      }
    }

    if (data.role !== role) {
      // If the stored role is different (e.g. was created as employee but now logging as teacher),
      // update the profile to use the newly requested role instead of blocking with an error.
      const updatedProfile = {
        ...data,
        role,
      };
      await setDoc(userRef, updatedProfile, { merge: true });
      data = updatedProfile;
    }

    const newUser = {
      uid: schoolId,
      name: data.name || (role === 'teacher' ? 'Teacher' : 'Employee'),
      schoolId,
      role: data.role,
    };

    setUser(newUser);

    if (role === 'teacher') {
      router.push('/dashboard/teacher');
    } else if (role === 'employee') {
      router.push('/dashboard/employee');
    }
  };

  const loginAdmin = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const fbUser = cred.user;

    // Profile will be loaded by onAuthStateChanged, but we can navigate now
    router.push('/dashboard/admin');
    return fbUser;
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, initialising, loginTeacherOrEmployee, loginWithAutoDetect, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}


