// ============================================
// Yusluv — Product Form (Add / Edit / Restock)
// ============================================

import { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { CATEGORIES, type Category, type Product } from '../../types';

interface ProductFormProps {
  product?: Product;
  mode?: 'add' | 'edit' | 'restock';
  onClose: () => void;
}

export default function ProductForm({ product, mode = 'add', onClose }: ProductFormProps) {
  const { addProduct, updateProduct, restockProduct } = useInventory();

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<Category>(product?.category || 'Provisions');
  const [bulkPrice, setBulkPrice] = useState(product?.bulkPrice?.toString() || '');
  const [piecePrice, setPiecePrice] = useState(product?.piecePrice?.toString() || '');
  const [piecesPerBulk, setPiecesPerBulk] = useState(product?.piecesPerBulk?.toString() || '12');
  const [stock, setStock] = useState(product?.stockInPieces?.toString() || '');
  const [lowThreshold, setLowThreshold] = useState(product?.lowStockThreshold?.toString() || '10');
  const [restockQty, setRestockQty] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'add' || mode === 'edit') {
      if (!name.trim()) return setError('Product name is required');
      if (!bulkPrice) return setError('Bulk price is required');
      if (!piecePrice) return setError('Piece price is required');
      if (!piecesPerBulk) return setError('Pieces per bulk is required');
      if (!stock) return setError('Initial stock is required');
    }

    setSaving(true);

    try {
      if (mode === 'restock' && product) {
        await restockProduct(product.id, parseInt(restockQty) || 0);
      } else if (mode === 'edit' && product) {
        await updateProduct(product.id, {
          name,
          category,
          bulkPrice: parseFloat(bulkPrice) || 0,
          piecePrice: parseFloat(piecePrice) || 0,
          piecesPerBulk: parseInt(piecesPerBulk) || 1,
          stockInPieces: parseInt(stock) || 0,
          lowStockThreshold: parseInt(lowThreshold) || 10,
        });
      } else {
        await addProduct({
          name,
          category,
          bulkPrice: parseFloat(bulkPrice) || 0,
          piecePrice: parseFloat(piecePrice) || 0,
          piecesPerBulk: parseInt(piecesPerBulk) || 1,
          stockInPieces: parseInt(stock) || 0,
          lowStockThreshold: parseInt(lowThreshold) || 10,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const title =
    mode === 'restock' ? `Restock: ${product?.name}` :
    mode === 'edit' ? 'Edit Product' : 'Add New Product';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end
      sm:items-center justify-center animate-fade-in">
      <div className="bg-[#161622] w-full max-w-md rounded-t-3xl sm:rounded-3xl
        max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center
              justify-center transition-colors"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4" noValidate>
          {mode === 'restock' ? (
            // Restock mode — simple qty input
            <div>
              <label className="block text-sm text-white/50 mb-1.5">
                Additional Pieces to Add
              </label>
              <input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder="e.g. 48"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                  text-white placeholder:text-white/20 focus:border-purple-500
                  focus:ring-1 focus:ring-purple-500/30 outline-none transition-all text-lg"
                autoFocus
                min="1"
                required
              />
              <p className="text-white/30 text-xs mt-1">
                Current stock: {product?.stockInPieces} pieces
              </p>
            </div>
          ) : (
            // Add / Edit mode
            <>
              <div>
                <label className="block text-sm text-white/50 mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Peak Milk"
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                    text-white placeholder:text-white/20 focus:border-purple-500
                    focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                    text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30
                    outline-none transition-all appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#161622]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Bulk Price (₦)</label>
                  <input
                    type="number"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    placeholder="e.g. 3600"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                      text-white placeholder:text-white/20 focus:border-purple-500
                      focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Piece Price (₦)</label>
                  <input
                    type="number"
                    value={piecePrice}
                    onChange={(e) => setPiecePrice(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                      text-white placeholder:text-white/20 focus:border-purple-500
                      focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Pieces per Bulk</label>
                  <input
                    type="number"
                    value={piecesPerBulk}
                    onChange={(e) => setPiecesPerBulk(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                      text-white placeholder:text-white/20 focus:border-purple-500
                      focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1.5">
                    Initial Stock (pcs)
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 48"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                      text-white placeholder:text-white/20 focus:border-purple-500
                      focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-1.5">
                  Low Stock Alert (pieces)
                </label>
                <input
                  type="number"
                  value={lowThreshold}
                  onChange={(e) => setLowThreshold(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10
                    text-white placeholder:text-white/20 focus:border-purple-500
                    focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                  min="0"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-semibold
              rounded-xl flex items-center justify-center gap-2 transition-all duration-150
              active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-purple-600/20 mt-2"
          >
            {mode === 'restock' ? (
              <><Plus size={18} /> Add Stock</>
            ) : (
              <><Save size={18} /> {mode === 'edit' ? 'Save Changes' : 'Add Product'}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
