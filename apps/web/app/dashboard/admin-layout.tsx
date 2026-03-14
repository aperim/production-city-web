"use client";

/**
 * Admin dashboard layout with sidebar navigation.
 * Sidebar items hidden based on permissions (client-side).
 * Server enforces permissions too — this is cosmetic only.
 */

import { type ReactNode } from "react";
import {
  AdminDashboardTemplate,
  type BreadcrumbItem,
  ConnectionDot,
  NotificationBell,
} from "@productioncity/holding-ui";
import type { SidebarSection } from "@productioncity/holding-ui";
import { useAuth } from "../lib/auth-context";
import { ProtectedRoute } from "../lib/route-guard";
import { WebSocketProvider } from "../lib/websocket/WebSocketProvider";
import { useWebSocket } from "../lib/websocket/useWebSocket";

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

/** Notification bell in the header */
function DashboardHeaderActions() {
  return (
    <NotificationBell
      data-testid="notification-bell"
      panel={
        <div
          data-testid="notification-panel"
          className="w-72 rounded-sm border border-border bg-card p-3 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">No new notifications</p>
        </div>
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
                  <span className="text-muted-foreground truncate max-w-32" title={user.email}>
                    {user.name || user.email}
                  </span>
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
