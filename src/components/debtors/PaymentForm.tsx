import { useState } from 'react';
import { Banknote } from 'lucide-react';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira } from '../../lib/utils';
import type { Debtor } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface PaymentFormProps {
  debtor: Debtor;
  onClose: () => void;
}

export default function PaymentForm({ debtor, onClose }: PaymentFormProps) {
  const { recordPayment } = useDebtors();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setSaving(true);
    try {
      await recordPayment(debtor.id, parsedAmount, note.trim() || undefined);
      onClose();
    } catch (err) {
      console.error('Record payment error:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePayFull = () => {
    setAmount(debtor.totalDebt.toString());
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Record Debt Payment"
      subtitle={`Receive payment against ${debtor.name}'s account.`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Current Balance Card with Quick "Pay Full" Pill */}
        <div className="p-3.5 bg-page-bg rounded-xl border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted block">Current Outstanding</span>
            <span className="text-lg font-bold text-danger">
              {formatNaira(debtor.totalDebt)}
            </span>
          </div>

          <button
            type="button"
            onClick={handlePayFull}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-tint text-primary hover:bg-emerald-100 border border-primary/20 transition-colors cursor-pointer"
          >
            Pay Full Balance
          </button>
        </div>

        <Input
          label="Amount Received (₦)"
          type="number"
          min="1"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 5000"
          required
          autoFocus
        />

        <Input
          label="Payment Note / Reference (Optional)"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Cash / Bank Transfer / Pos slip"
        />

        <div className="flex gap-3 pt-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={saving}
            icon={<Banknote size={16} />}
          >
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
