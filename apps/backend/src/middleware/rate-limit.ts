/**
 * Reusable rate limiting middleware.
 * Replaces ad-hoc per-route rate limiting implementations.
 *
 * Uses an in-memory Map scoped to the Worker isolate.
 * For Cloudflare Workers, each isolate has its own map, which provides
 * per-instance rate limiting. For global rate limiting, use Durable Objects.
 */

import type { Context, MiddlewareHandler } from "hono";
import { t } from "../i18n/index.js";

export interface RateLimitConfig {
  /** Function to derive the rate-limit key from the request (e.g., IP, email) */
  keyFn: (c: Context) => string;
  /** Maximum number of requests within the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/** Evict expired entries to prevent unbounded memory growth. */
function evictExpired(now: number): void {
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

/** Evict every 100 requests to amortize cleanup cost. */
let requestCounter = 0;
const EVICTION_INTERVAL = 100;

/**
 * Creates a rate limiting middleware with the given configuration.
 * Returns 429 with Retry-After header when limit is exceeded.
 */
export function rateLimitMiddleware(config: RateLimitConfig): MiddlewareHandler {
  return async (c, next) => {
    const key = config.keyFn(c);
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;

    // Periodic eviction of expired entries
    requestCounter++;
    if (requestCounter >= EVICTION_INTERVAL) {
      requestCounter = 0;
      evictExpired(now);
    }

    let entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    if (entry.count > config.limit) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      c.header("Retry-After", String(retryAfterSeconds));
      return c.json(
        {
          error: "rate_limited",
          message: t("errors.rateLimited"),
        },
        429,
      );
    }

    await next();
  };
}

/**
 * Clears the rate limit store. Primarily for testing.
 */
export function clearRateLimitStore(): void {
  store.clear();
}
