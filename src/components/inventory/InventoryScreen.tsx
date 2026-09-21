// ============================================
// Yusluv — Inventory Screen
// ============================================

import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Search, Package, Edit3, RefreshCw, Trash2, AlertTriangle, ChevronDown } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { CATEGORIES, type Category } from '../../types';
import { formatNaira } from '../../lib/utils';
import { downloadCSVTemplate, parseCSVFile } from '../../lib/export';
import StockBadge from './StockBadge';
import ProductForm from './ProductForm';
import type { Product } from '../../types';

export default function InventoryScreen() {
  const { products, removeProduct, getLowStockProducts, bulkAddProducts } = useInventory();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'restock' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(30);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset limit when search or category changes
  useEffect(() => {
    setVisibleLimit(30);
  }, [search, filterCategory]);

  const lowStockProducts = getLowStockProducts();

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search, filterCategory]);

  const openForm = (mode: 'add' | 'edit' | 'restock', product?: Product) => {
    setSelectedProduct(product);
    setFormMode(mode);
  };

  const handleDelete = async (id: string) => {
    await removeProduct(id);
    setDeleteConfirm(null);
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const rows = await parseCSVFile(file);
      const newProducts = rows.map((row) => ({
        name: row[0],
        category: (CATEGORIES.includes(row[1] as Category) ? row[1] : 'Provisions') as Category,
        bulkPrice: parseFloat(row[2]) || 0,
        piecePrice: parseFloat(row[3]) || 0,
        piecesPerBulk: parseInt(row[4]) || 1,
        stockInPieces: parseInt(row[5]) || 0,
        lowStockThreshold: parseInt(row[6]) || 10,
      }));
      await bulkAddProducts(newProducts);
      alert(`Successfully imported ${newProducts.length} products!`);
    } catch {
      alert('Failed to import CSV. Please make sure you are using the correct template format.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="px-4 py-3">
      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl
          flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">
            <strong>{lowStockProducts.length}</strong> item{lowStockProducts.length > 1 ? 's' : ''} running low on stock
          </p>
        </div>
      )}

      {/* Actions row: Search + Bulk Upload */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
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
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleBulkUpload}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="h-11 px-4 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20
            hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          {isUploading ? '...' : 'CSV Import'}
        </button>
      </div>

      {/* Category filter pills */}
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

      {/* Product count & Template Download */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-xs">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={downloadCSVTemplate}
          className="text-purple-400 text-xs hover:underline"
        >
          Download CSV Template
        </button>
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package size={48} className="text-white/10 mb-3" />
          <p className="text-white/30 text-sm">
            {products.length === 0 ? 'No products yet' : 'No products match your search'}
          </p>
          {products.length === 0 && (
            <p className="text-white/20 text-xs mt-1">Tap the + button to add your first product</p>
          )}
        </div>
      ) : (
        <div className="space-y-2 pb-24">
          {filtered.slice(0, visibleLimit).map((product) => (
            <div
              key={product.id}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5
                hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium text-sm truncate">{product.name}</h3>
                    <StockBadge
                      stock={product.stockInPieces}
                      threshold={product.lowStockThreshold}
                      piecesPerBulk={product.piecesPerBulk}
                    />
                  </div>
                  <p className="text-white/30 text-xs mb-1.5">{product.category}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-purple-400">
                      Bulk: {formatNaira(product.bulkPrice)}
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="text-white/50">
                      Piece: {formatNaira(product.piecePrice)}
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="text-white/30">
                      {product.piecesPerBulk} pcs/bulk
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100
                  transition-opacity">
                  <button
                    onClick={() => openForm('restock', product)}
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20
                      flex items-center justify-center transition-colors"
                    title="Restock"
                  >
                    <RefreshCw size={14} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => openForm('edit', product)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10
                      flex items-center justify-center transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={14} className="text-white/50" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20
                      flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* Delete confirmation */}
              {deleteConfirm === product.id && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center
                  justify-between animate-fade-in">
                  <p className="text-red-400 text-xs">Delete this product?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs
                        hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs
                        hover:bg-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length > visibleLimit && (
            <button
              onClick={() => setVisibleLimit(v => v + 30)}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80
                transition-colors text-sm font-medium"
            >
              <ChevronDown size={16} />
              Load More Products
            </button>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => openForm('add')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-purple-600 hover:bg-purple-500
          rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center
          transition-all duration-150 active:scale-90 z-30"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Product Form Modal */}
      {formMode && (
        <ProductForm
          product={selectedProduct}
          mode={formMode}
          onClose={() => {
            setFormMode(null);
            setSelectedProduct(undefined);
          }}
        />
      )}
    </div>
  );
}
