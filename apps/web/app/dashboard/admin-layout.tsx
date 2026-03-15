"use client";

/**
 * Admin dashboard layout with sidebar navigation.
 * Sidebar items hidden based on permissions (client-side).
 * Server enforces permissions too — this is cosmetic only.
 */

import { type ReactNode, useState, useCallback, useEffect } from "react";
import {
  AdminDashboardTemplate,
  type BreadcrumbItem,
  ConnectionDot,
  NotificationBell,
  NotificationPanel,
  type NotificationEntry,
} from "@productioncity/holding-ui";
import type { SidebarSection } from "@productioncity/holding-ui";
import { useAuth } from "../lib/auth-context";
import { ProtectedRoute } from "../lib/route-guard";
import { WebSocketProvider } from "../lib/websocket/WebSocketProvider";
import { useWebSocket } from "../lib/websocket/useWebSocket";
import { useChannel } from "../lib/websocket/useChannel";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationData,
} from "../lib/api-client";

export interface AdminLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  pendingApprovalCount?: number;
}

/** Maps WebSocket connection state to ConnectionDot variant */
function mapConnectionState(state: string): "connected" | "reconnecting" | "disconnected" {
  switch (state) {
    case "connected":
      return "connected";
    case "connecting":
      return "reconnecting";
    default:
      return "disconnected";
  }
}

/** Connection status indicator in sidebar footer */
function DashboardStatusBar() {
  const { state } = useWebSocket();
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ConnectionDot
        state={mapConnectionState(state)}
        size="sm"
        data-testid="connection-dot"
        data-state={state}
      />
      <span>{state === "connected" ? "Live" : state === "connecting" ? "Connecting" : "Offline"}</span>
    </div>
  );
}

/** Map notification type + context into a localized message */
function notificationMessage(n: NotificationData): string {
  switch (n.type) {
    case "approval_needed":
      return "New user pending approval";
    case "invitation_accepted":
      return "Invitation accepted";
    case "user_activated":
      return "User account activated";
    default:
      return n.type;
  }
}

/** Only allow relative URLs to prevent open redirects */
function isSafeUrl(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

/** Relative time string */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

/** Notification bell in the header — wired to real API and WebSocket */
function DashboardHeaderActions() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listNotifications();
      if (result.ok) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to WebSocket notifications for real-time updates
  useChannel("admin:notifications", {
    enabled: !!user,
    onMessage: () => {
      // Refetch when new notification arrives
      fetchNotifications();
    },
  });

  const handleMarkAllRead = useCallback(async () => {
    const result = await markAllNotificationsRead();
    if (result.ok) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
    }
  }, []);

  const handleSelect = useCallback(async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;

    // Mark as read
    if (!notif.readAt) {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    // Navigate to action URL if available
    if (notif.actionUrl && isSafeUrl(notif.actionUrl) && typeof window !== "undefined") {
      window.location.href = notif.actionUrl;
    }
  }, [notifications]);

  const panelNotifications: NotificationEntry[] = notifications.slice(0, 10).map((n) => ({
    id: n.id,
    message: notificationMessage(n),
    timestamp: timeAgo(n.createdAt),
    read: !!n.readAt,
    onAction: n.actionUrl && isSafeUrl(n.actionUrl) ? () => {
      if (typeof window !== "undefined") window.location.href = n.actionUrl!;
    } : undefined,
    actionLabel: n.actionUrl && isSafeUrl(n.actionUrl) ? "View" : undefined,
  }));

  return (
    <NotificationBell
      count={unreadCount}
      data-testid="notification-bell"
      panel={
        <NotificationPanel
          notifications={panelNotifications}
          onMarkAllRead={handleMarkAllRead}
          onSelect={handleSelect}
          loading={loading}
          data-testid="notification-panel"
        />
      }
    />
  );
}

export function AdminLayout({
  children,
  breadcrumbs,
  pendingApprovalCount,
}: AdminLayoutProps) {
  const { hasPermission, user, logout } = useAuth();

  const sidebarItems = [];

  sidebarItems.push({
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    active: typeof window !== "undefined" && window.location.pathname === "/dashboard",
  });

  if (hasPermission("user:read")) {
    sidebarItems.push({
      id: "users",
      label: "Users",
      href: "/dashboard/users",
      active: typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard/users"),
    });
  }

  if (hasPermission("invitation:read")) {
    sidebarItems.push({
      id: "invitations",
      label: "Invitations",
      href: "/dashboard/invitations",
      active: typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard/invitations"),
    });
  }

  if (hasPermission("user:update")) {
    sidebarItems.push({
      id: "approvals",
      label: "Pending Approvals",
      href: "/dashboard/approvals",
      active: typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard/approvals"),
      badge: pendingApprovalCount && pendingApprovalCount > 0 ? String(pendingApprovalCount) : undefined,
    });
  }

  if (hasPermission("audit:read")) {
    sidebarItems.push({
      id: "eoi",
      label: "Expressions of Interest",
      href: "/dashboard/eoi",
      active: typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard/eoi"),
    });
    sidebarItems.push({
      id: "audit-log",
      label: "Audit Log",
      href: "/dashboard/audit-log",
      active: typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard/audit-log"),
    });
  }

  const sections: SidebarSection[] = [
    {
      id: "main",
      items: sidebarItems,
    },
  ];

  return (
    <ProtectedRoute>
      <WebSocketProvider>
        <AdminDashboardTemplate
          sidebarSections={sections}
          sidebarFooter={
            user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <a
                    href="/dashboard/profile"
                    className="text-muted-foreground truncate max-w-32 hover:text-foreground transition-colors duration-150"
                    title={user.email}
                  >
                    {user.name || user.email}
                  </a>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    Sign out
                  </button>
                </div>
                <DashboardStatusBar />
              </div>
            ) : undefined
          }
          breadcrumbs={breadcrumbs}
          headerActions={<DashboardHeaderActions />}
        >
          {children}
        </AdminDashboardTemplate>
      </WebSocketProvider>
    </ProtectedRoute>
  );
}
