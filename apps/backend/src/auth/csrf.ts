/**
 * CSRF protection middleware for cookie-authenticated endpoints.
 * Validates Origin and Referer headers on mutating requests (POST, PATCH, DELETE, PUT).
 */

import type { Context, MiddlewareHandler } from "hono";

/**
 * Extracts the origin from a URL string. Returns null if invalid.
 */
function getOrigin(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * CSRF middleware: rejects mutating requests (POST, PATCH, DELETE, PUT) without
 * a valid Origin or Referer header matching the request's own origin.
 */
export function csrfMiddleware(): MiddlewareHandler {
  return async (c: Context, next) => {
    const method = c.req.method.toUpperCase();

    // Only check mutating methods
    if (!["POST", "PATCH", "DELETE", "PUT"].includes(method)) {
      return next();
    }

    const requestOrigin = getOrigin(c.req.url);
    if (!requestOrigin) {
      return c.json({ error: "csrf_failed", message: "Invalid request origin." }, 403);
    }

    // Check Origin header first, fall back to Referer
    const originHeader = c.req.header("Origin");
    const refererHeader = c.req.header("Referer");

    const clientOrigin = originHeader
      ? getOrigin(originHeader)
      : getOrigin(refererHeader);

    if (!clientOrigin) {
      return c.json({ error: "csrf_failed", message: "Missing Origin or Referer header." }, 403);
    }

    if (clientOrigin !== requestOrigin) {
      return c.json({ error: "csrf_failed", message: "Origin mismatch." }, 403);
    }

    return next();
  };
}
