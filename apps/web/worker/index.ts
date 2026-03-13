/**
 * apps/web custom worker entry — wraps the vinext app-router handler and
 * injects HTTP security response headers on every response.
 *
 * Also implements the www.production.city → production.city 308 redirect
 * (Issue #97) before delegating to the application handler.
 *
 * @see Issue #45
 * @see Issue #97
 */
import handler from "vinext/server/app-router-entry";

/** Canonical production hostname. */
const CANONICAL_HOST = "production.city";

/** www hostname that redirects to canonical. */
const WWW_HOST = `www.${CANONICAL_HOST}`;

/** Security headers applied to every response. */
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    // www → canonical redirect (Issue #97).
    // Must be done before routing to avoid serving content on www.
    // Security hardening per Codex review:
    //   - protocol forced to https (no downgrade possible)
    //   - port cleared (prevent host header tricks)
    //   - credentials (username/password) stripped from URL
    //   - 308 (Permanent Redirect) preserves HTTP method for non-GET requests;
    //     equivalent to 301 for GET/HEAD which is the typical browser case
    const url = new URL(request.url);
    if (url.hostname === WWW_HOST) {
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      url.port = "";
      url.username = "";
      url.password = "";
      return Response.redirect(url.toString(), 308);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vinext handler types are opaque
    const response = await (handler as any).fetch(request, env, ctx);
    const newResponse = new Response(response.body, response);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      newResponse.headers.set(key, value);
    }
    return newResponse;
  },
} satisfies ExportedHandler;
