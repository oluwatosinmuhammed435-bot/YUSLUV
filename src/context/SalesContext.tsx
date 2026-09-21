// ============================================
// Yusluv — Sales Context
// ============================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { CartItem, Sale, SaleItem, Product, SellMode } from '../types';
import { getAllSales, putSale } from '../lib/db';
import { generateId } from '../lib/utils';

interface SalesState {
  cart: CartItem[];
  sales: Sale[];
  isLoading: boolean;
}

type SalesAction =
  | { type: 'LOAD_SALES'; sales: Sale[] }
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'UPDATE_CART_ITEM'; index: number; item: CartItem }
  | { type: 'REMOVE_FROM_CART'; index: number }
  | { type: 'CLEAR_CART' }
  | { type: 'RECORD_SALE'; sale: Sale };

interface SalesContextValue extends SalesState {
  addToCart: (product: Product, sellMode: SellMode, quantity: number) => void;
  updateCartItem: (index: number, quantity: number, sellMode: SellMode) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  confirmSale: (debtorId?: string) => Promise<Sale>;
  cartTotal: number;
  cartItemCount: number;
}

const SalesContext = createContext<SalesContextValue | null>(null);

function calculateSubtotal(product: Product, sellMode: SellMode, quantity: number): number {
  const unitPrice = sellMode === 'bulk' ? product.bulkPrice : product.piecePrice;
  return unitPrice * quantity;
}

function salesReducer(state: SalesState, action: SalesAction): SalesState {
  switch (action.type) {
    case 'LOAD_SALES':
      return { ...state, sales: action.sales, isLoading: false };
    case 'ADD_TO_CART':
      return { ...state, cart: [...state.cart, action.item] };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map((item, i) => (i === action.index ? action.item : item)),
      };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((_, i) => i !== action.index) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'RECORD_SALE':
      return { ...state, sales: [action.sale, ...state.sales], cart: [] };
    default:
      return state;
  }
}

export function SalesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(salesReducer, {
    cart: [],
    sales: [],
    isLoading: true,
  });

  useEffect(() => {
    getAllSales().then((sales) => {
      // Sort most recent first
      sales.sort((a, b) => b.timestamp - a.timestamp);
      dispatch({ type: 'LOAD_SALES', sales });
    });
  }, []);

  const addToCart = useCallback(
    (product: Product, sellMode: SellMode, quantity: number) => {
      // Check if same product + same sell mode already in cart
      const existingIndex = state.cart.findIndex(
        (item) => item.product.id === product.id && item.sellMode === sellMode
      );

      if (existingIndex >= 0) {
        const existing = state.cart[existingIndex];
        const newQty = existing.quantity + quantity;
        const updated: CartItem = {
          ...existing,
          quantity: newQty,
          subtotal: calculateSubtotal(product, sellMode, newQty),
        };
        dispatch({ type: 'UPDATE_CART_ITEM', index: existingIndex, item: updated });
      } else {
        const item: CartItem = {
          product,
          quantity,
          sellMode,
          subtotal: calculateSubtotal(product, sellMode, quantity),
        };
        dispatch({ type: 'ADD_TO_CART', item });
      }
    },
    [state.cart]
  );

  const updateCartItem = useCallback(
    (index: number, quantity: number, sellMode: SellMode) => {
      const existing = state.cart[index];
      if (!existing) return;
      const updated: CartItem = {
        ...existing,
        quantity,
        sellMode,
        subtotal: calculateSubtotal(existing.product, sellMode, quantity),
      };
      dispatch({ type: 'UPDATE_CART_ITEM', index, item: updated });
    },
    [state.cart]
  );

  const removeFromCart = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', index });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const confirmSale = useCallback(
    async (debtorId?: string): Promise<Sale> => {
      const saleItems: SaleItem[] = state.cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        sellMode: item.sellMode,
        unitPrice:
          item.sellMode === 'bulk' ? item.product.bulkPrice : item.product.piecePrice,
        subtotal: item.subtotal,
      }));

      const sale: Sale = {
        id: generateId(),
        items: saleItems,
        totalAmount: state.cart.reduce((sum, item) => sum + item.subtotal, 0),
        debtorId,
        timestamp: Date.now(),
      };

      await putSale(sale);
      dispatch({ type: 'RECORD_SALE', sale });
      return sale;
    },
    [state.cart]
  );

  const cartTotal = state.cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SalesContext.Provider
      value={{
        ...state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        confirmSale,
        cartTotal,
        cartItemCount,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales(): SalesContextValue {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within SalesProvider');
  return ctx;
}
