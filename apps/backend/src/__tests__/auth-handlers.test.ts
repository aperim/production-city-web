import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });
import { sha256Hex, hmacSha256Hex, generateSessionToken } from "../auth/token.js";
import { SESSION_COOKIE_NAME } from "../auth/session.js";

describe("GET /v1/auth/verify — magic link token", () => {
  it("returns 400 with generic error for invalid token", async () => {
    const req = new Request("http://localhost/v1/auth/verify?token=invalid-token");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("token_invalid");
    expect(body.message).toContain("invalid or has expired");
  });

  it("sets session cookie on valid token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "verify-handler@test.com";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const req = new Request(
        `http://localhost/v1/auth/verify?token=${encodeURIComponent(token)}`,
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body.redirectUrl).toBe("/dashboard");

      // Check cookie
      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toContain(SESSION_COOKIE_NAME);
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain("Secure");
      expect(setCookie).toContain("SameSite=Lax");
      expect(setCookie).toContain("Path=/");

      // Check Referrer-Policy
      expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("creates audit log on verification", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "verify-audit@test.com";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      await app.fetch(
        new Request(`http://localhost/v1/auth/verify?token=${encodeURIComponent(token)}`),
        env,
      );

      // Check audit logs
      const logs = await prisma.auditLog.findMany({
        where: { subjectId: user.id },
        orderBy: { createdAt: "desc" },
      });
      const actions = logs.map((l) => l.action);
      expect(actions).toContain("auth.magic_link.verified");
      expect(actions).toContain("auth.login");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns generic error for expired/used/invalid tokens (anti-enumeration)", async () => {
    // All invalid token scenarios should return the same error
    const responses = await Promise.all([
      app.fetch(new Request("http://localhost/v1/auth/verify?token=invalid"), env),
      app.fetch(new Request("http://localhost/v1/auth/verify?token=also-invalid"), env),
    ]);

    for (const res of responses) {
      expect(res.status).toBe(400);
      const body = await res.json() as Record<string, unknown>;
      expect(body.error).toBe("token_invalid");
    }
  });
});

describe("POST /v1/auth/verify — magic code", () => {
  it("returns 400 with generic error for invalid code", async () => {
    const req = new Request("http://localhost/v1/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
      },
      body: JSON.stringify({ email: "nobody@test.com", code: "000000" }),
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("token_invalid");
  });

  it("sets session cookie on valid code", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "code-handler@test.com";
      const code = "654321";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);
      const hmacSecret = (env as unknown as Record<string, string>).HMAC_SECRET || "dev-hmac-secret-do-not-use-in-production";
      const codeHash = await hmacSha256Hex(hmacSecret, `${email}login${tokenHash}${code}`);

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash,
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const req = new Request("http://localhost/v1/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ email, code }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body.redirectUrl).toBe("/dashboard");
      // No sessionToken in body (critical security requirement)
      expect(body).not.toHaveProperty("sessionToken");

      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toContain(SESSION_COOKIE_NAME);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("includes remainingAttempts on code failure", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "code-remaining@test.com";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);
      const codeHash = await hmacSha256Hex(
        "dev-hmac-secret-do-not-use-in-production",
        `${email}login${tokenHash}123456`,
      );

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash,
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          maxAttempts: 5,
        },
      });

      const req = new Request("http://localhost/v1/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ email, code: "000000" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
      const body = await res.json() as Record<string, unknown>;
      expect(body.remainingAttempts).toBeDefined();
      expect(typeof body.remainingAttempts).toBe("number");
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("POST /v1/auth/logout", () => {
  it("clears session cookie on logout", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: "logout@test.com", status: "active" },
      });

      // Import createSession from session module
      const { createSession } = await import("../auth/session.js");
      const session = await createSession(prisma, user.id);

      const req = new Request("http://localhost/v1/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          Origin: "http://localhost",
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toBe("Logged out");

      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toContain("Max-Age=0");
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Response design — no sessionToken in body", () => {
  it("POST /v1/auth/verify never returns sessionToken", async () => {
    // Even on success, no sessionToken in body
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "no-token-body@test.com";
      const code = "999888";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);
      const hmacSecret = (env as unknown as Record<string, string>).HMAC_SECRET || "dev-hmac-secret-do-not-use-in-production";
      const codeHash = await hmacSha256Hex(hmacSecret, `${email}login${tokenHash}${code}`);

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash,
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const req = new Request("http://localhost/v1/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ email, code }),
      });
      const res = await app.fetch(req, env);
      const body = await res.json() as Record<string, unknown>;

      // Critical: no sessionToken in body
      expect(body).not.toHaveProperty("sessionToken");
      expect(body).not.toHaveProperty("token");
      expect(body).not.toHaveProperty("session_token");
    } finally {
      await prisma.$disconnect();
    }
  });
});
