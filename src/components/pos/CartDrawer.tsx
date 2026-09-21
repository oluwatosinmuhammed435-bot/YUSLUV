// ============================================
// Yusluv — Cart Drawer
// ============================================

import { useState } from 'react';
import { X, Trash2, ShoppingCart, ChevronUp, CreditCard, Users } from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { useInventory } from '../../context/InventoryContext';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira } from '../../lib/utils';
import type { Debtor } from '../../types';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, cartTotal, removeFromCart, clearCart, confirmSale } = useSales();
  const { deductStock } = useInventory();
  const { debtors, addCredit } = useDebtors();
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sellOnCredit, setSellOnCredit] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  const handleConfirmSale = async () => {
    if (cart.length === 0) return;
    setConfirming(true);

    try {
      // Deduct stock for each cart item
      for (const item of cart) {
        const piecesToDeduct =
          item.sellMode === 'bulk'
            ? item.quantity * item.product.piecesPerBulk
            : item.quantity;
        await deductStock(item.product.id, piecesToDeduct);
      }

      // Record the sale
      const sale = await confirmSale(selectedDebtor?.id);

      // If selling on credit, add to debtor's ledger
      if (sellOnCredit && selectedDebtor) {
        await addCredit(selectedDebtor.id, sale.totalAmount, sale.items, 'Credit sale');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSellOnCredit(false);
        setSelectedDebtor(null);
        onClose();
      }, 1500);
    } finally {
      setConfirming(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#111118] border-t border-white/10
        rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-purple-400" />
            <h2 className="text-white font-semibold">Cart</h2>
            <span className="text-white/30 text-sm">({cart.length} items)</span>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs
                  hover:bg-red-500/20 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center
                justify-center transition-colors"
            >
              <X size={16} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart size={40} className="text-white/10 mb-2" />
              <p className="text-white/25 text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.sellMode}-${index}`}
                  className="flex items-center gap-3 bg-white/[0.03] border border-white/5
                    rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-white/30 text-xs">
                      {item.quantity} × {formatNaira(
                        item.sellMode === 'bulk' ? item.product.bulkPrice : item.product.piecePrice
                      )}{' '}
                      ({item.sellMode})
                    </p>
                  </div>
                  <p className="text-purple-400 font-semibold text-sm shrink-0">
                    {formatNaira(item.subtotal)}
                  </p>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20
                      flex items-center justify-center transition-colors shrink-0"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credit Sale Toggle */}
        {cart.length > 0 && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setSellOnCredit(!sellOnCredit)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                transition-all border
                ${sellOnCredit
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-white/[0.03] border-white/5 text-white/40 hover:text-white/60'
                }`}
            >
              <Users size={16} />
              <span>Sell on Credit (Gbese)</span>
              <ChevronUp
                size={14}
                className={`ml-auto transition-transform ${sellOnCredit ? 'rotate-180' : ''}`}
              />
            </button>

            {sellOnCredit && (
              <div className="mt-2 space-y-1.5 animate-fade-in">
                {debtors.length === 0 ? (
                  <p className="text-white/30 text-xs px-2 py-2">
                    No debtors found. Add one in the Debtors tab first.
                  </p>
                ) : (
                  debtors.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDebtor(d)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                        transition-all text-left
                        ${selectedDebtor?.id === d.id
                          ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300'
                          : 'bg-white/[0.03] border border-white/5 text-white/60 hover:bg-white/5'
                        }`}
                    >
                      <span className="truncate">{d.name}</span>
                      <span className="text-white/20 text-xs ml-auto shrink-0">
                        Owes {formatNaira(d.totalDebt)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-4 pb-4 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-sm">Total</span>
              <span className="text-white text-xl font-bold">{formatNaira(cartTotal)}</span>
            </div>
            <button
              onClick={handleConfirmSale}
              disabled={confirming || (sellOnCredit && !selectedDebtor)}
              className={`w-full h-12 rounded-xl font-semibold text-white flex items-center
                justify-center gap-2 transition-all duration-200 active:scale-[0.98]
                disabled:opacity-50
                ${success
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20'
                }`}
            >
              {success ? (
                '✓ Sale Complete!'
              ) : confirming ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard size={18} />
                  Confirm Sale — {formatNaira(cartTotal)}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
