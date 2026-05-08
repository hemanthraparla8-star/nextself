import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDtksrb4rTOCt0UEEwlfS6PzFnjgLPTed0',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'nextself-93b1a.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'nextself-93b1a',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'nextself-93b1a.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '355855691335',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:355855691335:web:56f82c06cf016371b2cb62',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-MDDGLQQJ65',
};

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export async function getFirebaseAnalyticsIfSupported() {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported();
  return supported ? getAnalytics(getFirebaseApp()) : null;
}
