// ============================================
// Yusluv — OPay-Style PinPad Component
// ============================================

import { Delete } from 'lucide-react';

interface PinPadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onConfirm?: () => void;
  disabled?: boolean;
  /** If true, pressing the 4th digit auto-confirms (no OK button needed) */
  autoSubmit?: boolean;
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
    <div className="flex flex-col gap-3 w-full max-w-[300px] mx-auto select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-3 justify-center">
          {row.map((key, ci) => {
            if (key === '') {
              // Bottom-left: OK button or empty spacer
              return onConfirm ? (
                <button
                  key={ci}
                  onClick={onConfirm}
                  disabled={disabled}
                  className="w-20 h-20 rounded-full bg-purple-600/20 border border-purple-500/30
                    text-purple-300 font-bold text-sm tracking-wider transition-all duration-150
                    active:scale-90 active:bg-purple-600/40 disabled:opacity-30
                    disabled:cursor-not-allowed hover:bg-purple-600/30 hover:border-purple-400/50"
                >
                  OK
                </button>
              ) : (
                <div key={ci} className="w-20 h-20" />
              );
            }

            if (key === 'del') {
              return (
                <button
                  key={ci}
                  onClick={onDelete}
                  disabled={disabled}
                  className="w-20 h-20 rounded-full bg-white/5 border border-white/10
                    text-white/60 flex items-center justify-center transition-all duration-150
                    active:scale-90 active:bg-white/15 disabled:opacity-30 hover:bg-white/10
                    hover:border-white/20 hover:text-white/80"
                >
                  <Delete size={20} />
                </button>
              );
            }

            return (
              <button
                key={ci}
                onClick={() => onDigit(key)}
                disabled={disabled}
                className="w-20 h-20 rounded-full bg-white/[0.07] border border-white/10
                  text-white text-2xl font-light transition-all duration-100
                  active:scale-90 active:bg-purple-600/30 active:border-purple-500/40
                  disabled:opacity-30 hover:bg-white/12 hover:border-white/20
                  flex items-center justify-center"
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
