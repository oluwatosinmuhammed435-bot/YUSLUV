import { type HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export function Skeleton({
  variant = 'rounded',
  className = '',
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  return (
    <div
      className={`bg-page-bg/80 animate-pulse border border-border/40 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[12px] p-5 bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" className="w-10 h-10" />
          <div className="space-y-1.5">
            <Skeleton className="w-20 h-3.5" />
            <Skeleton className="w-14 h-2.5" />
          </div>
        </div>
        <Skeleton className="w-5 h-5 rounded" />
      </div>
      <Skeleton className="w-32 h-8" />
      <div className="flex justify-between pt-2 border-t border-border">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-24 h-3" />
      </div>
    </div>
  );
}

export default Skeleton;
