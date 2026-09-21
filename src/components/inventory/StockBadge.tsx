// ============================================
// Yusluv — Stock Badge
// ============================================

interface StockBadgeProps {
  stock: number;
  threshold: number;
  piecesPerBulk: number;
}

export default function StockBadge({ stock, threshold, piecesPerBulk }: StockBadgeProps) {
  const bulks = Math.floor(stock / piecesPerBulk);
  const remainder = stock % piecesPerBulk;

  let color: string;
  let label: string;

  if (stock === 0) {
    color = 'bg-red-500/20 text-red-400 border-red-500/30';
    label = 'Out of stock';
  } else if (stock <= threshold * 0.3) {
    color = 'bg-red-500/15 text-red-400 border-red-500/20';
    label = `${stock} pcs`;
  } else if (stock <= threshold) {
    color = 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    label = bulks > 0 ? `${bulks}b ${remainder}p` : `${stock} pcs`;
  } else {
    color = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    label = bulks > 0 ? `${bulks}b ${remainder}p` : `${stock} pcs`;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px]
      font-medium border ${color}`}>
      {label}
    </span>
  );
}
