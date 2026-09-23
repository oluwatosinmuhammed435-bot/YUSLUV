import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  const { getLowStockProducts } = useInventory();
  const navigate = useNavigate();
  const lowStock = getLowStockProducts();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Store Notifications"
      subtitle={`${lowStock.length} item${lowStock.length !== 1 ? 's' : ''} require attention`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {lowStock.length === 0 ? (
          <div className="py-12 text-center text-muted text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-success flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            All products are sufficiently stocked. No low-stock warnings right now!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-accent-amber flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text">{product.name}</h4>
                    <p className="text-xs text-muted">
                      {product.stockInPieces} pieces left (Threshold: {product.lowStockThreshold})
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigate('/inventory');
                    onClose();
                  }}
                  icon={<ArrowRight size={14} />}
                  iconPosition="right"
                >
                  Restock
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
