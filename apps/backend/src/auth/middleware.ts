/**
 * Auth middleware: session validation, permission checks, deny-by-default.
 */

import type { Context, MiddlewareHandler } from "hono";
import { validateSession, extractSessionToken } from "./session.js";
import { createPrismaClient } from "../lib/prisma.js";

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
      return c.json({ error: "unauthorized", message: "Authentication required." }, 401);
    }

    const prisma = await createPrismaClient(c.env.DB);
    try {
      const session = await validateSession(prisma, token);
      if (!session) {
        return c.json({ error: "unauthorized", message: "Invalid or expired session." }, 401);
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
        return c.json({ error: "unauthorized", message: "Account is not active." }, 401);
      }

      // Flatten permissions: "resource:action"
      const permissions = new Set<string>();
      for (const ur of user.userRoles) {
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
      return c.json({ error: "unauthorized", message: "Authentication required." }, 401);
    }
    if (!auth.permissions.includes(required)) {
      return c.json({ error: "forbidden", message: "Insufficient permissions." }, 403);
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
      return c.json({ error: "unauthorized", message: "Authentication required." }, 401);
    }
    const hasAny = permissions.some((p) => auth.permissions.includes(p));
    if (!hasAny) {
      return c.json({ error: "forbidden", message: "Insufficient permissions." }, 403);
    }
    return next();
  };
}
