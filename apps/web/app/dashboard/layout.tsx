"use client";

/**
 * Dashboard layout — wraps all /dashboard/* pages.
 *
 * Phase 2: uses WorkspaceShell + WorkspaceSidebar (workspace-based navigation)
 * replacing the old Phase 1 DashboardShell + SidebarNav.
 *
 * @see Issue #332 (Shell & Navigation epic)
 * @see Issue #336 (DashboardShell + DashboardLayout)
 * @see Issue #352 (noindex — meta robots tag)
 * @see Issue #436 (Phase 2 workspace-based UI)
 */

import { type ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import {
  WorkspaceShell,
  WorkspaceSidebar,
  WorkspaceTabs,
  ConnectionDot,
  NotificationBell,
  NotificationPanel,
  type NotificationEntry,
  type Phase,
  type WorkspaceSidebarItem,
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
import { RegistryProvider, useRegistry } from "./components/RegistryProvider";
import { SessionExpiredOverlay } from "./components/SessionExpiredOverlay";
import { useSessionMonitor } from "../lib/use-session-monitor";
import { useRegistryRevalidation } from "./use-registry-revalidation";
import { DASHBOARD_ROUTES } from "./_generated/routes";
import {
  WORKSPACE_CONFIG,
  WORKSPACE_MAP,
  type WorkspaceId,
} from "./_generated/workspace-config";
import { I18nProvider } from "../i18n/context";
import { AIPanelWired } from "./components/AIPanelWired";

/** Default phase for scaffold */
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

/**
 * Extract workspace and tab slugs from the current URL path.
 * Returns { workspace, tab } or empty strings if not on a workspace route.
 */
function useWorkspaceTabFromPath(currentPath: string): { workspace: string; tab: string } {
  return useMemo(() => {
    const segments = currentPath.split("/").filter(Boolean);
    const dashIdx = segments.indexOf("dashboard");
    return {
      workspace: segments[dashIdx + 1] ?? "",
      tab: segments[dashIdx + 2] ?? "",
    };
  }, [currentPath]);
}

/** Build workspace sidebar items from the config, filtered by registry visibility */
function useWorkspaceSidebarItems(): WorkspaceSidebarItem[] {
  const { visibleWorkspaceIds } = useRegistry();

  return useMemo(() => {
    const visibleSet = new Set(visibleWorkspaceIds);
    return WORKSPACE_CONFIG
      .filter((ws) => visibleSet.has(ws.id))
      .map((ws) => ({
        id: ws.id,
        label: ws.label,
        icon: ws.icon,
        path: `/dashboard/${ws.id}`,
      }));
  }, [visibleWorkspaceIds]);
}

/** Inner layout assembling the WorkspaceShell with WorkspaceSidebar and tabs */
function DashboardInner({ children }: { children: ReactNode }) {
  // Issue #354: Revalidate registry on tab focus
  useRegistryRevalidation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState("/dashboard");

  // Track current path for sidebar highlighting and tabs
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

  const handleNavigate = useCallback((path: string) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  }, []);

  // Phase 1 scaffold: all features visible so the full navigation structure
  // renders with ComingSoon placeholders. In Phase 2+, this will be replaced
  // by the server-resolved visible_feature_ids from GET /v1/registry/visible.
  // SECURITY NOTE: client-side workspace/tab anti-enumeration is a no-op in
  // scaffold mode — the backend API is the authoritative permission gate.
  const visibleFeatureIds = DASHBOARD_ROUTES.map((r) => r.id);

  const { workspace: activeWorkspace, tab: activeTab } = useWorkspaceTabFromPath(currentPath);

  return (
    <RegistryProvider visibleFeatureIds={visibleFeatureIds} currentPhase={DEFAULT_PHASE}>
      {/* Issue #352: noindex meta tag for all dashboard pages */}
      <meta name="robots" content="noindex, nofollow" />
      <WorkspaceShell
        sidebar={
          <WorkspaceSidebarWired
            activeWorkspace={activeWorkspace}
            collapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            onNavigate={handleNavigate}
          />
        }
        tabs={
          activeWorkspace ? (
            <WorkspaceTabsWired
              workspaceId={activeWorkspace}
              activeTab={activeTab}
              onNavigate={handleNavigate}
            />
          ) : undefined
        }
        scopeBar={
          <div className="flex items-center justify-end border-b border-border px-4 py-2">
            <DashboardHeaderActions />
          </div>
        }
        aiPanel={<AIPanelWired />}
        sidebarCollapsed={isCollapsed}
      >
        {children}
      </WorkspaceShell>
    </RegistryProvider>
  );
}

/** Wired WorkspaceSidebar — reads registry to filter visible workspaces */
function WorkspaceSidebarWired({
  activeWorkspace,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  activeWorkspace: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (path: string) => void;
}) {
  const workspaceItems = useWorkspaceSidebarItems();

  return (
    <WorkspaceSidebar
      workspaces={workspaceItems}
      activeWorkspace={activeWorkspace}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onNavigate={onNavigate}
    />
  );
}

/** Wired WorkspaceTabs — renders tabs for the active workspace */
function WorkspaceTabsWired({
  workspaceId,
  activeTab,
  onNavigate,
}: {
  workspaceId: string;
  activeTab: string;
  onNavigate: (path: string) => void;
}) {
  const { getVisibleTabIds } = useRegistry();
  const ws = WORKSPACE_MAP.get(workspaceId as WorkspaceId);

  const tabs = useMemo(() => {
    if (!ws) return [];
    const visibleTabIds = new Set(getVisibleTabIds(workspaceId));
    return ws.tabs
      .filter((t) => visibleTabIds.has(t.id))
      .map((t) => ({
        id: t.id,
        label: t.label,
        path: `/dashboard/${workspaceId}/${t.id}`,
      }));
  }, [ws, workspaceId, getVisibleTabIds]);

  if (!ws || tabs.length === 0) return null;

  return (
    <WorkspaceTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(_tabId, path) => onNavigate(path)}
    />
  );
}

/**
 * Session-aware protected route wrapper.
 * Uses useSessionMonitor to detect 401s and show the session-expired overlay
 * instead of hard-redirecting to /login (which would lose the current URL).
 */
function SessionAwareProtectedRoute({ children }: { children: ReactNode }) {
  const sessionMonitor = useSessionMonitor();

  return (
    <ProtectedRoute
      sessionExpiredFallback={
        sessionMonitor.expired ? (
          <SessionExpiredOverlay
            message={sessionMonitor.message}
            returnUrl={sessionMonitor.returnUrl}
          />
        ) : undefined
      }
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Dashboard layout — provides auth, WebSocket, i18n, and the workspace shell.
 *
 * Unauthenticated users are redirected to /login by ProtectedRoute.
 * Session expiry (401) shows an overlay instead of redirecting.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <SessionAwareProtectedRoute>
          <WebSocketProvider>
            <DashboardInner>{children}</DashboardInner>
          </WebSocketProvider>
        </SessionAwareProtectedRoute>
      </AuthProvider>
    </I18nProvider>
  );
}
