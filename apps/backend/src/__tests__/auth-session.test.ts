import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { createPrismaClient } from "../lib/prisma.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });
import {
  createSession,
  validateSession,
  revokeSession,
  revokeAllUserSessions,
  buildSessionCookie,
  buildClearSessionCookie,
  extractSessionToken,
  SESSION_COOKIE_NAME,
} from "../auth/session.js";

describe("Session creation", () => {
  it("creates a session and returns token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "session-create@test.com", status: "active" },
      });

      const result = await createSession(prisma, user.id, "1.2.3.4", "TestAgent");
      expect(result.token).toBeTruthy();
      expect(result.sessionId).toBeTruthy();
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    } finally {
      await prisma.$disconnect();
    }
  });

  it("stores hashed token in database (not plaintext)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "session-hash@test.com", status: "active" },
      });

      const result = await createSession(prisma, user.id);
      const session = await prisma.session.findUnique({
        where: { id: result.sessionId },
      });

      // The stored token is a hash, not the plaintext token
      expect(session!.token).not.toBe(result.token);
      expect(session!.token).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Session validation", () => {
  it("validates an active session", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "session-valid@test.com", status: "active" },
      });

      const created = await createSession(prisma, user.id);
      const validated = await validateSession(prisma, created.token);

      expect(validated).not.toBeNull();
      expect(validated!.userId).toBe(user.id);
      expect(validated!.sessionId).toBe(created.sessionId);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects a revoked session", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "session-revoked@test.com", status: "active" },
      });

      const created = await createSession(prisma, user.id);
      await revokeSession(prisma, created.sessionId);
      const validated = await validateSession(prisma, created.token);

      expect(validated).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects an expired session (hard limit)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "session-expired@test.com", status: "active" },
      });

      const created = await createSession(prisma, user.id);
      // Manually set expiresAt to past
      await prisma.session.update({
        where: { id: created.sessionId },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const validated = await validateSession(prisma, created.token);
      expect(validated).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects an idle session (30 days)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "session-idle@test.com", status: "active" },
      });

      const created = await createSession(prisma, user.id);
      // Set lastActiveAt to 31 days ago
      await prisma.session.update({
        where: { id: created.sessionId },
        data: { lastActiveAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) },
      });

      const validated = await validateSession(prisma, created.token);
      expect(validated).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("throttles sliding expiry updates (max once per 5 min)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "session-throttle@test.com", status: "active" },
      });

      const created = await createSession(prisma, user.id);

      // First validation immediately after creation: lastActiveAt should NOT update
      // (because idle time < 5 minutes)
      const before = await prisma.session.findUnique({
        where: { id: created.sessionId },
        select: { lastActiveAt: true },
      });

      await validateSession(prisma, created.token);

      const after = await prisma.session.findUnique({
        where: { id: created.sessionId },
        select: { lastActiveAt: true },
      });

      // lastActiveAt should be unchanged (within the 5-minute throttle window)
      expect(after!.lastActiveAt.getTime()).toBe(before!.lastActiveAt.getTime());

      // Now simulate 6 minutes of idle time
      await prisma.session.update({
        where: { id: created.sessionId },
        data: { lastActiveAt: new Date(Date.now() - 6 * 60 * 1000) },
      });

      const beforeUpdate = await prisma.session.findUnique({
        where: { id: created.sessionId },
        select: { lastActiveAt: true },
      });

      await validateSession(prisma, created.token);

      const afterUpdate = await prisma.session.findUnique({
        where: { id: created.sessionId },
        select: { lastActiveAt: true },
      });

      // lastActiveAt should be updated now
      expect(afterUpdate!.lastActiveAt.getTime()).toBeGreaterThan(
        beforeUpdate!.lastActiveAt.getTime(),
      );
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects nonexistent token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const validated = await validateSession(prisma, "nonexistent-token");
      expect(validated).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Session revocation", () => {
  it("revokeAllUserSessions revokes all active sessions", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "revoke-all@test.com", status: "active" },
      });

      await createSession(prisma, user.id);
      await createSession(prisma, user.id);
      await createSession(prisma, user.id);

      const count = await revokeAllUserSessions(prisma, user.id);
      expect(count).toBe(3);

      // All sessions should now be revoked
      const activeSessions = await prisma.session.count({
        where: { userId: user.id, revokedAt: null },
      });
      expect(activeSessions).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Cookie helpers", () => {
  it("builds session cookie with correct attributes", () => {
    const cookie = buildSessionCookie("my-token");
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=my-token`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Domain=production.city");
    expect(cookie).toContain("Max-Age=");
  });

  it("builds clear cookie with Max-Age=0", () => {
    const cookie = buildClearSessionCookie();
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(cookie).toContain("Max-Age=0");
  });

  it("extracts token from cookie header", () => {
    const token = extractSessionToken(`${SESSION_COOKIE_NAME}=my-token; other=value`);
    expect(token).toBe("my-token");
  });

  it("returns null when cookie header is missing", () => {
    expect(extractSessionToken(undefined)).toBeNull();
  });

  it("returns null when session cookie is absent", () => {
    expect(extractSessionToken("other=value")).toBeNull();
  });

  it("cookie name uses __Secure- prefix", () => {
    expect(SESSION_COOKIE_NAME).toBe("__Secure-session");
  });
});
