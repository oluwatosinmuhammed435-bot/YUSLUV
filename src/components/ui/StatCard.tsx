import { type ReactNode } from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string;
  icon: ReactNode;
  variant?: 'filled' | 'outlined';
  trend?: {
    value: string;
    isUp: boolean;
  };
  periodText?: string;
  deltaText?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  subtitle,
  value,
  icon,
  variant = 'outlined',
  trend,
  periodText = 'this week',
  deltaText,
  onClick,
  className = '',
}: StatCardProps) {
  const isFilled = variant === 'filled';

  return (
    <div
      onClick={onClick}
      className={`rounded-[12px] p-5 transition-all duration-150 relative ${
        isFilled
          ? 'bg-primary text-white shadow-sm shadow-primary/20'
          : 'bg-card text-text border border-border shadow-xs'
      } ${onClick ? 'cursor-pointer hover:border-primary/40' : ''} ${className}`}
    >
      {/* Top Header: Title, Subtitle, Chevron & Icon */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isFilled
                ? 'bg-white/20 text-white backdrop-blur-xs'
                : 'bg-primary text-white shadow-xs'
            }`}
          >
            {icon}
          </div>
          <div>
            <h3
              className={`text-sm font-medium tracking-tight ${
                isFilled ? 'text-white' : 'text-text'
              }`}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  isFilled ? 'text-white/70' : 'text-muted'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label="View details"
          className={`p-1 rounded-lg transition-colors ${
            isFilled ? 'text-white/60 hover:text-white' : 'text-muted hover:text-text'
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Main Big Number (~32px, weight 600-700) */}
      <div className="mt-2 mb-3">
        <span
          className={`text-2xl sm:text-[30px] font-bold tracking-tight leading-none ${
            isFilled ? 'text-white' : 'text-text'
          }`}
        >
          {value}
        </span>
      </div>

      {/* Bottom Row: Trend Left, Delta + Period Right */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-current/10">
        {trend ? (
          <div
            className={`flex items-center gap-1 font-semibold ${
              isFilled
                ? trend.isUp
                  ? 'text-emerald-200'
                  : 'text-red-200'
                : trend.isUp
                ? 'text-success'
                : 'text-danger'
            }`}
          >
            {trend.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend.value}</span>
          </div>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1 text-[11px]">
          {deltaText && (
            <span
              className={`font-semibold ${
                isFilled ? 'text-white' : 'text-text'
              }`}
            >
              {deltaText}
            </span>
          )}
          <span className={isFilled ? 'text-white/70' : 'text-muted'}>
            {periodText}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
