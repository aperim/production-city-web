/**
 * Environment helpers for resolving API and WebSocket host based on the
 * current window origin. Supports production, staging, and local dev.
 *
 * Mapping:
 *   production.city         → api.production.city
 *   staging.production.city → api.staging.production.city
 *   everything else         → same origin (localhost, preview, etc.)
 */

function resolveApiHost(): string {
  if (typeof window === "undefined") return "";
  const { hostname } = window.location;
  if (hostname === "production.city") return "api.production.city";
  if (hostname === "staging.production.city") return "api.staging.production.city";
  return "";
}

/**
 * Base URL prefix for all API requests.
 * Returns "https://<api-host>" for known production/staging origins,
 * or an empty string for same-origin (dev, localhost, unknown).
 */
export function getApiBase(): string {
  const host = resolveApiHost();
  return host ? `https://${host}` : "";
}

/**
 * WebSocket host for WS/WSS connections.
 * Returns the api subdomain for known production/staging origins,
 * or window.location.host for same-origin environments.
 */
export function getWsHost(): string {
  const host = resolveApiHost();
  return host || (typeof window !== "undefined" ? window.location.host : "");
}
