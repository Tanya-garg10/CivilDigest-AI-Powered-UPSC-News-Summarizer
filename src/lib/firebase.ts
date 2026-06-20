import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

// Embedded configuration direct from firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0256879183",
  appId: "1:712996940236:web:0d295dce4d4c5eee0f1569",
  apiKey: "AIzaSyCZrMeCZMV28gwpImsjSMLwouraH86q2Cs",
  authDomain: "gen-lang-client-0256879183.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-e3dea562-4c57-473a-9e27-7ea4b713d0b0",
  storageBucket: "gen-lang-client-0256879183.firebasestorage.app",
  messagingSenderId: "712996940236",
  measurementId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with standard persistence multi-tab manager
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth = getAuth(app);

// Helper to retrieve or generate a persistent local unique guest identifier
function getOrGenerateGuestUid(): string {
  try {
    let uid = localStorage.getItem('civildigest_anonymous_uid');
    if (!uid) {
      uid = 'guest-fallback-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
      localStorage.setItem('civildigest_anonymous_uid', uid);
    }
    return uid;
  } catch (_) {
    // If localStorage is unavailable, return a random string for the session
    return 'guest-fallback-temp-' + Math.random().toString(36).substring(2, 11);
  }
}

// Lazy function to ensure user is logged in (at least anonymously) so they can save sheets
export async function ensureUserAuthenticated() {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (error) {
    console.warn("Firebase Anonymous Auth restricted or failed, falling back to a local guest credential session:", error);
    const guestUid = getOrGenerateGuestUid();
    return {
      uid: guestUid,
      isAnonymous: true,
      email: null,
      displayName: "Guest Aspirant",
      metadata: {},
      providerData: [],
      emailVerified: false
    } as any;
  }
}
