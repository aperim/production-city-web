/**
 * Tests for WebSocket upgrade routes: /v1/ws and /v1/ws/delivery.
 * Validates HTTP-level behavior (auth, origin, rate limiting) before WebSocket upgrade.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { setupTestDatabase } from "./test-helpers.js";
import { sha256Hex, generateSessionToken } from "../auth/token.js";

beforeAll(async () => {
  await setupTestDatabase();
});

describe("GET /v1/ws — Authenticated WebSocket upgrade", () => {
  it("returns 426 when Upgrade header is missing", async () => {
    const req = new Request("http://localhost/v1/ws", {
      headers: { Origin: env.ALLOWED_ORIGIN },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(426);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("upgrade_required");
  });

  it("returns 403 when Origin header is missing", async () => {
    const req = new Request("http://localhost/v1/ws", {
      headers: { Upgrade: "websocket" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(403);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("forbidden");
  });

  it("returns 403 when Origin header does not match ALLOWED_ORIGIN", async () => {
    const req = new Request("http://localhost/v1/ws", {
      headers: {
        Upgrade: "websocket",
        Origin: "https://evil.com",
      },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(403);
  });

  it("returns 401 when session cookie is missing", async () => {
    const req = new Request("http://localhost/v1/ws", {
      headers: {
        Upgrade: "websocket",
        Origin: env.ALLOWED_ORIGIN,
      },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("unauthorized");
  });

  it("returns 401 when session token is invalid", async () => {
    const req = new Request("http://localhost/v1/ws", {
      headers: {
        Upgrade: "websocket",
        Origin: env.ALLOWED_ORIGIN,
        Cookie: "__Host-session=invalid-token",
      },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not active", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `ws-inactive-${Date.now()}@test.com`;
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);

      const user = await prisma.user.create({
        data: { email, status: "pending_approval" },
      });

      await prisma.session.create({
        data: {
          userId: user.id,
          token: tokenHash,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });

      const req = new Request("http://localhost/v1/ws", {
        headers: {
          Upgrade: "websocket",
          Origin: env.ALLOWED_ORIGIN,
          Cookie: `__Host-session=${token}`,
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(403);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("includes Cache-Control: no-store on error responses", async () => {
    const req = new Request("http://localhost/v1/ws", {
      headers: {
        Upgrade: "websocket",
        Origin: env.ALLOWED_ORIGIN,
      },
    });
    const res = await app.fetch(req, env);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("GET /v1/ws/delivery — Delivery token WebSocket upgrade", () => {
  it("returns 426 when Upgrade header is missing", async () => {
    const req = new Request("http://localhost/v1/ws/delivery?token=test", {
      headers: { Origin: env.ALLOWED_ORIGIN },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(426);
  });

  it("returns 403 when Origin is invalid", async () => {
    const req = new Request("http://localhost/v1/ws/delivery?token=test", {
      headers: {
        Upgrade: "websocket",
        Origin: "https://evil.com",
      },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(403);
  });

  it("returns 401 when delivery token is missing", async () => {
    const req = new Request("http://localhost/v1/ws/delivery", {
      headers: {
        Upgrade: "websocket",
        Origin: env.ALLOWED_ORIGIN,
      },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("unauthorized");
    expect(body.message).toContain("Delivery token required");
  });

  it("returns 401 for non-existent delivery token", async () => {
    const req = new Request("http://localhost/v1/ws/delivery?token=nonexistent", {
      headers: {
        Upgrade: "websocket",
        Origin: env.ALLOWED_ORIGIN,
      },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body.message).toContain("Invalid delivery token");
  });

  it("returns 401 for already-used delivery token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `delivery-used-${Date.now()}@test.com`;
      const tokenHash = await sha256Hex(generateSessionToken());
      const deliveryToken = crypto.randomUUID();

      await prisma.magicLink.create({
        data: {
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          deliveryToken,
          deliveryTokenUsed: true,
        },
      });

      const req = new Request(`http://localhost/v1/ws/delivery?token=${deliveryToken}`, {
        headers: {
          Upgrade: "websocket",
          Origin: env.ALLOWED_ORIGIN,
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("already used");
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("returns 401 for expired delivery token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `delivery-expired-${Date.now()}@test.com`;
      const tokenHash = await sha256Hex(generateSessionToken());
      const deliveryToken = crypto.randomUUID();

      await prisma.magicLink.create({
        data: {
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() - 1000), // already expired
          deliveryToken,
          deliveryTokenUsed: false,
        },
      });

      const req = new Request(`http://localhost/v1/ws/delivery?token=${deliveryToken}`, {
        headers: {
          Upgrade: "websocket",
          Origin: env.ALLOWED_ORIGIN,
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("expired");
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe("WebSocket audit logging", () => {
  it("logs ws_auth_failure for invalid origin", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      // Clear audit logs for this test
      const before = await prisma.auditLog.count({ where: { action: "ws_auth_failure" } });

      const req = new Request("http://localhost/v1/ws", {
        headers: {
          Upgrade: "websocket",
          Origin: "https://evil.com",
        },
      });
      await app.fetch(req, env);

      const after = await prisma.auditLog.count({ where: { action: "ws_auth_failure" } });
      expect(after).toBeGreaterThan(before);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});
