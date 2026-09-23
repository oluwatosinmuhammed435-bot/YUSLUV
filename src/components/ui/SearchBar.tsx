import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  sizeVariant?: 'sm' | 'md' | 'lg';
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search...',
      className = '',
      sizeVariant = 'md',
      ...props
    },
    ref
  ) => {
    const heightStyles = {
      sm: 'h-9 text-xs pl-9 pr-8',
      md: 'h-11 text-sm pl-10 pr-9',
      lg: 'h-12 text-base pl-11 pr-10',
    };

    const iconSize = sizeVariant === 'sm' ? 14 : sizeVariant === 'lg' ? 18 : 16;

    const hasValue = Boolean(value && String(value).length > 0);

    return (
      <div className={`relative flex items-center w-full ${className}`}>
        <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
          <Search size={iconSize} />
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-white text-text rounded-full border border-border transition-all duration-150 outline-none placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 ${heightStyles[sizeVariant]}`}
          {...props}
        />

        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 text-muted hover:text-text rounded-full hover:bg-page-bg transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
