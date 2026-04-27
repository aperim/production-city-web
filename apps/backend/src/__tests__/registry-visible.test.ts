/**
 * Tests for GET /v1/registry/visible endpoint.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Helper to create a user with dashboard role permissions, returning a session cookie.
 * The dashboard role is detected from the 'dashboard:{role}' permission.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.create({
      data: { email, status: "active" },
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-${crypto.randomUUID()}`, description: roleName },
    });

    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      } catch {
        // skip duplicate
      }
    }

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const session = await createSession(prisma, user.id);
    return { user, role, session, cookie: `${SESSION_COOKIE_NAME}=${session.token}` };
  } finally {
    await prisma.$disconnect();
  }
}

describe("GET /v1/registry/visible", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const req = new Request("http://localhost/v1/registry/visible");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.error).toBe("unauthorized");
  });

  it("returns visible features for admin (via dashboard:admin permission)", async () => {
    const { cookie } = await createUserWithRole(
      "reg-admin@test.com",
      "admin",
      [["dashboard", "admin"], ["user", "read"]],
    );

    const req = new Request("http://localhost/v1/registry/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      registry_version: string;
      phase: string;
      visible_feature_ids: string[];
    };

    expect(body.registry_version).toMatch(/^sha256:/);
    expect(body.phase).toBe("company_formation");
    // Admin sees all features
    expect(body.visible_feature_ids.length).toBe(502);
  });

  it("sets correct cache headers on 200", async () => {
    const { cookie } = await createUserWithRole(
      "reg-cache@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/registry/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=300");
    expect(res.headers.get("Vary")).toContain("Cookie");
  });

  it("returns filtered features for guest role", async () => {
    const { cookie } = await createUserWithRole(
      "reg-guest@test.com",
      "guest",
      [["dashboard", "guest"], ["events", "browse"], ["education", "browse"]],
    );

    const req = new Request("http://localhost/v1/registry/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      visible_feature_ids: string[];
    };

    expect(body.visible_feature_ids.length).toBeGreaterThan(0);
    expect(body.visible_feature_ids.length).toBeLessThan(50);
  });

  it("returns features for executive role", async () => {
    const { cookie } = await createUserWithRole(
      "reg-exec@test.com",
      "executive",
      [
        ["dashboard", "executive"],
        ["hr", "read"],
        ["legal", "read"],
        ["company_finance", "read"],
        ["productions", "read"],
        ["facilities", "read"],
        ["analytics", "read"],
        ["investor", "read"],
      ],
    );

    const req = new Request("http://localhost/v1/registry/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { visible_feature_ids: string[] };
    // Executive sees more than guest but less than admin
    expect(body.visible_feature_ids.length).toBeGreaterThan(10);
    expect(body.visible_feature_ids.length).toBeLessThan(502);
  });

  it("registry_version is a sha256 hash", async () => {
    const { cookie } = await createUserWithRole(
      "reg-hash@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/registry/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    const body = (await res.json()) as { registry_version: string };
    expect(body.registry_version).toMatch(/^sha256:[0-9a-f]{64}$/);
  });
});
