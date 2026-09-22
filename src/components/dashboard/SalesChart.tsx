// ============================================
// Yusluv — Sales vs Expenses Chart
// ============================================

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Sale, Expense } from '../../types';

interface SalesChartProps {
  sales: Sale[];
  expenses: Expense[];
}

export default function SalesChart({ sales, expenses }: SalesChartProps) {
  const data = useMemo(() => {
    // Generate last 7 days including today
    const days: { date: Date; label: string; sales: number; expenses: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-NG', { weekday: 'short' }),
        sales: 0,
        expenses: 0,
      });
    }

    // Populate data
    sales.forEach((s) => {
      const saleDate = new Date(s.timestamp);
      const day = days.find((d) => 
        d.date.getDate() === saleDate.getDate() &&
        d.date.getMonth() === saleDate.getMonth() &&
        d.date.getFullYear() === saleDate.getFullYear()
      );
      if (day) day.sales += s.totalAmount;
    });

    expenses.forEach((e) => {
      const expDate = new Date(e.timestamp);
      const day = days.find((d) => 
        d.date.getDate() === expDate.getDate() &&
        d.date.getMonth() === expDate.getMonth() &&
        d.date.getFullYear() === expDate.getFullYear()
      );
      if (day) day.expenses += e.amount;
    });

    return days;
  }, [sales, expenses]);

  // If no data exists, don't show the chart
  const hasData = data.some((d) => d.sales > 0 || d.expenses > 0);
  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center border border-white/5 bg-white/[0.02] rounded-2xl">
        <p className="text-white/30 text-xs">No sales data for the last 7 days</p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            tickFormatter={(val) => `₦${(val / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161622',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginBottom: '4px' }}
            formatter={(value: number) => [`₦${(value || 0).toLocaleString()}`, '']}
          />
          <Area
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke="#34d399"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#fb923c"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorExp)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
