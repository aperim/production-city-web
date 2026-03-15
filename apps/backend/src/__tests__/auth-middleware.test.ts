import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });

/**
 * Helper to create a user with roles and permissions for testing.
 */
async function createAuthenticatedUser(
  prisma: ReturnType<typeof createPrismaClient> extends Promise<infer T> ? T : never,
  email: string,
  roleName: string,
  permissionPairs: [string, string][],
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });

  const role = await prisma.role.create({
    data: { name: `${roleName}-${user.id.slice(0, 6)}`, description: "Test role" },
  });

  for (const [resource, action] of permissionPairs) {
    let perm = await prisma.permission.findUnique({
      where: { resource_action: { resource, action } },
    });
    if (!perm) {
      perm = await prisma.permission.create({
        data: { resource, action },
      });
    }
    await prisma.rolePermission.create({
      data: { roleId: role.id, permissionId: perm.id },
    });
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  const session = await createSession(prisma, user.id);
  return { user, role, session };
}

describe("Auth middleware", () => {
  it("returns 401 without session cookie on protected route", async () => {
    const req = new Request("http://localhost/v1/auth/session");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe("unauthorized");
  });

  it("returns 401 with invalid session cookie", async () => {
    const req = new Request("http://localhost/v1/auth/session", {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=invalid-token-value` },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("returns 200 with valid session on GET /v1/auth/session", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAuthenticatedUser(
        prisma,
        "middleware-valid@test.com",
        "admin",
        [["user", "read"]],
      );

      const req = new Request("http://localhost/v1/auth/session", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      const userObj = body.user as Record<string, unknown>;
      expect(userObj.id).toBe(user.id);
      expect(userObj.email).toBe("middleware-valid@test.com");
      expect(body.permissions).toBeDefined();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns hasPhone:false when user has no phone", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        `hasphone-false-${Date.now()}@test.com`,
        "admin",
        [["user", "read"]],
      );

      const req = new Request("http://localhost/v1/auth/session", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      const userObj = body.user as Record<string, unknown>;
      expect(userObj.hasPhone).toBe(false);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns hasPhone:true when user has a phone number", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `hasphone-true-${Date.now()}@test.com`;
      const { user, session } = await createAuthenticatedUser(
        prisma,
        email,
        "admin",
        [["user", "read"]],
      );

      // Set phone number on user
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: "+61412345678" },
      });

      const req = new Request("http://localhost/v1/auth/session", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      const userObj = body.user as Record<string, unknown>;
      expect(userObj.hasPhone).toBe(true);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 401 for deactivated user", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "middleware-deactivated@test.com",
        "admin",
        [["user", "read"]],
      );

      // Deactivate the user
      await prisma.user.update({
        where: { email: "middleware-deactivated@test.com" },
        data: { status: "deactivated" },
      });

      const req = new Request("http://localhost/v1/auth/session", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Permission middleware", () => {
  it("returns 403 without required permission on admin route", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      // Create user WITHOUT user:read permission
      const { session } = await createAuthenticatedUser(
        prisma,
        "no-perm@test.com",
        "viewer",
        [["other", "read"]],
      );

      const req = new Request("http://localhost/v1/admin/users?page=1", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(403);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 200 with required permission on admin route", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "has-perm@test.com",
        "admin",
        [["user", "read"]],
      );

      const req = new Request("http://localhost/v1/admin/users?page=1", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("every protected admin route returns 401 without auth", async () => {
    const protectedRoutes = [
      ["GET", "/v1/admin/users"],
      ["GET", "/v1/admin/roles"],
      ["GET", "/v1/admin/permissions"],
      ["GET", "/v1/admin/approvals"],
      ["GET", "/v1/admin/audit-log"],
      ["GET", "/v1/admin/invitations"],
    ];

    for (const [method, path] of protectedRoutes) {
      const req = new Request(`http://localhost${path}`, { method });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
    }
  });
});

describe("CSRF middleware", () => {
  it("rejects POST without Origin header", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "csrf-no-origin@test.com",
        "admin",
        [["user", "read"], ["user", "update"]],
      );

      const req = new Request("http://localhost/v1/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(403);
      const body = await res.json() as Record<string, unknown>;
      expect(body.error).toBe("csrf_failed");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("allows POST with matching Origin header", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "csrf-ok@test.com",
        "admin",
        [["user", "read"]],
      );

      const req = new Request("http://localhost/v1/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          Origin: "http://localhost",
          "Content-Type": "application/json",
        },
      });
      const res = await app.fetch(req, env);
      // Should pass CSRF and reach the handler (200 = logged out)
      expect(res.status).toBe(200);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects POST with mismatched Origin header", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "csrf-mismatch@test.com",
        "admin",
        [["user", "read"]],
      );

      const req = new Request("http://localhost/v1/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          Origin: "http://evil.com",
          "Content-Type": "application/json",
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(403);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("allows POST with ALLOWED_ORIGIN (cross-subdomain)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "csrf-cross-origin@test.com",
        "admin",
        [["user", "read"]],
      );

      // Simulate the production scenario: frontend at ALLOWED_ORIGIN
      // (e.g. https://production.city) posts to the API (e.g. https://api.production.city).
      // In test env, ALLOWED_ORIGIN is http://localhost:4321 while the API URL is http://localhost.
      const req = new Request("http://localhost/v1/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          Origin: env.ALLOWED_ORIGIN,
          "Content-Type": "application/json",
        },
      });
      const res = await app.fetch(req, env);
      // Should pass CSRF because ALLOWED_ORIGIN is in the allowlist
      expect(res.status).toBe(200);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("allows POST with Referer from ALLOWED_ORIGIN (cross-subdomain)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "csrf-cross-referer@test.com",
        "admin",
        [["user", "read"]],
      );

      // Same cross-subdomain scenario but using Referer header instead of Origin
      const req = new Request("http://localhost/v1/auth/logout", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          Referer: `${env.ALLOWED_ORIGIN}/auth/verify?token=abc`,
          "Content-Type": "application/json",
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("allows GET requests without Origin", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "csrf-get@test.com",
        "admin",
        [["user", "read"]],
      );

      const req = new Request("http://localhost/v1/auth/session", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Cookie-only auth (no Bearer)", () => {
  it("rejects Authorization: Bearer header", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthenticatedUser(
        prisma,
        "bearer-reject@test.com",
        "admin",
        [["user", "read"]],
      );

      // Use Bearer header instead of cookie — should fail
      const req = new Request("http://localhost/v1/auth/session", {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(401);
    } finally {
      await prisma.$disconnect();
    }
  });
});
