"use client";

/**
 * Resolves the user's primary dashboard role from auth context roles.
 *
 * Priority order matches the DashboardRole type — admin is highest priority,
 * guest is the fallback when no recognized role is present.
 */

import type { DashboardRole } from "@productioncity/holding-ui";
import { useAuth } from "../lib/auth-context";

/** Role priority — first match wins */
const ROLE_PRIORITY: DashboardRole[] = [
  "admin",
  "executive",
  "government",
  "investor",
  "partner",
  "first_nations",
  "vendor",
  "client",
  "staff",
  "guest",
];

/**
 * Resolve a DashboardRole from a list of role strings.
 * Returns the highest-priority recognized role, or "guest" if none match.
 */
export function resolveDashboardRole(roles: string[]): DashboardRole {
  const roleSet = new Set(roles);
  for (const role of ROLE_PRIORITY) {
    if (roleSet.has(role)) return role;
  }
  return "guest";
}

/**
 * Hook: returns the current user's primary dashboard role.
 */
export function useDashboardRole(): DashboardRole {
  const { roles } = useAuth();
  return resolveDashboardRole(roles);
}
