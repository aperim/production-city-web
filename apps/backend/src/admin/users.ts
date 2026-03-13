/**
 * Admin user management handlers:
 * GET /v1/admin/users — list with pagination, filtering, sorting
 * GET /v1/admin/users/:id — user detail
 * PATCH /v1/admin/users/:id — update status/name
 * POST /v1/admin/users/:id/roles — assign roles
 * DELETE /v1/admin/users/:id/roles/:roleId — remove role
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import { revokeAllUserSessions } from "../auth/session.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const usersApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

const VALID_SORT_BY = ["createdAt", "email", "name", "lastLoginAt", "status"] as const;
const VALID_SORT_ORDER = ["asc", "desc"] as const;
const VALID_STATUSES = ["active", "pending_approval", "deactivated"] as const;

/** --- Schemas --- */

const UserListQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("25"),
  status: z.string().optional(),
  role: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.string().optional().default("desc"),
});

const PaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  status: z.string(),
  emailVerified: z.boolean(),
  roles: z.array(z.object({ id: z.string(), name: z.string() })),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});

const UserListResponseSchema = z.object({
  users: z.array(UserSchema),
  pagination: PaginationSchema,
});

const PatchUserBodySchema = z.object({
  status: z.enum(["active", "deactivated"]).optional(),
  name: z.string().max(100).optional(),
});

const PatchUserResponseSchema = z.object({
  user: UserSchema,
  revokedSessionCount: z.number().optional(),
});

const AssignRolesBodySchema = z.object({
  roleIds: z.array(z.string().min(1)).min(1),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

/** --- Route Definitions --- */

const listUsersRoute = createRoute({
  method: "get",
  path: "/v1/admin/users",
  summary: "List users",
  request: { query: UserListQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: UserListResponseSchema } }, description: "User list" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid params" },
  },
});

const getUserRoute = createRoute({
  method: "get",
  path: "/v1/admin/users/{id}",
  summary: "Get user detail",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: UserSchema } }, description: "User detail" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const patchUserRoute = createRoute({
  method: "patch",
  path: "/v1/admin/users/{id}",
  summary: "Update user status or name",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: PatchUserBodySchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: PatchUserResponseSchema } }, description: "Updated" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const assignRolesRoute = createRoute({
  method: "post",
  path: "/v1/admin/users/{id}/roles",
  summary: "Assign roles to user",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: AssignRolesBodySchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: UserSchema } }, description: "Roles assigned" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const removeRoleRoute = createRoute({
  method: "delete",
  path: "/v1/admin/users/{id}/roles/{roleId}",
  summary: "Remove a role from user",
  request: { params: z.object({ id: z.string(), roleId: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Removed" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

/** --- Apply auth middleware --- */
usersApp.use("/v1/admin/*", authMiddleware());

/** --- Handlers --- */

usersApp.use("/v1/admin/users", requirePermission("user", "read"));
usersApp.use("/v1/admin/users/*", requirePermission("user", "read"));

usersApp.openapi(listUsersRoute, async (c) => {
  const query = c.req.valid("query");
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 25));
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  // Validate sortBy
  if (!VALID_SORT_BY.includes(sortBy as typeof VALID_SORT_BY[number])) {
    return c.json({ error: "invalid_param", message: `Invalid sortBy. Allowed: ${VALID_SORT_BY.join(", ")}` }, 400);
  }

  // Validate sortOrder
  if (!VALID_SORT_ORDER.includes(sortOrder as typeof VALID_SORT_ORDER[number])) {
    return c.json({ error: "invalid_param", message: `Invalid sortOrder. Allowed: ${VALID_SORT_ORDER.join(", ")}` }, 400);
  }

  // Validate search length
  if (query.search && query.search.length > 200) {
    return c.json({ error: "invalid_param", message: "Search query too long (max 200 characters)." }, 400);
  }

  // Validate status
  if (query.status && !VALID_STATUSES.includes(query.status as typeof VALID_STATUSES[number])) {
    return c.json({ error: "invalid_param", message: `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}` }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Build where clause
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search } },
        { name: { contains: query.search } },
      ];
    }
    if (query.role) {
      where.userRoles = { some: { role: { name: query.role } } };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            select: { role: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return c.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        status: u.status,
        emailVerified: u.emailVerified,
        roles: u.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

usersApp.openapi(getUserRoute, async (c) => {
  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: {
          select: { role: { select: { id: true, name: true } } },
        },
      },
    });

    if (!user) {
      return c.json({ error: "not_found", message: "User not found." }, 404);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      emailVerified: user.emailVerified,
      roles: user.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

usersApp.use("/v1/admin/users/:id", requirePermission("user", "update"));

usersApp.openapi(patchUserRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        userRoles: { select: { role: { select: { name: true } } } },
      },
    });

    if (!user) {
      return c.json({ error: "not_found", message: "User not found." }, 404);
    }

    // Validate name: no HTML
    if (body.name !== undefined) {
      if (/<[^>]*>/.test(body.name)) {
        return c.json({ error: "invalid_input", message: "Name must not contain HTML tags." }, 400);
      }
    }

    let revokedSessionCount: number | undefined;
    const previousStatus = user.status;

    if (body.status === "deactivated") {
      // Cannot deactivate self
      if (id === auth.user.id) {
        return c.json({ error: "conflict", message: "Cannot deactivate your own account." }, 409);
      }

      // Cannot deactivate last super_admin
      const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === "super_admin");
      if (isSuperAdmin) {
        const activeSuperAdminCount = await prisma.user.count({
          where: {
            status: "active",
            userRoles: { some: { role: { name: "super_admin" } } },
          },
        });
        if (activeSuperAdminCount <= 1) {
          return c.json({ error: "conflict", message: "Cannot deactivate the last active super_admin." }, 409);
        }
      }

      // Deactivation: revoke all sessions in same transaction
      revokedSessionCount = await revokeAllUserSessions(prisma, id);
    }

    if (body.status === "active" && user.status !== "active") {
      // Reactivation: verify at least one role exists
      const roleCount = await prisma.userRole.count({ where: { userId: id } });
      if (roleCount === 0) {
        return c.json({ error: "conflict", message: "Cannot activate user with no roles." }, 409);
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "deactivated") updateData.deactivatedAt = new Date();
      if (body.status === "active") updateData.deactivatedAt = null;
    }
    if (body.name !== undefined) updateData.name = body.name;

    await prisma.user.update({ where: { id }, data: updateData });

    // Audit log
    if (body.status && body.status !== previousStatus) {
      await createAuditLog(prisma, {
        action: "user.status_changed",
        resource: "user",
        actorId: auth.user.id,
        subjectId: id,
        details: { previousStatus, newStatus: body.status, revokedSessionCount },
        ipAddress: c.req.header("CF-Connecting-IP"),
        userAgent: c.req.header("User-Agent"),
      });
    }

    // Fetch updated user
    const updated = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: { select: { role: { select: { id: true, name: true } } } },
      },
    });

    return c.json({
      user: {
        id: updated!.id,
        email: updated!.email,
        name: updated!.name,
        status: updated!.status,
        emailVerified: updated!.emailVerified,
        roles: updated!.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
        lastLoginAt: updated!.lastLoginAt?.toISOString() ?? null,
        createdAt: updated!.createdAt.toISOString(),
      },
      revokedSessionCount,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Role assignment requires role:update permission
usersApp.use("/v1/admin/users/:id/roles", requirePermission("role", "update"));
usersApp.use("/v1/admin/users/:id/roles/*", requirePermission("role", "update"));

usersApp.openapi(assignRolesRoute, async (c) => {
  const { id } = c.req.valid("param");
  const { roleIds } = c.req.valid("json");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      return c.json({ error: "not_found", message: "User not found." }, 404);
    }

    // Validate roles exist
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true },
    });
    if (roles.length !== roleIds.length) {
      return c.json({ error: "invalid_input", message: "One or more roles not found." }, 400);
    }

    // Create user roles (skip duplicates)
    for (const role of roles) {
      const existing = await prisma.userRole.findUnique({
        where: { userId_roleId: { userId: id, roleId: role.id } },
      });
      if (!existing) {
        await prisma.userRole.create({
          data: { userId: id, roleId: role.id, grantedBy: auth.user.id },
        });

        await createAuditLog(prisma, {
          action: "user.role_changed",
          resource: "user",
          actorId: auth.user.id,
          subjectId: id,
          details: { roleName: role.name, changeType: "assigned" },
          ipAddress: c.req.header("CF-Connecting-IP"),
          userAgent: c.req.header("User-Agent"),
        });
      }
    }

    // Return updated user
    const updated = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, status: true, emailVerified: true,
        lastLoginAt: true, createdAt: true,
        userRoles: { select: { role: { select: { id: true, name: true } } } },
      },
    });

    return c.json({
      id: updated!.id,
      email: updated!.email,
      name: updated!.name,
      status: updated!.status,
      emailVerified: updated!.emailVerified,
      roles: updated!.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
      lastLoginAt: updated!.lastLoginAt?.toISOString() ?? null,
      createdAt: updated!.createdAt.toISOString(),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

usersApp.openapi(removeRoleRoute, async (c) => {
  const { id, roleId } = c.req.valid("param");
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const userRole = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: id, roleId } },
      select: { role: { select: { name: true } } },
    });

    if (!userRole) {
      return c.json({ error: "not_found", message: "User does not have this role." }, 404);
    }

    // Self-demotion prevention: cannot remove own admin/super_admin
    if (id === auth.user.id && ["admin", "super_admin"].includes(userRole.role.name)) {
      return c.json({
        error: "conflict",
        message: `Cannot remove your own ${userRole.role.name} role.`,
      }, 409);
    }

    // Last super_admin protection
    if (userRole.role.name === "super_admin") {
      const activeSuperAdminCount = await prisma.user.count({
        where: {
          status: "active",
          userRoles: { some: { role: { name: "super_admin" } } },
        },
      });
      if (activeSuperAdminCount <= 1) {
        return c.json({
          error: "conflict",
          message: "Cannot remove the last super_admin role.",
        }, 409);
      }
    }

    // Cannot remove last role from any user
    const roleCount = await prisma.userRole.count({ where: { userId: id } });
    if (roleCount <= 1) {
      return c.json({
        error: "conflict",
        message: "Cannot remove the last role from a user.",
      }, 409);
    }

    await prisma.userRole.delete({
      where: { userId_roleId: { userId: id, roleId } },
    });

    await createAuditLog(prisma, {
      action: "user.role_changed",
      resource: "user",
      actorId: auth.user.id,
      subjectId: id,
      details: { roleName: userRole.role.name, changeType: "removed" },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: "Role removed." }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
