import { type ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[12px] bg-card border border-border ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mb-4 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-muted max-w-sm mt-1 mb-5">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
