// ============================================
// Yusluv — Type Definitions
// ============================================

export type Category = 'Provisions' | 'Drugs' | 'Beverages' | 'Snacks' | 'Toiletries' | 'Electronics' | 'Other';

export const CATEGORIES: Category[] = [
  'Provisions',
  'Drugs',
  'Beverages',
  'Snacks',
  'Toiletries',
  'Electronics',
  'Other',
];

export interface Product {
  id: string;
  name: string;
  category: Category;
  bulkPrice: number;
  piecePrice: number;
  piecesPerBulk: number;
  stockInPieces: number;
  lowStockThreshold: number;
  createdAt: number;
  updatedAt: number;
}

export type SellMode = 'piece' | 'bulk';

export interface CartItem {
  product: Product;
  quantity: number;
  sellMode: SellMode;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  debtorId?: string;
  timestamp: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  sellMode: SellMode;
  unitPrice: number;
  subtotal: number;
}

export type DebtTransactionType = 'credit' | 'payment';

export interface DebtTransaction {
  id: string;
  type: DebtTransactionType;
  amount: number;
  items?: SaleItem[];
  note: string;
  timestamp: number;
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
  transactions: DebtTransaction[];
  createdAt: number;
  updatedAt: number;
}

// ---- Expenses ----

export type ExpenseCategory = 'Restocking' | 'Transport' | 'Rent' | 'Utilities' | 'Salary' | 'Repairs' | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Restocking',
  'Transport',
  'Rent',
  'Utilities',
  'Salary',
  'Repairs',
  'Other',
];

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
  timestamp: number;
}

