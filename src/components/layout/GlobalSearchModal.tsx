import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Users, Receipt, X } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useDebtors } from '../../context/DebtorContext';
import { useSales } from '../../context/SalesContext';
import { formatNaira } from '../../lib/utils';
import Modal from '../ui/Modal';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { products } = useInventory();
  const { debtors } = useDebtors();
  const { sales } = useSales();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], debtors: [], sales: [] };

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedDebtors = debtors
      .filter((d) => d.name.toLowerCase().includes(q) || d.phone.includes(q))
      .slice(0, 5);

    const matchedSales = sales
      .filter((s) => s.id.toLowerCase().includes(q) || s.items.some((i) => i.productName.toLowerCase().includes(q)))
      .slice(0, 4);

    return { products: matchedProducts, debtors: matchedDebtors, sales: matchedSales };
  }, [query, products, debtors, sales]);

  const hasAnyResults =
    results.products.length > 0 || results.debtors.length > 0 || results.sales.length > 0;

  return (
    <Modal open={open} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3.5 text-muted pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a product, customer, sale ID..."
            className="w-full h-12 pl-11 pr-10 bg-page-bg rounded-xl text-text border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 text-muted hover:text-text rounded-full hover:bg-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 divide-y divide-border">
          {query.trim() === '' ? (
            <div className="py-10 text-center text-xs text-muted">
              Start typing to search products, customers, and transactions across the store.
            </div>
          ) : !hasAnyResults ? (
            <div className="py-10 text-center text-xs text-muted">
              No matching products, customers, or sales found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* Products */}
              {results.products.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    <Package size={14} className="text-primary" />
                    <span>Products</span>
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          navigate('/inventory');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-page-bg transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="font-semibold text-sm text-text group-hover:text-primary transition-colors">
                            {p.name}
                          </div>
                          <div className="text-xs text-muted">
                            {p.category} &bull; {p.stockInPieces} pieces in stock
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-text">
                            {formatNaira(p.piecePrice)}
                          </div>
                          <div className="text-[11px] text-muted">
                            Bulk: {formatNaira(p.bulkPrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Debtors */}
              {results.debtors.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    <Users size={14} className="text-accent-amber" />
                    <span>Customers & Debtors</span>
                  </div>
                  <div className="space-y-1">
                    {results.debtors.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          navigate('/debtors');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-page-bg transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="font-semibold text-sm text-text group-hover:text-primary transition-colors">
                            {d.name}
                          </div>
                          <div className="text-xs text-muted">{d.phone}</div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-semibold ${
                              d.totalDebt > 0 ? 'text-danger' : 'text-success'
                            }`}
                          >
                            {d.totalDebt > 0 ? `Owes ${formatNaira(d.totalDebt)}` : 'Cleared'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales */}
              {results.sales.length > 0 && (
                <div className="pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    <Receipt size={14} className="text-accent-violet" />
                    <span>Sales Records</span>
                  </div>
                  <div className="space-y-1">
                    {results.sales.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          navigate('/');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-page-bg transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-text font-mono">
                            Sale #{s.id.slice(-6).toUpperCase()}
                          </div>
                          <div className="text-xs text-muted">
                            {s.items.length} item{s.items.length !== 1 ? 's' : ''} &bull;{' '}
                            {new Date(s.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-primary">
                          {formatNaira(s.totalAmount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
