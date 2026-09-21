// ============================================
// Yusluv — Debtors Screen
// ============================================

import { useState, useMemo } from 'react';
import { Plus, Search, Users, AlertCircle } from 'lucide-react';
import { useDebtors } from '../../context/DebtorContext';
import { formatNaira } from '../../lib/utils';
import type { Debtor } from '../../types';
import DebtorForm from './DebtorForm';
import DebtorProfile from './DebtorProfile';

export default function DebtorsScreen() {
  const { debtors, totalOutstandingDebt } = useDebtors();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  const filtered = useMemo(() => {
    return debtors
      .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.totalDebt - a.totalDebt);
  }, [debtors, search]);

  // Show profile view if a debtor is selected
  if (selectedDebtor) {
    return (
      <DebtorProfile
        debtor={selectedDebtor}
        onBack={() => setSelectedDebtor(null)}
      />
    );
  }

  return (
    <div className="px-4 py-3">
      {/* Outstanding debt summary */}
      {debtors.length > 0 && (
        <div className="bg-gradient-to-br from-red-600/10 to-red-900/10 border
          border-red-500/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-red-400" />
            <p className="text-red-300/60 text-xs font-medium uppercase tracking-wider">
              Total Outstanding
            </p>
          </div>
          <p className="text-red-400 text-2xl font-bold">
            {formatNaira(totalOutstandingDebt)}
          </p>
          <p className="text-white/20 text-xs mt-1">
            {debtors.filter((d) => d.totalDebt > 0).length} active debtor{debtors.filter((d) => d.totalDebt > 0).length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10
            text-white placeholder:text-white/25 focus:border-purple-500/50
            focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm"
        />
      </div>

      {/* Debtor list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={48} className="text-white/10 mb-3" />
          <p className="text-white/30 text-sm">
            {debtors.length === 0 ? 'No customers yet' : 'No customers match your search'}
          </p>
          {debtors.length === 0 && (
            <p className="text-white/20 text-xs mt-1">
              Tap + to add your first customer
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((debtor) => (
            <button
              key={debtor.id}
              onClick={() => setSelectedDebtor(debtor)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-3.5
                hover:border-white/10 transition-all text-left group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{debtor.name}</h3>
                  {debtor.phone && (
                    <p className="text-white/25 text-xs mt-0.5">{debtor.phone}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className={`font-bold text-sm ${
                    debtor.totalDebt > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {debtor.totalDebt > 0 ? formatNaira(debtor.totalDebt) : 'Cleared ✓'}
                  </p>
                  <p className="text-white/15 text-[10px] mt-0.5">
                    {debtor.transactions.length} transaction{debtor.transactions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-500
          rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center
          transition-all duration-150 active:scale-90 z-30"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Debtor Form Modal */}
      {showForm && <DebtorForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
