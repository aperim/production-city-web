"use client";

/**
 * Subscription management page — stats, list, admin actions.
 * Permission required: subscription:manage
 */

import { useCallback, useEffect, useState } from "react";
import {
  AdminSubscriptionTable,
  type AdminSubscription,
  type SubscriptionFilters,
  type PaginationState,
} from "@productioncity/holding-ui";
import { PermissionGate } from "../../lib/route-guard";
import { useBreadcrumbs } from "../use-breadcrumbs";
import {
  listAdminSubscriptions,
  getSubscriptionStats,
  adminDeleteSubscription,
} from "../../lib/api-client";

interface SubscriptionStatsData {
  totalConfirmed: number;
  totalPending: number;
  totalEmail: number;
  totalSms: number;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    confirmedEmail: number;
    confirmedSms: number;
    pending: number;
    total: number;
  }>;
}

export default function SubscriptionsAdminPage() {
  useBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
    { label: "Subscriptions" },
  ]);

  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<SubscriptionFilters>({});
  const [stats, setStats] = useState<SubscriptionStatsData | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    const result = await listAdminSubscriptions({
      page,
      status: filters.status,
      channel: filters.channel,
      category: filters.category,
    });
    if (result.ok) {
      const subs = result.data.subscriptions ?? result.data;
      setSubscriptions(
        (Array.isArray(subs) ? subs : []).map(
          (s): AdminSubscription => ({
            id: s.id,
            categoryId: s.categoryId,
            channel: s.channel as "email" | "sms",
            status: s.status as "pending" | "confirmed" | "declined" | "expired",
            userName: s.userName ?? "",
            email: s.email ?? "",
            phone: s.phone ?? null,
            createdAt: s.createdAt,
            categoryName: s.categoryName ?? "",
          }),
        ),
      );
      const pg = result.data.pagination;
      setTotalPages(pg?.totalPages ?? Math.ceil((pg?.total ?? subs.length) / (pg?.pageSize ?? 20)));
    }
  }, [page, filters]);

  const fetchStats = useCallback(async () => {
    const result = await getSubscriptionStats();
    if (result.ok) {
      const raw = result.data.stats ?? [];
      setStats({
        totalConfirmed: raw.reduce((s, c) => s + c.emailConfirmed + c.smsConfirmed, 0),
        totalPending: raw.reduce((s, c) => s + c.pending, 0),
        totalEmail: raw.reduce((s, c) => s + c.emailConfirmed, 0),
        totalSms: raw.reduce((s, c) => s + c.smsConfirmed, 0),
        byCategory: raw.map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          confirmedEmail: c.emailConfirmed,
          confirmedSms: c.smsConfirmed,
          pending: c.pending,
          total: c.total,
        })),
      });
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRemove = useCallback(
    async (id: string) => {
      if (!confirm("Remove this subscription?")) return;
      const result = await adminDeleteSubscription(id);
      if (result.ok) {
        await fetchSubscriptions();
        await fetchStats();
      }
    },
    [fetchSubscriptions, fetchStats],
  );

  const handleFilter = useCallback((newFilters: SubscriptionFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const pagination: PaginationState = {
    page,
    totalPages,
    onPageChange: setPage,
  };

  return (
    <PermissionGate permission="subscription:manage">
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-foreground">Subscriptions</h1>

        {/* Stats dashboard */}
        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-semibold text-foreground">{stats.totalConfirmed}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-foreground">{stats.totalPending}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-2xl font-semibold text-foreground">{stats.totalEmail}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">SMS</p>
                <p className="text-2xl font-semibold text-foreground">{stats.totalSms}</p>
              </div>
            </div>

            {/* Per-category stats */}
            {stats.byCategory.length > 0 && (
              <div className="rounded-lg border border-border bg-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">SMS</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Pending</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byCategory.map((cat) => (
                      <tr key={cat.categoryId} className="border-b border-border">
                        <td className="px-4 py-3 text-foreground">{cat.categoryName}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{cat.confirmedEmail}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{cat.confirmedSms}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{cat.pending}</td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">{cat.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Subscription table */}
        <AdminSubscriptionTable
          subscriptions={subscriptions}
          onRemove={handleRemove}
          filters={filters}
          onFilter={handleFilter}
          pagination={pagination}
          data-testid="subscriptions-table"
        />
      </div>
    </PermissionGate>
  );
}
