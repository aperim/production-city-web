'use client';

import { cn } from '../../lib/utils';
import { DataTable, type DataTableColumn, type DataTableAction, type SortState } from '../DataTable/DataTable';

export interface CanvasTableProps<T extends { id: string | number }> {
  /** Column definitions (passed through to DataTable) */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Loading state */
  loading?: boolean;
  /** Table caption for accessibility */
  caption?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Row selection mode */
  selectionMode?: 'none' | 'single' | 'multi';
  /** Currently selected row ids */
  selectedIds?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (ids: Set<string | number>) => void;
  /** Row actions */
  rowActions?: DataTableAction<T>[];
  /** Pagination: current page */
  page?: number;
  /** Pagination: total pages */
  totalPages?: number;
  /** Pagination: rows per page */
  pageSize?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Sort state */
  sortState?: SortState;
  /** Sort change handler */
  onSortChange?: (sort: SortState) => void;
  /** CSV export handler — renders export button when provided */
  onExportCSV?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * Workspace-integrated data table. Wraps DataTable with CSV export and workspace context.
 */
export function CanvasTable<T extends { id: string | number }>({
  columns,
  data,
  loading,
  caption,
  emptyMessage,
  selectionMode,
  selectedIds,
  onSelectionChange,
  rowActions,
  page,
  totalPages,
  pageSize,
  onPageChange,
  sortState,
  onSortChange,
  onExportCSV,
  className,
}: CanvasTableProps<T>) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {onExportCSV && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors"
          >
            Export CSV
          </button>
        </div>
      )}
      <DataTable<T>
        columns={columns}
        data={data}
        loading={loading}
        caption={caption}
        error={!loading && data.length === 0 && emptyMessage ? emptyMessage : undefined}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        rowActions={rowActions}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        sortState={sortState}
        onSortChange={onSortChange}
      />
    </div>
  );
}
