"use client";

/**
 * Dashboard home — role-aware landing page.
 *
 * Uses the RoleDashboard template with data adapted from existing APIs.
 * KPI cards and quick actions are permission-gated per the user's role.
 */

import { useCallback, useEffect, useState } from "react";
import {
  RoleDashboard,
  type KpiCard,
  type QuickAction,
  type ActivityEntry,
} from "@productioncity/holding-ui";
import { useAuth } from "../lib/auth-context";
import { useDashboardRole } from "./use-dashboard-role";
import {
  getAdminStats,
  listAuditLog,
  type AdminStats,
  type AuditLogEntryData,
} from "../lib/api-client";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const role = useDashboardRole();
  const canReadUsers = hasPermission("user:read");
  const canReadAudit = hasPermission("audit:read");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLogEntryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResult, activityResult] = await Promise.all([
        canReadUsers ? getAdminStats() : Promise.resolve(null),
        canReadAudit ? listAuditLog({}) : Promise.resolve(null),
      ]);

      if (statsResult && statsResult.ok) {
        setStats(statsResult.data);
      }
      if (activityResult && activityResult.ok) {
        setRecentActivity(activityResult.data.entries.slice(0, 10));
      }
    } finally {
      setLoading(false);
    }
  }, [canReadUsers, canReadAudit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build KPI cards from admin stats (permission-gated)
  const kpiCards: KpiCard[] = [];
  if (canReadUsers && stats) {
    kpiCards.push(
      { label: "Total Users", value: String(stats.totalUsers), trend: "neutral" },
      { label: "Pending Approvals", value: String(stats.pendingApprovals), trend: "neutral" },
      { label: "Active Invitations", value: String(stats.activeInvitations), trend: "neutral" },
    );
  }

  // Build quick actions (permission-gated)
  const quickActions: QuickAction[] = [];
  if (hasPermission("invitation:read")) {
    quickActions.push({ label: "Invite User", href: "/dashboard/invitations" });
  }
  if (hasPermission("user:update")) {
    quickActions.push({ label: "View Pending Approvals", href: "/dashboard/approvals" });
  }

  // Build activity feed from audit log (permission-gated)
  const activities: ActivityEntry[] = canReadAudit
    ? recentActivity.map((entry) => ({
        id: entry.id,
        message: `${entry.actorName ?? "System"}: ${entry.action}${entry.subjectName ? ` → ${entry.subjectName}` : ""}`,
        timestamp: new Date(entry.timestamp).toLocaleString(),
      }))
    : [];

  return (
    <RoleDashboard
      userName={user?.name ?? user?.email ?? "User"}
      role={role}
      kpiCards={kpiCards}
      quickActions={quickActions}
      activities={activities}
      loading={loading}
    />
  );
}
