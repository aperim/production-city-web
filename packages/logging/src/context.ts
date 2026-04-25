/**
 * Request context extracted from Cloudflare Worker request headers.
 */
export interface RequestContext {
  /** CF-Ray header — unique Cloudflare edge request identifier */
  cfRay: string | null;
  /** Correlation request ID (x-request-id or cf-ray fallback) */
  requestId: string | null;
}

/**
 * Extract request context from a Cloudflare Worker `Request` object.
 * Uses only standard `Headers` API — no Node.js APIs.
 */
export function extractRequestContext(request: Request): RequestContext {
  const cfRay = request.headers.get("cf-ray");
  const requestId = request.headers.get("x-request-id") ?? cfRay;
  return { cfRay, requestId };
}

/**
 * Detect the deployment environment from Cloudflare Worker environment bindings
 * or a fallback string.
 *
 * Recognises the `ENVIRONMENT` binding (string) set in wrangler.toml vars.
 * Falls back to "dev" when absent or unrecognised.
 */
export function detectEnvironment(
  env: { ENVIRONMENT?: string } | string | undefined,
): "dev" | "preview" | "staging" | "production" {
  const raw = typeof env === "string" ? env : env?.ENVIRONMENT;
  switch (raw?.toLowerCase()) {
    case "production":
      return "production";
    case "staging":
      return "staging";
    case "preview":
      return "preview";
    default:
      return "dev";
  }
}
