import { type ReactNode } from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}: TabsProps<T>) {
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-xs sm:text-sm gap-2',
  };

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center justify-center font-medium rounded-full shrink-0 transition-all duration-150 active:scale-95 cursor-pointer ${
              sizeStyles[size]
            } ${
              isActive
                ? 'bg-primary text-white shadow-xs font-semibold'
                : 'bg-white text-muted hover:text-text border border-border hover:border-muted/40'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-page-bg text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
