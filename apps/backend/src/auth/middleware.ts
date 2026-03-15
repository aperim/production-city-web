/**
 * Auth middleware: session validation, permission checks, deny-by-default.
 */

import type { Context, MiddlewareHandler } from "hono";
import { validateSession, extractSessionToken } from "./session.js";
import { createPrismaClient } from "../lib/prisma.js";
import { t } from "../i18n/index.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  status: string;
}

export interface AuthContext {
  user: AuthUser;
  sessionId: string;
  permissions: string[];
  roleIds?: string[];
}

/**
 * Auth middleware: validates session cookie and loads user with permissions.
 * Sets c.set("auth") with AuthContext on success.
 * Returns 401 if no valid session.
 * Cookie-only auth (no Bearer) in Phase 1.
 */
export function authMiddleware(): MiddlewareHandler {
  return async (c: Context, next) => {
    const cookieHeader = c.req.header("Cookie");
    const token = extractSessionToken(cookieHeader);

    if (!token) {
      return c.json({ error: "unauthorized", message: t("auth.login.required") }, 401);
    }

    const prisma = await createPrismaClient(c.env.DB);
    try {
      const session = await validateSession(prisma, token);
      if (!session) {
        return c.json({ error: "unauthorized", message: t("auth.login.invalidSession") }, 401);
      }

      // Load user with roles and permissions
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  rolePermissions: {
                    select: {
                      permission: {
                        select: { resource: true, action: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || user.status !== "active") {
        return c.json({ error: "unauthorized", message: t("auth.login.accountInactive") }, 401);
      }

      // Flatten permissions: "resource:action"
      const permissions = new Set<string>();
      const roleIds: string[] = [];
      for (const ur of user.userRoles) {
        roleIds.push(ur.role.id);
        for (const rp of ur.role.rolePermissions) {
          permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
        }
      }

      const authContext: AuthContext = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
        },
        sessionId: session.sessionId,
        permissions: Array.from(permissions),
        roleIds,
      };

      c.set("auth", authContext);
      return next();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  };
}

/**
 * Require a specific permission (resource:action).
 * Must be used after authMiddleware.
 */
export function requirePermission(resource: string, action: string): MiddlewareHandler {
  const required = `${resource}:${action}`;
  return async (c: Context, next) => {
    const auth = c.get("auth") as AuthContext | undefined;
    if (!auth) {
      return c.json({ error: "unauthorized", message: t("auth.login.required") }, 401);
    }
    if (!auth.permissions.includes(required)) {
      return c.json({ error: "forbidden", message: t("permissions.forbidden") }, 403);
    }
    return next();
  };
}

/**
 * Require any one of multiple permissions.
 * Must be used after authMiddleware.
 */
export function requireAnyPermission(permissions: string[]): MiddlewareHandler {
  return async (c: Context, next) => {
    const auth = c.get("auth") as AuthContext | undefined;
    if (!auth) {
      return c.json({ error: "unauthorized", message: t("auth.login.required") }, 401);
    }
    const hasAny = permissions.some((p) => auth.permissions.includes(p));
    if (!hasAny) {
      return c.json({ error: "forbidden", message: t("permissions.forbidden") }, 403);
    }
    return next();
  };
}

/**
 * Optional auth middleware: tries to authenticate but does not fail if no session.
 * Sets c.set("auth") with AuthContext on success, or leaves it unset.
 * Use for public endpoints that show extra content to authenticated users.
 */
export function optionalAuthMiddleware(): MiddlewareHandler {
  return async (c: Context, next) => {
    const cookieHeader = c.req.header("Cookie");
    const token = extractSessionToken(cookieHeader);

    if (!token) {
      return next();
    }

    const prisma = await createPrismaClient(c.env.DB);
    try {
      const session = await validateSession(prisma, token);
      if (!session) {
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  rolePermissions: {
                    select: {
                      permission: {
                        select: { resource: true, action: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || user.status !== "active") {
        return next();
      }

      const permissions = new Set<string>();
      const roleIds: string[] = [];
      for (const ur of user.userRoles) {
        roleIds.push(ur.role.id);
        for (const rp of ur.role.rolePermissions) {
          permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
        }
      }

      const authContext: AuthContext = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
        },
        sessionId: session.sessionId,
        permissions: Array.from(permissions),
        roleIds,
      };

      c.set("auth", authContext);
      return next();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  };
}
