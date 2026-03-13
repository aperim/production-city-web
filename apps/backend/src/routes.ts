/**
 * Route mounting: auth and admin APIs with CSRF middleware.
 */

import type { OpenAPIHono } from "@hono/zod-openapi";
import { authApp } from "./auth/handlers.js";
import { csrfMiddleware } from "./auth/csrf.js";
import { usersApp } from "./admin/users.js";
import { invitationsApp } from "./admin/invitations.js";
import { approvalsApp } from "./admin/approvals.js";
import { rolesApp } from "./admin/roles.js";
import { auditLogApp } from "./admin/audit-log.js";
import { mediaAdminApp } from "./admin/media.js";
import { mediaApp } from "./media/handlers.js";
import { eoiApp } from "./eoi/handlers.js";
import { eoiAdminApp } from "./admin/eoi.js";

/**
 * Mount all auth and admin routes onto the main app.
 * CSRF middleware is applied to all mutating cookie-authenticated endpoints.
 */
export function mountRoutes(app: OpenAPIHono<{ Bindings: Record<string, unknown> }>): void {
  // CSRF protection for all mutating endpoints under /v1/
  app.use("/v1/*", csrfMiddleware());

  // Auth routes (verify, logout, session)
  app.route("/", authApp);

  // Admin routes
  app.route("/", usersApp);
  app.route("/", invitationsApp);
  app.route("/", approvalsApp);
  app.route("/", rolesApp);
  app.route("/", auditLogApp);
  app.route("/", mediaAdminApp);

  // Public media routes (no auth required)
  app.route("/", mediaApp);

  // EOI admin routes (auth + admin role required)
  app.route("/", eoiAdminApp);

  // Public EOI and locales routes (no auth required)
  app.route("/", eoiApp);

  // Test routes — only in test environment (build-time conditional import).
  // Requires BOTH NODE_ENV=test AND TEST_ENABLED=true.
  // The async import is awaited via mountTestRoutes() in test server startup.
  // This block is a fallback for lazy mounting in dev; production builds
  // should never reach this code path.

}

/**
 * Mount test routes (for use in test server startup).
 * SECURITY: Only call this when NODE_ENV=test AND TEST_ENABLED=true.
 * Callers MUST await this before accepting requests to avoid race conditions.
 */
export async function mountTestRoutes(app: OpenAPIHono<{ Bindings: Record<string, unknown> }>): Promise<void> {
  if (process.env.NODE_ENV !== "test" || process.env.TEST_ENABLED !== "true") {
    throw new Error("mountTestRoutes() called outside test environment");
  }
  const { testApp } = await import("./test-routes.js");
  app.route("/", testApp);
}
