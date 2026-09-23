import { type HTMLAttributes, type ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'danger' | 'amber' | 'violet' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: ReactNode;
}

export function Badge({
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    primary: 'bg-primary-tint text-primary border border-primary/20',
    success: 'bg-emerald-50 text-success border border-success/20',
    danger: 'bg-red-50 text-danger border border-danger/20',
    amber: 'bg-amber-50 text-accent-amber border border-accent-amber/20',
    violet: 'bg-purple-50 text-accent-violet border border-accent-violet/20',
    neutral: 'bg-page-bg text-muted border border-border',
  };

  const dotStyles = {
    primary: 'bg-primary',
    success: 'bg-success',
    danger: 'bg-danger',
    amber: 'bg-accent-amber',
    violet: 'bg-accent-violet',
    neutral: 'bg-muted',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full shrink-0 select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
