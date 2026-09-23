import { type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (item: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState,
  className = '',
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full bg-card rounded-[12px] border border-border p-6 space-y-4">
        <div className="h-6 bg-page-bg rounded animate-pulse w-1/4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-page-bg rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`w-full overflow-x-auto bg-card rounded-[12px] border border-border ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-page-bg/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3.5 px-4 text-xs font-medium text-muted uppercase tracking-wider ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick
                  ? 'cursor-pointer hover:bg-primary-tint/30'
                  : 'hover:bg-page-bg/40'
              }`}
            >
              {columns.map((col) => {
                const cellContent = col.render
                  ? col.render(item, index)
                  : ((item as Record<string, unknown>)[col.key] as ReactNode);

                return (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 text-text ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
