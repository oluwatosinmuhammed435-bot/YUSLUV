import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  ShoppingCart,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useDebtors } from '../../context/DebtorContext';
import { useInventory } from '../../context/InventoryContext';
import { formatNaira } from '../../lib/utils';
import ExpenseForm from './ExpenseForm';
import SalesChart from './SalesChart';
import TopCategoriesChart from './TopCategoriesChart';
import DateFilterPill, { type DateFilterOption } from '../ui/DateFilterPill';
import StatCard from '../ui/StatCard';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import type { Sale, Expense } from '../../types';

type Transaction =
  | { type: 'sale'; data: Sale; timestamp: number }
  | { type: 'expense'; data: Expense; timestamp: number };

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { expenses, removeExpense } = useExpenses();
  const { totalOutstandingDebt, debtors } = useDebtors();
  const { products } = useInventory();

  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  // Time boundaries for filtering
  const now = new Date();
  const filteredSales = useMemo(() => {
    if (dateFilter === 'all') return sales;
    const cutoff = new Date();
    if (dateFilter === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (dateFilter === '7days') {
      cutoff.setDate(now.getDate() - 7);
    } else if (dateFilter === '30days') {
      cutoff.setDate(now.getDate() - 30);
    }
    return sales.filter((s) => s.timestamp >= cutoff.getTime());
  }, [sales, dateFilter]);

  const filteredExpenses = useMemo(() => {
    if (dateFilter === 'all') return expenses;
    const cutoff = new Date();
    if (dateFilter === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (dateFilter === '7days') {
      cutoff.setDate(now.getDate() - 7);
    } else if (dateFilter === '30days') {
      cutoff.setDate(now.getDate() - 30);
    }
    return expenses.filter((e) => e.timestamp >= cutoff.getTime());
  }, [expenses, dateFilter]);

  // Overall calculations
  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netMarginAmount = totalSalesAmount - totalExpensesAmount;
  const activeDebtorsCount = debtors.filter((d) => d.totalDebt > 0).length;

  // Top selling products by revenue and volume
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; qty: number; revenue: number }> = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productStats[item.productId].qty += item.quantity;
        productStats[item.productId].revenue += item.subtotal;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [sales]);

  // Grouped Daily Transaction Feed (Today, Yesterday, previous days)
  const groupedHistory = useMemo(() => {
    const allTx: Transaction[] = [
      ...sales.map((s) => ({ type: 'sale' as const, data: s, timestamp: s.timestamp })),
      ...expenses.map((e) => ({ type: 'expense' as const, data: e, timestamp: e.timestamp })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    const groups: Record<
      string,
      {
        label: string;
        totalSales: number;
        totalExpenses: number;
        net: number;
        transactions: Transaction[];
      }
    > = {};

    const todayStr = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    allTx.forEach((tx) => {
      const d = new Date(tx.timestamp);
      const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

      if (!groups[dateKey]) {
        let label = d.toLocaleDateString('en-NG', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        if (d.toDateString() === todayStr) label = 'Today';
        else if (d.toDateString() === yesterdayStr) label = 'Yesterday';

        groups[dateKey] = {
          label,
          totalSales: 0,
          totalExpenses: 0,
          net: 0,
          transactions: [],
        };
      }

      groups[dateKey].transactions.push(tx);
      if (tx.type === 'sale') groups[dateKey].totalSales += tx.data.totalAmount;
      else groups[dateKey].totalExpenses += tx.data.amount;
      groups[dateKey].net = groups[dateKey].totalSales - groups[dateKey].totalExpenses;
    });

    return Object.values(groups).slice(0, 5);
  }, [sales, expenses]);

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Business Overview</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Real-time dashboard tracking daily sales performance, expenses and customer balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Small primary-colored pill "Today" with calendar icon */}
          <DateFilterPill value={dateFilter} onChange={(val) => setDateFilter(val)} />

          <Button
            variant="primary"
            size="sm"
            icon={<ShoppingCart size={16} />}
            onClick={() => navigate('/pos')}
          >
            New Sale
          </Button>
        </div>
      </div>

      {/* Row of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Filled with primary (#0B7A4B) and white text */}
        <StatCard
          variant="filled"
          title="Total Sales"
          subtitle={`${filteredSales.length} orders recorded`}
          value={formatNaira(totalSalesAmount)}
          icon={<DollarSign size={20} />}
          trend={{ value: '+14.2%', isUp: true }}
          periodText="this week"
          deltaText="+₦18,400"
          onClick={() => navigate('/pos')}
        />

        {/* Card 2: Outlined - Outstanding Credit */}
        <StatCard
          variant="outlined"
          title="Outstanding Credit"
          subtitle={`${activeDebtorsCount} customers owe`}
          value={formatNaira(totalOutstandingDebt)}
          icon={<Users size={20} />}
          trend={{ value: activeDebtorsCount > 0 ? `${activeDebtorsCount} Active` : 'Zero Debt', isUp: false }}
          periodText="this week"
          deltaText={formatNaira(totalOutstandingDebt)}
          onClick={() => navigate('/debtors')}
        />

        {/* Card 3: Outlined - Expenses */}
        <StatCard
          variant="outlined"
          title="Expenses"
          subtitle={`${filteredExpenses.length} payouts logged`}
          value={formatNaira(totalExpensesAmount)}
          icon={<Receipt size={20} />}
          trend={{ value: '-5.1%', isUp: true }}
          periodText="this week"
          deltaText="Bills & Restock"
          onClick={() => setShowExpenseForm(true)}
        />

        {/* Card 4: Outlined - Net Margin */}
        <StatCard
          variant="outlined"
          title="Net Margin"
          subtitle={
            totalSalesAmount > 0
              ? `${Math.round((netMarginAmount / totalSalesAmount) * 100)}% margin`
              : 'Margin breakdown'
          }
          value={formatNaira(netMarginAmount)}
          icon={<TrendingUp size={20} />}
          trend={{ value: netMarginAmount >= 0 ? '+18.4%' : '-12.0%', isUp: netMarginAmount >= 0 }}
          periodText="this week"
          deltaText="Estimated Net"
        />
      </div>

      {/* Charts Grid: Sales Performance (8 cols) + Top Categories Donut (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SalesChart
            sales={sales}
            expenses={expenses}
            filterOption={dateFilter}
          />
        </div>

        <div className="lg:col-span-4">
          <TopCategoriesChart sales={sales} products={products} />
        </div>
      </div>

      {/* Bottom Section: Top-Moving Products & Grouped Daily Transaction Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Moving Products (5 cols) */}
        <div className="lg:col-span-5 bg-card rounded-[12px] border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text tracking-tight">
                Top-Moving Products
              </h3>
              <p className="text-xs text-muted">Ranked by revenue and units sold.</p>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">
                No items sold yet. Start scanning products at POS to see bestsellers here.
              </div>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-page-bg/60 border border-border/40 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary-tint text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-text truncate max-w-[170px]">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-muted">{p.qty} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-text block">
                      {formatNaira(p.revenue)}
                    </span>
                    <span className="text-[10px] text-success font-semibold">
                      +{Math.min(99, Math.round((p.qty * 12) / 5))}% vol
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grouped Daily Transaction Feed (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-[12px] border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text tracking-tight">
                Daily Transaction History
              </h3>
              <p className="text-xs text-muted">
                Live stream of sales orders and operational payouts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowExpenseForm(true)}
            >
              Add Expense
            </Button>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {groupedHistory.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted">
                No transactions recorded yet. Complete a checkout in POS to begin your audit trail.
              </div>
            ) : (
              groupedHistory.map((group) => (
                <div key={group.label} className="space-y-2">
                  {/* Date Group Header */}
                  <div className="flex items-center justify-between py-1 px-2 bg-page-bg rounded-lg text-xs font-medium text-muted">
                    <span className="font-semibold text-text">{group.label}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-success">Sales: {formatNaira(group.totalSales)}</span>
                      <span className="text-muted/40">&bull;</span>
                      <span className="text-danger">Costs: {formatNaira(group.totalExpenses)}</span>
                      <span className="text-muted/40">&bull;</span>
                      <span className="font-bold text-text">
                        Net: {formatNaira(group.net)}
                      </span>
                    </div>
                  </div>

                  {/* Transactions under this day */}
                  <div className="space-y-1.5 pl-1">
                    {group.transactions.map((tx) => {
                      const isSale = tx.type === 'sale';
                      return (
                        <div
                          key={tx.data.id}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-page-bg/70 border border-transparent hover:border-border transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isSale
                                  ? 'bg-emerald-50 text-success'
                                  : 'bg-red-50 text-danger'
                              }`}
                            >
                              {isSale ? (
                                <ArrowDownRight size={15} />
                              ) : (
                                <ArrowUpRight size={15} />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-text">
                                {isSale
                                  ? `Sale #${tx.data.id.slice(-6).toUpperCase()}`
                                  : (tx.data as Expense).description}
                              </div>
                              <div className="text-[11px] text-muted">
                                {new Date(tx.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                &bull;{' '}
                                {isSale
                                  ? `${(tx.data as Sale).items.length} item${
                                      (tx.data as Sale).items.length !== 1 ? 's' : ''
                                    }`
                                  : (tx.data as Expense).category}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold ${
                                isSale ? 'text-success' : 'text-danger'
                              }`}
                            >
                              {isSale
                                ? `+${formatNaira(tx.data.totalAmount)}`
                                : `-${formatNaira((tx.data as Expense).amount)}`}
                            </span>

                            {!isSale && (
                              <button
                                type="button"
                                onClick={() => setDeleteExpenseId(tx.data.id)}
                                className="p-1 text-muted hover:text-danger rounded hover:bg-red-50 transition-colors"
                                title="Delete expense entry"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseForm && (
        <ExpenseForm onClose={() => setShowExpenseForm(false)} />
      )}

      {/* Delete Expense Confirmation */}
      {deleteExpenseId && (
        <Modal
          open={true}
          onClose={() => setDeleteExpenseId(null)}
          title="Delete Expense Record"
          subtitle="Are you sure you want to delete this expense record?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted">
              Removing this expense will restore its amount to your net profit margin calculations.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteExpenseId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={async () => {
                  await removeExpense(deleteExpenseId);
                  setDeleteExpenseId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
