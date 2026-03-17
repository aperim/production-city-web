'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { AuditLogEntry } from '../../molecules/AuditLogEntry/AuditLogEntry';

/** Audit log entry data shape for the SecurityCanvas. */
export interface AuditLogEntryData {
  id: string;
  action: string;
  actorName?: string;
  subjectName?: string;
  details?: string;
  timestamp: Date;
  ipAddress?: string;
}

/** Filter state for the audit log. */
export interface AuditLogFilters {
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
  user?: string;
}

/** Props for the SecurityCanvas organism. */
export interface SecurityCanvasProps {
  /** Audit log entries to display. */
  entries: AuditLogEntryData[];
  /** Whether the user has audit:read permission. */
  hasPermission: boolean;
  /** Whether more entries can be loaded (cursor pagination). */
  hasMore: boolean;
  /** Load more entries handler. */
  onLoadMore: () => void;
  /** Filter change handler. */
  onFilterChange?: (filters: AuditLogFilters) => void;
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: string;
  /** Action type options for the filter dropdown. */
  actionTypes?: Array<{ value: string; label: string }>;
  /** Additional class names. */
  className?: string;
}

const DEFAULT_ACTION_TYPES = [
  { value: '', label: 'All actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'role_change', label: 'Role change' },
  { value: 'user_create', label: 'User created' },
  { value: 'user_delete', label: 'User deleted' },
  { value: 'settings_change', label: 'Settings changed' },
];

/**
 * SecurityCanvas organism — audit log with filters and cursor pagination.
 *
 * Permission: `audit:read`.
 * State coverage: loading, empty, error, access-denied.
 */
export function SecurityCanvas({
  entries,
  hasPermission,
  hasMore,
  onLoadMore,
  onFilterChange,
  loading = false,
  error,
  actionTypes = DEFAULT_ACTION_TYPES,
  className,
}: SecurityCanvasProps) {
  const [filters, setFilters] = useState<AuditLogFilters>({});

  if (!hasPermission) {
    return (
      <div className={cn('flex items-center justify-center p-8 text-sm text-muted-foreground', className)}>
        No access to security audit log
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

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    const updated = { ...filters, [key]: value || undefined };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap p-4 pb-0">
        <select
          aria-label="Action type"
          value={filters.actionType ?? ''}
          onChange={(e) => handleFilterChange('actionType', e.target.value)}
          className="h-8 px-2 text-sm border border-border rounded-sm bg-background text-foreground"
        >
          {actionTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          aria-label="From"
          value={filters.dateFrom ?? ''}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          className="h-8 px-2 text-sm border border-border rounded-sm bg-background text-foreground"
        />
        <input
          type="date"
          aria-label="To"
          value={filters.dateTo ?? ''}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          className="h-8 px-2 text-sm border border-border rounded-sm bg-background text-foreground"
        />
        <input
          type="text"
          aria-label="User"
          placeholder="Filter by user..."
          value={filters.user ?? ''}
          onChange={(e) => handleFilterChange('user', e.target.value)}
          className="h-8 w-40 px-2 text-sm border border-border rounded-sm bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No audit log entries found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <AuditLogEntry
                key={entry.id}
                action={entry.action}
                actorName={entry.actorName}
                subjectName={entry.subjectName}
                details={entry.details}
                timestamp={entry.timestamp}
                ipAddress={entry.ipAddress}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={onLoadMore}
              className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-accent/30 transition-colors duration-100"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
