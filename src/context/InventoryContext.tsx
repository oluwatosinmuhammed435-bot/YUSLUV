// ============================================
// Yusluv — Inventory Context (Firestore)
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
import type { Product, Category } from '../types';
import { generateId } from '../lib/utils';

interface InventoryState {
  products: Product[];
  isLoading: boolean;
}

type InventoryAction =
  | { type: 'LOAD'; products: Product[] }
  | { type: 'SET_LOADING'; loading: boolean };

interface InventoryContextValue extends InventoryState {
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  restockProduct: (id: string, additionalPieces: number) => Promise<void>;
  deductStock: (id: string, pieces: number) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  getProductsByCategory: (category: Category) => Product[];
  getLowStockProducts: () => Product[];
  bulkAddProducts: (products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, products: action.products, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    default:
      return state;
  }
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(inventoryReducer, {
    products: [],
    isLoading: true,
  });

  // Real-time Firestore listener — fires on every change across all devices
  useEffect(() => {
    if (!user) return;
    const col = collection(db, 'users', user.uid, 'products');
    const unsub = onSnapshot(col, (snap) => {
      const products = snap.docs.map((d) => d.data() as Product);
      // Sort newest first in memory (avoids needing a Firestore index)
      products.sort((a, b) => b.createdAt - a.createdAt);
      dispatch({ type: 'LOAD', products });
    }, (err) => {
      console.error('Inventory snapshot error:', err);
    });
    return unsub;
  }, [user]);

  const colRef = useCallback(() => {
    if (!user) throw new Error('Not authenticated');
    return collection(db, 'users', user.uid, 'products');
  }, [user]);

  const addProduct = useCallback(
    async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
      const now = Date.now();
      const product: Product = { ...data, id: generateId(), createdAt: now, updatedAt: now };
      await setDoc(doc(colRef(), product.id), product);
      return product;
    },
    [colRef]
  );

  const bulkAddProducts = useCallback(
    async (items: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> => {
      const now = Date.now();
      await Promise.all(
        items.map((data) => {
          const p: Product = { ...data, id: generateId(), createdAt: now, updatedAt: now };
          return setDoc(doc(colRef(), p.id), p);
        })
      );
    },
    [colRef]
  );

  const updateProduct = useCallback(
    async (id: string, data: Partial<Product>) => {
      const existing = state.products.find((p) => p.id === id);
      if (!existing) return;
      const updated = { ...existing, ...data, updatedAt: Date.now() };
      await setDoc(doc(colRef(), id), updated);
    },
    [state.products, colRef]
  );

  const restockProduct = useCallback(
    async (id: string, additionalPieces: number) => {
      const existing = state.products.find((p) => p.id === id);
      if (!existing) return;
      const updated = {
        ...existing,
        stockInPieces: existing.stockInPieces + additionalPieces,
        updatedAt: Date.now(),
      };
      await setDoc(doc(colRef(), id), updated);
    },
    [state.products, colRef]
  );

  const deductStock = useCallback(
    async (id: string, pieces: number) => {
      const existing = state.products.find((p) => p.id === id);
      if (!existing) return;
      const updated = {
        ...existing,
        stockInPieces: Math.max(0, existing.stockInPieces - pieces),
        updatedAt: Date.now(),
      };
      await setDoc(doc(colRef(), id), updated);
    },
    [state.products, colRef]
  );

  const removeProduct = useCallback(
    async (id: string) => {
      await deleteDoc(doc(colRef(), id));
    },
    [colRef]
  );

  const getProductsByCategory = useCallback(
    (category: Category) => state.products.filter((p) => p.category === category),
    [state.products]
  );

  const getLowStockProducts = useCallback(
    () => state.products.filter((p) => p.stockInPieces <= p.lowStockThreshold),
    [state.products]
  );

  return (
    <InventoryContext.Provider
      value={{
        ...state,
        addProduct,
        updateProduct,
        restockProduct,
        deductStock,
        removeProduct,
        getProductsByCategory,
        getLowStockProducts,
        bulkAddProducts,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
