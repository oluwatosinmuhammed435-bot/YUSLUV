// ============================================
// Yusluv — Authentication Context (Firebase)
// ============================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { hashPin, verifyPin } from '../lib/crypto';

// ---- State & Actions ----

interface AuthState {
  // Firebase cloud auth
  user: User | null;
  isFirebaseLoading: boolean;
  firebaseError: string | null;

  // Local PIN layer (secondary, device-level lock)
  isPinSet: boolean;
  isPinUnlocked: boolean;
  pinError: string | null;
}

type AuthAction =
  | { type: 'FIREBASE_LOADING' }
  | { type: 'FIREBASE_SIGNED_IN'; user: User; isPinSet: boolean }
  | { type: 'FIREBASE_SIGNED_OUT' }
  | { type: 'FIREBASE_ERROR'; error: string }
  | { type: 'CLEAR_FIREBASE_ERROR' }
  | { type: 'PIN_UNLOCKED' }
  | { type: 'PIN_LOCKED' }
  | { type: 'PIN_ERROR'; error: string }
  | { type: 'CLEAR_PIN_ERROR' }
  | { type: 'PIN_SET'; isPinSet: boolean }
  | { type: 'PIN_RESET' };

interface AuthContextValue {
  // Cloud identity
  user: User | null;
  isFirebaseLoading: boolean;
  firebaseError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  clearFirebaseError: () => void;

  // Local PIN (secondary lock)
  isPinSet: boolean;
  isPinUnlocked: boolean;
  pinError: string | null;
  setupPin: (pin: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  resetPin: () => void;
  clearPinError: () => void;

  // Convenience
  isAuthenticated: boolean; // user logged in AND pin unlocked (or no pin set)
}

const AuthContext = createContext<AuthContextValue | null>(null);

function pinStorageKey(uid: string) {
  return `yusluv-pin-hash-${uid}`;
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'FIREBASE_LOADING':
      return { ...state, isFirebaseLoading: true };
    case 'FIREBASE_SIGNED_IN':
      return {
        ...state,
        user: action.user,
        isFirebaseLoading: false,
        firebaseError: null,
        isPinSet: action.isPinSet,
        // If no pin is set, auto-unlock locally
        isPinUnlocked: !action.isPinSet,
      };
    case 'FIREBASE_SIGNED_OUT':
      return {
        ...state,
        user: null,
        isFirebaseLoading: false,
        isPinSet: false,
        isPinUnlocked: false,
        pinError: null,
      };
    case 'FIREBASE_ERROR':
      return { ...state, isFirebaseLoading: false, firebaseError: action.error };
    case 'CLEAR_FIREBASE_ERROR':
      return { ...state, firebaseError: null };
    case 'PIN_UNLOCKED':
      return { ...state, isPinUnlocked: true, pinError: null };
    case 'PIN_LOCKED':
      // Only lock if a PIN is actually set; otherwise no-op
      return state.isPinSet ? { ...state, isPinUnlocked: false, pinError: null } : state;
    case 'PIN_ERROR':
      return { ...state, pinError: action.error };
    case 'CLEAR_PIN_ERROR':
      return { ...state, pinError: null };
    case 'PIN_SET':
      return { ...state, isPinSet: action.isPinSet, isPinUnlocked: true };
    case 'PIN_RESET':
      return { ...state, isPinSet: false, isPinUnlocked: true, pinError: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isFirebaseLoading: true,
    firebaseError: null,
    isPinSet: false,
    isPinUnlocked: false,
    pinError: null,
  });

  // Listen to Firebase auth state across devices/tabs
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const key = pinStorageKey(firebaseUser.uid);
        const isPinSet = !!localStorage.getItem(key);
        dispatch({ type: 'FIREBASE_SIGNED_IN', user: firebaseUser, isPinSet });
      } else {
        dispatch({ type: 'FIREBASE_SIGNED_OUT' });
      }
    });
    return unsub;
  }, []);

  // Lock PIN when app goes to background (tab hidden / phone lock screen)
  // This makes every re-open require the PIN again — like OPay
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch({ type: 'PIN_LOCKED' });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // ---- Firebase Auth actions ----

  const signIn = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'FIREBASE_LOADING' });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will fire and update state
    } catch (err: unknown) {
      const msg = mapFirebaseError(err);
      dispatch({ type: 'FIREBASE_ERROR', error: msg });
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'FIREBASE_LOADING' });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will fire and update state
    } catch (err: unknown) {
      const msg = mapFirebaseError(err);
      dispatch({ type: 'FIREBASE_ERROR', error: msg });
    }
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
    // onAuthStateChanged will fire FIREBASE_SIGNED_OUT
  }, []);

  const clearFirebaseError = useCallback(() => {
    dispatch({ type: 'CLEAR_FIREBASE_ERROR' });
  }, []);

  // ---- Local PIN actions ----

  const setupPin = useCallback(async (pin: string) => {
    if (!state.user) return;
    const hash = await hashPin(pin);
    localStorage.setItem(pinStorageKey(state.user.uid), hash);
    dispatch({ type: 'PIN_SET', isPinSet: true });
  }, [state.user]);

  const unlockWithPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!state.user) return false;
    const storedHash = localStorage.getItem(pinStorageKey(state.user.uid));
    if (!storedHash) return false;
    const valid = await verifyPin(pin, storedHash);
    if (valid) {
      dispatch({ type: 'PIN_UNLOCKED' });
    } else {
      dispatch({ type: 'PIN_ERROR', error: 'Wrong PIN. Try again.' });
    }
    return valid;
  }, [state.user]);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    if (!state.user) return false;
    const storedHash = localStorage.getItem(pinStorageKey(state.user.uid));
    if (!storedHash) return false;
    const valid = await verifyPin(oldPin, storedHash);
    if (!valid) return false;
    const newHash = await hashPin(newPin);
    localStorage.setItem(pinStorageKey(state.user.uid), newHash);
    return true;
  }, [state.user]);

  const resetPin = useCallback(() => {
    if (!state.user) return;
    localStorage.removeItem(pinStorageKey(state.user.uid));
    dispatch({ type: 'PIN_RESET' });
  }, [state.user]);

  const clearPinError = useCallback(() => {
    dispatch({ type: 'CLEAR_PIN_ERROR' });
  }, []);

  const isAuthenticated =
    !!state.user && (state.isPinUnlocked || !state.isPinSet);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        logOut,
        clearFirebaseError,
        setupPin,
        unlockWithPin,
        changePin,
        resetPin,
        clearPinError,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ---- Firebase error mapper ----

function mapFirebaseError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'No internet connection. Please check your network.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}
