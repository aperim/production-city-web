/**
 * X-Request-ID middleware: generates a unique request ID for every request,
 * propagates it to the response headers, and makes it available via context.
 */

import type { MiddlewareHandler } from "hono";

/**
 * Middleware that generates a unique X-Request-ID for each request.
 * The ID is set on the response header and stored in context as "requestId".
 */
export function requestIdMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);
    c.header("X-Request-ID", requestId);
    await next();
  };
}
