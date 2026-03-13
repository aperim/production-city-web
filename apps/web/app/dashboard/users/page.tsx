"use client";

/**
 * User management page — search, filter, sort, pagination.
 * Permission required: user:read
 */

import { useCallback, useEffect, useState } from "react";
import {
  UserTable,
  UserDetailPanel,
  type UserTableUser,
  type PaginationInfo,
  type SortState,
  type StatusType,
  type UserDetail,
  type AuditLogEntryProps,
} from "@productioncity/holding-ui";
import { AdminLayout } from "../admin-layout";
import { PermissionGate } from "../../lib/route-guard";
import {
  listUsers,
  getUser,
  getUserAuditLog,
  type AdminUser,
} from "../../lib/api-client";

export default function UsersPage() {
  const [users, setUsers] = useState<UserTableUser[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType | "">("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  // Detail panel
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [userAuditLog, setUserAuditLog] = useState<AuditLogEntryProps[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers({
        page: pagination.page,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        sort: sortField || undefined,
        order: sortOrder || undefined,
      });
      if (result.ok) {
        setUsers(
          result.data.users.map((u: AdminUser) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            status: u.status as StatusType,
            roles: u.roles,
            createdAt: new Date(u.createdAt),
          })),
        );
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(result.data.total / result.data.pageSize),
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, searchQuery, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilter = useCallback((status: StatusType | "") => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSort = useCallback((sort: SortState) => {
    setSortField(sort.columnId);
    setSortOrder(sort.direction === "desc" ? "desc" : "asc");
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleUserClick = useCallback(async (userId: string) => {
    const [userResult, auditResult] = await Promise.all([
      getUser(userId),
      getUserAuditLog(userId),
    ]);

    if (userResult.ok) {
      const u = userResult.data;
      setSelectedUser({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status as StatusType,
        roles: u.roles,
        createdAt: new Date(u.createdAt),
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : undefined,
      });
    }

    if (auditResult.ok) {
      setUserAuditLog(
        auditResult.data.entries.map((e) => ({
          action: e.action,
          actorName: e.actorName,
          subjectName: e.subjectName,
          details: e.details,
          timestamp: new Date(e.timestamp),
          ipAddress: e.ipAddress,
        })),
      );
    }

    setDetailOpen(true);
  }, []);

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Users" },
      ]}
    >
      <PermissionGate permission="user:read">
        <UserTable
          users={users}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onSort={handleSort}
          onUserClick={handleUserClick}
          loading={loading}
        />
        <UserDetailPanel
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          user={selectedUser}
          auditLog={userAuditLog}
        />
      </PermissionGate>
    </AdminLayout>
  );
}
