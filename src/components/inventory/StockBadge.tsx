// ============================================
// Yusluv — Stock Badge (Otoxa Emerald Theme)
// ============================================

interface StockBadgeProps {
  stock: number;
  threshold: number;
  piecesPerBulk: number;
}

export default function StockBadge({ stock, threshold, piecesPerBulk }: StockBadgeProps) {
  const bulks = Math.floor(stock / piecesPerBulk);
  const remainder = stock % piecesPerBulk;

  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-danger border border-danger/20">
        <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
        Out of Stock
      </span>
    );
  }

  if (stock <= threshold) {
    const detail = bulks > 0 ? `${bulks} bulk, ${remainder} pcs` : `${stock} pcs`;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-accent-amber border border-accent-amber/20">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-amber shrink-0" />
        Low: {detail}
      </span>
    );
  }

  const detail = bulks > 0 ? `${bulks}b ${remainder > 0 ? remainder + 'p' : ''}` : `${stock} pcs`;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-tint text-primary border border-primary/20">
      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      {detail} ({stock} pcs)
    </span>
  );
}
