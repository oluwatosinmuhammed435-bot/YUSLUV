// ============================================
// Yusluv — Expense Context
// ============================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Expense, ExpenseCategory } from '../types';
import { getAllExpenses, putExpense, deleteExpense as dbDeleteExpense } from '../lib/db';
import { generateId } from '../lib/utils';

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
}

type ExpenseAction =
  | { type: 'LOAD'; expenses: Expense[] }
  | { type: 'ADD'; expense: Expense }
  | { type: 'DELETE'; id: string };

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
    case 'ADD':
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case 'DELETE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
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
  const [state, dispatch] = useReducer(expenseReducer, {
    expenses: [],
    isLoading: true,
  });

  useEffect(() => {
    getAllExpenses().then((expenses) => {
      expenses.sort((a, b) => b.timestamp - a.timestamp);
      dispatch({ type: 'LOAD', expenses });
    });
  }, []);

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
      await putExpense(expense);
      dispatch({ type: 'ADD', expense });
      return expense;
    },
    []
  );

  const removeExpense = useCallback(async (id: string) => {
    await dbDeleteExpense(id);
    dispatch({ type: 'DELETE', id });
  }, []);

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
