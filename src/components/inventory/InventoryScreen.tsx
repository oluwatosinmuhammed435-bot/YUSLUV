import { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Package,
  Edit3,
  RefreshCw,
  Trash2,
  AlertTriangle,
  MoreVertical,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { CATEGORIES, type Category, type Product } from '../../types';
import { formatNaira } from '../../lib/utils';
import { downloadCSVTemplate, parseCSVFile, downloadInventoryCSV } from '../../lib/export';
import StockBadge from './StockBadge';
import ProductForm from './ProductForm';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import DataTable, { type Column } from '../ui/DataTable';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';

export default function InventoryScreen() {
  const { products, removeProduct, getLowStockProducts, bulkAddProducts, isLoading } = useInventory();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'restock' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const lowStockProducts = getLowStockProducts();

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search, filterCategory]);

  const openForm = (mode: 'add' | 'edit' | 'restock', product?: Product) => {
    setSelectedProduct(product);
    setFormMode(mode);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await removeProduct(deleteConfirm.id);
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
      alert('Failed to import CSV. Please ensure you are using the official template format.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
      setSecondaryMenuOpen(false);
    }
  };

  // Tabs for Categories
  const categoryTabs = [
    { id: 'All' as const, label: 'All Products', count: products.length },
    ...CATEGORIES.map((c) => ({
      id: c,
      label: c,
      count: products.filter((p) => p.category === c).length,
    })),
  ];

  // DataTable columns for desktop
  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (product) => {
        const initials = product.name.slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-text text-sm">{product.name}</div>
              <div className="text-xs text-muted">ID: #{product.id.slice(-6).toUpperCase()}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) => {
        const variantMap: Record<Category, 'primary' | 'amber' | 'violet' | 'neutral' | 'success'> = {
          Provisions: 'primary',
          Drugs: 'violet',
          Beverages: 'amber',
          Snacks: 'success',
          Toiletries: 'neutral',
          Electronics: 'violet',
          Other: 'neutral',
        };
        return (
          <Badge variant={variantMap[product.category] || 'neutral'} size="sm">
            {product.category}
          </Badge>
        );
      },
    },
    {
      key: 'stockInPieces',
      header: 'Stock Status',
      render: (product) => (
        <StockBadge
          stock={product.stockInPieces}
          threshold={product.lowStockThreshold}
          piecesPerBulk={product.piecesPerBulk}
        />
      ),
    },
    {
      key: 'piecePrice',
      header: 'Piece Price',
      align: 'right',
      render: (product) => (
        <span className="font-semibold text-text">{formatNaira(product.piecePrice)}</span>
      ),
    },
    {
      key: 'bulkPrice',
      header: 'Bulk Price',
      align: 'right',
      render: (product) => (
        <div>
          <div className="font-semibold text-text">{formatNaira(product.bulkPrice)}</div>
          <div className="text-[11px] text-muted">({product.piecesPerBulk} pcs/bulk)</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (product) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openForm('restock', product)}
            className="p-1.5 rounded-lg text-primary hover:bg-primary-tint transition-colors cursor-pointer"
            title="Restock"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={() => openForm('edit', product)}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-page-bg transition-colors cursor-pointer"
            title="Edit Details"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirm(product)}
            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Products & Inventory</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage your store catalog, piece/bulk pricing, and track replenishment levels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Secondary Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSecondaryMenuOpen(!secondaryMenuOpen)}
              className="h-11 px-3.5 rounded-xl border border-border bg-white text-muted hover:text-text hover:bg-page-bg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <FileSpreadsheet size={16} />
              <span className="text-xs font-semibold hidden md:inline">Spreadsheet Tools</span>
              <MoreVertical size={16} />
            </button>

            {secondaryMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setSecondaryMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-border shadow-lg py-1.5 z-30 animate-fade-in text-xs">
                  <button
                    onClick={() => {
                      downloadCSVTemplate();
                      setSecondaryMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-text hover:bg-page-bg transition-colors"
                  >
                    <Download size={15} className="text-primary" />
                    Download CSV Template
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-text hover:bg-page-bg transition-colors disabled:opacity-50"
                  >
                    <Upload size={15} className="text-blue-600" />
                    {isUploading ? 'Importing...' : 'Bulk Import (CSV)'}
                  </button>
                  <button
                    onClick={() => {
                      downloadInventoryCSV();
                      setSecondaryMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-text hover:bg-page-bg transition-colors"
                  >
                    <Download size={15} className="text-accent-amber" />
                    Export Inventory (CSV)
                  </button>
                </div>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleBulkUpload}
            />
          </div>

          {/* Primary Add Product Button */}
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={() => openForm('add')}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-accent-amber flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's are' : ' is'} below minimum threshold!
              </p>
              <p className="text-[11px] text-muted">
                Restock now to prevent stockouts at checkout.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 hover:bg-amber-100 text-accent-amber font-semibold"
            onClick={() => setFilterCategory('All')}
          >
            Review Items
          </Button>
        </div>
      )}

      {/* Search & Filter Chips */}
      <div className="space-y-3">
        <div className="max-w-md">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by product name, category, or ID..."
          />
        </div>

        <Tabs
          tabs={categoryTabs}
          activeTab={filterCategory}
          onChange={(cat) => setFilterCategory(cat)}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={(p) => p.id}
          loading={isLoading}
          emptyState={
            <EmptyState
              icon={<Package size={28} />}
              title="No products found"
              description={
                search || filterCategory !== 'All'
                  ? 'No items match your active search filter. Try clearing filters or searching for something else.'
                  : 'Your inventory catalog is currently empty. Tap "Add Product" to create your first stock item.'
              }
              action={
                search || filterCategory !== 'All' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setFilterCategory('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => openForm('add')}>
                    + Add First Product
                  </Button>
                )
              }
            />
          }
        />
      </div>

      {/* Mobile Card List View */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title="No products found"
            description="Try changing your search query or category filter."
          />
        ) : (
          filtered.map((product) => {
            const initials = product.name.slice(0, 2).toUpperCase();
            return (
              <div
                key={product.id}
                className="bg-card p-4 rounded-xl border border-border shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text text-sm">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted">{product.category}</span>
                        <span className="text-muted/40">&bull;</span>
                        <span className="text-[11px] text-muted font-mono">
                          #{product.id.slice(-5).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <StockBadge
                    stock={product.stockInPieces}
                    threshold={product.lowStockThreshold}
                    piecesPerBulk={product.piecesPerBulk}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                  <div className="p-2 bg-page-bg rounded-lg">
                    <span className="text-muted text-[10px] block">Piece Price</span>
                    <span className="font-semibold text-text text-sm">
                      {formatNaira(product.piecePrice)}
                    </span>
                  </div>
                  <div className="p-2 bg-page-bg rounded-lg">
                    <span className="text-muted text-[10px] block">Bulk Price</span>
                    <span className="font-semibold text-text text-sm">
                      {formatNaira(product.bulkPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    icon={<RefreshCw size={14} />}
                    onClick={() => openForm('restock', product)}
                  >
                    Restock
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Edit3 size={14} />}
                    onClick={() => openForm('edit', product)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:bg-red-50"
                    icon={<Trash2 size={14} />}
                    onClick={() => setDeleteConfirm(product)}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit / Restock Modal */}
      {formMode && (
        <ProductForm
          mode={formMode}
          product={selectedProduct}
          onClose={() => setFormMode(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          open={true}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Product Deletion"
          subtitle={`Are you sure you want to permanently delete "${deleteConfirm.name}"?`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted">
              This action cannot be undone. Any previous sales records that contain this item will preserve the historical name, but this product will no longer appear in the catalog or inventory.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
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
