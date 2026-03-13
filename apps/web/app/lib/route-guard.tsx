"use client";

/**
 * Route guards for auth and permission-based access control.
 */

import { type ReactNode } from "react";
import { useAuth } from "./auth-context";

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Where to redirect unauthenticated users. */
  loginPath?: string;
}

/**
 * Protects a route — redirects to login if not authenticated.
 * Shows a loading state while session is being checked.
 */
export function ProtectedRoute({
  children,
  loginPath = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Client-side redirect
    if (typeof window !== "undefined") {
      window.location.href = loginPath;
    }
    return null;
  }

  return <>{children}</>;
}

export interface PermissionGateProps {
  children?: ReactNode;
  /** Required permission to view content. */
  permission: string;
  /** What to show if access is denied. Defaults to AccessDenied component. */
  fallback?: ReactNode;
}

/**
 * Permission gate — shows content only if the user has the required permission.
 * Shows an "Access Denied" message (not a redirect) per security requirements.
 */
export function PermissionGate({
  children,
  permission,
  fallback,
}: PermissionGateProps) {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return fallback ?? <AccessDenied />;
  }

  return <>{children}</>;
}

/**
 * Access denied component — shown when user lacks permission.
 * Per security requirements: show this instead of redirect.
 */
export function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Access Denied</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}
