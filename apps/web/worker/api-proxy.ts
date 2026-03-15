/**
 * API proxy for the web Worker.
 *
 * Proxies /v1/* and health-check requests to the backend worker.
 * Uses a Cloudflare Service Binding in production/staging, or falls
 * back to a BACKEND_URL fetch in dev.
 *
 * This keeps all API calls same-origin from the browser's perspective,
 * which is required because session cookies use the __Host- prefix
 * (SameSite=Lax, no Domain attribute) and would not be sent cross-origin.
 *
 * @see Issue #309
 */

/** Paths that should be proxied to the backend. */
const API_PATH_PREFIXES = ["/v1/"];

/** Exact paths that should be proxied (health probes). */
const API_EXACT_PATHS = ["/live", "/ready"];

/**
 * Encoded patterns that could be used for path traversal attacks.
 * These are checked against the raw pathname before proxying.
 */
const DANGEROUS_ENCODED_PATTERNS = [
  /%2f/i,  // encoded forward slash
  /%2e/i,  // encoded dot (for ../  traversal)
  /%5c/i,  // encoded backslash
];

/**
 * Determines if a request path should be proxied to the backend API.
 *
 * Rejects paths containing encoded traversal characters to prevent
 * path canonicalization mismatches between the proxy and backend.
 */
export function isApiPath(pathname: string): boolean {
  // Reject encoded traversal patterns before checking prefixes
  for (const pattern of DANGEROUS_ENCODED_PATTERNS) {
    if (pattern.test(pathname)) return false;
  }

  for (const prefix of API_PATH_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  for (const exact of API_EXACT_PATHS) {
    if (pathname === exact) return true;
  }
  return false;
}

/**
 * Environment bindings relevant to API proxying.
 * BACKEND_SERVICE is a Cloudflare Service Binding (production/staging).
 * BACKEND_URL is a string URL for dev environments.
 */
export interface ApiProxyEnv {
  /** Cloudflare Service Binding to the backend worker. */
  BACKEND_SERVICE?: { fetch: (request: Request) => Promise<Response> };
  /** Fallback URL for dev environments (e.g., "http://localhost:8787"). */
  BACKEND_URL?: string;
}

/**
 * Proxy an API request to the backend.
 *
 * Prefers the service binding when available (zero-latency, same-runtime
 * communication in Cloudflare). Falls back to BACKEND_URL fetch for dev.
 *
 * Returns a 502 if neither is configured or if the backend is unreachable.
 */
export async function proxyApiRequest(
  request: Request,
  env: ApiProxyEnv,
): Promise<Response> {
  try {
    // Prefer service binding (production/staging)
    if (env.BACKEND_SERVICE) {
      return await env.BACKEND_SERVICE.fetch(request);
    }

    // Fallback: rewrite URL to BACKEND_URL (dev)
    if (env.BACKEND_URL) {
      const url = new URL(request.url);
      const backendUrl = new URL(url.pathname + url.search, env.BACKEND_URL);
      const proxiedRequest = new Request(backendUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: request.redirect,
      });
      return await fetch(proxiedRequest);
    }
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "api.proxy.error",
        error: String(err),
        url: request.url,
      }),
    );
    return new Response(
      JSON.stringify({ error: "backend_unavailable", message: "Backend service is temporarily unavailable" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // No backend configured
  return new Response(
    JSON.stringify({ error: "backend_unavailable", message: "API backend is not configured" }),
    {
      status: 502,
      headers: { "Content-Type": "application/json" },
    },
  );
}
