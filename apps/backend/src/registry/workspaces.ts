/**
 * GET /v1/workspaces/visible — returns workspace configs filtered by user role.
 *
 * Response includes tab statuses, feature counts, and upcoming features.
 * Caching: private, max-age=300, Vary: Cookie
 * Auth: required (session cookie)
 *
 * @see Issue #386
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { resolveDashboardRole, REGISTRY_HASH } from "../lib/permissions.js";
import { computeVisibleWorkspaces } from "../lib/workspace-resolver.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  COMPANY_PHASE?: string;
};

export const workspacesVisibleApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

const TabSchema = z.object({
  id: z.string(),
  label: z.string(),
  canvas: z.string(),
  status: z.enum(["active", "coming_soon", "planned"]),
  featureCount: z.number(),
  activeFeatureCount: z.number(),
});

const UpcomingFeatureSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.string(),
});

const WorkspaceSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
  description: z.string(),
  defaultCanvas: z.string(),
  tabs: z.array(TabSchema),
  totalFeatures: z.number(),
  activeFeatures: z.number(),
  upcomingFeatures: z.array(UpcomingFeatureSchema),
});

const WorkspacesVisibleResponseSchema = z.object({
  registry_version: z.string(),
  phase: z.string(),
  workspaces: z.array(WorkspaceSchema),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const workspacesVisibleRoute = createRoute({
  method: "get",
  path: "/v1/workspaces/visible",
  summary: "Get visible workspaces for authenticated user",
  description:
    "Returns workspace configs filtered by the user's role and permissions, including tab statuses, feature counts, and upcoming features.",
  responses: {
    200: {
      content: { "application/json": { schema: WorkspacesVisibleResponseSchema } },
      description: "Filtered workspace list",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
  },
});

workspacesVisibleApp.use("/v1/workspaces/visible", authMiddleware());

workspacesVisibleApp.openapi(workspacesVisibleRoute, (c) => {
  const auth = c.get("auth") as AuthContext;

  const dashboardRole = resolveDashboardRole(auth.permissions);
  const workspaces = computeVisibleWorkspaces(dashboardRole, auth.permissions);

  const phase = (c.env as Record<string, unknown>).COMPANY_PHASE as string | undefined ?? "company_formation";

  c.header("Cache-Control", "private, max-age=300");
  c.header("Vary", "Cookie");

  return c.json(
    {
      registry_version: `sha256:${REGISTRY_HASH}`,
      phase,
      workspaces,
    },
    200,
  );
});
