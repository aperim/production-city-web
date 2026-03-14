'use client';

import {
  useCallback,
  useId,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { cn } from '../../lib/utils';

/** Column sort direction */
export type SortDirection = 'asc' | 'desc' | null;

/** Sort state */
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** Column definition */
export interface DataTableColumn<T> {
  /** Unique column identifier */
  id: string;
  /** Column header label */
  header: ReactNode;
  /** Accessor: key of T or custom renderer */
  accessor: keyof T | ((row: T) => ReactNode);
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Minimum column width in px */
  minWidth?: number;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is visible by default */
  visible?: boolean;
}

/** Row action */
export interface DataTableAction<T> {
  /** Label for the action */
  label: string;
  /** Action handler */
  onClick: (row: T) => void;
  /** Whether to show this action */
  show?: (row: T) => boolean;
}

/**
 * Props for the DataTable organism.
 */
export interface DataTableProps<T extends { id: string | number }> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Loading state — shows skeleton rows */
  loading?: boolean;
  /** Error message */
  error?: ReactNode;
  /**
   * Table caption for accessibility.
   */
  caption?: string;
  /** Row selection mode */
  selectionMode?: 'none' | 'single' | 'multi';
  /** Currently selected row ids */
  selectedIds?: Set<string | number>;
  /** Called when selection changes */
  onSelectionChange?: (ids: Set<string | number>) => void;
  /** Row expansion renderer */
  expandedRowRenderer?: (row: T) => ReactNode;
  /** Row actions */
  rowActions?: DataTableAction<T>[];
  /** Pagination: current page (1-based) */
  page?: number;
  /** Pagination: total pages */
  totalPages?: number;
  /** Pagination: rows per page */
  pageSize?: number;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** External sort state (controlled) */
  sortState?: SortState;
  /** Called when sort changes */
  onSortChange?: (sort: SortState) => void;
  /** Density */
  density?: 'comfortable' | 'compact';
  /** Additional class names */
  className?: string;
  /**
   * Whether to show column visibility toggle.
   * @default false
   */
  showColumnToggle?: boolean;
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-sm bg-muted animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (!direction) {
    return (
      <svg aria-hidden="true" className="inline ml-1 opacity-30" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2L4 7h8L8 2zM8 14l4-5H4l4 5z" />
      </svg>
    );
  }
  if (direction === 'asc') {
    return (
      <svg aria-hidden="true" className="inline ml-1" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 2L4 9h8L8 2z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="inline ml-1" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 14L4 7h8L8 14z" />
    </svg>
  );
}

/**
 * DataTable organism.
 *
 * Sortable columns, row selection (single/multi), row expansion,
 * pagination, column visibility toggle, loading/empty/error states.
 * WCAG 2.2 AA: proper table semantics, aria-sort, selection state.
 * ReactNode only — no HTML injection.
 *
 * Virtualization decision: for 1000+ rows, use external windowing
 * (e.g., TanStack Virtual) at the app level. DataTable itself focuses
 * on API purity; virtualization is a rendering concern left to the consumer.
 */
export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  error,
  caption,
  selectionMode = 'none',
  selectedIds,
  onSelectionChange,
  expandedRowRenderer,
  rowActions,
  page,
  totalPages,
  onPageChange,
  sortState: controlledSort,
  onSortChange,
  density = 'comfortable',
  className,
  showColumnToggle = false,
}: DataTableProps<T>) {
  const instanceId = useId();
  const [internalSort, setInternalSort] = useState<SortState>({ columnId: '', direction: null });
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter((c) => c.visible !== false).map((c) => c.id)),
  );
  const [showToggle, setShowToggle] = useState(false);

  const sort = controlledSort ?? internalSort;

  const handleSort = useCallback(
    (columnId: string) => {
      const nextDirection: SortDirection =
        sort.columnId === columnId
          ? sort.direction === 'asc'
            ? 'desc'
            : sort.direction === 'desc'
            ? null
            : 'asc'
          : 'asc';
      const next: SortState = { columnId, direction: nextDirection };
      if (onSortChange) {
        onSortChange(next);
      } else {
        setInternalSort(next);
      }
    },
    [sort, onSortChange],
  );

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;
    const allIds = new Set(data.map((r) => r.id));
    const allSelected = data.every((r) => selectedIds?.has(r.id));
    onSelectionChange(allSelected ? new Set() : allIds);
  }, [data, selectedIds, onSelectionChange]);

  const handleSelectRow = useCallback(
    (id: string | number) => {
      if (!onSelectionChange || !selectedIds) return;
      if (selectionMode === 'single') {
        onSelectionChange(new Set([id]));
        return;
      }
      const next = new Set(selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onSelectionChange(next);
    },
    [selectionMode, selectedIds, onSelectionChange],
  );

  const toggleExpand = useCallback((id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleColumn = useCallback((colId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) {
        next.delete(colId);
      } else {
        next.add(colId);
      }
      return next;
    });
  }, []);

  const visibleCols = columns.filter((c) => visibleColumns.has(c.id));

  const colCount =
    visibleCols.length +
    (selectionMode !== 'none' ? 1 : 0) +
    (expandedRowRenderer ? 1 : 0) +
    (rowActions?.length ? 1 : 0);

  const cellPadding = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';
  const headerPadding = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  const isEmpty = !loading && !error && data.length === 0;

  const captionId = `table-caption-${instanceId}`;

  return (
    <div className={cn('w-full', className)}>
      {showColumnToggle && (
        <div className="mb-2 flex justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowToggle((s) => !s)}
              aria-expanded={showToggle}
              aria-haspopup="listbox"
              className="rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150"
            >
              Columns
            </button>
            {showToggle && (
              <div
                role="listbox"
                aria-multiselectable="true"
                aria-label="Toggle columns"
                className="absolute end-0 z-20 mt-1 w-40 rounded-md border border-border bg-background shadow-md py-1"
              >
                {columns.map((col) => (
                  <div
                    key={col.id}
                    role="option"
                    aria-selected={visibleColumns.has(col.id)}
                    onClick={() => toggleColumn(col.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={visibleColumns.has(col.id)}
                      className="pointer-events-none"
                      aria-hidden="true"
                    />
                    {col.header}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-md border border-border">
        <table
          className="w-full text-sm border-collapse"
          aria-labelledby={caption ? captionId : undefined}
          aria-busy={loading}
        >
          {caption && (
            <caption id={captionId} className="sr-only">
              {caption}
            </caption>
          )}
          <thead className="bg-muted/50">
            <tr>
              {selectionMode === 'multi' && (
                <th className={cn(headerPadding, 'w-10 text-left')}>
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={data.length > 0 && data.every((r) => selectedIds?.has(r.id))}
                    onChange={handleSelectAll}
                    className="rounded-xs border-border"
                  />
                </th>
              )}
              {selectionMode === 'single' && (
                <th className={cn(headerPadding, 'w-10')} />
              )}
              {expandedRowRenderer && <th className={cn(headerPadding, 'w-10')} />}
              {visibleCols.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={
                    sort.columnId === col.id
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : col.sortable
                      ? 'none'
                      : undefined
                  }
                  style={{ minWidth: col.minWidth } as CSSProperties}
                  className={cn(
                    headerPadding,
                    'font-medium text-foreground text-left select-none',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer hover:bg-muted/80',
                  )}
                  onClick={col.sortable ? () => handleSort(col.id) : undefined}
                >
                  {col.header}
                  {col.sortable && (
                    <SortIcon
                      direction={sort.columnId === col.id ? sort.direction : null}
                    />
                  )}
                </th>
              ))}
              {rowActions?.length ? (
                <th className={cn(headerPadding, 'w-24 text-right')}>
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} colCount={colCount} />
              ))}
            {error && !loading && (
              <tr>
                <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-destructive">
                  {error}
                </td>
              </tr>
            )}
            {isEmpty && (
              <tr>
                <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No data to display.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              data.map((row) => {
                const isExpanded = expandedIds.has(row.id);
                const isSelected = selectedIds?.has(row.id) ?? false;
                return (
                  <>
                    <tr
                      key={row.id}
                      aria-selected={selectionMode !== 'none' ? isSelected : undefined}
                      className={cn(
                        'hover:bg-muted/30 transition-colors duration-100',
                        isSelected && 'bg-muted/50',
                      )}
                    >
                      {selectionMode === 'multi' && (
                        <td className={cn(cellPadding, 'w-10')}>
                          <input
                            type="checkbox"
                            aria-label={`Select row ${row.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.id)}
                            className="rounded-xs border-border"
                          />
                        </td>
                      )}
                      {selectionMode === 'single' && (
                        <td className={cn(cellPadding, 'w-10')}>
                          <input
                            type="radio"
                            name={`${instanceId}-row-select`}
                            aria-label={`Select row ${row.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectRow(row.id)}
                          />
                        </td>
                      )}
                      {expandedRowRenderer && (
                        <td className={cn(cellPadding, 'w-10')}>
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                            onClick={() => toggleExpand(row.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors duration-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            <svg
                              aria-hidden="true"
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className={cn('transition-transform duration-150', isExpanded && 'rotate-90')}
                            >
                              <path d="M6 3l6 5-6 5V3z" />
                            </svg>
                          </button>
                        </td>
                      )}
                      {visibleCols.map((col) => {
                        const value =
                          typeof col.accessor === 'function'
                            ? col.accessor(row)
                            : (row[col.accessor] as ReactNode);
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              cellPadding,
                              'text-foreground',
                              col.align === 'center' && 'text-center',
                              col.align === 'right' && 'text-right',
                            )}
                          >
                            {value}
                          </td>
                        );
                      })}
                      {rowActions?.length ? (
                        <td className={cn(cellPadding, 'text-right')}>
                          <div className="flex items-center justify-end gap-1">
                            {rowActions
                              .filter((a) => a.show?.(row) !== false)
                              .map((action) => (
                                <button
                                  key={action.label}
                                  type="button"
                                  onClick={() => action.onClick(row)}
                                  className="rounded-sm px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-100 min-h-[44px]"
                                >
                                  {action.label}
                                </button>
                              ))}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                    {expandedRowRenderer && isExpanded && (
                      <tr key={`${row.id}-expanded`} className="bg-muted/20">
                        <td colSpan={colCount} className={cellPadding}>
                          {expandedRowRenderer(row)}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
          </tbody>
        </table>
      </div>

      {totalPages && totalPages > 1 && onPageChange && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange((page ?? 1) - 1)}
              disabled={(page ?? 1) <= 1}
              aria-label="Previous page"
              className="rounded-sm border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ring min-h-[44px]"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange((page ?? 1) + 1)}
              disabled={(page ?? 1) >= totalPages}
              aria-label="Next page"
              className="rounded-sm border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-ring min-h-[44px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
