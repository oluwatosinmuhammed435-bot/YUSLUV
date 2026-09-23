import { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';
import type { Product, SellMode } from '../../types';
import { formatNaira } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, sellMode: SellMode, qty: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [sellMode, setSellMode] = useState<SellMode>('piece');
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const outOfStock = product.stockInPieces === 0;
  const isLowStock = product.stockInPieces <= product.lowStockThreshold;

  const maxBulks = Math.floor(product.stockInPieces / product.piecesPerBulk);
  const maxQty = sellMode === 'bulk' ? maxBulks : product.stockInPieces;

  const unitPrice = sellMode === 'bulk' ? product.bulkPrice : product.piecePrice;
  const subtotal = unitPrice * qty;

  const handleAdd = () => {
    if (outOfStock || qty < 1) return;
    onAddToCart(product, sellMode, qty);
    setJustAdded(true);
    setQty(1);
    setTimeout(() => setJustAdded(false), 800);
  };

  const handleModeChange = (mode: SellMode) => {
    setSellMode(mode);
    setQty(1);
  };

  return (
    <div
      className={`bg-card rounded-[12px] border transition-all duration-150 flex flex-col justify-between p-3.5 sm:p-4 select-none ${
        outOfStock
          ? 'opacity-60 border-border bg-page-bg/40'
          : justAdded
          ? 'border-primary ring-2 ring-primary/20 shadow-sm'
          : 'border-border hover:border-primary/40 hover:shadow-xs'
      }`}
    >
      {/* Top: Product Name, Category & Stock Badge */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-text line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              outOfStock
                ? 'bg-red-50 text-danger border border-danger/20'
                : isLowStock
                ? 'bg-amber-50 text-accent-amber border border-accent-amber/20'
                : 'bg-primary-tint text-primary border border-primary/20'
            }`}
          >
            {outOfStock ? 'Out' : isLowStock ? `${product.stockInPieces} left` : `${product.stockInPieces} pcs`}
          </span>
        </div>
        <p className="text-[11px] text-muted mb-3">{product.category}</p>

        {/* Sell Mode Toggle (Piece vs Bulk) */}
        <div className="flex bg-page-bg p-1 rounded-xl border border-border mb-3">
          <button
            type="button"
            onClick={() => handleModeChange('piece')}
            disabled={outOfStock}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sellMode === 'piece'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            Piece
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('bulk')}
            disabled={maxBulks === 0}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              sellMode === 'bulk'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            Bulk ({product.piecesPerBulk}p)
          </button>
        </div>

        {/* Price display */}
        <div className="flex items-baseline justify-between mb-3 px-1">
          <div>
            <span className="text-xs text-muted block">Rate</span>
            <span className="text-base font-bold text-text">
              {formatNaira(unitPrice)}
            </span>
          </div>
          {qty > 1 && (
            <div className="text-right">
              <span className="text-[10px] text-muted block">Subtotal</span>
              <span className="text-sm font-semibold text-primary">
                {formatNaira(subtotal)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Quantity Stepper & Add Button */}
      <div className="pt-2 border-t border-border flex items-center gap-2">
        {/* Quantity Stepper */}
        <div className="flex items-center bg-page-bg border border-border rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={outOfStock || qty <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-7 text-center font-semibold text-xs text-text">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            disabled={outOfStock || qty >= maxQty}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex-1 h-9 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
            outOfStock
              ? 'bg-page-bg text-muted cursor-not-allowed border border-border'
              : justAdded
              ? 'bg-success text-white shadow-xs'
              : 'bg-primary text-white hover:bg-primary-hover shadow-xs'
          }`}
        >
          {justAdded ? (
            <>
              <Check size={14} />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
