// ─── Firebase Configuration ───────────────────────────────────────────────────
// IMPORTANT: Replace these placeholder values with your actual Firebase project
// configuration. Go to: Firebase Console → Your Project → Project Settings → 
// Your Apps → Web App → Firebase SDK snippet → Config

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Firebase config for vinyak-construction project
const firebaseConfig = {
  apiKey: "AIzaSyBG-m1gLAjLtpL_0cTNcGYIY8i5o4teo28",
  authDomain: "vinyak-construction.firebaseapp.com",
  projectId: "vinyak-construction",
  storageBucket: "vinyak-construction.firebasestorage.app",
  messagingSenderId: "399407310130",
  appId: "1:399407310130:web:4b1f46cc9e67f84df4232b",
};

// Initialize Firebase (prevent re-initialization in hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({ forceOwnership: true }),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
});

// Storage
export const storage = getStorage(app);

export default app;
