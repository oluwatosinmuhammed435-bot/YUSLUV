// ============================================
// Yusluv — Debtor Form
// ============================================

import { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { useDebtors } from '../../context/DebtorContext';
import type { Debtor } from '../../types';

interface DebtorFormProps {
  debtor?: Debtor;
  onClose: () => void;
}

export default function DebtorForm({ debtor, onClose }: DebtorFormProps) {
  const { addDebtor, updateDebtor } = useDebtors();
  const [name, setName] = useState(debtor?.name || '');
  const [phone, setPhone] = useState(debtor?.phone || '');
  const [saving, setSaving] = useState(false);

  const isEdit = !!debtor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateDebtor(debtor.id, { name, phone });
      } else {
        await addDebtor(name, phone);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end
      sm:items-center justify-center animate-fade-in">
      <div className="bg-[#161622] w-full max-w-md rounded-t-3xl sm:rounded-3xl
        border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? 'Edit Customer' : 'Add Customer'}
          </h2>
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
            <label className="block text-sm text-white/50 mb-1.5">Customer Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mama Chioma"
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                text-white placeholder:text-white/20 focus:border-purple-500
                focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                text-white placeholder:text-white/20 focus:border-purple-500
                focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-semibold
              rounded-xl flex items-center justify-center gap-2 transition-all duration-150
              active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-purple-600/20 mt-2"
          >
            {isEdit ? (
              <><Save size={18} /> Save Changes</>
            ) : (
              <><UserPlus size={18} /> Add Customer</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
