// ============================================
// Yusluv — Debtor Context (Firestore)
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
import type { Debtor, DebtTransaction, SaleItem } from '../types';
import { generateId, formatNaira, formatDate } from '../lib/utils';

interface DebtorState {
  debtors: Debtor[];
  isLoading: boolean;
}

type DebtorAction =
  | { type: 'LOAD'; debtors: Debtor[] };

interface DebtorContextValue extends DebtorState {
  addDebtor: (name: string, phone: string) => Promise<Debtor>;
  updateDebtor: (id: string, data: Partial<Pick<Debtor, 'name' | 'phone'>>) => Promise<void>;
  removeDebtor: (id: string) => Promise<void>;
  addCredit: (debtorId: string, amount: number, items?: SaleItem[], note?: string) => Promise<void>;
  recordPayment: (debtorId: string, amount: number, note?: string) => Promise<void>;
  generateWhatsAppSummary: (debtorId: string) => string;
  totalOutstandingDebt: number;
}

const DebtorContext = createContext<DebtorContextValue | null>(null);

function debtorReducer(state: DebtorState, action: DebtorAction): DebtorState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, debtors: action.debtors, isLoading: false };
    default:
      return state;
  }
}

export function DebtorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(debtorReducer, {
    debtors: [],
    isLoading: true,
  });

  // Real-time Firestore listener
  useEffect(() => {
    if (!user) return;
    const col = collection(db, 'users', user.uid, 'debtors');
    const unsub = onSnapshot(col, (snap) => {
      const debtors = snap.docs.map((d) => d.data() as Debtor);
      debtors.sort((a, b) => a.createdAt - b.createdAt);
      dispatch({ type: 'LOAD', debtors });
    }, (err) => {
      console.error('Debtors snapshot error:', err);
    });
    return unsub;
  }, [user]);

  const colRef = useCallback(() => {
    if (!user) throw new Error('Not authenticated');
    return collection(db, 'users', user.uid, 'debtors');
  }, [user]);

  const addDebtor = useCallback(async (name: string, phone: string): Promise<Debtor> => {
    const now = Date.now();
    const debtor: Debtor = {
      id: generateId(),
      name,
      phone,
      totalDebt: 0,
      transactions: [],
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(colRef(), debtor.id), debtor);
    return debtor;
  }, [colRef]);

  const updateDebtor = useCallback(
    async (id: string, data: Partial<Pick<Debtor, 'name' | 'phone'>>) => {
      const existing = state.debtors.find((d) => d.id === id);
      if (!existing) return;
      const updated = { ...existing, ...data, updatedAt: Date.now() };
      await setDoc(doc(colRef(), id), updated);
    },
    [state.debtors, colRef]
  );

  const removeDebtor = useCallback(async (id: string) => {
    await deleteDoc(doc(colRef(), id));
  }, [colRef]);

  const addCredit = useCallback(
    async (debtorId: string, amount: number, items?: SaleItem[], note?: string) => {
      const existing = state.debtors.find((d) => d.id === debtorId);
      if (!existing) return;

      const transaction: DebtTransaction = {
        id: generateId(),
        type: 'credit',
        amount,
        note: note || 'Credit purchase',
        timestamp: Date.now(),
        ...(items ? { items } : {}),
      };

      const updated: Debtor = {
        ...existing,
        totalDebt: existing.totalDebt + amount,
        transactions: [transaction, ...existing.transactions],
        updatedAt: Date.now(),
      };

      await setDoc(doc(colRef(), debtorId), updated);
    },
    [state.debtors, colRef]
  );

  const recordPayment = useCallback(
    async (debtorId: string, amount: number, note?: string) => {
      const existing = state.debtors.find((d) => d.id === debtorId);
      if (!existing) return;

      const transaction: DebtTransaction = {
        id: generateId(),
        type: 'payment',
        amount,
        note: note || 'Payment received',
        timestamp: Date.now(),
      };

      const updated: Debtor = {
        ...existing,
        totalDebt: Math.max(0, existing.totalDebt - amount),
        transactions: [transaction, ...existing.transactions],
        updatedAt: Date.now(),
      };

      await setDoc(doc(colRef(), debtorId), updated);
    },
    [state.debtors, colRef]
  );

  const generateWhatsAppSummary = useCallback(
    (debtorId: string): string => {
      const debtor = state.debtors.find((d) => d.id === debtorId);
      if (!debtor) return '';

      let summary = `📋 *YUSLUV — Debt Summary*\n`;
      summary += `━━━━━━━━━━━━━━━━━━━━\n`;
      summary += `👤 *Customer:* ${debtor.name}\n`;
      summary += `📞 *Phone:* ${debtor.phone}\n`;
      summary += `💰 *Total Owed:* ${formatNaira(debtor.totalDebt)}\n`;
      summary += `━━━━━━━━━━━━━━━━━━━━\n\n`;
      summary += `📝 *Transaction History:*\n`;

      debtor.transactions.slice(0, 15).forEach((tx) => {
        const icon = tx.type === 'credit' ? '🔴' : '🟢';
        const label = tx.type === 'credit' ? 'Credit' : 'Payment';
        summary += `${icon} ${label}: ${formatNaira(tx.amount)} — ${formatDate(tx.timestamp)}\n`;
        if (tx.note) summary += `   _${tx.note}_\n`;
      });

      summary += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      summary += `_Generated by Yusluv_`;

      return summary;
    },
    [state.debtors]
  );

  const totalOutstandingDebt = state.debtors.reduce((sum, d) => sum + d.totalDebt, 0);

  return (
    <DebtorContext.Provider
      value={{
        ...state,
        addDebtor,
        updateDebtor,
        removeDebtor,
        addCredit,
        recordPayment,
        generateWhatsAppSummary,
        totalOutstandingDebt,
      }}
    >
      {children}
    </DebtorContext.Provider>
  );
}

export function useDebtors(): DebtorContextValue {
  const ctx = useContext(DebtorContext);
  if (!ctx) throw new Error('useDebtors must be used within DebtorProvider');
  return ctx;
}
