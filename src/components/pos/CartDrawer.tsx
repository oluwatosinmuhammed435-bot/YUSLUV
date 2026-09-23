import Modal from '../ui/Modal';
import CartPanel from './CartPanel';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="bottomSheet"
      maxWidth="md"
    >
      <div className="h-[75vh] -m-6 flex flex-col">
        <CartPanel onSuccess={onClose} />
      </div>
    </Modal>
  );
}
