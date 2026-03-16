/**
 * Legacy dashboard route redirects.
 *
 * Maps old dashboard paths to new registry-driven paths.
 * Returns a 301 response for permanent redirects, or null if no redirect is needed.
 *
 * @see Issue #349 — Migrate existing routes to registry paths
 */

/** Legacy path → new registry path */
const LEGACY_REDIRECTS: Record<string, string> = {
  "/dashboard/users": "/dashboard/admin/users/manage",
  "/dashboard/invitations": "/dashboard/admin/users/manage",
  "/dashboard/approvals": "/dashboard/admin/users/manage",
  "/dashboard/audit-log": "/dashboard/admin/audit/logs",
  "/dashboard/announcements": "/dashboard/comms/internal/announcements",
};

/**
 * Check if a dashboard path should be redirected.
 * Returns a 301 Response if the path matches a legacy route, null otherwise.
 */
export function handleLegacyRedirect(url: URL): Response | null {
  const newPath = LEGACY_REDIRECTS[url.pathname];
  if (!newPath) return null;

  const redirectUrl = new URL(url);
  redirectUrl.pathname = newPath;

  return new Response(null, {
    status: 301,
    headers: { Location: redirectUrl.toString() },
  });
}
