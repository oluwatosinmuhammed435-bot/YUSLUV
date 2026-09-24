import { useState } from 'react';
import { useDebtors } from '../../context/DebtorContext';
import type { Debtor } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface DebtorFormProps {
  debtor?: Debtor;
  onClose: () => void;
}

export default function DebtorForm({ debtor, onClose }: DebtorFormProps) {
  const { addDebtor, updateDebtor } = useDebtors();
  const [name, setName] = useState(debtor?.name || '');
  const [phone, setPhone] = useState(debtor?.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(debtor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && debtor) {
        await updateDebtor(debtor.id, { name: name.trim(), phone: phone.trim() });
      } else {
        await addDebtor(name.trim(), phone.trim());
      }
      onClose();
    } catch (err) {
      console.error('Save debtor error:', err);
      setError('Failed to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={isEdit ? 'Edit Customer' : 'Add New Customer'}
      subtitle={
        isEdit
          ? 'Update contact information for this customer.'
          : 'Create a customer profile to track credit sales and WhatsApp reminders.'
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Customer Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alhaji Musa Bello"
          required
          autoFocus
        />

        <Input
          label="Phone Number (for WhatsApp reminders)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 0803 123 4567"
          required
          helperText="Include standard Nigerian phone number for 1-click WhatsApp messaging."
        />

        <div className="flex gap-3 pt-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" loading={saving}>
            {isEdit ? 'Update Details' : 'Save Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
