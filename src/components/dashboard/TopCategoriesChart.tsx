import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronRight } from 'lucide-react';
import type { Sale, Product, Category } from '../../types';
import { formatNaira } from '../../lib/utils';

interface TopCategoriesChartProps {
  sales: Sale[];
  products: Product[];
}

export default function TopCategoriesChart({ sales, products }: TopCategoriesChartProps) {
  const { data, totalRevenue } = useMemo(() => {
    // Map productId -> category
    const productCategoryMap: Record<string, Category> = {};
    products.forEach((p) => {
      productCategoryMap[p.id] = p.category;
    });

    const categoryRevenue: Record<string, number> = {};
    let total = 0;

    sales.forEach((s) => {
      s.items.forEach((item) => {
        const cat = productCategoryMap[item.productId] || 'Other';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.subtotal;
        total += item.subtotal;
      });
    });

    // Color mapping according to spec: primary, amber, violet, and grey for Other
    const colorMap: Record<string, string> = {
      Provisions: '#0B7A4B', // primary
      Drugs: '#7C3AED', // accent-violet
      Beverages: '#F5A524', // accent-amber
      Snacks: '#16A34A', // success
      Toiletries: '#6366F1', // indigo
      Electronics: '#3B82F6', // blue
      Other: '#9CA3AF', // grey
    };

    const sorted = Object.entries(categoryRevenue)
      .map(([name, value]) => ({
        name,
        value,
        color: colorMap[name] || '#9CA3AF',
        percent: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // If no sales yet, provide dummy preview data
    if (sorted.length === 0) {
      return {
        data: [
          { name: 'Provisions', value: 45000, color: '#0B7A4B', percent: 50 },
          { name: 'Beverages', value: 25000, color: '#F5A524', percent: 28 },
          { name: 'Drugs', value: 12000, color: '#7C3AED', percent: 13 },
          { name: 'Other', value: 8000, color: '#9CA3AF', percent: 9 },
        ],
        totalRevenue: 90000,
      };
    }

    return { data: sorted, totalRevenue: total };
  }, [sales, products]);

  return (
    <div className="bg-card rounded-[12px] border border-border p-5 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-text tracking-tight">
          Top Categories
        </h3>
        <p className="text-xs text-muted">
          Sales distribution across store departments.
        </p>
      </div>

      {/* Donut Chart with center label */}
      <div className="relative h-[200px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                return (
                  <div className="bg-white border border-border rounded-xl p-2.5 shadow-lg text-xs space-y-0.5 z-30">
                    <p className="font-semibold text-text">{d.name}</p>
                    <p className="font-bold text-primary">{formatNaira(Number(d.value))}</p>
                    <p className="text-muted text-[11px]">{Number(d.payload.percent).toFixed(1)}% of total</p>
                  </div>
                );
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-medium text-muted uppercase tracking-wider">
            Totals
          </span>
          <span className="text-sm font-bold text-text mt-0.5">
            {formatNaira(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Legend below with color squares & chevron */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        {data.slice(0, 4).map((cat) => (
          <div
            key={cat.name}
            className="flex items-center justify-between text-xs py-1 px-1 rounded-lg hover:bg-page-bg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium text-text">{cat.name}</span>
            </div>

            <div className="flex items-center gap-2 text-muted">
              <span className="font-semibold text-text">{formatNaira(cat.value)}</span>
              <span className="text-[11px]">({cat.percent.toFixed(0)}%)</span>
              <ChevronRight size={14} className="text-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
