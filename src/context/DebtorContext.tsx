// ============================================
// Yusluv — Debtor Context
// ============================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Debtor, DebtTransaction, SaleItem } from '../types';
import { getAllDebtors, putDebtor, deleteDebtor as dbDeleteDebtor } from '../lib/db';
import { generateId, formatNaira, formatDate } from '../lib/utils';

interface DebtorState {
  debtors: Debtor[];
  isLoading: boolean;
}

type DebtorAction =
  | { type: 'LOAD'; debtors: Debtor[] }
  | { type: 'ADD'; debtor: Debtor }
  | { type: 'UPDATE'; debtor: Debtor }
  | { type: 'DELETE'; id: string };

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
    case 'ADD':
      return { ...state, debtors: [...state.debtors, action.debtor] };
    case 'UPDATE':
      return {
        ...state,
        debtors: state.debtors.map((d) =>
          d.id === action.debtor.id ? action.debtor : d
        ),
      };
    case 'DELETE':
      return { ...state, debtors: state.debtors.filter((d) => d.id !== action.id) };
    default:
      return state;
  }
}

export function DebtorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(debtorReducer, {
    debtors: [],
    isLoading: true,
  });

  useEffect(() => {
    getAllDebtors().then((debtors) => dispatch({ type: 'LOAD', debtors }));
  }, []);

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
    await putDebtor(debtor);
    dispatch({ type: 'ADD', debtor });
    return debtor;
  }, []);

  const updateDebtor = useCallback(
    async (id: string, data: Partial<Pick<Debtor, 'name' | 'phone'>>) => {
      const existing = state.debtors.find((d) => d.id === id);
      if (!existing) return;
      const updated = { ...existing, ...data, updatedAt: Date.now() };
      await putDebtor(updated);
      dispatch({ type: 'UPDATE', debtor: updated });
    },
    [state.debtors]
  );

  const removeDebtor = useCallback(async (id: string) => {
    await dbDeleteDebtor(id);
    dispatch({ type: 'DELETE', id });
  }, []);

  const addCredit = useCallback(
    async (debtorId: string, amount: number, items?: SaleItem[], note?: string) => {
      const existing = state.debtors.find((d) => d.id === debtorId);
      if (!existing) return;

      const transaction: DebtTransaction = {
        id: generateId(),
        type: 'credit',
        amount,
        items,
        note: note || 'Credit purchase',
        timestamp: Date.now(),
      };

      const updated: Debtor = {
        ...existing,
        totalDebt: existing.totalDebt + amount,
        transactions: [transaction, ...existing.transactions],
        updatedAt: Date.now(),
      };

      await putDebtor(updated);
      dispatch({ type: 'UPDATE', debtor: updated });
    },
    [state.debtors]
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

      await putDebtor(updated);
      dispatch({ type: 'UPDATE', debtor: updated });
    },
    [state.debtors]
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
