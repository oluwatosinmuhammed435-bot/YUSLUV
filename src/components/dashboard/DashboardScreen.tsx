// ============================================
// Yusluv — Dashboard Screen
// ============================================

import { useMemo, useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign,
  Receipt, Trash2, Package, ArrowUpRight, ArrowDownRight,
  History, CalendarDays
} from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useDebtors } from '../../context/DebtorContext';
import { useInventory } from '../../context/InventoryContext';
import { formatNaira } from '../../lib/utils';
import ExpenseForm from './ExpenseForm';
import SalesChart from './SalesChart';
import type { Sale, Expense } from '../../types';

type Transaction = 
  | { type: 'sale'; data: Sale; timestamp: number }
  | { type: 'expense'; data: Expense; timestamp: number };

export default function DashboardScreen() {
  const { sales } = useSales();
  const { expenses, removeExpense } = useExpenses();
  const { totalOutstandingDebt } = useDebtors();
  const { products, getLowStockProducts } = useInventory();

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Global Stats
  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const lowStockItems = getLowStockProducts();
  const totalProducts = products.length;

  // Calculate top selling products (all time)
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [sales]);

  // Grouped Transaction History
  const groupedHistory = useMemo(() => {
    const allTx: Transaction[] = [
      ...sales.map(s => ({ type: 'sale' as const, data: s, timestamp: s.timestamp })),
      ...expenses.map(e => ({ type: 'expense' as const, data: e, timestamp: e.timestamp }))
    ].sort((a, b) => b.timestamp - a.timestamp); // Newest first

    const groups: Record<string, {
      dateObj: Date;
      label: string;
      totalSales: number;
      totalExpenses: number;
      net: number;
      transactions: Transaction[];
    }> = {};

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    allTx.forEach(tx => {
      const d = new Date(tx.timestamp);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      
      if (!groups[dateKey]) {
        let label = d.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' });
        if (d.toDateString() === today.toDateString()) label = 'Today';
        else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';

        groups[dateKey] = {
          dateObj: d,
          label,
          totalSales: 0,
          totalExpenses: 0,
          net: 0,
          transactions: []
        };
      }

      groups[dateKey].transactions.push(tx);
      if (tx.type === 'sale') groups[dateKey].totalSales += tx.data.totalAmount;
      else groups[dateKey].totalExpenses += tx.data.amount;
      groups[dateKey].net = groups[dateKey].totalSales - groups[dateKey].totalExpenses;
    });

    return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [sales, expenses]);

  return (
    <div className="px-4 py-3 pb-24">
      
      {/* 7-Day Performance Chart */}
      <div className="bg-[#161622] border border-white/5 rounded-2xl p-4 mb-4 shadow-xl">
        <h3 className="text-white/80 text-sm font-semibold mb-1">7-Day Performance</h3>
        <p className="text-white/40 text-xs mb-4">Compare your sales and expenses</p>
        <SalesChart sales={sales} expenses={expenses} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-900/5 border border-emerald-500/10 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={13} className="text-emerald-400" />
            <span className="text-emerald-300/60 text-[10px] font-medium uppercase tracking-wider">Total Sales</span>
          </div>
          <p className="text-emerald-400 text-xl font-bold">{formatNaira(totalSales)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600/10 to-orange-900/5 border border-orange-500/10 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={13} className="text-orange-400" />
            <span className="text-orange-300/60 text-[10px] font-medium uppercase tracking-wider">Total Expenses</span>
          </div>
          <p className="text-orange-400 text-xl font-bold">{formatNaira(totalExpenses)}</p>
        </div>

        <div className={`border rounded-2xl p-3.5 ${
          netProfit >= 0 ? 'bg-gradient-to-br from-purple-600/10 to-purple-900/5 border-purple-500/10' : 'bg-gradient-to-br from-red-600/10 to-red-900/5 border-red-500/10'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={13} className={netProfit >= 0 ? 'text-purple-400' : 'text-red-400'} />
            <span className={`text-[10px] font-medium uppercase tracking-wider ${netProfit >= 0 ? 'text-purple-300/60' : 'text-red-300/60'}`}>Net Profit</span>
          </div>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
            {netProfit >= 0 ? '' : '-'}{formatNaira(Math.abs(netProfit))}
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={13} className="text-white/40" />
            <span className="text-white/30 text-[10px] font-medium uppercase tracking-wider">Inventory</span>
          </div>
          <p className="text-white text-xl font-bold">{totalProducts}</p>
          {lowStockItems.length > 0 && <p className="text-amber-400 text-[10px] mt-0.5">⚠ {lowStockItems.length} low stock</p>}
          {totalOutstandingDebt > 0 && <p className="text-red-400/60 text-[10px] mt-0.5">Owed: {formatNaira(totalOutstandingDebt)}</p>}
        </div>
      </div>

      {/* Top Selling Products */}
      {topProducts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">Top Selling Products</h3>
          <div className="bg-[#161622] border border-white/5 rounded-2xl p-3 shadow-lg">
            {topProducts.map((p, index) => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-zinc-300' : 'text-orange-300'}`}>#{index + 1}</span>
                  <div>
                    <p className="text-white text-sm">{p.name}</p>
                    <p className="text-white/30 text-[10px]">{p.qty} items sold</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-medium text-sm">{formatNaira(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPay-Style Transaction History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-white/50" />
          <h2 className="text-white/80 font-semibold text-lg">Transaction History</h2>
        </div>

        {groupedHistory.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <CalendarDays size={32} className="text-white/10 mb-3" />
            <p className="text-white/30 text-sm">No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedHistory.map((group) => (
              <div key={group.label} className="space-y-2">
                {/* Date Header & Margin Badge */}
                <div className="flex items-center justify-between sticky top-14 bg-[#0a0a0f]/95 py-2 z-10 border-b border-white/5 backdrop-blur-md">
                  <h3 className="text-white/60 text-xs font-medium uppercase tracking-widest">{group.label}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    group.net >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {group.net >= 0 ? '+' : '-'}{formatNaira(Math.abs(group.net))} Margin
                  </span>
                </div>

                {/* Transactions List */}
                <div className="bg-[#161622] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                  {group.transactions.map((tx) => {
                    const isSale = tx.type === 'sale';
                    const time = new Date(tx.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
                    
                    if (isSale) {
                      const sale = tx.data as Sale;
                      return (
                        <div key={sale.id} className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <ArrowUpRight size={12} className="text-emerald-400" />
                              </div>
                              <span className="text-emerald-400 font-semibold text-sm">+{formatNaira(sale.totalAmount)}</span>
                            </div>
                            <span className="text-white/20 text-[10px]">{time}</span>
                          </div>
                          <div className="ml-8 space-y-0.5">
                            {sale.items.map((item, idx) => (
                              <p key={idx} className="text-white/40 text-xs">
                                {item.quantity}× {item.productName} <span className="text-white/20">({formatNaira(item.subtotal)})</span>
                              </p>
                            ))}
                            {sale.debtorId && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] border border-amber-500/20">
                                Credit Sale
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      const expense = tx.data as Expense;
                      return (
                        <div key={expense.id} className="p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <ArrowDownRight size={12} className="text-orange-400" />
                              </div>
                              <span className="text-orange-400 font-semibold text-sm">-{formatNaira(expense.amount)}</span>
                            </div>
                            <span className="text-white/20 text-[10px]">{time}</span>
                          </div>
                          <div className="ml-8 flex items-center justify-between">
                            <div>
                              <p className="text-white/60 text-xs">{expense.description}</p>
                              <span className="text-white/20 text-[9px] px-1.5 py-0.5 rounded bg-white/5 mt-0.5 inline-block">{expense.category}</span>
                            </div>
                            
                            {/* Delete Expense */}
                            {deleteConfirm === expense.id ? (
                              <div className="flex gap-1 animate-fade-in">
                                <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded bg-white/5 text-white/40 text-[10px]">No</button>
                                <button onClick={() => { removeExpense(expense.id); setDeleteConfirm(null); }} className="px-2 py-1 rounded bg-red-500/15 text-red-400 text-[10px]">Del</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(expense.id)} className="w-6 h-6 rounded bg-white/0 hover:bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={12} className="text-red-400/60" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Expense Button */}
      <button
        onClick={() => setShowExpenseForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-orange-600 hover:bg-orange-500
          rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center
          transition-all duration-150 active:scale-90 z-30"
      >
        <Receipt size={22} className="text-white" />
      </button>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm onClose={() => setShowExpenseForm(false)} />
      )}
    </div>
  );
}
