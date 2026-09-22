// ============================================
// Yusluv — Expense Context (Firestore)
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
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import type { Expense, ExpenseCategory } from '../types';
import { generateId } from '../lib/utils';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
}

type ExpenseAction =
  | { type: 'LOAD'; expenses: Expense[] };

interface ExpenseContextValue extends ExpenseState {
  addExpense: (description: string, category: ExpenseCategory, amount: number, note?: string) => Promise<Expense>;
  removeExpense: (id: string) => Promise<void>;
  getTodayExpenses: () => Expense[];
  getTodayExpenseTotal: () => number;
  getExpensesByDate: (date: Date) => Expense[];
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, expenses: action.expenses, isLoading: false };
    default:
      return state;
  }
}

function isSameDay(ts: number, date: Date): boolean {
  const d = new Date(ts);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(expenseReducer, {
    expenses: [],
    isLoading: true,
  });

  // Real-time Firestore listener
  useEffect(() => {
    if (!user) return;
    const col = collection(db, 'users', user.uid, 'expenses');
    const unsub = onSnapshot(col, (snap) => {
      const expenses = snap.docs.map((d) => d.data() as Expense);
      expenses.sort((a, b) => b.timestamp - a.timestamp);
      dispatch({ type: 'LOAD', expenses });
    }, (err) => {
      console.error('Expenses snapshot error:', err);
    });
    return unsub;
  }, [user]);

  const colRef = useCallback(() => {
    if (!user) throw new Error('Not authenticated');
    return collection(db, 'users', user.uid, 'expenses');
  }, [user]);

  const addExpense = useCallback(
    async (description: string, category: ExpenseCategory, amount: number, note?: string): Promise<Expense> => {
      const expense: Expense = {
        id: generateId(),
        description,
        category,
        amount,
        note: note || '',
        timestamp: Date.now(),
      };
      await setDoc(doc(colRef(), expense.id), expense);
      return expense;
    },
    [colRef]
  );

  const removeExpense = useCallback(async (id: string) => {
    await deleteDoc(doc(colRef(), id));
  }, [colRef]);

  const getExpensesByDate = useCallback(
    (date: Date) => state.expenses.filter((e) => isSameDay(e.timestamp, date)),
    [state.expenses]
  );

  const getTodayExpenses = useCallback(
    () => getExpensesByDate(new Date()),
    [getExpensesByDate]
  );

  const getTodayExpenseTotal = useCallback(
    () => getTodayExpenses().reduce((sum, e) => sum + e.amount, 0),
    [getTodayExpenses]
  );

  return (
    <ExpenseContext.Provider
      value={{
        ...state,
        addExpense,
        removeExpense,
        getTodayExpenses,
        getTodayExpenseTotal,
        getExpensesByDate,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
