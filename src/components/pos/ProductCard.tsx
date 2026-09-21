// ============================================
// Yusluv — POS Product Card
// ============================================

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Product, SellMode } from '../../types';
import { formatNaira } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, sellMode: SellMode, qty: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [sellMode, setSellMode] = useState<SellMode>('piece');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stockInPieces === 0;
  const isLow = product.stockInPieces <= product.lowStockThreshold;

  const maxQty = sellMode === 'bulk'
    ? Math.floor(product.stockInPieces / product.piecesPerBulk)
    : product.stockInPieces;

  const unitPrice = sellMode === 'bulk' ? product.bulkPrice : product.piecePrice;

  const handleAdd = () => {
    if (outOfStock || qty < 1) return;
    onAddToCart(product, sellMode, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 600);
  };

  return (
    <div
      className={`relative bg-white/[0.03] border rounded-2xl p-3 transition-all duration-200
        ${outOfStock
          ? 'border-white/5 opacity-50'
          : added
            ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
            : isLow
              ? 'border-amber-500/20 hover:border-amber-500/30'
              : 'border-white/5 hover:border-white/10'
        }`}
    >
      {/* Product name + category */}
      <h3 className="text-white font-medium text-sm truncate mb-0.5">{product.name}</h3>
      <p className="text-white/25 text-[10px] mb-2">{product.category}</p>

      {/* Sell mode toggle */}
      <div className="flex bg-white/5 rounded-lg p-0.5 mb-2">
        <button
          onClick={() => { setSellMode('piece'); setQty(1); }}
          className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all
            ${sellMode === 'piece'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-white/40 hover:text-white/60'
            }`}
        >
          Piece
        </button>
        <button
          onClick={() => { setSellMode('bulk'); setQty(1); }}
          disabled={Math.floor(product.stockInPieces / product.piecesPerBulk) === 0}
          className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            ${sellMode === 'bulk'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-white/40 hover:text-white/60'
            }`}
        >
          Bulk
        </button>
      </div>

      {/* Price */}
      <p className="text-purple-400 font-bold text-base mb-2">{formatNaira(unitPrice)}</p>

      {/* Qty + Add */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white/5 rounded-lg">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock}
            className="w-8 h-8 flex items-center justify-center text-white/40
              hover:text-white/70 transition-colors disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-white text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={outOfStock || qty >= maxQty}
            className="w-8 h-8 flex items-center justify-center text-white/40
              hover:text-white/70 transition-colors disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all
            duration-150 active:scale-95
            ${added
              ? 'bg-emerald-500 text-white'
              : outOfStock
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
            }`}
        >
          {added ? '✓ Added' : outOfStock ? 'No Stock' : 'Add'}
        </button>
      </div>

      {/* Stock indicator */}
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-[10px] ${
          outOfStock ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white/20'
        }`}>
          {outOfStock ? 'OUT OF STOCK' : `${product.stockInPieces} pcs left`}
        </span>
      </div>
    </div>
  );
}
