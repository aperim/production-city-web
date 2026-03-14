/**
 * Environment variable validation using Zod.
 * Validates all required Cloudflare Worker bindings at startup.
 */

import { z } from "@hono/zod-openapi";

/**
 * Schema for all required environment bindings for the backend Worker.
 * D1Database is a runtime binding (not a string), so we validate it separately.
 */
export const EnvSchema = z.object({
  ALLOWED_ORIGIN: z.string().min(1, "ALLOWED_ORIGIN is required"),
  HMAC_SECRET: z.string().min(1, "HMAC_SECRET is required"),
  POSTMARK_API_TOKEN: z.string().optional(),
});

/**
 * Validates environment bindings. Throws a descriptive error if required bindings are missing.
 * Called at the start of the Worker fetch handler.
 *
 * @param env - The Cloudflare Worker environment bindings
 * @throws Error with a clear description of missing bindings
 */
export function validateEnv(env: Record<string, unknown>): void {
  // Validate D1 binding exists
  if (!env.DB) {
    throw new Error("Missing required D1 database binding: DB");
  }

  // Validate Durable Object binding exists
  if (!env.WEBSOCKET_SERVER) {
    throw new Error("Missing required Durable Object binding: WEBSOCKET_SERVER");
  }

  // Validate string bindings
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${issues}`);
  }
}
