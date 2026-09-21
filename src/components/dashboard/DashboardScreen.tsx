// ============================================
// Yusluv — Dashboard Screen
// ============================================

import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Receipt, Plus, Trash2, ChevronLeft, ChevronRight,
  Calendar, Package, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useDebtors } from '../../context/DebtorContext';
import { useInventory } from '../../context/InventoryContext';
import { formatNaira } from '../../lib/utils';
import ExpenseForm from './ExpenseForm';
import SalesChart from './SalesChart';

function isSameDay(ts: number, date: Date): boolean {
  const d = new Date(ts);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date.getTime(), today)) return 'Today';
  if (isSameDay(date.getTime(), yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function DashboardScreen() {
  const { sales } = useSales();
  const { expenses, removeExpense } = useExpenses();
  const { totalOutstandingDebt } = useDebtors();
  const { products, getLowStockProducts } = useInventory();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Navigate dates
  const goBack = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };
  const goForward = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const now = new Date();
    if (d <= now) setSelectedDate(d);
  };
  const goToday = () => setSelectedDate(new Date());

  const isToday = isSameDay(selectedDate.getTime(), new Date());

  // Filter by selected date
  const daySales = useMemo(
    () => sales.filter((s) => isSameDay(s.timestamp, selectedDate)),
    [sales, selectedDate]
  );
  const dayExpenses = useMemo(
    () => expenses.filter((e) => isSameDay(e.timestamp, selectedDate)),
    [expenses, selectedDate]
  );

  const totalSales = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const transactionCount = daySales.length;

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

  return (
    <div className="px-4 py-3">
      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center
            justify-center transition-colors"
        >
          <ChevronLeft size={18} className="text-white/50" />
        </button>

        <div className="text-center">
          <button
            onClick={goToday}
            className="flex items-center gap-1.5 text-white font-semibold text-base
              hover:text-purple-400 transition-colors"
          >
            <Calendar size={15} className="text-purple-400" />
            {formatDayLabel(selectedDate)}
          </button>
          {!isToday && (
            <p className="text-white/25 text-[10px] mt-0.5">
              {selectedDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        <button
          onClick={goForward}
          disabled={isToday}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center
            justify-center transition-colors disabled:opacity-20"
        >
          <ChevronRight size={18} className="text-white/50" />
        </button>
      </div>

      {/* 7-Day Performance Chart */}
      <div className="bg-[#161622] border border-white/5 rounded-2xl p-4 mb-4 shadow-xl">
        <h3 className="text-white/80 text-sm font-semibold mb-1">7-Day Performance</h3>
        <p className="text-white/40 text-xs mb-4">Compare your sales and expenses</p>
        <SalesChart sales={sales} expenses={expenses} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Total Sales */}
        <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-900/5 border
          border-emerald-500/10 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={13} className="text-emerald-400" />
            <span className="text-emerald-300/60 text-[10px] font-medium uppercase tracking-wider">
              Sales
            </span>
          </div>
          <p className="text-emerald-400 text-xl font-bold">{formatNaira(totalSales)}</p>
          <p className="text-white/20 text-[10px] mt-0.5">
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-orange-600/10 to-orange-900/5 border
          border-orange-500/10 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={13} className="text-orange-400" />
            <span className="text-orange-300/60 text-[10px] font-medium uppercase tracking-wider">
              Expenses
            </span>
          </div>
          <p className="text-orange-400 text-xl font-bold">{formatNaira(totalExpenses)}</p>
          <p className="text-white/20 text-[10px] mt-0.5">
            {dayExpenses.length} record{dayExpenses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Net Profit */}
        <div className={`border rounded-2xl p-3.5 ${
          netProfit >= 0
            ? 'bg-gradient-to-br from-purple-600/10 to-purple-900/5 border-purple-500/10'
            : 'bg-gradient-to-br from-red-600/10 to-red-900/5 border-red-500/10'
        }`}>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={13} className={netProfit >= 0 ? 'text-purple-400' : 'text-red-400'} />
            <span className={`text-[10px] font-medium uppercase tracking-wider ${
              netProfit >= 0 ? 'text-purple-300/60' : 'text-red-300/60'
            }`}>
              Net Profit
            </span>
          </div>
          <p className={`text-xl font-bold ${
            netProfit >= 0 ? 'text-purple-400' : 'text-red-400'
          }`}>
            {netProfit >= 0 ? '' : '-'}{formatNaira(Math.abs(netProfit))}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={13} className="text-white/40" />
            <span className="text-white/30 text-[10px] font-medium uppercase tracking-wider">
              Inventory
            </span>
          </div>
          <p className="text-white text-xl font-bold">{totalProducts}</p>
          {lowStockItems.length > 0 && (
            <p className="text-amber-400 text-[10px] mt-0.5">
              ⚠ {lowStockItems.length} low stock
            </p>
          )}
          {totalOutstandingDebt > 0 && (
            <p className="text-red-400/60 text-[10px] mt-0.5">
              Owed: {formatNaira(totalOutstandingDebt)}
            </p>
          )}
        </div>
      </div>

      {/* Top Selling Products */}
      {topProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
            Top Selling Products
          </h3>
          <div className="bg-[#161622] border border-white/5 rounded-2xl p-3 shadow-lg">
            {topProducts.map((p, index) => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${
                    index === 0 ? 'text-amber-400' : index === 1 ? 'text-zinc-300' : 'text-orange-300'
                  }`}>
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-white text-sm">{p.name}</p>
                    <p className="text-white/30 text-[10px]">{p.qty} items sold</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-medium text-sm">
                  {formatNaira(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart size={12} />
            Sales
          </h3>
        </div>

        {daySales.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-white/20 text-sm">No sales recorded</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {daySales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-3
                  hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ArrowUpRight size={13} className="text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-sm">
                      {formatNaira(sale.totalAmount)}
                    </span>
                  </div>
                  <span className="text-white/20 text-[10px]">
                    {new Date(sale.timestamp).toLocaleTimeString('en-NG', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {sale.items.map((item, i) => (
                    <p key={i} className="text-white/30 text-[11px]">
                      {item.quantity}× {item.productName}
                      <span className="text-white/15"> ({item.sellMode}) — {formatNaira(item.subtotal)}</span>
                    </p>
                  ))}
                </div>
                {sale.debtorId && (
                  <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md
                    bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/15">
                    Credit Sale
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Receipt size={12} />
            Expenses
          </h3>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10
              text-orange-400 text-[11px] font-medium hover:bg-orange-500/20
              transition-colors border border-orange-500/15"
          >
            <Plus size={12} />
            Add
          </button>
        </div>

        {dayExpenses.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
            <p className="text-white/20 text-sm">No expenses recorded</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {dayExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-3
                  hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ArrowDownRight size={13} className="text-orange-400 shrink-0" />
                      <span className="text-orange-400 font-semibold text-sm">
                        {formatNaira(expense.amount)}
                      </span>
                      <span className="text-white/15 text-[10px]">
                        {new Date(expense.timestamp).toLocaleTimeString('en-NG', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/20 text-[10px] px-1.5 py-0.5 rounded bg-white/5">
                        {expense.category}
                      </span>
                      {expense.note && (
                        <span className="text-white/15 text-[10px] truncate">{expense.note}</span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  {deleteConfirm === expense.id ? (
                    <div className="flex gap-1 shrink-0 ml-2 animate-fade-in">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 rounded-lg bg-white/5 text-white/40 text-[10px]
                          hover:bg-white/10 transition-colors"
                      >
                        No
                      </button>
                      <button
                        onClick={async () => {
                          await removeExpense(expense.id);
                          setDeleteConfirm(null);
                        }}
                        className="px-2 py-1 rounded-lg bg-red-500/15 text-red-400 text-[10px]
                          hover:bg-red-500/25 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(expense.id)}
                      className="w-7 h-7 rounded-lg bg-white/0 hover:bg-red-500/10
                        flex items-center justify-center transition-colors shrink-0
                        opacity-0 group-hover:opacity-100 ml-2"
                    >
                      <Trash2 size={12} className="text-red-400/60" />
                    </button>
                  )}
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
