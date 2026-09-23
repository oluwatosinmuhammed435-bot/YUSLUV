import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export type DateFilterOption = 'today' | '7days' | '30days' | 'all';

export interface DateFilterPillProps {
  value: DateFilterOption;
  onChange: (option: DateFilterOption) => void;
  className?: string;
}

const options: { id: DateFilterOption; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'all', label: 'All Time' },
];

export function DateFilterPill({
  value,
  onChange,
  className = '',
}: DateFilterPillProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = options.find((o) => o.id === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-tint text-primary hover:bg-emerald-100 text-xs font-semibold border border-primary/20 transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
      >
        <Calendar size={14} className="text-primary" />
        <span>{activeOption.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 text-primary ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-border shadow-lg py-1.5 z-30 animate-fade-in">
          {options.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary-tint text-primary font-semibold'
                    : 'text-text hover:bg-page-bg'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DateFilterPill;
