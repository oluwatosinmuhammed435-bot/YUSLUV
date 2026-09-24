import { useState, useMemo } from 'react';
import { Plus, Users, AlertCircle, Phone, ChevronRight } from 'lucide-react';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira } from '../../lib/utils';
import type { Debtor } from '../../types';
import DebtorForm from './DebtorForm';
import DebtorProfile from './DebtorProfile';
import SearchBar from '../ui/SearchBar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';

export default function DebtorsScreen() {
  const { debtors, totalOutstandingDebt } = useDebtors();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  const filtered = useMemo(() => {
    return debtors
      .filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.phone.includes(search)
      )
      .sort((a, b) => b.totalDebt - a.totalDebt);
  }, [debtors, search]);

  const activeDebtorsCount = debtors.filter((d) => d.totalDebt > 0).length;

  // If a customer is selected, show their full detail ledger profile
  if (selectedDebtor) {
    return (
      <DebtorProfile
        debtor={selectedDebtor}
        onBack={() => setSelectedDebtor(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Customer Credit & Debtors</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Track customer balances, payment records, and send instant WhatsApp debt reminders.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setShowAddForm(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Outstanding Debt Summary Widget */}
      {debtors.length > 0 && (
        <div className="bg-card rounded-[12px] border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-danger flex items-center justify-center shrink-0 border border-red-200">
              <AlertCircle size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Total Uncollected Debt
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-danger tracking-tight">
                {formatNaira(totalOutstandingDebt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              <strong>{activeDebtorsCount}</strong> customer{activeDebtorsCount !== 1 ? 's' : ''} with active balance
            </span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by customer name or phone number..."
        />
      </div>

      {/* Customer List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No customers found"
            description={
              debtors.length === 0
                ? 'No customer records created yet. Tap "Add Customer" to start tracking credit sales.'
                : 'No customer matches your search query.'
            }
            action={
              debtors.length === 0 ? (
                <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
                  Add First Customer
                </Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map((debtor) => {
            const hasDebt = debtor.totalDebt > 0;
            const initials = debtor.name.slice(0, 2).toUpperCase();

            return (
              <div
                key={debtor.id}
                onClick={() => setSelectedDebtor(debtor)}
                className="bg-card p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                    {initials}
                  </div>
                  <div className="truncate">
                    <h3 className="font-semibold text-text text-sm group-hover:text-primary transition-colors truncate">
                      {debtor.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                      <Phone size={12} className="text-muted" />
                      <span>{debtor.phone}</span>
                      <span className="text-muted/40">&bull;</span>
                      <span>{debtor.transactions.length} orders</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <Badge variant={hasDebt ? 'danger' : 'success'} size="sm">
                      {hasDebt ? formatNaira(debtor.totalDebt) : 'Debt Free'}
                    </Badge>
                  </div>
                  <ChevronRight size={18} className="text-muted/50 group-hover:text-text transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddForm && (
        <DebtorForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}
