import { useState, useMemo } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSales } from '../../context/SalesContext';
import { CATEGORIES, type Category } from '../../types';
import { formatNaira } from '../../lib/utils';
import ProductCard from './ProductCard';
import CartPanel from './CartPanel';
import CartDrawer from './CartDrawer';
import SearchBar from '../ui/SearchBar';
import Tabs from '../ui/Tabs';
import EmptyState from '../ui/EmptyState';

export default function POSScreen() {
  const { products } = useInventory();
  const { addToCart, cartItemCount, cartTotal } = useSales();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        // In-stock products first
        if (a.stockInPieces === 0 && b.stockInPieces > 0) return 1;
        if (a.stockInPieces > 0 && b.stockInPieces === 0) return -1;
        return a.name.localeCompare(b.name);
      });
  }, [products, search, filterCategory]);

  const categoryTabs = [
    { id: 'All' as const, label: 'All Items' },
    ...CATEGORIES.map((c) => ({ id: c, label: c })),
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header bar on POS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Point of Sale</h1>
          <p className="text-xs sm:text-sm text-muted">
            Fast counter billing with instant piece/bulk toggles and credit checkout.
          </p>
        </div>
      </div>

      {/* Two-Pane Desktop / Tablet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Search, Category Chips & Products Grid (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search bar & Category filter */}
          <div className="space-y-3">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Quick search product name or barcode..."
            />

            <Tabs
              tabs={categoryTabs}
              activeTab={filterCategory}
              onChange={(cat) => setFilterCategory(cat)}
            />
          </div>

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package size={28} />}
              title="No products available"
              description={
                products.length === 0
                  ? 'Add items in the Inventory screen to start taking orders.'
                  : 'No products match your search or filter.'
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3.5 pb-20 lg:pb-0">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Sticky Desktop Cart Summary (4 cols on lg) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 h-[calc(100vh-110px)]">
          <CartPanel />
        </div>
      </div>

      {/* Mobile Sticky Bottom "View Cart" Floating Bar */}
      {cartItemCount > 0 && (
        <div className="lg:hidden fixed bottom-18 left-4 right-4 z-30 animate-slide-up">
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="w-full h-14 bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-primary/30 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                {cartItemCount}
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold block text-white/80">Order Total</span>
                <span className="text-base font-bold text-white leading-none">
                  {formatNaira(cartTotal)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-xl shadow-xs">
              <span>View Cart & Pay</span>
              <ShoppingCart size={14} />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Cart Bottom Sheet */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
      />
    </div>
  );
}
