import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';
import { AppState } from '../types';

// Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: 'AIzaSyDORWH5fEeNe7KWyWPMO17OfsluRwR7XCM',
  authDomain: 'exams-mc.firebaseapp.com',
  projectId: 'exams-mc',
  storageBucket: 'exams-mc.firebasestorage.app',
  messagingSenderId: '381112658840',
  appId: '1:381112658840:web:e4f212c4a852b0db7c99ed',
  measurementId: 'G-BV7C25S757',
  databaseURL: 'https://exams-mc-default-rtdb.firebaseio.com/',
};

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth & Realtime Database
export const auth = getAuth(firebaseApp);
export const database = getDatabase(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user with email & password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  classGrade: string = 'Class 9'
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (credential.user && displayName.trim()) {
    try {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    } catch {}
  }
  return credential.user;
}

/**
 * Sign in existing user with email & password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
}

import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Sign in / Sign up with Google (Opens real Chrome Custom Tab on native Android, popup on web)
 */
export async function loginWithGoogle(): Promise<User | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const clientId = '381112658840-frm4sfmglcgglb0bflue1n4002n6l7lt.apps.googleusercontent.com';
      const redirectUri = 'https://exams-mc.firebaseapp.com/__/auth/handler';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code%20id_token&scope=openid%20profile%20email`;

      await Browser.open({
        url: authUrl,
        windowName: '_blank',
        presentationStyle: 'popover',
      });
    } catch (browserErr) {
      console.warn('Chrome Custom Tab error, trying direct auth:', browserErr);
    }
  }

  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  } catch (err: any) {
    if (Capacitor.isNativePlatform() && auth.currentUser) {
      return auth.currentUser;
    }
    throw err;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to Auth State changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Save user study OS state to Firebase Realtime Database
 */
export async function saveUserDataToCloud(uid: string, state: AppState): Promise<boolean> {
  if (!uid) return false;
  try {
    const userRef = ref(database, `users/${uid}/study_os_data`);
    const payload = {
      ...state,
      lastSyncedAt: new Date().toISOString(),
      updatedTimestamp: serverTimestamp(),
    };
    await set(userRef, payload);
    return true;
  } catch (err) {
    console.warn('Realtime database cloud save error:', err);
    return false;
  }
}

/**
 * Load user study OS state from Firebase Realtime Database
 */
export async function loadUserDataFromCloud(uid: string): Promise<AppState | null> {
  if (!uid) return null;
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `users/${uid}/study_os_data`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data as AppState;
    }
    return null;
  } catch (err) {
    console.warn('Realtime database cloud load error:', err);
    return null;
  }
}

/**
 * Subscribe to Realtime Database changes for live multi-device synchronization
 */
export function subscribeToUserDataInCloud(
  uid: string,
  onData: (data: AppState) => void,
  onError?: (err: Error) => void
): () => void {
  if (!uid) return () => {};
  try {
    const userRef = ref(database, `users/${uid}/study_os_data`);
    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          onData(data as AppState);
        }
      },
      (error) => {
        console.warn('Realtime database subscription error:', error);
        if (onError) onError(error);
      }
    );
    return () => unsubscribe();
  } catch (err: any) {
    console.warn('Failed to attach Realtime database listener:', err);
    return () => {};
  }
}
