// ============================================
// Yusluv — Firebase Initialization
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLk-By4RxP9YxUj-iUGSDfxD4E0sTeNao",
  authDomain: "yusluv-eeb0b.firebaseapp.com",
  projectId: "yusluv-eeb0b",
  storageBucket: "yusluv-eeb0b.firebasestorage.app",
  messagingSenderId: "386653457332",
  appId: "1:386653457332:web:7908b8a0125c461eb180e1",
  measurementId: "G-JMXPHBT4CR",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Firebase v10+ way to enable offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
