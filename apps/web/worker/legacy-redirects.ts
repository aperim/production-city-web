/**
 * Legacy dashboard route redirects.
 *
 * Maps old dashboard paths to new workspace-based paths.
 * Returns a 302 response for temporary redirects, or null if no redirect is needed.
 *
 * Uses 302 (temporary) redirects during initial rollout — browsers and CDNs
 * cache 301s aggressively. Switch to 301 after new routes are proven stable.
 *
 * @see Issue #349, #447
 */

/** Static legacy path → new workspace path */
const STATIC_REDIRECTS: Record<string, string> = {
  "/dashboard/announcements": "/dashboard/administration/communications",
  "/dashboard/announcements/new": "/dashboard/administration/communications/new",
  "/dashboard/categories": "/dashboard/administration/communications?view=categories",
  "/dashboard/tags": "/dashboard/administration/communications?view=tags",
  "/dashboard/subscriptions-admin": "/dashboard/administration/communications?view=subscriptions",
  "/dashboard/users": "/dashboard/administration/users",
  "/dashboard/invitations": "/dashboard/administration/users?view=invitations",
  "/dashboard/approvals": "/dashboard/administration/users?view=approvals",
  "/dashboard/audit-log": "/dashboard/administration/security",
  "/dashboard/eoi": "/dashboard/partnerships/eoi",
};

/**
 * Dynamic route patterns: /dashboard/announcements/:id and /dashboard/announcements/:id/edit
 */
const ANNOUNCEMENT_PREFIX = "/dashboard/announcements/";

/**
 * Check if a dashboard path should be redirected.
 * Returns a 302 Response if the path matches a legacy route, null otherwise.
 */
export function handleLegacyRedirect(url: URL): Response | null {
  // Check static redirects first
  const staticTarget = STATIC_REDIRECTS[url.pathname];
  if (staticTarget) {
    const redirectUrl = new URL(url);
    // If the target already contains a query string, merge it
    if (staticTarget.includes("?")) {
      const [pathname, qs] = staticTarget.split("?");
      redirectUrl.pathname = pathname!;
      // Preserve existing query params and add the new ones
      const targetParams = new URLSearchParams(qs);
      for (const [key, value] of targetParams) {
        redirectUrl.searchParams.set(key, value);
      }
    } else {
      redirectUrl.pathname = staticTarget;
    }
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() },
    });
  }

  // Check dynamic announcement routes: /dashboard/announcements/:id(/edit)
  if (url.pathname.startsWith(ANNOUNCEMENT_PREFIX)) {
    const rest = url.pathname.slice(ANNOUNCEMENT_PREFIX.length);
    // Match :id/edit or :id (no further segments)
    const editMatch = rest.match(/^([^/]+)\/edit$/);
    if (editMatch) {
      const redirectUrl = new URL(url);
      redirectUrl.pathname = `/dashboard/administration/communications/${editMatch[1]}/edit`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl.toString() },
      });
    }
    const idMatch = rest.match(/^([^/]+)$/);
    if (idMatch) {
      const redirectUrl = new URL(url);
      redirectUrl.pathname = `/dashboard/administration/communications/${idMatch[1]}`;
      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl.toString() },
      });
    }
  }

  return null;
}
