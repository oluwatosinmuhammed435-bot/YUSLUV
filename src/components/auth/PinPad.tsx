// ============================================
// Yusluv — PinPad Component
// ============================================

import { Delete } from 'lucide-react';

interface PinPadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export default function PinPad({ onDigit, onDelete, onConfirm, disabled }: PinPadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
      {keys.map((key, i) => {
        if (key === '') {
          return (
            <button
              key={i}
              onClick={onConfirm}
              disabled={disabled}
              className="h-16 rounded-2xl bg-purple-600 hover:bg-purple-500
                text-white font-bold text-sm transition-all duration-150
                active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                shadow-lg shadow-purple-600/20"
            >
              OK
            </button>
          );
        }
        if (key === 'del') {
          return (
            <button
              key={i}
              onClick={onDelete}
              disabled={disabled}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/10
                text-white/70 flex items-center justify-center transition-all
                duration-150 active:scale-95 disabled:opacity-40"
            >
              <Delete size={22} />
            </button>
          );
        }
        return (
          <button
            key={i}
            onClick={() => onDigit(key)}
            disabled={disabled}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10
              text-white text-xl font-semibold transition-all duration-150
              active:scale-95 active:bg-purple-600/30 disabled:opacity-40"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
