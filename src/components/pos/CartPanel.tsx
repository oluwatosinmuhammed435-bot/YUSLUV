import { useState } from 'react';
import { Trash2, ShoppingCart, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { useInventory } from '../../context/InventoryContext';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira } from '../../lib/utils';
import type { Debtor } from '../../types';
import Button from '../ui/Button';

interface CartPanelProps {
  onSuccess?: () => void;
}

export default function CartPanel({ onSuccess }: CartPanelProps) {
  const { cart, cartTotal, removeFromCart, clearCart, confirmSale } = useSales();
  const { deductStock } = useInventory();
  const { debtors, addCredit, addDebtor } = useDebtors();

  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sellOnCredit, setSellOnCredit] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [error, setError] = useState('');

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;
    try {
      const created = await addDebtor(newCustomerName.trim(), newCustomerPhone.trim());
      setSelectedDebtor(created);
      setShowAddCustomer(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
    } catch (err) {
      console.error('Create debtor error:', err);
    }
  };

  const handleCheckout = async (isCredit: boolean) => {
    if (cart.length === 0) return;
    setError('');

    if (isCredit && !selectedDebtor) {
      setError('Please select or add a customer to record a credit sale.');
      setSellOnCredit(true);
      return;
    }

    setConfirming(true);

    try {
      // Deduct stock for all cart items
      await Promise.all(
        cart.map((item) => {
          const piecesToDeduct =
            item.sellMode === 'bulk'
              ? item.quantity * item.product.piecesPerBulk
              : item.quantity;
          return deductStock(item.product.id, piecesToDeduct);
        })
      );

      // Record sale in SalesContext
      const sale = await confirmSale(isCredit && selectedDebtor ? selectedDebtor.id : undefined);

      // If credit sale, update debtor ledger
      if (isCredit && selectedDebtor) {
        await addCredit(selectedDebtor.id, sale.totalAmount, sale.items, 'POS Credit Sale');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSellOnCredit(false);
        setSelectedDebtor(null);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-card rounded-[12px] border border-border">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-success flex items-center justify-center mb-3 animate-scale-in">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-lg font-bold text-text">Sale Completed!</h3>
        <p className="text-xs text-muted mt-1">
          {sellOnCredit && selectedDebtor
            ? `Charged ${formatNaira(cartTotal)} to ${selectedDebtor.name}'s credit ledger.`
            : `Cash receipt recorded. Inventory updated successfully.`}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between bg-card rounded-[12px] border border-border overflow-hidden select-none">
      {/* Cart Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-page-bg/40">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-primary" />
          <h2 className="text-sm font-bold text-text tracking-tight">
            Current Order ({cart.length})
          </h2>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-danger hover:underline font-semibold cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="p-4 overflow-y-auto flex-1 divide-y divide-border/60 space-y-3">
        {cart.length === 0 ? (
          <div className="py-16 text-center text-muted">
            <div className="w-12 h-12 rounded-full bg-page-bg flex items-center justify-center mx-auto mb-2 text-muted">
              <ShoppingCart size={22} />
            </div>
            <p className="text-xs font-medium">Cart is empty</p>
            <p className="text-[11px] text-muted/80 mt-0.5">
              Select items from the catalog on the left to start an order.
            </p>
          </div>
        ) : (
          cart.map((item, index) => (
            <div key={`${item.product.id}-${item.sellMode}`} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-text truncate">
                    {item.product.name}
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-page-bg text-muted border border-border">
                    {item.sellMode === 'bulk' ? 'Bulk' : 'Pcs'}
                  </span>
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  {item.quantity} x {formatNaira(item.sellMode === 'bulk' ? item.product.bulkPrice : item.product.piecePrice)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-text">
                  {formatNaira(item.subtotal)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCart(index)}
                  className="p-1 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Picker for Credit Sales */}
      {sellOnCredit && (
        <div className="p-4 bg-amber-50/50 border-t border-amber-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent-amber flex items-center gap-1.5">
              <UserCheck size={14} /> Assign to Customer Ledger:
            </span>
            <button
              type="button"
              onClick={() => setShowAddCustomer(!showAddCustomer)}
              className="text-[11px] text-primary font-bold hover:underline cursor-pointer"
            >
              {showAddCustomer ? 'Select Existing' : '+ New Customer'}
            </button>
          </div>

          {showAddCustomer ? (
            <form onSubmit={handleCreateCustomer} className="space-y-2">
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Customer Full Name"
                className="w-full h-9 px-3 bg-white rounded-lg border border-border text-xs text-text outline-none focus:border-primary"
                required
              />
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="Phone (080...)"
                  className="flex-1 h-9 px-3 bg-white rounded-lg border border-border text-xs text-text outline-none focus:border-primary"
                  required
                />
                <Button size="sm" variant="primary" type="submit">
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <select
              value={selectedDebtor?.id || ''}
              onChange={(e) => {
                const found = debtors.find((d) => d.id === e.target.value) || null;
                setSelectedDebtor(found);
              }}
              className="w-full h-10 px-3 bg-white rounded-xl border border-border text-xs text-text outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- Choose Debtor / Customer --</option>
              {debtors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone}) {d.totalDebt > 0 ? `• Owes ${formatNaira(d.totalDebt)}` : ''}
                </option>
              ))}
            </select>
          )}

          {selectedDebtor && (
            <div className="text-[11px] text-muted flex items-center justify-between">
              <span>Current Outstanding:</span>
              <span className="font-semibold text-danger">{formatNaira(selectedDebtor.totalDebt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-danger text-xs font-semibold flex items-center gap-1.5 border-t border-red-200">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Cart Summary & Checkout Buttons */}
      <div className="p-4 bg-page-bg/40 border-t border-border space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-muted">Total Amount</span>
          <span className="text-2xl font-bold text-text tracking-tight">
            {formatNaira(cartTotal)}
          </span>
        </div>

        {/* Action Buttons: Cash Sale vs Credit Sale */}
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant={sellOnCredit ? 'primary' : 'secondary'}
            size="lg"
            className="w-full text-xs sm:text-sm font-semibold"
            disabled={cart.length === 0 || confirming}
            onClick={() => {
              if (!sellOnCredit) {
                setSellOnCredit(true);
              } else {
                handleCheckout(true);
              }
            }}
          >
            {sellOnCredit ? 'Confirm Credit' : 'Credit Sale'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full text-xs sm:text-sm font-bold shadow-md shadow-primary/20"
            disabled={cart.length === 0 || confirming}
            loading={confirming && !sellOnCredit}
            onClick={() => {
              setSellOnCredit(false);
              handleCheckout(false);
            }}
          >
            Cash Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
