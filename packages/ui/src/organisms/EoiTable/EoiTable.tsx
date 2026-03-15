'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';

/** EOI item shape for the table */
export interface EoiTableItem {
  id: string;
  name: string;
  email: string;
  category: string;
  status: string;
  locale: string;
  sourcePage: string;
  createdAt: string;
}

/** Page-based pagination info */
export interface EoiPagination {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

/** Props for the EoiTable organism */
export interface EoiTableProps {
  /** EOI data to display */
  items: EoiTableItem[];
  /** Pagination state */
  pagination: EoiPagination;
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Called when search input changes */
  onSearch: (query: string) => void;
  /** Called when category filter changes */
  onCategoryFilter: (category: string) => void;
  /** Called when status filter changes */
  onStatusFilter: (status: string) => void;
  /** Called when a row is clicked */
  onRowClick?: (id: string) => void;
  /** Whether data is loading */
  loading?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Category filter label */
  categoryFilterLabel?: string;
  /** Status filter label */
  statusFilterLabel?: string;
  /** Category options */
  categories?: Array<{ value: string; label: string }>;
  /** Status options */
  statuses?: Array<{ value: string; label: string }>;
  /** Category label map */
  categoryLabels?: Record<string, string>;
  /** Status label map */
  statusLabels?: Record<string, string>;
  className?: string;
}

const DEFAULT_CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "general", label: "General" },
  { value: "producer", label: "Producer" },
  { value: "creative", label: "Creative" },
  { value: "partner", label: "Partner" },
  { value: "investor", label: "Investor" },
  { value: "education", label: "Education" },
  { value: "employment", label: "Employment" },
];

const DEFAULT_STATUSES = [
  { value: "", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "archived", label: "Archived" },
];

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  producer: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  creative: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  partner: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  investor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  education: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  employment: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  contacted: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  archived: "bg-muted text-muted-foreground",
};

/**
 * EoiTable organism -- table with search, filter, page-based pagination for EOI submissions.
 */
function EoiTable({
  items,
  pagination,
  onPageChange,
  onSearch,
  onCategoryFilter,
  onStatusFilter,
  onRowClick,
  loading = false,
  searchPlaceholder = "Search by name or email",
  categoryFilterLabel = "Category",
  statusFilterLabel = "Status",
  categories = DEFAULT_CATEGORIES,
  statuses = DEFAULT_STATUSES,
  categoryLabels = {},
  statusLabels = {},
  className,
}: EoiTableProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="h-8 w-56 px-2.5 text-sm border border-border rounded-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          onChange={(e) => onCategoryFilter(e.target.value)}
          className="h-8 px-2 text-sm border border-border rounded-sm bg-background text-foreground"
          aria-label={categoryFilterLabel}
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => onStatusFilter(e.target.value)}
          className="h-8 px-2 text-sm border border-border rounded-sm bg-background text-foreground"
          aria-label={statusFilterLabel}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">{categoryFilterLabel}</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">{statusFilterLabel}</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Locale</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                  No expressions of interest found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-border last:border-b-0 transition-colors duration-100",
                    onRowClick && "cursor-pointer hover:bg-accent/30",
                  )}
                  onClick={onRowClick ? () => onRowClick(item.id) : undefined}
                >
                  <td className="px-3 py-2 text-foreground">{item.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.email}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 text-xs rounded-sm",
                        CATEGORY_COLORS[item.category] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {categoryLabels[item.category] ?? item.category}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-block px-1.5 py-0.5 text-xs rounded-sm",
                        STATUS_COLORS[item.status] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {statusLabels[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.locale}</td>
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {`Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total)`}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-2 py-1 border border-border rounded-sm disabled:opacity-50 hover:bg-accent/30 transition-colors duration-100"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-2 py-1 border border-border rounded-sm disabled:opacity-50 hover:bg-accent/30 transition-colors duration-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { EoiTable };
