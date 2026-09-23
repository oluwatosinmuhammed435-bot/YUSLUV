import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

    const sizeStyles = {
      sm: 'h-9 px-3.5 text-xs gap-1.5 min-w-[36px]',
      md: 'h-11 px-4 text-sm gap-2 min-w-[44px]',
      lg: 'h-12 px-6 text-base gap-2.5 min-w-[48px]',
    };

    const variantStyles = {
      primary:
        'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20 font-semibold',
      secondary:
        'bg-primary-tint text-primary hover:bg-emerald-100/80 border border-primary/20 font-semibold',
      outline:
        'bg-white text-text border border-border hover:bg-page-bg hover:border-muted/30 font-medium',
      ghost:
        'bg-transparent text-muted hover:text-text hover:bg-black/5 font-medium',
      danger:
        'bg-danger text-white hover:bg-red-600 shadow-sm shadow-danger/20 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === 'right' && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
