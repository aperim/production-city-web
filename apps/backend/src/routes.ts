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
}
