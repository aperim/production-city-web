"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type {
  AdminSubscription,
  SubscriptionFilters,
  PaginationState,
} from "../../types/announcements";
import { ChannelIcon } from "../../atoms/ChannelIcon/ChannelIcon";
import { SubscriptionStatusDot } from "../../atoms/SubscriptionStatusDot/SubscriptionStatusDot";
import { Pagination } from "../../molecules/Pagination/Pagination";

/** Props for the AdminSubscriptionTable organism. */
export interface AdminSubscriptionTableProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Subscription data (phone masked by default). */
  subscriptions: AdminSubscription[];
  /** Remove handler. */
  onRemove: (id: string) => void;
  /** Active filters. */
  filters: SubscriptionFilters;
  /** Filter change handler. */
  onFilter: (filters: SubscriptionFilters) => void;
  /** Pagination state. */
  pagination: PaginationState;
}

/**
 * Mask a phone number for display.
 *
 * Shows first 3 and last 2 digits, masks the rest with asterisks.
 */
function maskPhone(phone: string): string {
  if (phone.length <= 5) return "***";
  return phone.slice(0, 3) + "*".repeat(phone.length - 5) + phone.slice(-2);
}

/**
 * Admin view of all subscriptions with filtering.
 *
 * Phone numbers are masked by default for privacy.
 */
function AdminSubscriptionTable({
  subscriptions,
  onRemove,
  filters,
  onFilter,
  pagination,
  className,
  ...props
}: AdminSubscriptionTableProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            onFilter({
              ...filters,
              status: e.target.value ? (e.target.value as AdminSubscription["status"]) : undefined,
            })
          }
          className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={filters.channel ?? ""}
          onChange={(e) =>
            onFilter({
              ...filters,
              channel: e.target.value ? (e.target.value as AdminSubscription["channel"]) : undefined,
            })
          }
          className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
          aria-label="Filter by channel"
        >
          <option value="">All channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Channel</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No subscriptions found.
                </td>
              </tr>
            )}

            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-border hover:bg-muted/10 transition-colors duration-100">
                <td className="px-4 py-3 font-medium text-foreground">{sub.userName}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{sub.categoryName}</td>
                <td className="px-4 py-3">
                  <ChannelIcon channel={sub.channel} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <SubscriptionStatusDot status={sub.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{sub.email}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  {sub.phone ? maskPhone(sub.phone) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(sub.id)}
                    className="rounded border border-border px-2 py-0.5 text-xs text-red-400 hover:text-red-300 hover:border-red-800/50 transition-colors duration-150"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export { AdminSubscriptionTable, maskPhone };
