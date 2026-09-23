import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Sale, Expense } from '../../types';
import { formatNaira } from '../../lib/utils';

interface SalesChartProps {
  sales: Sale[];
  expenses: Expense[];
  filterOption?: 'today' | '7days' | '30days' | 'all';
}

export default function SalesChart({
  sales,
  expenses,
  filterOption = '7days',
}: SalesChartProps) {
  const data = useMemo(() => {
    const daysCount = filterOption === 'today' ? 1 : filterOption === '30days' ? 30 : 7;
    const days: { date: Date; label: string; earnings: number; costs: number }[] = [];
    const now = new Date();

    if (filterOption === 'today') {
      // Breakdown by 4-hour slots for today
      for (let h = 0; h < 24; h += 4) {
        const d = new Date(now);
        d.setHours(h, 0, 0, 0);
        days.push({
          date: d,
          label: `${h}:00`,
          earnings: 0,
          costs: 0,
        });
      }
    } else {
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push({
          date: d,
          label:
            i === 0
              ? 'Today'
              : d.toLocaleDateString('en-NG', {
                  weekday: daysCount <= 7 ? 'short' : undefined,
                  day: 'numeric',
                  month: daysCount > 7 ? 'short' : undefined,
                }),
          earnings: 0,
          costs: 0,
        });
      }
    }

    // Populate Sales
    sales.forEach((s) => {
      const saleDate = new Date(s.timestamp);
      if (filterOption === 'today') {
        if (saleDate.toDateString() === now.toDateString()) {
          const slot = Math.floor(saleDate.getHours() / 4);
          if (days[slot]) days[slot].earnings += s.totalAmount;
        }
      } else {
        const day = days.find(
          (d) =>
            d.date.getDate() === saleDate.getDate() &&
            d.date.getMonth() === saleDate.getMonth() &&
            d.date.getFullYear() === saleDate.getFullYear()
        );
        if (day) day.earnings += s.totalAmount;
      }
    });

    // Populate Expenses
    expenses.forEach((e) => {
      const expDate = new Date(e.timestamp);
      if (filterOption === 'today') {
        if (expDate.toDateString() === now.toDateString()) {
          const slot = Math.floor(expDate.getHours() / 4);
          if (days[slot]) days[slot].costs += e.amount;
        }
      } else {
        const day = days.find(
          (d) =>
            d.date.getDate() === expDate.getDate() &&
            d.date.getMonth() === expDate.getMonth() &&
            d.date.getFullYear() === expDate.getFullYear()
        );
        if (day) day.costs += e.amount;
      }
    });

    return days;
  }, [sales, expenses, filterOption]);

  const totalEarnings = data.reduce((sum, d) => sum + d.earnings, 0);
  const totalCosts = data.reduce((sum, d) => sum + d.costs, 0);

  return (
    <div className="bg-card rounded-[12px] border border-border p-5 space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-text tracking-tight">
            Sales Performance
          </h3>
          <p className="text-xs text-muted">
            Revenue earnings compared against recorded business costs.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="text-muted">Earnings:</span>
            <span className="font-bold text-text">{formatNaira(totalEarnings)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-costs-line" />
            <span className="text-muted">Costs:</span>
            <span className="font-bold text-text">{formatNaira(totalCosts)}</span>
          </div>
        </div>
      </div>

      {/* Recharts Monotone Line Chart */}
      <div className="h-[260px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            {/* Light horizontal grid lines only */}
            <CartesianGrid
              stroke="#E6E6E1"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: '#E6E6E1' }}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              dy={6}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickFormatter={(v: number) => {
                if (v >= 1000000) return `₦${(v / 1000000).toFixed(1)}M`;
                if (v >= 1000) return `₦${(v / 1000).toFixed(0)}k`;
                return `₦${v}`;
              }}
              dx={-4}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-white border border-border rounded-xl p-3 shadow-lg text-xs space-y-1 z-30">
                    <p className="font-semibold text-text">{d.label}</p>
                    <div className="flex items-center justify-between gap-4 text-primary font-medium">
                      <span>Earnings:</span>
                      <span className="font-bold">{formatNaira(d.earnings)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-muted font-medium">
                      <span>Costs:</span>
                      <span className="font-bold text-text">{formatNaira(d.costs)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-border font-medium">
                      <span>Net:</span>
                      <span
                        className={`font-bold ${
                          d.earnings - d.costs >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {formatNaira(d.earnings - d.costs)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            {/* Earnings (Sales) Line - primary with hollow white dots */}
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#0B7A4B"
              strokeWidth={2.5}
              dot={{
                r: 4,
                stroke: '#0B7A4B',
                strokeWidth: 2,
                fill: '#FFFFFF',
              }}
              activeDot={{
                r: 6,
                stroke: '#0B7A4B',
                strokeWidth: 2,
                fill: '#FFFFFF',
              }}
            />

            {/* Costs (Expenses) Line - light grey */}
            <Line
              type="monotone"
              dataKey="costs"
              stroke="#D4D4D8"
              strokeWidth={2}
              dot={{
                r: 3,
                stroke: '#D4D4D8',
                strokeWidth: 1.5,
                fill: '#FFFFFF',
              }}
              activeDot={{
                r: 5,
                stroke: '#D4D4D8',
                strokeWidth: 2,
                fill: '#FFFFFF',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with small square swatches below */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-primary" />
          <span className="font-medium text-text">Earnings (Sales Revenue)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-costs-line" />
          <span className="font-medium text-text">Costs (Expenses)</span>
        </div>
      </div>
    </div>
  );
}
