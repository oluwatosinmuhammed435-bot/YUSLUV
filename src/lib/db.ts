// ============================================
// Yusluv — IndexedDB Setup & CRUD Helpers
// ============================================

import { openDB, type IDBPDatabase } from 'idb';
import type { Product, Sale, Debtor, Expense } from '../types';

const DB_NAME = 'yusluv-db';
const DB_VERSION = 2;

let dbInstance: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('debtors')) {
        db.createObjectStore('debtors', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id' });
      }
    },
    blocked() {
      // This happens if another tab is open with the old version of the DB.
      alert('App update paused! Please close all other tabs of this app and refresh this page to apply the new update.');
    },
    blocking() {
      // If we are the old tab and a new tab wants to upgrade, get out of the way.
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
      }
    },
  });

  return dbInstance;
}

// ---- Products ----

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll('products');
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const db = await getDB();
  return db.get('products', id);
}

export async function putProduct(product: Product): Promise<void> {
  const db = await getDB();
  await db.put('products', product);
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('products', id);
}

// ---- Sales ----

export async function getAllSales(): Promise<Sale[]> {
  const db = await getDB();
  return db.getAll('sales');
}

export async function putSale(sale: Sale): Promise<void> {
  const db = await getDB();
  await db.put('sales', sale);
}

// ---- Debtors ----

export async function getAllDebtors(): Promise<Debtor[]> {
  const db = await getDB();
  return db.getAll('debtors');
}

export async function getDebtor(id: string): Promise<Debtor | undefined> {
  const db = await getDB();
  return db.get('debtors', id);
}

export async function putDebtor(debtor: Debtor): Promise<void> {
  const db = await getDB();
  await db.put('debtors', debtor);
}

export async function deleteDebtor(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('debtors', id);
}

// ---- Expenses ----

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDB();
  return db.getAll('expenses');
}

export async function putExpense(expense: Expense): Promise<void> {
  const db = await getDB();
  await db.put('expenses', expense);
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('expenses', id);
}

// ---- Bulk Export ----

export async function exportAllData(): Promise<{
  products: Product[];
  sales: Sale[];
  debtors: Debtor[];
  expenses: Expense[];
}> {
  const [products, sales, debtors, expenses] = await Promise.all([
    getAllProducts(),
    getAllSales(),
    getAllDebtors(),
    getAllExpenses(),
  ]);
  return { products, sales, debtors, expenses };
}

// ---- Bulk Import ----

export async function importAllData(data: {
  products?: Product[];
  sales?: Sale[];
  debtors?: Debtor[];
  expenses?: Expense[];
}): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['products', 'sales', 'debtors', 'expenses'], 'readwrite');

  if (data.products) {
    for (const p of data.products) {
      await tx.objectStore('products').put(p);
    }
  }
  if (data.sales) {
    for (const s of data.sales) {
      await tx.objectStore('sales').put(s);
    }
  }
  if (data.debtors) {
    for (const d of data.debtors) {
      await tx.objectStore('debtors').put(d);
    }
  }
  if (data.expenses) {
    for (const e of data.expenses) {
      await tx.objectStore('expenses').put(e);
    }
  }

  await tx.done;
}
