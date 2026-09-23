import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

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
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }

    setSaving(true);
    try {
      await addExpense(description.trim(), category, parsedAmount, note.trim());
      onClose();
    } catch (err) {
      console.error('Failed to log expense:', err);
      setError('Failed to record expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Record Business Expense"
      subtitle="Log operational costs, supplier payments, or daily shop expenditures."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Expense Title / Description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Generator Fuel / Restock Delivery"
          required
          autoFocus
        />

        <div>
          <label className="block text-xs font-medium text-text mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="w-full h-11 bg-white text-text text-sm rounded-xl border border-border px-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Amount Spent (₦)"
          type="number"
          min="1"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 5000"
          required
        />

        <div>
          <label className="block text-xs font-medium text-text mb-1.5">
            Additional Note (Optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Receipt number, vendor name, or details..."
            className="w-full p-3 bg-white text-text text-sm rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted/60"
          />
        </div>

        <div className="flex gap-3 pt-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={saving}
            icon={<Plus size={16} />}
          >
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
