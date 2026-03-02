/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, GoogleAuthProvider, linkWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD7BRwZAFIFgSr11e5BAv6XITDUcbjcsMY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "soulrefinery-soulmate.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "soulrefinery-soulmate",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "soulrefinery-soulmate.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "962426792627",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:962426792627:web:935736cab26751e0765ec6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E3MMGGSV3P"
};

// Initialize Firebase only if config is provided to avoid crashing
const isFirebaseConfigured = !!firebaseConfig.apiKey;

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isFirebaseConfigured ? getAuth(app!) : null;
export const db = isFirebaseConfigured ? getFirestore(app!) : null;

// Helper function to sign in anonymously
export const signInAnon = async () => {
  if (!auth) {
    console.warn("Firebase is not configured. Skipping anonymous sign-in.");
    return null;
  }
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    return null;
  }
};

// Helper function to link anonymous account with Google
export const linkWithGoogle = async () => {
  if (!auth || !auth.currentUser) return null;
  
  const provider = new GoogleAuthProvider();
  try {
    const result = await linkWithPopup(auth.currentUser, provider);
    return result.user;
  } catch (error: any) {
    console.error("Error linking with Google:", error);
    // If the account already exists, you might want to handle credential-already-in-use
    // by signing in with Google directly and merging data, but for simplicity we just log it.
    throw error;
  }
};
