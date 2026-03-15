/**
 * GET /robots.txt — allow all indexing with sitemap directive.
 *
 * @see Issue #280
 */
export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://production.city/sitemap.xml",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
