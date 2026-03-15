/**
 * WebSocket upgrade routes:
 * - GET /v1/ws — Authenticated WebSocket upgrade (cookie-based)
 * - GET /v1/ws/delivery — Delivery token WebSocket upgrade (unauthenticated)
 */

import { Hono } from "hono";
import { createPrismaClient } from "../lib/prisma.js";
import { validateSession, extractSessionToken } from "../auth/session.js";
import { hmacSha256Hex } from "../auth/token.js";
import { createAuditLog } from "../auth/audit.js";

interface Bindings {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  POSTMARK_API_TOKEN: string;
  WEBSOCKET_SERVER: DurableObjectNamespace;
}

/** Per-IP rate limiting state (in-memory, resets on Worker restart) */
const ipUpgradeCounters = new Map<string, { count: number; windowStart: number }>();
const IP_RATE_LIMIT = 20;
const IP_RATE_WINDOW_MS = 60_000;

/**
 * Check per-IP rate limit for WebSocket upgrades.
 * Returns true if request is allowed.
 */
function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  let state = ipUpgradeCounters.get(ip);

  if (!state || now - state.windowStart > IP_RATE_WINDOW_MS) {
    state = { count: 0, windowStart: now };
    ipUpgradeCounters.set(ip, state);
  }

  state.count++;
  return state.count <= IP_RATE_LIMIT;
}

/**
 * Validate Origin header against ALLOWED_ORIGIN.
 */
function validateOrigin(origin: string | undefined, allowedOrigin: string): boolean {
  if (!origin) return false;
  return origin === allowedOrigin;
}

export const wsApp = new Hono<{ Bindings: Bindings }>();

/**
 * GET /v1/ws — Authenticated WebSocket upgrade.
 * Validates __Secure-session cookie, loads user with permissions,
 * then forwards to the Durable Object with HMAC-signed auth context.
 */
wsApp.get("/v1/ws", async (c) => {
  // Cache-Control: no-store on all responses from this route
  c.header("Cache-Control", "no-store");

  // Validate Upgrade header
  if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") {
    return c.json({ error: "upgrade_required", message: "WebSocket upgrade required" }, 426);
  }

  // Origin validation (primary CSRF defense for WebSocket)
  const origin = c.req.header("Origin");
  if (!validateOrigin(origin, c.env.ALLOWED_ORIGIN)) {
    const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
    const prisma = await createPrismaClient(c.env.DB);
    try {
      await createAuditLog(prisma, {
        action: "ws_auth_failure",
        resource: "websocket",
        details: { reason: "invalid_origin", origin: origin ?? "missing" },
        ipAddress: ip,
        userAgent: c.req.header("User-Agent"),
      });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
    return c.json({ error: "forbidden", message: "Invalid origin" }, 403);
  }

  // Pre-auth rate limiting (BEFORE authentication to prevent DB flooding)
  const clientIp = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
  if (!checkIpRateLimit(clientIp)) {
    const prisma = await createPrismaClient(c.env.DB);
    try {
      await createAuditLog(prisma, {
        action: "ws_rate_limited",
        resource: "websocket",
        details: { limitType: "ip_upgrade" },
        ipAddress: clientIp,
      });
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
    return c.json({ error: "rate_limited", message: "Too many upgrade requests" }, 429);
  }

  // Authenticate via __Secure-session cookie
  const cookieHeader = c.req.header("Cookie");
  const token = extractSessionToken(cookieHeader);

  if (!token) {
    return c.json({ error: "unauthorized", message: "Authentication required" }, 401);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const session = await validateSession(prisma, token);
    if (!session) {
      await createAuditLog(prisma, {
        action: "ws_auth_failure",
        resource: "websocket",
        details: { reason: "invalid_session" },
        ipAddress: clientIp,
        userAgent: c.req.header("User-Agent"),
      });
      return c.json({ error: "unauthorized", message: "Invalid or expired session" }, 401);
    }

    // Load user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: { select: { resource: true, action: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== "active") {
      await createAuditLog(prisma, {
        action: "ws_auth_failure",
        resource: "websocket",
        details: { reason: "inactive_user" },
        ipAddress: clientIp,
        subjectId: session.userId,
      });
      return c.json({ error: "forbidden", message: "Account is not active" }, 403);
    }

    // Flatten permissions
    const roles: string[] = [];
    const permissions = new Set<string>();
    for (const ur of user.userRoles) {
      roles.push(ur.role.name);
      for (const rp of ur.role.rolePermissions) {
        permissions.add(`${rp.permission.resource}:${rp.permission.action}`);
      }
    }

    // Sign auth context with HMAC before forwarding to DO (includes timestamp for replay protection)
    const authPayload = JSON.stringify({
      userId: user.id,
      roles,
      permissions: Array.from(permissions),
      sessionId: session.sessionId,
      ts: Date.now(),
    });
    const authSignature = await hmacSha256Hex(c.env.HMAC_SECRET, authPayload);

    // Route to DO keyed by userId
    const doId = c.env.WEBSOCKET_SERVER.idFromName(user.id);
    const doStub = c.env.WEBSOCKET_SERVER.get(doId);

    // Forward upgrade request to DO with signed auth context
    const doRequest = new Request(c.req.url, {
      headers: {
        Upgrade: "websocket",
        "X-WS-Auth-Payload": authPayload,
        "X-WS-Auth-Signature": authSignature,
      },
    });

    // Audit log the connection
    await createAuditLog(prisma, {
      actorId: user.id,
      action: "ws_connect",
      resource: "websocket",
      details: { durableObjectId: doId.toString() },
      ipAddress: clientIp,
      userAgent: c.req.header("User-Agent"),
    });

    return doStub.fetch(doRequest);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

/**
 * GET /v1/ws/delivery — Delivery token WebSocket upgrade.
 * Validates one-time delivery token, scopes connection to delivery channel.
 */
wsApp.get("/v1/ws/delivery", async (c) => {
  c.header("Cache-Control", "no-store");

  // Validate Upgrade header
  if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") {
    return c.json({ error: "upgrade_required", message: "WebSocket upgrade required" }, 426);
  }

  // Origin validation
  const origin = c.req.header("Origin");
  if (!validateOrigin(origin, c.env.ALLOWED_ORIGIN)) {
    return c.json({ error: "forbidden", message: "Invalid origin" }, 403);
  }

  // Pre-auth rate limiting
  const clientIp = c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For") ?? "unknown";
  if (!checkIpRateLimit(clientIp)) {
    return c.json({ error: "rate_limited", message: "Too many upgrade requests" }, 429);
  }

  // Extract delivery token from query
  const deliveryToken = c.req.query("token");
  if (!deliveryToken) {
    return c.json({ error: "unauthorized", message: "Delivery token required" }, 401);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Atomic conditional consume: marks token as used in a single query.
    // If count === 0, the token was invalid, already used, or expired.
    const consumed = await prisma.magicLink.updateMany({
      where: {
        deliveryToken,
        deliveryTokenUsed: false,
        expiresAt: { gt: new Date() },
      },
      data: { deliveryTokenUsed: true },
    });

    if (consumed.count === 0) {
      // Distinguish between invalid, used, and expired for user-facing errors
      const magicLink = await prisma.magicLink.findUnique({
        where: { deliveryToken },
        select: { deliveryTokenUsed: true, expiresAt: true },
      });

      if (!magicLink) {
        return c.json({ error: "unauthorized", message: "Invalid delivery token" }, 401);
      }
      if (magicLink.deliveryTokenUsed) {
        return c.json({ error: "unauthorized", message: "Delivery token already used" }, 401);
      }
      if (magicLink.expiresAt <= new Date()) {
        return c.json({ error: "unauthorized", message: "Delivery token expired" }, 401);
      }
      return c.json({ error: "unauthorized", message: "Invalid delivery token" }, 401);
    }

    // Fetch the consumed magic link for routing
    const magicLink = await prisma.magicLink.findUnique({
      where: { deliveryToken },
      select: { id: true },
    });

    if (!magicLink) {
      return c.json({ error: "unauthorized", message: "Invalid delivery token" }, 401);
    }

    // Sign auth context for delivery-only connection (includes timestamp for replay protection)
    const deliveryChannel = `delivery:${magicLink.id}`;
    const authPayload = JSON.stringify({
      userId: `delivery:${magicLink.id}`,
      roles: [],
      permissions: [],
      sessionId: `delivery:${magicLink.id}`,
      deliveryOnly: true,
      deliveryChannel,
      ts: Date.now(),
    });
    const authSignature = await hmacSha256Hex(c.env.HMAC_SECRET, authPayload);

    // Route to DO keyed by delivery channel
    const doId = c.env.WEBSOCKET_SERVER.idFromName(deliveryChannel);
    const doStub = c.env.WEBSOCKET_SERVER.get(doId);

    const doRequest = new Request(c.req.url, {
      headers: {
        Upgrade: "websocket",
        "X-WS-Auth-Payload": authPayload,
        "X-WS-Auth-Signature": authSignature,
      },
    });

    return doStub.fetch(doRequest);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
