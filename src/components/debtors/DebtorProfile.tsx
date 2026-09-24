import { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Banknote,
  MessageCircle,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira, formatDate } from '../../lib/utils';
import type { Debtor } from '../../types';
import PaymentForm from './PaymentForm';
import DebtorForm from './DebtorForm';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

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

  // Always read latest data from context
  const debtor = debtors.find((d) => d.id === initialDebtor.id) || initialDebtor;

  const handleCopyWhatsApp = async () => {
    const summary = generateWhatsAppSummary(debtor.id);
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const summary = generateWhatsAppSummary(debtor.id);
    const cleanPhone = debtor.phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  const handleDelete = async () => {
    await removeDebtor(debtor.id);
    onBack();
  };

  const hasDebt = debtor.totalDebt > 0;

  return (
    <div className="space-y-6">
      {/* Back button & Action Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-text transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Edit3 size={14} />}
            onClick={() => setShowEdit(true)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-red-50"
            icon={<Trash2 size={14} />}
            onClick={() => setDeleteConfirm(true)}
          />
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="bg-card rounded-[12px] border border-border p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary-tint text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
              {debtor.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-text">
                  {debtor.name}
                </h1>
                <Badge variant={hasDebt ? 'danger' : 'success'} size="sm">
                  {hasDebt ? 'Has Balance' : 'Debt Free'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted mt-1">
                <Phone size={13} className="text-muted" />
                <span>{debtor.phone}</span>
                <span className="text-muted/40">&bull;</span>
                <span>Customer ID: #{debtor.id.slice(-5).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Large Total Debt Badge */}
          <div className="sm:text-right p-3 sm:p-0 bg-page-bg sm:bg-transparent rounded-xl">
            <span className="text-xs text-muted block">Total Outstanding Debt</span>
            <span
              className={`text-2xl font-bold tracking-tight ${
                hasDebt ? 'text-danger' : 'text-success'
              }`}
            >
              {formatNaira(debtor.totalDebt)}
            </span>
          </div>
        </div>

        {/* Action Buttons: WhatsApp Reminder & Add Payment */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-border">
          <Button
            variant="primary"
            className="bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs"
            icon={<MessageCircle size={16} />}
            onClick={handleWhatsAppShare}
          >
            Send WhatsApp Reminder
          </Button>

          <Button
            variant="outline"
            icon={copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            onClick={handleCopyWhatsApp}
          >
            {copied ? 'Copied Invoice!' : 'Copy Invoice'}
          </Button>

          {hasDebt && (
            <Button
              variant="secondary"
              icon={<Banknote size={16} />}
              onClick={() => setShowPayment(true)}
            >
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-card rounded-[12px] border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text tracking-tight">
              Customer Ledger & Audit History
            </h3>
            <p className="text-xs text-muted">
              Chronological log of credit purchases and cash repayments.
            </p>
          </div>
          <span className="text-xs font-semibold text-muted">
            {debtor.transactions.length} entries
          </span>
        </div>

        {debtor.transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            No transactions found for this customer.
          </div>
        ) : (
          <div className="space-y-3">
            {[...debtor.transactions]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl border border-border bg-page-bg/40 space-y-2 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCredit
                              ? 'bg-red-50 text-danger'
                              : 'bg-emerald-50 text-success'
                          }`}
                        >
                          {isCredit ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-text">
                            {isCredit ? 'Credit Purchase (Billed)' : 'Payment Received'}
                          </div>
                          <div className="text-[11px] text-muted">
                            {formatDate(tx.timestamp)}
                            {tx.note && ` • ${tx.note}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-bold ${
                            isCredit ? 'text-danger' : 'text-success'
                          }`}
                        >
                          {isCredit ? `+${formatNaira(tx.amount)}` : `-${formatNaira(tx.amount)}`}
                        </span>
                      </div>
                    </div>

                    {/* Line Items for Credit Sales */}
                    {tx.items && tx.items.length > 0 && (
                      <div className="pl-9 pt-1.5 space-y-1 border-t border-border/50 text-xs">
                        <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                          Items Billed:
                        </span>
                        {tx.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-muted text-[11px]"
                          >
                            <span>
                              {item.productName} ({item.quantity} {item.sellMode})
                            </span>
                            <span className="font-medium text-text">
                              {formatNaira(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPayment && (
        <PaymentForm debtor={debtor} onClose={() => setShowPayment(false)} />
      )}

      {/* Edit Customer Modal */}
      {showEdit && (
        <DebtorForm debtor={debtor} onClose={() => setShowEdit(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          open={true}
          onClose={() => setDeleteConfirm(false)}
          title="Delete Customer Profile"
          subtitle={`Are you sure you want to delete ${debtor.name}?`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted">
              {hasDebt ? (
                <strong className="text-danger font-semibold">
                  Warning: This customer still owes {formatNaira(debtor.totalDebt)}. Deleting their profile will write off this outstanding balance!
                </strong>
              ) : (
                'This customer has zero outstanding balance and can be safely removed.'
              )}
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
