// ============================================
// Yusluv — Inventory Context
// ============================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Product, Category } from '../types';
import { getAllProducts, putProduct, deleteProduct as dbDeleteProduct } from '../lib/db';
import { generateId } from '../lib/utils';

interface InventoryState {
  products: Product[];
  isLoading: boolean;
}

type InventoryAction =
  | { type: 'LOAD'; products: Product[] }
  | { type: 'ADD'; product: Product }
  | { type: 'UPDATE'; product: Product }
  | { type: 'DELETE'; id: string };

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
    case 'ADD':
      return { ...state, products: [...state.products, action.product] };
    case 'UPDATE':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.product.id ? action.product : p
        ),
      };
    case 'DELETE':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
      };
    default:
      return state;
  }
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, {
    products: [],
    isLoading: true,
  });

  useEffect(() => {
    getAllProducts().then((products) => dispatch({ type: 'LOAD', products }));
  }, []);

  const addProduct = useCallback(
    async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
      const now = Date.now();
      const product: Product = {
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      await putProduct(product);
      dispatch({ type: 'ADD', product });
      return product;
    },
    []
  );

  const bulkAddProducts = useCallback(
    async (items: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> => {
      const now = Date.now();
      const newProducts = items.map((data) => ({
        ...data,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }));
      // Wait for all DB puts to complete
      await Promise.all(newProducts.map((p) => putProduct(p)));
      // Instead of dispatching ADD in a loop, we can just reload all products
      const all = await getAllProducts();
      dispatch({ type: 'LOAD', products: all });
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, data: Partial<Product>) => {
      const existing = state.products.find((p) => p.id === id);
      if (!existing) return;
      const updated = { ...existing, ...data, updatedAt: Date.now() };
      await putProduct(updated);
      dispatch({ type: 'UPDATE', product: updated });
    },
    [state.products]
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
      await putProduct(updated);
      dispatch({ type: 'UPDATE', product: updated });
    },
    [state.products]
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
      await putProduct(updated);
      dispatch({ type: 'UPDATE', product: updated });
    },
    [state.products]
  );

  const removeProduct = useCallback(async (id: string) => {
    await dbDeleteProduct(id);
    dispatch({ type: 'DELETE', id });
  }, []);

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
