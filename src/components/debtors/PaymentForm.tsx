// ============================================
// Yusluv — Payment Form
// ============================================

import { useState } from 'react';
import { X, Banknote } from 'lucide-react';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira } from '../../lib/utils';
import type { Debtor } from '../../types';

interface PaymentFormProps {
  debtor: Debtor;
  onClose: () => void;
}

export default function PaymentForm({ debtor, onClose }: PaymentFormProps) {
  const { recordPayment } = useDebtors();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    setSaving(true);
    try {
      await recordPayment(debtor.id, parsedAmount, note || undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePayAll = () => {
    setAmount(debtor.totalDebt.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end
      sm:items-center justify-center animate-fade-in">
      <div className="bg-[#161622] w-full max-w-md rounded-t-3xl sm:rounded-3xl
        border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-semibold text-white">Record Payment</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {debtor.name} — Owes {formatNaira(debtor.totalDebt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center
              justify-center transition-colors"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-white/50">Payment Amount (₦)</label>
              <button
                type="button"
                onClick={handlePayAll}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Pay All ({formatNaira(debtor.totalDebt)})
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10
                text-white text-2xl font-bold placeholder:text-white/15
                focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30
                outline-none transition-all text-center"
              max={debtor.totalDebt}
              min={1}
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-1.5">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cash payment"
              className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10
                text-white placeholder:text-white/20 focus:border-purple-500
                focus:ring-1 focus:ring-purple-500/30 outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !amount || parseFloat(amount) <= 0}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold
              rounded-xl flex items-center justify-center gap-2 transition-all duration-150
              active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-600/20"
          >
            <Banknote size={18} />
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
}
