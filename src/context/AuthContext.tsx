// ============================================
// Yusluv — Authentication Context
// ============================================

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { hashPin, verifyPin } from '../lib/crypto';

interface AuthState {
  isAuthenticated: boolean;
  isPinSet: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'INIT'; isPinSet: boolean }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_FAIL'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'PIN_RESET' };

interface AuthContextValue extends AuthState {
  setupPin: (pin: string) => Promise<void>;
  authenticate: (pin: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  resetPin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PIN_HASH_KEY = 'yusluv-pin-hash';

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'INIT':
      return { ...state, isPinSet: action.isPinSet, isLoading: false };
    case 'AUTH_SUCCESS':
      return { ...state, isAuthenticated: true, error: null };
    case 'AUTH_FAIL':
      return { ...state, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'PIN_RESET':
      return { ...state, isAuthenticated: false, isPinSet: false, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isPinSet: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const hash = localStorage.getItem(PIN_HASH_KEY);
    dispatch({ type: 'INIT', isPinSet: !!hash });
  }, []);

  const setupPin = async (pin: string) => {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_HASH_KEY, hash);
    dispatch({ type: 'AUTH_SUCCESS' });
  };

  const authenticate = async (pin: string): Promise<boolean> => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (!storedHash) return false;

    const valid = await verifyPin(pin, storedHash);
    if (valid) {
      dispatch({ type: 'AUTH_SUCCESS' });
      return true;
    } else {
      dispatch({ type: 'AUTH_FAIL', error: 'Wrong PIN. Try again.' });
      return false;
    }
  };

  const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    if (!storedHash) return false;

    const valid = await verifyPin(oldPin, storedHash);
    if (!valid) return false;

    const newHash = await hashPin(newPin);
    localStorage.setItem(PIN_HASH_KEY, newHash);
    return true;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  const resetPin = () => {
    localStorage.removeItem(PIN_HASH_KEY);
    dispatch({ type: 'PIN_RESET' });
  };

  return (
    <AuthContext.Provider
      value={{ ...state, setupPin, authenticate, logout, clearError, changePin, resetPin }}
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
