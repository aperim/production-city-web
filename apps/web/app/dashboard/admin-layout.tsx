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
} from "@productioncity/holding-ui";
import type { SidebarSection } from "@productioncity/holding-ui";
import { useAuth } from "../lib/auth-context";
import { ProtectedRoute } from "../lib/route-guard";

export interface AdminLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  pendingApprovalCount?: number;
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
      <AdminDashboardTemplate
        sidebarSections={sections}
        sidebarFooter={
          user ? (
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
          ) : undefined
        }
        breadcrumbs={breadcrumbs}
      >
        {children}
      </AdminDashboardTemplate>
    </ProtectedRoute>
  );
}
