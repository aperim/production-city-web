/**
 * Redirects for pages hidden per PRO-477 content-thinning plan.
 *
 * Pages are NOT deleted — only removed from nav, sitemap, and structured data.
 * 302 redirects ensure crawlers and bookmarks are updated gracefully.
 *
 * @see PRO-486
 */

/** Paths hidden from nav/sitemap that redirect to home. */
const HIDDEN_PATHS = new Set([
  "/company/team",
  "/vision",
  "/network",
  "/community",
  "/company/approach",
  "/creative",
]);

/**
 * Returns a 302 redirect to "/" if the path (with locale prefix stripped)
 * is a hidden page, otherwise null.
 *
 * @param localePath - the path AFTER locale prefix has been stripped (e.g. "/vision")
 * @param originUrl  - the full request URL (used to build the redirect target)
 */
export function handleHiddenPageRedirect(localePath: string, originUrl: URL): Response | null {
  if (!HIDDEN_PATHS.has(localePath)) return null;

  const target = new URL(originUrl);
  target.pathname = "/";
  target.search = "";

  return new Response(null, {
    status: 302,
    headers: { Location: target.toString() },
  });
}
