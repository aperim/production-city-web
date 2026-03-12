import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

/** Security headers applied to all responses */
function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Serve static assets and SPA fallback */
app.all("*", async (c) => {
  const response = await c.env.ASSETS.fetch(c.req.raw);
  return addSecurityHeaders(response);
});

export default app;
