"use client";

/**
 * Dashboard layout — wraps all /dashboard/* pages.
 *
 * Uses the new registry-driven DashboardShell with SidebarNav,
 * DashboardBreadcrumb, and RegistryProvider. Existing hand-coded
 * routes coexist during migration.
 *
 * @see Issue #332 (Shell & Navigation epic)
 * @see Issue #336 (DashboardShell + DashboardLayout)
 * @see Issue #352 (noindex — meta robots tag)
 */

import { type ReactNode, useState, useEffect, useCallback } from "react";
import {
  DashboardShell as DashboardShellTemplate,
  SidebarNav,
  DashboardBreadcrumb,
  ConnectionDot,
  NotificationBell,
  NotificationPanel,
  type NotificationEntry,
  type Phase,
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
import { RegistryProvider } from "./components/RegistryProvider";
import { SessionExpiredOverlay } from "./components/SessionExpiredOverlay";
import { useSessionMonitor } from "../lib/use-session-monitor";
import { useRegistryRevalidation } from "./use-registry-revalidation";
import { SIDEBAR_CONFIG } from "./_generated/sidebar-config";
import { DASHBOARD_ROUTES } from "./_generated/routes";
import { FEATURE_INDEX } from "./_generated/feature-index";
import { I18nProvider } from "../i18n/context";

/** Build a label map from the feature index for O(1) lookup */
const FEATURE_LABEL_MAP = new Map<string, string>();
for (const entry of FEATURE_INDEX) {
  FEATURE_LABEL_MAP.set(entry.id, entry.label);
}

/** Default phase for scaffold (Phase 1) */
const DEFAULT_PHASE: Phase = "company_formation";

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

/** Connection status indicator */
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

/** Map notification type to a message */
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

/** Header actions: user profile, status, notifications */
function DashboardHeaderActions() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

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
    <div className="flex items-center gap-3">
      {user && (
        <div className="flex items-center gap-3 text-sm">
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
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            Sign out
          </button>
          <DashboardStatusBar />
        </div>
      )}
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
    </div>
  );
}

/** Inner layout assembling the DashboardShell with SidebarNav and breadcrumbs */
function DashboardInner({ children }: { children: ReactNode }) {
  const sessionMonitor = useSessionMonitor();

  // Issue #354: Revalidate registry on tab focus (Phase 1)
  useRegistryRevalidation({ enabled: !sessionMonitor.expired });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState("/dashboard");

  // Track current path for sidebar highlighting and breadcrumbs
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrentPath(window.location.pathname);
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Load collapsed state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("pc-sidebar-collapsed");
      if (stored === "true") setIsCollapsed(true);
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pc-sidebar-collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Phase 1: all features visible (scaffold shows everything as ComingSoon)
  const visibleFeatureIds = DASHBOARD_ROUTES.map((r) => r.id);

  const routes = DASHBOARD_ROUTES.map((r) => ({
    id: r.id,
    label: FEATURE_LABEL_MAP.get(r.id) ?? r.id,
    path: r.path,
    status: r.status,
  }));

  return (
    <RegistryProvider visibleFeatureIds={visibleFeatureIds} currentPhase={DEFAULT_PHASE}>
      {/* Issue #353: session expired overlay */}
      {sessionMonitor.expired && (
        <SessionExpiredOverlay
          message={sessionMonitor.message}
          returnUrl={sessionMonitor.returnUrl}
        />
      )}
      {/* Issue #352: noindex meta tag for all dashboard pages */}
      <meta name="robots" content="noindex, nofollow" />
      <DashboardShellTemplate
        sidebar={
          <SidebarNav
            config={SIDEBAR_CONFIG}
            visibleFeatureIds={visibleFeatureIds}
            currentPhase={DEFAULT_PHASE}
            currentPath={currentPath}
            routes={routes}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
          />
        }
        breadcrumb={
          <DashboardBreadcrumb
            currentPath={currentPath}
            sidebarConfig={SIDEBAR_CONFIG}
          />
        }
        header={<DashboardHeaderActions />}
      >
        {children}
      </DashboardShellTemplate>
    </RegistryProvider>
  );
}

/**
 * Dashboard layout — provides auth, WebSocket, i18n, and the registry-driven shell.
 *
 * Unauthenticated users are redirected to /login by ProtectedRoute.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <ProtectedRoute>
          <WebSocketProvider>
            <DashboardInner>{children}</DashboardInner>
          </WebSocketProvider>
        </ProtectedRoute>
      </AuthProvider>
    </I18nProvider>
  );
}
