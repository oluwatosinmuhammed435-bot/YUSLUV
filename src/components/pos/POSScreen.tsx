// ============================================
// Yusluv — POS Screen
// ============================================

import { useState, useMemo } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useSales } from '../../context/SalesContext';
import { CATEGORIES, type Category } from '../../types';
import { formatNaira } from '../../lib/utils';
import ProductCard from './ProductCard';
import CartDrawer from './CartDrawer';

export default function POSScreen() {
  const { products } = useInventory();
  const { addToCart, cartItemCount, cartTotal } = useSales();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        // Show in-stock items first
        if (a.stockInPieces === 0 && b.stockInPieces > 0) return 1;
        if (a.stockInPieces > 0 && b.stockInPieces === 0) return -1;
        return a.name.localeCompare(b.name);
      });
  }, [products, search, filterCategory]);

  return (
    <div className="px-4 py-3">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10
            text-white placeholder:text-white/25 focus:border-purple-500/50
            focus:ring-1 focus:ring-purple-500/20 outline-none transition-all text-sm"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        <button
          onClick={() => setFilterCategory('All')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${filterCategory === 'All'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filterCategory === c
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart size={48} className="text-white/10 mb-3" />
          <p className="text-white/30 text-sm">
            {products.length === 0
              ? 'Add products in the Inventory tab to start selling'
              : 'No products match your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-20 right-4 bg-purple-600 hover:bg-purple-500
            text-white rounded-2xl shadow-xl shadow-purple-600/30 px-4 h-12
            flex items-center gap-2 transition-all duration-200 active:scale-95 z-30
            animate-fade-in"
        >
          <ShoppingCart size={18} />
          <span className="font-semibold text-sm">{formatNaira(cartTotal)}</span>
          <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5
            rounded-md ml-1">
            {cartItemCount}
          </span>
        </button>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
