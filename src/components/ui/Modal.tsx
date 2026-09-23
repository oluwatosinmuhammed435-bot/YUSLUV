import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'modal' | 'bottomSheet' | 'responsive';
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  variant = 'responsive',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidthStyles = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
  };

  const isBottomSheetOnly = variant === 'bottomSheet';
  const isResponsive = variant === 'responsive';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container / Sheet */}
      <div
        className={`relative z-10 w-full bg-white text-text shadow-xl flex flex-col max-h-[90vh] transition-all overflow-hidden ${
          isBottomSheetOnly
            ? 'rounded-t-[20px] animate-slide-up'
            : isResponsive
            ? 'rounded-t-[20px] sm:rounded-[16px] animate-slide-up sm:animate-scale-in border border-border ' +
              maxWidthStyles[maxWidth]
            : 'rounded-[16px] animate-scale-in border border-border ' +
              maxWidthStyles[maxWidth]
        }`}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-10 h-1 bg-border rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-border">
            <div>
              {title && (
                <h3 className="text-base font-semibold text-text tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-muted mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 text-muted hover:text-text rounded-lg hover:bg-page-bg transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-page-bg/50 border-t border-border flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
