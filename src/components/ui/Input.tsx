import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      iconLeft,
      iconRight,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-text mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {iconLeft && (
            <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
              {iconLeft}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full h-11 bg-white text-text text-sm rounded-xl border transition-all duration-150 outline-none placeholder:text-muted/60 disabled:bg-page-bg disabled:text-muted ${
              iconLeft ? 'pl-10' : 'pl-3.5'
            } ${iconRight ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            } ${className}`}
            {...props}
          />

          {iconRight && (
            <div className="absolute right-3.5 text-muted flex items-center justify-center">
              {iconRight}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
