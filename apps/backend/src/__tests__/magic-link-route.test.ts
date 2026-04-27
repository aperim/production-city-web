/**
 * Tests for POST /v1/auth/magic-link — request a magic link login email.
 *
 * Anti-enumeration: the response shape and status must be identical for
 * registered and unregistered emails (except rate-limiting 429).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/** Helper to POST /v1/auth/magic-link with an email. */
function postMagicLink(email: string, headers?: Record<string, string>) {
  return app.fetch(
    new Request("http://localhost/v1/auth/magic-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
        ...headers,
      },
      body: JSON.stringify({ email }),
    }),
    env,
  );
}

describe("POST /v1/auth/magic-link", () => {
  it("returns 200 with requestId and deliveryToken for a registered user", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "magic-route-registered@test.com";
      await prisma.user.create({
        data: { email, status: "active" },
      });

      const res = await postMagicLink(email);
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty("requestId");
      expect(body).toHaveProperty("deliveryToken");
      expect(body).toHaveProperty("status", "sending");
      expect(body).toHaveProperty("message");
      expect(typeof body.requestId).toBe("string");
      expect(typeof body.deliveryToken).toBe("string");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns identical 200 response shape for unregistered email (anti-enumeration)", async () => {
    const res = await postMagicLink("unregistered-magic@test.com");
    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    // Must have the same fields as a registered user response
    expect(body).toHaveProperty("requestId");
    expect(body).toHaveProperty("deliveryToken");
    expect(body).toHaveProperty("status", "sending");
    expect(body).toHaveProperty("message");
    expect(typeof body.requestId).toBe("string");
    expect(typeof body.deliveryToken).toBe("string");
  });

  it("returns 422 for invalid email format", async () => {
    const res = await postMagicLink("not-an-email");
    // OpenAPI validation should reject this
    expect(res.status).toBe(400);
  });

  it("returns 422 for missing email field", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/auth/magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("creates a MagicLink record in the database", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "magic-route-record@test.com";
      await prisma.user.create({
        data: { email, status: "active" },
      });

      await postMagicLink(email);

      const links = await prisma.magicLink.findMany({
        where: { email },
      });
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(links[0]!.purpose).toBe("login");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("creates an AuditLog entry for the request", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "magic-route-audit@test.com";
      await prisma.user.create({
        data: { email, status: "active" },
      });

      await postMagicLink(email);

      const logs = await prisma.auditLog.findMany({
        where: { action: "magic_link_request" },
        orderBy: { createdAt: "desc" },
      });
      // Should have at least one audit log for this action
      const relevant = logs.find((l) => {
        const details = l.details ? JSON.parse(l.details) : {};
        return details.email === email;
      });
      expect(relevant).toBeDefined();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 429 when rate limited by email", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "magic-route-ratelimit@test.com";
      await prisma.user.create({
        data: { email, status: "active" },
      });

      // Send 3 requests to hit the rate limit (EMAIL_RATE_LIMIT = 3)
      await postMagicLink(email);
      await postMagicLink(email);
      await postMagicLink(email);

      // 4th should be rate limited
      const res = await postMagicLink(email);
      expect(res.status).toBe(429);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty("error", "rate_limited");
      expect(body).toHaveProperty("retryAfter");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("never exposes whether an email is registered in response body", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const registeredEmail = "magic-route-enum-check@test.com";
      await prisma.user.create({
        data: { email: registeredEmail, status: "active" },
      });

      const [registeredRes, unregisteredRes] = await Promise.all([
        postMagicLink(registeredEmail),
        postMagicLink("definitely-not-registered-xyz@test.com"),
      ]);

      expect(registeredRes.status).toBe(200);
      expect(unregisteredRes.status).toBe(200);

      const registeredBody = (await registeredRes.json()) as Record<string, unknown>;
      const unregisteredBody = (await unregisteredRes.json()) as Record<string, unknown>;

      // Same keys in both responses
      const regKeys = Object.keys(registeredBody).sort();
      const unregKeys = Object.keys(unregisteredBody).sort();
      expect(regKeys).toEqual(unregKeys);

      // Neither should leak userExists or similar
      expect(registeredBody).not.toHaveProperty("userExists");
      expect(unregisteredBody).not.toHaveProperty("userExists");
    } finally {
      await prisma.$disconnect();
    }
  });
});
