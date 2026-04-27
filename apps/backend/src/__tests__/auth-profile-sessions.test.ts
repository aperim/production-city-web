/**
 * Tests for PATCH /v1/auth/profile, GET /v1/auth/sessions, DELETE /v1/auth/sessions/:id
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { setupTestDatabase } from "./test-helpers.js";
import { sha256Hex, generateSessionToken } from "../auth/token.js";
import { SESSION_COOKIE_NAME } from "../auth/session.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/** Helper: create user + session, return cookie string */
async function createUserWithSession(
  email: string,
  name?: string,
  userAgent?: string,
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.create({
      data: { email, name: name ?? null, status: "active" },
    });

    const token = generateSessionToken();
    const tokenHash = await sha256Hex(token);
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(),
        userAgent: userAgent ?? "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/537.36 Chrome/133",
      },
    });

    return {
      user,
      session,
      token,
      cookie: `${SESSION_COOKIE_NAME}=${token}`,
    };
  } finally {
    await prisma.$disconnect();
  }
}

/** Headers for mutating requests (CSRF requires Origin) */
function patchHeaders(cookie: string) {
  return {
    Cookie: cookie,
    Origin: "http://localhost",
    "Content-Type": "application/json",
  };
}

function deleteHeaders(cookie: string) {
  return {
    Cookie: cookie,
    Origin: "http://localhost",
  };
}

describe("PATCH /v1/auth/profile", () => {
  it("updates user name", async () => {
    const { cookie, user } = await createUserWithSession(
      `profile-update-${Date.now()}@test.com`,
      "Old Name",
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/profile", {
        method: "PATCH",
        headers: patchHeaders(cookie),
        body: JSON.stringify({ name: "New Name" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.message).toBe("Profile updated");

    const prisma = await createPrismaClient(env.DB);
    try {
      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated?.name).toBe("New Name");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects empty name", async () => {
    const { cookie } = await createUserWithSession(
      `profile-empty-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/profile", {
        method: "PATCH",
        headers: patchHeaders(cookie),
        body: JSON.stringify({ name: "" }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("rejects whitespace-only name", async () => {
    const { cookie } = await createUserWithSession(
      `profile-whitespace-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/profile", {
        method: "PATCH",
        headers: patchHeaders(cookie),
        body: JSON.stringify({ name: "   " }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("rejects name exceeding 100 characters", async () => {
    const { cookie } = await createUserWithSession(
      `profile-long-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/profile", {
        method: "PATCH",
        headers: patchHeaders(cookie),
        body: JSON.stringify({ name: "x".repeat(101) }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/auth/profile", {
        method: "PATCH",
        headers: {
          Origin: "http://localhost",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test" }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("creates audit log entry", async () => {
    const { cookie, user } = await createUserWithSession(
      `profile-audit-${Date.now()}@test.com`,
      "Before",
    );

    await app.fetch(
      new Request("http://localhost/v1/auth/profile", {
        method: "PATCH",
        headers: patchHeaders(cookie),
        body: JSON.stringify({ name: "After" }),
      }),
      env,
    );

    const prisma = await createPrismaClient(env.DB);
    try {
      const log = await prisma.auditLog.findFirst({
        where: { actorId: user.id, action: "profile.update" },
        orderBy: { createdAt: "desc" },
      });
      expect(log).not.toBeNull();
      expect(log!.action).toBe("profile.update");
      const details = JSON.parse(log!.details ?? "{}");
      expect(details.field).toBe("name");
      expect(details.oldValue).toBe("Before");
      expect(details.newValue).toBe("After");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("trims whitespace from name", async () => {
    const { cookie, user } = await createUserWithSession(
      `profile-trim-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/profile", {
        method: "PATCH",
        headers: patchHeaders(cookie),
        body: JSON.stringify({ name: "  Trimmed Name  " }),
      }),
      env,
    );
    expect(res.status).toBe(200);

    const prisma = await createPrismaClient(env.DB);
    try {
      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated?.name).toBe("Trimmed Name");
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("GET /v1/auth/sessions", () => {
  it("returns user's active sessions", async () => {
    const { cookie } = await createUserWithSession(
      `sessions-list-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/sessions", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sessions: Array<Record<string, unknown>> };
    expect(body.sessions.length).toBeGreaterThanOrEqual(1);
    expect(body.sessions[0]!.isCurrent).toBe(true);
    expect(body.sessions[0]!.browser).toBeDefined();
    expect(body.sessions[0]!.os).toBeDefined();
  });

  it("excludes revoked sessions", async () => {
    const email = `sessions-revoked-${Date.now()}@test.com`;
    const { cookie, user } = await createUserWithSession(email);

    const prisma = await createPrismaClient(env.DB);
    try {
      const revokedToken = generateSessionToken();
      const revokedHash = await sha256Hex(revokedToken);
      await prisma.session.create({
        data: {
          userId: user.id,
          token: revokedHash,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(),
          revokedAt: new Date(),
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/sessions", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = (await res.json()) as { sessions: Array<Record<string, unknown>> };
    expect(body.sessions.length).toBe(1);
  });

  it("does NOT include IP addresses", async () => {
    const { cookie } = await createUserWithSession(
      `sessions-noip-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/sessions", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = (await res.json()) as { sessions: Array<Record<string, unknown>> };
    for (const session of body.sessions) {
      expect(session).not.toHaveProperty("ipAddress");
      expect(session).not.toHaveProperty("ip");
    }
  });

  it("marks current session with isCurrent: true", async () => {
    const { cookie } = await createUserWithSession(
      `sessions-current-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/sessions", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = (await res.json()) as { sessions: Array<{ isCurrent: boolean }> };
    const current = body.sessions.filter((s) => s.isCurrent);
    expect(current.length).toBe(1);
  });

  it("parses user agent to browser/OS", async () => {
    const { cookie } = await createUserWithSession(
      `sessions-ua-${Date.now()}@test.com`,
      undefined,
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/sessions", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = (await res.json()) as { sessions: Array<{ browser: string; os: string }> };
    expect(body.sessions[0]!.browser).toBe("Chrome 133");
    expect(body.sessions[0]!.os).toBe("Windows 10+");
  });
});

describe("DELETE /v1/auth/sessions/:id", () => {
  it("revokes a session", async () => {
    const email = `sessions-revoke-${Date.now()}@test.com`;
    const { cookie, user } = await createUserWithSession(email);

    const prisma = await createPrismaClient(env.DB);
    let otherSessionId: string;
    try {
      const otherToken = generateSessionToken();
      const otherHash = await sha256Hex(otherToken);
      const other = await prisma.session.create({
        data: {
          userId: user.id,
          token: otherHash,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(),
        },
      });
      otherSessionId = other.id;
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`http://localhost/v1/auth/sessions/${otherSessionId}`, {
        method: "DELETE",
        headers: deleteHeaders(cookie),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.message).toBe("Session revoked");
  });

  it("returns 400 for current session", async () => {
    const { cookie, session } = await createUserWithSession(
      `sessions-self-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request(`http://localhost/v1/auth/sessions/${session.id}`, {
        method: "DELETE",
        headers: deleteHeaders(cookie),
      }),
      env,
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.message).toContain("current session");
  });

  it("returns 404 for non-existent session", async () => {
    const { cookie } = await createUserWithSession(
      `sessions-notfound-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request("http://localhost/v1/auth/sessions/nonexistent-id", {
        method: "DELETE",
        headers: deleteHeaders(cookie),
      }),
      env,
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 for another user's session (no info leakage)", async () => {
    const { cookie: cookie1 } = await createUserWithSession(
      `sessions-other1-${Date.now()}@test.com`,
    );
    const { session: session2 } = await createUserWithSession(
      `sessions-other2-${Date.now()}@test.com`,
    );

    const res = await app.fetch(
      new Request(`http://localhost/v1/auth/sessions/${session2.id}`, {
        method: "DELETE",
        headers: deleteHeaders(cookie1),
      }),
      env,
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 for already-revoked session", async () => {
    const email = `sessions-already-${Date.now()}@test.com`;
    const { cookie, user } = await createUserWithSession(email);

    const prisma = await createPrismaClient(env.DB);
    let revokedId: string;
    try {
      const rtoken = generateSessionToken();
      const rhash = await sha256Hex(rtoken);
      const rev = await prisma.session.create({
        data: {
          userId: user.id,
          token: rhash,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(),
          revokedAt: new Date(),
        },
      });
      revokedId = rev.id;
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`http://localhost/v1/auth/sessions/${revokedId}`, {
        method: "DELETE",
        headers: deleteHeaders(cookie),
      }),
      env,
    );
    expect(res.status).toBe(404);
  });

  it("creates audit log entry on revoke", async () => {
    const email = `sessions-audit-${Date.now()}@test.com`;
    const { cookie, user } = await createUserWithSession(email);

    const prisma = await createPrismaClient(env.DB);
    let otherSessionId: string;
    try {
      const otherToken = generateSessionToken();
      const otherHash = await sha256Hex(otherToken);
      const other = await prisma.session.create({
        data: {
          userId: user.id,
          token: otherHash,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(),
        },
      });
      otherSessionId = other.id;
    } finally {
      await prisma.$disconnect();
    }

    await app.fetch(
      new Request(`http://localhost/v1/auth/sessions/${otherSessionId}`, {
        method: "DELETE",
        headers: deleteHeaders(cookie),
      }),
      env,
    );

    const prisma2 = await createPrismaClient(env.DB);
    try {
      const log = await prisma2.auditLog.findFirst({
        where: { actorId: user.id, action: "session.revoke" },
        orderBy: { createdAt: "desc" },
      });
      expect(log).not.toBeNull();
      const details = JSON.parse(log!.details ?? "{}");
      expect(details.sessionId).toBe(otherSessionId);
    } finally {
      await prisma2.$disconnect();
    }
  });
});
