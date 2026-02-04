'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

// Keep school ID normalization consistent across the app.
// We store documents in Firestore using an uppercase `MBC-XXXX` format,
// but users might type `mbc-0001` or just `0001` when logging in.
function normalizeSchoolId(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';

  const upper = trimmed.toUpperCase();
  return upper.startsWith('MBC-') ? upper : `MBC-${upper}`;
}

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
    const trimmedId = String(schoolId || '').trim();
    if (!trimmedId) {
      throw new Error('School ID is required');
    }

    // Normalize to our canonical Firestore ID format (e.g. MBC-0001),
    // so login works even if the user types different casing like mbc-0001.
    const normalizedId = normalizeSchoolId(trimmedId);

    // First, check the teachers collection – this is the source of truth.
    const teacherRef = doc(firebaseDb, 'teachers', normalizedId);
    const teacherSnap = await getDoc(teacherRef);
    
    // If there is no record in teachers, login is not allowed.
    if (!teacherSnap.exists()) {
      throw new Error(
        'School ID not found. Please contact the admin to add you to the system.'
      );
    }

    const teacherData = teacherSnap.data();

    // Decide role based strictly on what admin set in the teachers collection.
    // Only explicit 'teacher' or 'employee' roles are allowed to log in.
    const rawRole = String(teacherData.role || '').toLowerCase();
    if (rawRole !== 'teacher' && rawRole !== 'employee') {
      throw new Error(
        'Your account role is not allowed to log in. Please contact the admin.'
      );
    }

    const detectedRole = rawRole === 'teacher' ? 'teacher' : 'employee';

    // Now use the detected role to login, always passing the normalized ID.
    return loginTeacherOrEmployee({ schoolId: normalizedId, role: detectedRole });
  };

  const loginTeacherOrEmployee = async ({ schoolId, role }) => {
    if (!schoolId) {
      throw new Error('School ID is required');
    }

    // Ensure we always talk to Firestore using the normalized ID.
    const normalizedId = normalizeSchoolId(schoolId);

    // Extra safety: only allow login if this ID exists in the teachers collection.
    const teacherRefForCheck = doc(firebaseDb, 'teachers', normalizedId);
    const teacherSnapForCheck = await getDoc(teacherRefForCheck);
    if (!teacherSnapForCheck.exists()) {
      throw new Error(
        'School ID not found. Please contact the admin to add you to the system.'
      );
    }

    // This uses documents like: users/{schoolId} with fields { role, name, schoolId }.
    // If it does not exist yet, we create it automatically.
    const userRef = doc(firebaseDb, 'users', normalizedId);
    const snap = await getDoc(userRef);

    // Helper: try to read name from teachers collection when logging in as teacher
    const getTeacherName = async () => {
      try {
        if (role !== 'teacher') return null;
        const teacherRef = doc(firebaseDb, 'teachers', normalizedId);
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
        schoolId: normalizedId,
      };
      await setDoc(userRef, defaultProfile);
      
      const newUser = {
        uid: normalizedId,
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
      uid: normalizedId,
      name: data.name || (role === 'teacher' ? 'Teacher' : 'Employee'),
      schoolId: normalizedId,
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
    try {
      await signOut(firebaseAuth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Firebase signOut error:', error);
      // Still clear local state and redirect even if Firebase signOut fails
      setUser(null);
      router.push('/login');
    }
  };

  const sendPasswordReset = async (email) => {
    const targetEmail = email || (user && user.email);
    if (!targetEmail) {
      throw new Error('Email is required to send a password reset link.');
    }
    await sendPasswordResetEmail(firebaseAuth, targetEmail);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initialising,
        loginTeacherOrEmployee,
        loginWithAutoDetect,
        loginAdmin,
        logout,
        sendPasswordReset,
      }}
    >
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


