// ============================================
// Yusluv — Clean Emerald PIN Pad
// ============================================

import { Delete } from 'lucide-react';

interface PinPadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onConfirm?: () => void;
  disabled?: boolean;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export default function PinPad({
  onDigit,
  onDelete,
  onConfirm,
  disabled,
}: PinPadProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[280px] mx-auto select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-3 justify-center">
          {row.map((key, ci) => {
            if (key === '') {
              return onConfirm ? (
                <button
                  key={ci}
                  type="button"
                  onClick={onConfirm}
                  disabled={disabled}
                  className="w-18 h-18 rounded-full bg-primary-tint border border-primary/20 text-primary font-bold text-sm tracking-wider transition-all duration-150 active:scale-90 active:bg-primary active:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-100 cursor-pointer flex items-center justify-center shadow-xs"
                >
                  OK
                </button>
              ) : (
                <div key={ci} className="w-18 h-18" />
              );
            }

            if (key === 'del') {
              return (
                <button
                  key={ci}
                  type="button"
                  onClick={onDelete}
                  disabled={disabled}
                  className="w-18 h-18 rounded-full bg-white border border-border text-muted hover:text-text flex items-center justify-center transition-all duration-150 active:scale-90 active:bg-page-bg disabled:opacity-30 cursor-pointer shadow-xs"
                  aria-label="Delete digit"
                >
                  <Delete size={20} />
                </button>
              );
            }

            return (
              <button
                key={ci}
                type="button"
                onClick={() => onDigit(key)}
                disabled={disabled}
                className="w-18 h-18 rounded-full bg-white border border-border text-text text-2xl font-medium transition-all duration-100 active:scale-90 active:bg-primary-tint active:border-primary/40 disabled:opacity-30 hover:border-primary/30 hover:bg-page-bg/60 flex items-center justify-center cursor-pointer shadow-xs"
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
