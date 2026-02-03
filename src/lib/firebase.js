'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT:
// Replace the below with your real Firebase project config
// or better: load them from environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyCO56N4BUIxTs-x6GpadA9UGGFpmM_wSW8",
  authDomain: "monitoring-be506.firebaseapp.com",
  projectId: "monitoring-be506",
  storageBucket: "monitoring-be506.firebasestorage.app",
  messagingSenderId: "35089388328",
  appId: "1:35089388328:web:20bd1193b46de7ec40f61d",
  measurementId: "G-V95FH1QF43"
};

function createFirebaseApp() {
  if (!firebaseConfig.apiKey) {
    console.warn(
      '[Firebase] Missing config. Set NEXT_PUBLIC_FIREBASE_* env vars in your `.env.local`.'
    );
  }

  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = createFirebaseApp();

export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);

