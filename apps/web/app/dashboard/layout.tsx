"use client";

/**
 * Shared dashboard layout — wraps all /dashboard/* pages in
 * ProtectedRoute + WebSocketProvider + AdminDashboardTemplate.
 *
 * Individual pages no longer wrap in AdminLayout. They render content only
 * and declare breadcrumbs via useSetBreadcrumbs().
 */

import { type ReactNode, useState, useEffect, useCallback } from "react";
import {
  AdminDashboardTemplate,
  ConnectionDot,
  NotificationBell,
  NotificationPanel,
  type NotificationEntry,
  type SidebarSection,
} from "@productioncity/holding-ui";
import { AuthProvider, useAuth } from "../lib/auth-context";
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
import { BreadcrumbProvider, useBreadcrumbState } from "./breadcrumb-context";
import { I18nProvider, useTranslation } from "../i18n/context";

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
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
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

/** Notification bell in the header */
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

  useChannel("admin:notifications", {
    enabled: !!user,
    onMessage: () => {
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

    if (!notif.readAt) {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    if (notif.actionUrl && isSafeUrl(notif.actionUrl) && typeof window !== "undefined") {
      window.location.href = notif.actionUrl;
    }
  }, [notifications]);

  const panelNotifications: NotificationEntry[] = notifications.slice(0, 10).map((n) => ({
    id: n.id,
    message: notificationMessage(n),
    timestamp: timeAgo(n.createdAt),
    timestampIso: n.createdAt,
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

/** Inner layout that reads breadcrumbs from context */
function DashboardShell({ children }: { children: ReactNode }) {
  const { hasPermission, user, logout } = useAuth();
  const breadcrumbs = useBreadcrumbState();
  const { t } = useTranslation();

  // Active path for sidebar highlighting. Reads on mount and listens
  // for popstate (back/forward). Sidebar links use <a href> (full-page
  // navigation) so mount-read covers normal clicks; popstate covers
  // browser history navigation.
  const [activePath, setActivePath] = useState("/dashboard");
  useEffect(() => {
    if (typeof window === "undefined") return;
    setActivePath(window.location.pathname);
    const onPopState = () => setActivePath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const sidebarItems = [];

  sidebarItems.push({
    id: "dashboard",
    label: t("nav.dashboard"),
    href: "/dashboard",
    active: activePath === "/dashboard",
  });

  if (hasPermission("user:read")) {
    sidebarItems.push({
      id: "users",
      label: t("nav.users"),
      href: "/dashboard/users",
      active: activePath.startsWith("/dashboard/users"),
    });
  }

  if (hasPermission("invitation:read")) {
    sidebarItems.push({
      id: "invitations",
      label: t("nav.invitations"),
      href: "/dashboard/invitations",
      active: activePath.startsWith("/dashboard/invitations"),
    });
  }

  if (hasPermission("user:update")) {
    sidebarItems.push({
      id: "approvals",
      label: t("nav.approvals"),
      href: "/dashboard/approvals",
      active: activePath.startsWith("/dashboard/approvals"),
    });
  }

  if (hasPermission("announcement:read_admin")) {
    sidebarItems.push({
      id: "announcements",
      label: t("nav.updates"),
      href: "/dashboard/announcements",
      active: activePath.startsWith("/dashboard/announcements"),
    });
    sidebarItems.push({
      id: "categories",
      label: t("admin.categories.title"),
      href: "/dashboard/categories",
      active: activePath.startsWith("/dashboard/categories"),
    });
    sidebarItems.push({
      id: "tags",
      label: t("admin.tags.title"),
      href: "/dashboard/tags",
      active: activePath.startsWith("/dashboard/tags"),
    });
  }

  if (hasPermission("subscription:manage")) {
    sidebarItems.push({
      id: "subscriptions",
      label: t("admin.subscriptions.title"),
      href: "/dashboard/subscriptions-admin",
      active: activePath.startsWith("/dashboard/subscriptions-admin"),
    });
  }

  if (hasPermission("audit:read")) {
    sidebarItems.push({
      id: "eoi",
      label: t("admin.eoi.title"),
      href: "/dashboard/eoi",
      active: activePath.startsWith("/dashboard/eoi"),
    });
    sidebarItems.push({
      id: "audit-log",
      label: t("nav.auditLog"),
      href: "/dashboard/audit-log",
      active: activePath.startsWith("/dashboard/audit-log"),
    });
  }

  const sections: SidebarSection[] = [{ id: "main", items: sidebarItems }];

  return (
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
                {t("auth.logout.button")}
              </button>
            </div>
            <DashboardStatusBar />
          </div>
        ) : undefined
      }
      breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}
      skipNavLabel={t("dashboard.skip_to_content")}
      headerActions={<DashboardHeaderActions />}
    >
      {children}
    </AdminDashboardTemplate>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ProtectedRoute>
          <WebSocketProvider>
            <BreadcrumbProvider>
              <DashboardShell>{children}</DashboardShell>
            </BreadcrumbProvider>
          </WebSocketProvider>
        </ProtectedRoute>
      </AuthProvider>
    </I18nProvider>
  );
}
