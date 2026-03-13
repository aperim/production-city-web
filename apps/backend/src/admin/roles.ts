/**
 * Admin roles & permissions (read-only):
 * GET /v1/admin/roles — list all roles with permissions
 * GET /v1/admin/permissions — list all permissions grouped by resource
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const rolesApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

/** --- Schemas --- */

const PermissionSchema = z.object({
  id: z.string(),
  resource: z.string(),
  action: z.string(),
  description: z.string().nullable(),
});

const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  permissions: z.array(PermissionSchema),
});

const RolesResponseSchema = z.object({ roles: z.array(RoleSchema) });

const PermissionGroupSchema = z.object({
  resource: z.string(),
  permissions: z.array(PermissionSchema),
});

const PermissionsResponseSchema = z.object({
  groups: z.array(PermissionGroupSchema),
});

/** --- Routes --- */

const listRolesRoute = createRoute({
  method: "get",
  path: "/v1/admin/roles",
  summary: "List all roles",
  responses: {
    200: { content: { "application/json": { schema: RolesResponseSchema } }, description: "Roles" },
  },
});

const listPermissionsRoute = createRoute({
  method: "get",
  path: "/v1/admin/permissions",
  summary: "List all permissions grouped by resource",
  responses: {
    200: { content: { "application/json": { schema: PermissionsResponseSchema } }, description: "Permissions" },
  },
});

/** --- Auth --- */
rolesApp.use("/v1/admin/*", authMiddleware());
rolesApp.use("/v1/admin/roles", requirePermission("role", "read"));
rolesApp.use("/v1/admin/permissions", requirePermission("role", "read"));

/** --- Handlers --- */

rolesApp.openapi(listRolesRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        isSystem: true,
        rolePermissions: {
          select: {
            permission: {
              select: { id: true, resource: true, action: true, description: true },
            },
          },
        },
      },
    });

    return c.json({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissions: r.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          resource: rp.permission.resource,
          action: rp.permission.action,
          description: rp.permission.description,
        })),
      })),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

rolesApp.openapi(listPermissionsRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
      select: { id: true, resource: true, action: true, description: true },
    });

    // Group by resource
    const groups: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      if (!groups[p.resource]) groups[p.resource] = [];
      groups[p.resource]!.push(p);
    }

    return c.json({
      groups: Object.entries(groups).map(([resource, perms]) => ({
        resource,
        permissions: perms.map((p) => ({
          id: p.id,
          resource: p.resource,
          action: p.action,
          description: p.description,
        })),
      })),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
