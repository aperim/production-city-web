'use client';

import { cn } from '../../lib/utils';
import { EoiTable, type EoiTableItem, type EoiPagination } from '../EoiTable/EoiTable';
import { EoiDetailPanel, type EoiDetail } from '../EoiDetailPanel/EoiDetailPanel';

/**
 * Props for the EoiCanvas organism.
 *
 * Permission: Uses `audit:read` as EOI-specific permission does not yet exist.
 * Track in future issue.
 * @see https://github.com/productioncity/holding/issues/445
 */
export interface EoiCanvasProps {
  /** EOI items to display. */
  items: EoiTableItem[];
  /** Pagination state. */
  pagination: EoiPagination;
  /** Page change handler. */
  onPageChange: (page: number) => void;
  /** Search handler. */
  onSearch: (query: string) => void;
  /** Category filter handler. */
  onCategoryFilter: (category: string) => void;
  /** Status filter handler. */
  onStatusFilter: (status: string) => void;
  /** Whether the user has audit:read permission. */
  hasPermission: boolean;
  /** Row click handler. */
  onRowClick?: (id: string) => void;
  /** Currently selected EOI for the detail panel. */
  selectedEoi?: EoiDetail | null;
  /** Called when the detail panel should close. */
  onDetailClose?: () => void;
  /** Called when status is updated in the detail panel. */
  onStatusUpdate?: (id: string, status: string) => void;
  /** Whether user can update status. */
  canUpdateStatus?: boolean;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Additional class names. */
  className?: string;
}

/**
 * EoiCanvas organism — EOI table with filters, search, and detail panel.
 *
 * Uses `audit:read` permission (known mismatch — no EOI-specific permission
 * exists yet). Document this in JSDoc and track in a future issue.
 */
export function EoiCanvas({
  items,
  pagination,
  onPageChange,
  onSearch,
  onCategoryFilter,
  onStatusFilter,
  hasPermission,
  onRowClick,
  selectedEoi,
  onDetailClose,
  onStatusUpdate,
  canUpdateStatus,
  loading = false,
  error,
  className,
}: EoiCanvasProps) {
  if (!hasPermission) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-sm text-muted-foreground', className)}>
        No access to expressions of interest
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-sm text-destructive', className)}>
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-sm text-muted-foreground', className)}>
        Loading...
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1 overflow-y-auto p-4">
        <EoiTable
          items={items}
          pagination={pagination}
          onPageChange={onPageChange}
          onSearch={onSearch}
          onCategoryFilter={onCategoryFilter}
          onStatusFilter={onStatusFilter}
          onRowClick={onRowClick}
          loading={loading}
        />
      </div>

      {selectedEoi && onDetailClose && (
        <EoiDetailPanel
          open={!!selectedEoi}
          onClose={onDetailClose}
          eoi={selectedEoi}
          onStatusUpdate={onStatusUpdate}
          canUpdateStatus={canUpdateStatus}
        />
      )}
    </div>
  );
}
