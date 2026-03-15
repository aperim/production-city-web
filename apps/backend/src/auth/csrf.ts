/**
 * CSRF protection middleware for cookie-authenticated endpoints.
 * Validates Origin and Referer headers on mutating requests (POST, PATCH, DELETE, PUT).
 *
 * The allowed origin is read from the `ALLOWED_ORIGIN` environment binding — the same
 * value the CORS middleware uses — so that cross-subdomain requests from the configured
 * frontend (e.g. `https://production.city` → `https://api.production.city`) are accepted
 * while all other origins are rejected.
 */

import type { Context, MiddlewareHandler } from "hono";
import { t } from "../i18n/index.js";

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
 * a valid Origin or Referer header matching the configured allowed origin.
 *
 * Allowed origins (checked in order):
 * 1. The `ALLOWED_ORIGIN` env binding (frontend origin, e.g. `https://production.city`)
 * 2. The API's own origin (same-origin requests, e.g. from Swagger UI)
 *
 * This two-entry allowlist supports the cross-subdomain architecture
 * (`production.city` → `api.production.city`) without weakening CSRF protection.
 */
export function csrfMiddleware(): MiddlewareHandler {
  return async (c: Context, next) => {
    const method = c.req.method.toUpperCase();

    // Only check mutating methods
    if (!["POST", "PATCH", "DELETE", "PUT"].includes(method)) {
      return next();
    }

    // Build the allowlist: configured frontend origin + API's own origin
    const allowedOrigin: string | undefined = (c.env as Record<string, unknown>)?.ALLOWED_ORIGIN as string | undefined;
    const apiOrigin = getOrigin(c.req.url);

    const allowedOrigins = new Set<string>();
    if (allowedOrigin) allowedOrigins.add(allowedOrigin);
    if (apiOrigin) allowedOrigins.add(apiOrigin);

    if (allowedOrigins.size === 0) {
      return c.json({ error: "csrf_failed", message: t("auth.csrf.invalidOrigin") }, 403);
    }

    // Check Origin header first, fall back to Referer
    const originHeader = c.req.header("Origin");
    const refererHeader = c.req.header("Referer");

    const clientOrigin = originHeader
      ? getOrigin(originHeader)
      : getOrigin(refererHeader);

    if (!clientOrigin) {
      return c.json({ error: "csrf_failed", message: t("auth.csrf.missingHeader") }, 403);
    }

    if (!allowedOrigins.has(clientOrigin)) {
      return c.json({ error: "csrf_failed", message: t("auth.csrf.originMismatch") }, 403);
    }

    return next();
  };
}
