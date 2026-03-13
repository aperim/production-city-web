"use client";

/**
 * Dashboard home — stats, recent activity, quick actions.
 */

import { useCallback, useEffect, useState } from "react";
import { AuditLogEntry } from "@productioncity/holding-ui";
import { AdminLayout } from "./admin-layout";
import { useAuth } from "../lib/auth-context";
import {
  getAdminStats,
  listAuditLog,
  type AdminStats,
  type AuditLogEntryData,
} from "../lib/api-client";

export default function DashboardPage() {
  const { hasPermission } = useAuth();
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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Stats — only for users with user:read */}
        {canReadUsers && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Users"
              value={stats?.totalUsers}
              loading={loading}
            />
            <StatCard
              label="Pending Approvals"
              value={stats?.pendingApprovals}
              loading={loading}
            />
            <StatCard
              label="Active Invitations"
              value={stats?.activeInvitations}
              loading={loading}
            />
          </div>
        )}

        {/* Quick actions — permission-gated */}
        {(hasPermission("invitation:read") || hasPermission("user:update")) && (
          <div className="flex gap-3">
            {hasPermission("invitation:read") && (
              <a
                href="/dashboard/invitations"
                className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors duration-150"
              >
                Invite User
              </a>
            )}
            {hasPermission("user:update") && (
              <a
                href="/dashboard/approvals"
                className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors duration-150"
              >
                View Pending Approvals
              </a>
            )}
          </div>
        )}

        {/* Recent activity — only for users with audit:read */}
        {canReadAudit && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">Recent Activity</p>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="divide-y divide-border rounded-sm border border-border">
                {recentActivity.map((entry) => (
                  <AuditLogEntry
                    key={entry.id}
                    action={entry.action}
                    actorName={entry.actorName}
                    subjectName={entry.subjectName}
                    details={entry.details}
                    timestamp={new Date(entry.timestamp)}
                    ipAddress={entry.ipAddress}
                    className="px-3"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-4 flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-medium text-foreground tabular-nums">
        {loading ? "-" : (value ?? 0)}
      </p>
    </div>
  );
}
