/**
 * GET /v1/registry/visible — returns filtered feature IDs per user.
 *
 * Response: { registry_version, phase, visible_feature_ids }
 * Caching: private, max-age=300, Vary: Cookie
 * Auth: required (session cookie)
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { computeVisibleFeatures, resolveDashboardRole, REGISTRY_HASH } from "../lib/permissions.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  COMPANY_PHASE?: string;
};

export const registryVisibleApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

const VisibleResponseSchema = z.object({
  registry_version: z.string(),
  phase: z.string(),
  visible_feature_ids: z.array(z.string()),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const visibleRoute = createRoute({
  method: "get",
  path: "/v1/registry/visible",
  summary: "Get visible dashboard features for authenticated user",
  description:
    "Returns the list of feature IDs the current user's role and permissions grant access to, plus the current company lifecycle phase and registry version hash.",
  responses: {
    200: {
      content: { "application/json": { schema: VisibleResponseSchema } },
      description: "Filtered feature list",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Unauthorized",
    },
  },
});

registryVisibleApp.use("/v1/registry/visible", authMiddleware());

registryVisibleApp.openapi(visibleRoute, (c) => {
  const auth = c.get("auth") as AuthContext;

  // Resolve dashboard role from the user's effective permission set.
  // This decouples from DB role names — any RBAC system that grants
  // 'dashboard:{role}' permissions will work.
  const dashboardRole = resolveDashboardRole(auth.permissions);

  const visibleFeatureIds = computeVisibleFeatures(dashboardRole, auth.permissions);

  const phase = (c.env as Record<string, unknown>).COMPANY_PHASE as string | undefined ?? "company_formation";

  c.header("Cache-Control", "private, max-age=300");
  c.header("Vary", "Cookie");

  return c.json(
    {
      registry_version: `sha256:${REGISTRY_HASH}`,
      phase,
      visible_feature_ids: visibleFeatureIds,
    },
    200,
  );
});
