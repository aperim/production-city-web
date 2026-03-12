/**
 * GET /robots.txt — disallow all indexing while in holding state.
 */
export function GET() {
  return new Response("User-agent: *\nDisallow: /\n", {
    headers: { "Content-Type": "text/plain" },
  });
}
