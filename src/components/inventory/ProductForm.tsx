import { useState } from 'react';
import { Plus, RefreshCw, Edit3 } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { CATEGORIES, type Category, type Product } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

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
  const [restockType, setRestockType] = useState<'pieces' | 'bulks'>('pieces');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isRestock = mode === 'restock';
  const isEdit = mode === 'edit';

  const modalTitle = isRestock
    ? `Restock: ${product?.name}`
    : isEdit
    ? `Edit Product`
    : `Add New Product`;

  const modalSubtitle = isRestock
    ? `Quickly add inventory units to this item.`
    : isEdit
    ? `Update pricing, packaging, and threshold details.`
    : `Add a new item to your store catalog with bulk & piece rates.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isRestock) {
      if (!name.trim()) return setError('Product name is required');
      if (!bulkPrice) return setError('Bulk price is required');
      if (!piecePrice) return setError('Piece price is required');
      if (!piecesPerBulk) return setError('Pieces per bulk is required');
      if (!stock) return setError('Current stock is required');
    } else {
      if (!restockQty || parseInt(restockQty) <= 0) {
        return setError('Please enter a valid restock quantity');
      }
    }

    setSaving(true);

    try {
      if (isRestock && product) {
        const qty = parseInt(restockQty) || 0;
        const piecesToAdd = restockType === 'bulks' ? qty * product.piecesPerBulk : qty;
        await restockProduct(product.id, piecesToAdd);
      } else if (isEdit && product) {
        await updateProduct(product.id, {
          name: name.trim(),
          category,
          bulkPrice: parseFloat(bulkPrice) || 0,
          piecePrice: parseFloat(piecePrice) || 0,
          piecesPerBulk: parseInt(piecesPerBulk) || 1,
          stockInPieces: parseInt(stock) || 0,
          lowStockThreshold: parseInt(lowThreshold) || 10,
        });
      } else {
        await addProduct({
          name: name.trim(),
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
      console.error('Save product error:', err);
      setError('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-danger rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {isRestock ? (
          /* RESTOCK MODE */
          <div className="space-y-4">
            <div className="p-3.5 bg-page-bg rounded-xl border border-border flex items-center justify-between text-xs">
              <div>
                <p className="text-muted">Current Stock Available</p>
                <p className="text-base font-bold text-text mt-0.5">
                  {product?.stockInPieces || 0} pieces
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted">Packaging Ratio</p>
                <p className="text-text font-semibold mt-0.5">
                  1 bulk = {product?.piecesPerBulk || 1} pcs
                </p>
              </div>
            </div>

            {/* Restock Mode Toggle (Pieces vs Bulks) */}
            <div className="flex gap-2 p-1 bg-page-bg rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setRestockType('pieces')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  restockType === 'pieces'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                Add in Pieces
              </button>
              <button
                type="button"
                onClick={() => setRestockType('bulks')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  restockType === 'bulks'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                Add in Bulks / Cartons
              </button>
            </div>

            <Input
              label={`Quantity to Add (${restockType === 'bulks' ? 'Bulk Packs' : 'Individual Pieces'})`}
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder="e.g. 24"
              required
              autoFocus
            />

            {restockQty && parseInt(restockQty) > 0 && product && (
              <p className="text-xs text-primary font-medium">
                New total stock will be{' '}
                <strong className="font-bold">
                  {product.stockInPieces +
                    (restockType === 'bulks'
                      ? parseInt(restockQty) * product.piecesPerBulk
                      : parseInt(restockQty))}{' '}
                  pieces
                </strong>
                .
              </p>
            )}

            <div className="flex gap-3 pt-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={saving}
                icon={<RefreshCw size={16} />}
              >
                Confirm Restock
              </Button>
            </div>
          </div>
        ) : (
          /* ADD / EDIT MODE */
          <div className="space-y-3.5">
            <Input
              label="Product Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Golden Penny Spaghetti 500g"
              required
              autoFocus
            />

            <div>
              <label className="block text-xs font-medium text-text mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full h-11 bg-white text-text text-sm rounded-xl border border-border px-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Row: Bulk Price vs Piece Price */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Bulk / Pack Price (₦)"
                type="number"
                step="any"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="e.g. 14000"
                required
              />
              <Input
                label="Piece / Unit Price (₦)"
                type="number"
                step="any"
                value={piecePrice}
                onChange={(e) => setPiecePrice(e.target.value)}
                placeholder="e.g. 700"
                required
              />
            </div>

            {/* Packaging & Stock Row */}
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Pcs Per Bulk"
                type="number"
                min="1"
                value={piecesPerBulk}
                onChange={(e) => setPiecesPerBulk(e.target.value)}
                placeholder="12"
                required
              />
              <Input
                label="Stock (in pieces)"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                required
              />
              <Input
                label="Low Alert At"
                type="number"
                min="1"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(e.target.value)}
                placeholder="10"
                required
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={saving}
                icon={isEdit ? <Edit3 size={16} /> : <Plus size={16} />}
              >
                {isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
