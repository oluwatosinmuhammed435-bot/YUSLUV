// ============================================
// Yusluv — Expense Form
// ============================================

import { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../../types';

interface ExpenseFormProps {
  onClose: () => void;
}

export default function ExpenseForm({ onClose }: ExpenseFormProps) {
  const { addExpense } = useExpenses();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Restocking');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || !parsedAmount) return;

    setSaving(true);
    try {
      await addExpense(description.trim(), category, parsedAmount, note.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end
      sm:items-center justify-center animate-fade-in">
      <div className="bg-[#161622] w-full max-w-md rounded-t-3xl sm:rounded-3xl
        max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Record Expense</h2>
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
            <label className="block text-sm text-white/50 mb-1.5">What did you spend on?</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Bought 5 cartons of Peak Milk"
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                text-white placeholder:text-white/20 focus:border-purple-500
                focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30
                outline-none transition-all appearance-none"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#161622]">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-1.5">Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10
                text-white text-2xl font-bold placeholder:text-white/15
                focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30
                outline-none transition-all text-center"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-1.5">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Paid to supplier Alhaji Musa"
              className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10
                text-white placeholder:text-white/20 focus:border-purple-500
                focus:ring-1 focus:ring-purple-500/30 outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !description.trim() || !amount}
            className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-white font-semibold
              rounded-xl flex items-center justify-center gap-2 transition-all duration-150
              active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-orange-600/20 mt-2"
          >
            <Receipt size={18} />
            Record Expense
          </button>
        </form>
      </div>
    </div>
  );
}
