// ============================================
// Yusluv — Debtor Profile
// ============================================

import { useState } from 'react';
import {
  ArrowLeft, Phone, Banknote, MessageCircle, Copy, Check,
  TrendingDown, TrendingUp, Edit3, Trash2
} from 'lucide-react';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira, formatDate } from '../../lib/utils';
import type { Debtor } from '../../types';
import PaymentForm from './PaymentForm';
import DebtorForm from './DebtorForm';

interface DebtorProfileProps {
  debtor: Debtor;
  onBack: () => void;
}

export default function DebtorProfile({ debtor: initialDebtor, onBack }: DebtorProfileProps) {
  const { debtors, removeDebtor, generateWhatsAppSummary } = useDebtors();
  const [showPayment, setShowPayment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Always get fresh debtor data from context
  const debtor = debtors.find((d) => d.id === initialDebtor.id) || initialDebtor;

  const handleCopyWhatsApp = async () => {
    const summary = generateWhatsAppSummary(debtor.id);
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const summary = generateWhatsAppSummary(debtor.id);
    const url = `https://wa.me/${debtor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  const handleDelete = async () => {
    await removeDebtor(debtor.id);
    onBack();
  };

  return (
    <div className="px-4 py-3">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/70
          transition-colors mb-4 text-sm"
      >
        <ArrowLeft size={16} />
        Back to Debtors
      </button>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-purple-600/10 to-purple-900/10 border
        border-purple-500/10 rounded-2xl p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-white text-xl font-bold">{debtor.name}</h2>
            {debtor.phone && (
              <a
                href={`tel:${debtor.phone}`}
                className="flex items-center gap-1.5 text-white/40 text-sm mt-1
                  hover:text-purple-400 transition-colors"
              >
                <Phone size={12} />
                {debtor.phone}
              </a>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowEdit(true)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center
                justify-center transition-colors"
            >
              <Edit3 size={14} className="text-white/50" />
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center
                justify-center transition-colors"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Total Owed</p>
          <p className={`text-2xl font-bold ${
            debtor.totalDebt > 0 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {formatNaira(debtor.totalDebt)}
          </p>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl
          animate-fade-in">
          <p className="text-red-400 text-sm mb-2">
            Delete <strong>{debtor.name}</strong> and all their records?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm(false)}
              className="flex-1 py-2 rounded-lg bg-white/5 text-white/50 text-sm
                hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm
                hover:bg-red-500/30 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setShowPayment(true)}
          className="h-11 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/20
            text-emerald-400 rounded-xl flex items-center justify-center gap-2 text-sm
            font-medium transition-all active:scale-[0.98]"
        >
          <Banknote size={16} />
          Record Payment
        </button>
        <button
          onClick={handleCopyWhatsApp}
          className={`h-11 rounded-xl flex items-center justify-center gap-2 text-sm
            font-medium transition-all active:scale-[0.98] border
            ${copied
              ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Summary'}
        </button>
      </div>

      {debtor.phone && (
        <button
          onClick={handleWhatsAppShare}
          className="w-full h-11 bg-[#25D366]/15 hover:bg-[#25D366]/25 border
            border-[#25D366]/20 text-[#25D366] rounded-xl flex items-center
            justify-center gap-2 text-sm font-medium transition-all
            active:scale-[0.98] mb-4"
        >
          <MessageCircle size={16} />
          Send via WhatsApp
        </button>
      )}

      {/* Transaction History */}
      <div className="mb-2">
        <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
          Transaction History
        </h3>
      </div>

      {debtor.transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/20 text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {debtor.transactions.map((tx) => (
            <div
              key={tx.id}
              className={`bg-white/[0.03] border rounded-xl p-3 ${
                tx.type === 'credit'
                  ? 'border-red-500/10'
                  : 'border-emerald-500/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {tx.type === 'credit' ? (
                    <TrendingUp size={14} className="text-red-400" />
                  ) : (
                    <TrendingDown size={14} className="text-emerald-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    tx.type === 'credit' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount)}
                  </span>
                </div>
                <span className="text-white/20 text-xs">{formatDate(tx.timestamp)}</span>
              </div>
              {tx.note && (
                <p className="text-white/30 text-xs mt-1">{tx.note}</p>
              )}
              {tx.items && tx.items.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {tx.items.map((item, i) => (
                    <p key={i} className="text-white/20 text-[11px]">
                      {item.quantity}× {item.productName} ({item.sellMode})
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showPayment && (
        <PaymentForm debtor={debtor} onClose={() => setShowPayment(false)} />
      )}
      {showEdit && (
        <DebtorForm debtor={debtor} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}
