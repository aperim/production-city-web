"use client";

/**
 * EOI admin dashboard page — list, filter, search, detail view.
 * Permission required: audit:read (matching backend)
 */

import { useCallback, useEffect, useState } from "react";
import {
  EoiTable,
  EoiDetailPanel,
  EoiStats,
  type EoiTableItem,
  type EoiPagination,
  type EoiDetail,
} from "@productioncity/holding-ui";
import { AdminLayout } from "../admin-layout";
import { PermissionGate } from "../../lib/route-guard";
import { useAuth } from "../../lib/auth-context";
import {
  listEoi,
  getEoi,
  updateEoiStatus,
  getEoiStats,
  type EoiAdminItem,
} from "../../lib/api-client";

export default function EoiPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("audit:write");

  // Table state
  const [items, setItems] = useState<EoiTableItem[]>([]);
  const [pagination, setPagination] = useState<EoiPagination>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Detail panel state
  const [selectedEoi, setSelectedEoi] = useState<EoiDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Stats state
  const [stats, setStats] = useState<{
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    total: number;
  }>({ byCategory: {}, byStatus: {}, total: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchEois = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listEoi({
        page: pagination.page,
        limit: pagination.limit,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      if (result.ok) {
        setItems(
          result.data.data.map((item: EoiAdminItem) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            category: item.category,
            status: item.status,
            locale: item.locale,
            sourcePage: item.sourcePage,
            createdAt: item.createdAt,
          })),
        );
        setPagination((prev) => ({
          ...prev,
          totalPages: result.data.pagination.totalPages,
          total: result.data.pagination.total,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, categoryFilter, statusFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const result = await getEoiStats();
      if (result.ok) {
        setStats({
          byCategory: result.data.byCategory,
          byStatus: result.data.byStatus,
          total: result.data.total,
        });
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEois();
  }, [fetchEois]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleCategoryFilter = useCallback((category: string) => {
    setCategoryFilter(category);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleRowClick = useCallback(async (id: string) => {
    const result = await getEoi(id);
    if (result.ok) {
      setSelectedEoi(result.data as EoiDetail);
      setDetailOpen(true);
    }
  }, []);

  const handleStatusUpdate = useCallback(async (id: string, status: string) => {
    const result = await updateEoiStatus(id, status);
    if (result.ok) {
      // Update local state
      setSelectedEoi((prev) => prev ? { ...prev, status } : null);
      setItems((prev) =>
        prev.map((item) => item.id === id ? { ...item, status } : item),
      );
      // Refresh stats
      fetchStats();
    }
  }, [fetchStats]);

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Expressions of Interest" },
      ]}
    >
      <PermissionGate permission="audit:read">
        <div className="space-y-4">
          <EoiStats
            byCategory={stats.byCategory}
            byStatus={stats.byStatus}
            total={stats.total}
            loading={statsLoading}
          />
          <EoiTable
            items={items}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onCategoryFilter={handleCategoryFilter}
            onStatusFilter={handleStatusFilter}
            onRowClick={handleRowClick}
            loading={loading}
          />
          <EoiDetailPanel
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
            eoi={selectedEoi}
            onStatusUpdate={handleStatusUpdate}
            canUpdateStatus={canWrite}
          />
        </div>
      </PermissionGate>
    </AdminLayout>
  );
}
