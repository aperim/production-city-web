/**
 * Auth API handlers: magic link verification, code verification, logout, session info.
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { verifyMagicLinkToken, verifyMagicCode, TOKEN_INVALID_ERROR } from "./token.js";
import {
  createSession,
  buildSessionCookie,
  buildClearSessionCookie,
  extractSessionToken,
  validateSession,
  revokeSession,
} from "./session.js";
import { createAuditLog } from "./audit.js";
import { authMiddleware } from "./middleware.js";
import type { AuthContext } from "./middleware.js";

type Bindings = {
  DB: D1Database;
  HMAC_SECRET: string;
  ALLOWED_ORIGIN: string;
};

export const authApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

/** --- Schemas --- */

const VerifyTokenQuerySchema = z.object({
  token: z.string().min(1),
});

const VerifyCodeBodySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const TokenErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const VerifySuccessSchema = z.object({
  redirectUrl: z.string(),
});

const CodeErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  remainingAttempts: z.number().optional(),
});

const LogoutResponseSchema = z.object({
  message: z.string(),
});

const SessionInfoSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    status: z.string(),
  }),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  session: z.object({
    createdAt: z.string(),
    expiresAt: z.string(),
  }),
});

/** --- Route Definitions --- */

const verifyTokenRoute = createRoute({
  method: "get",
  path: "/v1/auth/verify",
  summary: "Verify magic link token",
  description: "Verify a magic link token from email. Sets session cookie on success.",
  request: { query: VerifyTokenQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: VerifySuccessSchema } },
      description: "Token verified, session created",
    },
    400: {
      content: { "application/json": { schema: TokenErrorSchema } },
      description: "Invalid or expired token",
    },
  },
});

const verifyCodeRoute = createRoute({
  method: "post",
  path: "/v1/auth/verify",
  summary: "Verify magic code",
  description: "Verify a 6-digit magic code. Sets session cookie on success.",
  request: {
    body: { content: { "application/json": { schema: VerifyCodeBodySchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: VerifySuccessSchema } },
      description: "Code verified, session created",
    },
    400: {
      content: { "application/json": { schema: CodeErrorSchema } },
      description: "Invalid code or max attempts exceeded",
    },
  },
});

const logoutRoute = createRoute({
  method: "post",
  path: "/v1/auth/logout",
  summary: "Log out",
  description: "Revoke current session and clear cookie.",
  responses: {
    200: {
      content: { "application/json": { schema: LogoutResponseSchema } },
      description: "Logged out successfully",
    },
  },
});

const sessionRoute = createRoute({
  method: "get",
  path: "/v1/auth/session",
  summary: "Get current session info",
  description: "Returns current user, roles, permissions, and session details.",
  responses: {
    200: {
      content: { "application/json": { schema: SessionInfoSchema } },
      description: "Session info",
    },
    401: {
      content: { "application/json": { schema: TokenErrorSchema } },
      description: "Not authenticated",
    },
  },
});

/** --- Handlers --- */

authApp.openapi(verifyTokenRoute, async (c) => {
  const { token } = c.req.valid("query");
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const result = await verifyMagicLinkToken(prisma, token);

    if (!result) {
      // Log server-side, return generic error
      console.error(JSON.stringify({ event: "auth.token.verification.failed" }));
      await createAuditLog(prisma, {
        action: "auth.magic_link.verified",
        resource: "auth",
        details: { email: "unknown", purpose: "unknown" },
        ipAddress: c.req.header("CF-Connecting-IP"),
        userAgent: c.req.header("User-Agent"),
      });
      return c.json(TOKEN_INVALID_ERROR, 400);
    }

    // Find or validate user
    let userId = result.magicLink.userId;
    if (!userId) {
      // Check for pending invitation acceptance
      const invitation = await prisma.invitation.findFirst({
        where: { email: result.magicLink.email, status: "pending" },
        select: { id: true, invitationRoles: { select: { roleId: true } } },
      });

      if (invitation) {
        // Create user from invitation
        const newUser = await prisma.user.create({
          data: {
            email: result.magicLink.email,
            status: "active",
            emailVerified: true,
            lastLoginAt: new Date(),
          },
        });
        userId = newUser.id;

        // Assign invitation roles
        for (const ir of invitation.invitationRoles) {
          await prisma.userRole.create({
            data: { userId: newUser.id, roleId: ir.roleId },
          });
        }

        // Accept invitation atomically
        await prisma.invitation.updateMany({
          where: { id: invitation.id, status: "pending" },
          data: {
            status: "accepted",
            activeEmail: null,
            userId: newUser.id,
            acceptedAt: new Date(),
          },
        });

        await createAuditLog(prisma, {
          action: "user.created",
          resource: "user",
          actorId: newUser.id,
          subjectId: newUser.id,
          details: { email: result.magicLink.email, source: "invitation" },
          ipAddress: c.req.header("CF-Connecting-IP"),
          userAgent: c.req.header("User-Agent"),
        });
      } else {
        // No user and no invitation: generic error
        return c.json(TOKEN_INVALID_ERROR, 400);
      }
    } else {
      // Update last login
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date(), emailVerified: true },
      });
    }

    // Create session
    const session = await createSession(
      prisma,
      userId,
      c.req.header("CF-Connecting-IP"),
      c.req.header("User-Agent"),
    );

    // Audit log
    await createAuditLog(prisma, {
      action: "auth.magic_link.verified",
      resource: "auth",
      actorId: userId,
      subjectId: userId,
      details: { email: result.magicLink.email, purpose: result.magicLink.purpose },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    await createAuditLog(prisma, {
      action: "auth.login",
      resource: "auth",
      actorId: userId,
      subjectId: userId,
      details: { email: result.magicLink.email, method: "magic_link" },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    // Set session cookie and Referrer-Policy
    c.header("Set-Cookie", buildSessionCookie(session.token));
    c.header("Referrer-Policy", "no-referrer");
    return c.json({ redirectUrl: "/dashboard" }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

authApp.openapi(verifyCodeRoute, async (c) => {
  const { email, code } = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  const hmacSecret = c.env.HMAC_SECRET || "default-hmac-secret";

  try {
    const { result, remainingAttempts, reason } = await verifyMagicCode(
      prisma,
      email,
      code,
      hmacSecret,
    );

    if (!result) {
      // Log specific reason server-side
      console.error(JSON.stringify({ event: "auth.code.verification.failed", reason }));

      await createAuditLog(prisma, {
        action: "auth.code.failed",
        resource: "auth",
        details: { email, remainingAttempts, reason },
        ipAddress: c.req.header("CF-Connecting-IP"),
        userAgent: c.req.header("User-Agent"),
      });

      const response: { error: string; message: string; remainingAttempts?: number } = {
        ...TOKEN_INVALID_ERROR,
      };
      if (remainingAttempts !== undefined) {
        response.remainingAttempts = remainingAttempts;
      }
      return c.json(response, 400);
    }

    // Find or create user (same logic as token verification)
    let userId = result.magicLink.userId;
    if (!userId) {
      const invitation = await prisma.invitation.findFirst({
        where: { email: result.magicLink.email, status: "pending" },
        select: { id: true, invitationRoles: { select: { roleId: true } } },
      });

      if (invitation) {
        const newUser = await prisma.user.create({
          data: {
            email: result.magicLink.email,
            status: "active",
            emailVerified: true,
            lastLoginAt: new Date(),
          },
        });
        userId = newUser.id;

        for (const ir of invitation.invitationRoles) {
          await prisma.userRole.create({
            data: { userId: newUser.id, roleId: ir.roleId },
          });
        }

        await prisma.invitation.updateMany({
          where: { id: invitation.id, status: "pending" },
          data: {
            status: "accepted",
            activeEmail: null,
            userId: newUser.id,
            acceptedAt: new Date(),
          },
        });

        await createAuditLog(prisma, {
          action: "user.created",
          resource: "user",
          actorId: newUser.id,
          subjectId: newUser.id,
          details: { email: result.magicLink.email, source: "invitation" },
          ipAddress: c.req.header("CF-Connecting-IP"),
          userAgent: c.req.header("User-Agent"),
        });
      } else {
        return c.json(TOKEN_INVALID_ERROR, 400);
      }
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: new Date(), emailVerified: true },
      });
    }

    const session = await createSession(
      prisma,
      userId,
      c.req.header("CF-Connecting-IP"),
      c.req.header("User-Agent"),
    );

    await createAuditLog(prisma, {
      action: "auth.code.verified",
      resource: "auth",
      actorId: userId,
      subjectId: userId,
      details: { email: result.magicLink.email, purpose: result.magicLink.purpose },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    await createAuditLog(prisma, {
      action: "auth.login",
      resource: "auth",
      actorId: userId,
      subjectId: userId,
      details: { email: result.magicLink.email, method: "magic_code" },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    c.header("Set-Cookie", buildSessionCookie(session.token));
    c.header("Referrer-Policy", "no-referrer");
    return c.json({ redirectUrl: "/dashboard" }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

authApp.openapi(logoutRoute, async (c) => {
  const cookieHeader = c.req.header("Cookie");
  const token = extractSessionToken(cookieHeader);
  const prisma = await createPrismaClient(c.env.DB);

  try {
    if (token) {
      const session = await validateSession(prisma, token);
      if (session) {
        await revokeSession(prisma, session.sessionId);

        await createAuditLog(prisma, {
          action: "auth.logout",
          resource: "auth",
          actorId: session.userId,
          subjectId: session.userId,
          ipAddress: c.req.header("CF-Connecting-IP"),
          userAgent: c.req.header("User-Agent"),
        });
      }
    }

    c.header("Set-Cookie", buildClearSessionCookie());
    return c.json({ message: "Logged out" }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Session info requires auth
authApp.use("/v1/auth/session", authMiddleware());

authApp.openapi(sessionRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    // Load roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        userRoles: {
          select: {
            role: { select: { name: true } },
          },
        },
      },
    });

    const roles = userWithRoles?.userRoles.map((ur) => ur.role.name) ?? [];

    // Get session info
    const token = extractSessionToken(c.req.header("Cookie"));
    let sessionInfo = { createdAt: "", expiresAt: "" };
    if (token) {
      const session = await validateSession(prisma, token);
      if (session) {
        sessionInfo = {
          createdAt: session.createdAt.toISOString(),
          expiresAt: session.expiresAt.toISOString(),
        };
      }
    }

    return c.json(
      {
        user: {
          id: auth.user.id,
          email: auth.user.email,
          name: auth.user.name,
          status: auth.user.status,
        },
        roles,
        permissions: auth.permissions,
        session: sessionInfo,
      },
      200,
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
