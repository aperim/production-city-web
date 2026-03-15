/**
 * Auth API handlers: magic link request, verification, code verification, logout, session info.
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { verifyMagicLinkToken, verifyMagicCode, TOKEN_INVALID_ERROR } from "./token.js";
import { t } from "../i18n/index.js";
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
import { handleMagicLinkRequest } from "../email/service.js";

type Bindings = {
  DB: D1Database;
  HMAC_SECRET: string;
  ALLOWED_ORIGIN: string;
  POSTMARK_API_TOKEN: string;
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
    hasPhone: z.boolean(),
  }),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  session: z.object({
    createdAt: z.string(),
    expiresAt: z.string(),
  }),
});

const MagicLinkRequestBodySchema = z.object({
  email: z.string().email(),
});

const MagicLinkResponseSchema = z.object({
  requestId: z.string(),
  status: z.string(),
  message: z.string(),
  deliveryToken: z.string(),
});

const RateLimitedSchema = z.object({
  error: z.string(),
  retryAfter: z.number(),
  message: z.string(),
});

/** --- Route Definitions --- */

const magicLinkRoute = createRoute({
  method: "post",
  path: "/v1/auth/magic-link",
  summary: "Request a magic link login email",
  description:
    "Sends a magic link email to the provided address. " +
    "Response is identical regardless of whether the email is registered (anti-enumeration).",
  request: {
    body: { content: { "application/json": { schema: MagicLinkRequestBodySchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: MagicLinkResponseSchema } },
      description: "Magic link request accepted",
    },
    429: {
      content: { "application/json": { schema: RateLimitedSchema } },
      description: "Rate limited — too many requests",
    },
  },
});

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

authApp.openapi(magicLinkRoute, async (c) => {
  const { email } = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const ipAddress = c.req.header("CF-Connecting-IP") ?? "unknown";
    const userAgent = c.req.header("User-Agent");
    const baseUrl = c.env.ALLOWED_ORIGIN || "http://localhost:4321";
    const hmacSecret = c.env.HMAC_SECRET || "dev-hmac-secret-do-not-use-in-production";
    const postmarkApiToken = c.env.POSTMARK_API_TOKEN || "";

    const result = await handleMagicLinkRequest(
      { prisma, postmarkApiToken, hmacSecret, baseUrl },
      { email, ipAddress, userAgent },
    );

    if (result.status === 429) {
      return c.json(result.body as { error: string; retryAfter: number; message: string }, 429);
    }
    return c.json(result.body as { requestId: string; status: string; message: string; deliveryToken: string }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

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
      return c.json(TOKEN_INVALID_ERROR(), 400);
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
        return c.json(TOKEN_INVALID_ERROR(), 400);
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
        ...TOKEN_INVALID_ERROR(),
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
        return c.json(TOKEN_INVALID_ERROR(), 400);
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
    return c.json({ message: t("auth.login.loggedOut") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Auth-protected endpoints
authApp.use("/v1/auth/session", authMiddleware());
authApp.use("/v1/auth/profile", authMiddleware());
authApp.use("/v1/auth/sessions", authMiddleware());
authApp.use("/v1/auth/sessions/*", authMiddleware());

authApp.openapi(sessionRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    // Load roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        phone: true,
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
          hasPhone: userWithRoles?.phone != null && userWithRoles.phone.length > 0,
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

/** --- Profile Update --- */

const UpdateProfileBodySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
});

const ProfileUpdateSuccessSchema = z.object({
  message: z.string(),
});

const updateProfileRoute = createRoute({
  method: "patch",
  path: "/v1/auth/profile",
  summary: "Update current user profile",
  description: "Update the authenticated user's profile (name only).",
  request: {
    body: { content: { "application/json": { schema: UpdateProfileBodySchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: ProfileUpdateSuccessSchema } },
      description: "Profile updated successfully",
    },
    400: {
      content: { "application/json": { schema: TokenErrorSchema } },
      description: "Invalid input",
    },
    401: {
      content: { "application/json": { schema: TokenErrorSchema } },
      description: "Not authenticated",
    },
  },
});

authApp.openapi(updateProfileRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const { name: rawName } = c.req.valid("json");
  const name = rawName.trim();

  if (!name) {
    return c.json({ error: "validation_error", message: "Name cannot be empty" }, 400);
  }

  if (name.length > 100) {
    return c.json({ error: "validation_error", message: "Name must be 100 characters or fewer" }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);

  try {
    const oldUser = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { name: true },
    });

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { name, updatedAt: new Date() },
    });

    await createAuditLog(prisma, {
      action: "profile.update",
      resource: "user",
      actorId: auth.user.id,
      subjectId: auth.user.id,
      details: { field: "name", oldValue: oldUser?.name ?? "", newValue: name },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: "Profile updated" }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

/** --- Session Management --- */

/**
 * Parse user agent string to human-readable browser/OS.
 * Lightweight — no external dependencies.
 */
function parseUserAgent(ua: string | null): { browser: string; os: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown" };

  let browser = "Unknown";
  let os = "Unknown";

  // Browser detection
  if (ua.includes("Firefox/")) {
    const m = ua.match(/Firefox\/(\d+)/);
    browser = m ? `Firefox ${m[1]}` : "Firefox";
  } else if (ua.includes("Edg/")) {
    const m = ua.match(/Edg\/(\d+)/);
    browser = m ? `Edge ${m[1]}` : "Edge";
  } else if (ua.includes("Chrome/")) {
    const m = ua.match(/Chrome\/(\d+)/);
    browser = m ? `Chrome ${m[1]}` : "Chrome";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    const m = ua.match(/Version\/(\d+)/);
    browser = m ? `Safari ${m[1]}` : "Safari";
  }

  // OS detection
  if (ua.includes("Windows NT")) {
    const m = ua.match(/Windows NT (\d+\.\d+)/);
    if (m) {
      const ver = m[1];
      if (ver === "10.0") os = "Windows 10+";
      else os = `Windows NT ${ver}`;
    } else {
      os = "Windows";
    }
  } else if (ua.includes("Mac OS X")) {
    const m = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = m && m[1] ? `macOS ${m[1].replace(/_/g, ".")}` : "macOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("Android")) {
    const m = ua.match(/Android (\d+)/);
    os = m ? `Android ${m[1]}` : "Android";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    const m = ua.match(/OS (\d+)/);
    os = m ? `iOS ${m[1]}` : "iOS";
  }

  return { browser, os };
}

const SessionItemSchema = z.object({
  id: z.string(),
  browser: z.string(),
  os: z.string(),
  createdAt: z.string(),
  lastActiveAt: z.string(),
  isCurrent: z.boolean(),
});

const SessionListResponseSchema = z.object({
  sessions: z.array(SessionItemSchema),
});

const listSessionsRoute = createRoute({
  method: "get",
  path: "/v1/auth/sessions",
  summary: "List user's active sessions",
  description: "Returns all non-revoked, non-expired sessions for the authenticated user. No IP addresses included.",
  responses: {
    200: {
      content: { "application/json": { schema: SessionListResponseSchema } },
      description: "List of active sessions",
    },
    401: {
      content: { "application/json": { schema: TokenErrorSchema } },
      description: "Not authenticated",
    },
  },
});

authApp.openapi(listSessionsRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const now = new Date();
    const sessions = await prisma.session.findMany({
      where: {
        userId: auth.user.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        userAgent: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { lastActiveAt: "desc" },
    });

    const result = sessions.map((s) => {
      const { browser, os } = parseUserAgent(s.userAgent);
      return {
        id: s.id,
        browser,
        os,
        createdAt: s.createdAt.toISOString(),
        lastActiveAt: s.lastActiveAt.toISOString(),
        isCurrent: s.id === auth.sessionId,
      };
    });

    return c.json({ sessions: result }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

const RevokeSessionSuccessSchema = z.object({
  message: z.string(),
});

const RevokeSessionParamsSchema = z.object({
  sessionId: z.string().min(1),
});

const revokeSessionRoute = createRoute({
  method: "delete",
  path: "/v1/auth/sessions/{sessionId}",
  summary: "Revoke a session",
  description: "Revoke one of the authenticated user's sessions. Cannot revoke the current session.",
  request: { params: RevokeSessionParamsSchema },
  responses: {
    200: {
      content: { "application/json": { schema: RevokeSessionSuccessSchema } },
      description: "Session revoked",
    },
    400: {
      content: { "application/json": { schema: TokenErrorSchema } },
      description: "Cannot revoke current session",
    },
    404: {
      content: { "application/json": { schema: TokenErrorSchema } },
      description: "Session not found",
    },
  },
});

authApp.openapi(revokeSessionRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const { sessionId } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);

  try {
    // Cannot revoke current session
    if (sessionId === auth.sessionId) {
      return c.json(
        { error: "invalid_request", message: "Cannot revoke current session" },
        400,
      );
    }

    // Find the session — must belong to this user and not already revoked
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: auth.user.id,
        revokedAt: null,
      },
      select: { id: true },
    });

    // Unified 404 for not-found, foreign, or already-revoked (no info leakage)
    if (!session) {
      return c.json(
        { error: "not_found", message: "Session not found" },
        404,
      );
    }

    await revokeSession(prisma, session.id);

    await createAuditLog(prisma, {
      action: "session.revoke",
      resource: "session",
      actorId: auth.user.id,
      subjectId: auth.user.id,
      details: { sessionId },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: "Session revoked" }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
