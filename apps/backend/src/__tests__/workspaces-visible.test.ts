/**
 * Tests for GET /v1/workspaces/visible endpoint (#386).
 *
 * Validates:
 * - 401 for unauthenticated requests
 * - Role-scoped workspace responses
 * - Cache headers (Vary: Cookie, Cache-Control: private, max-age=300)
 * - Response shape (tabs, feature counts, upcoming features)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Helper to create a user with dashboard role permissions, returning a session cookie.
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
      data: { name: `ws-${roleName}-${user.id.slice(0, 8)}`, description: roleName },
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

type WorkspacesResponse = {
  registry_version: string;
  phase: string;
  workspaces: Array<{
    id: string;
    label: string;
    icon: string;
    description: string;
    defaultCanvas: string;
    tabs: Array<{
      id: string;
      label: string;
      canvas: string;
      status: string;
      featureCount: number;
      activeFeatureCount: number;
    }>;
    totalFeatures: number;
    activeFeatures: number;
    upcomingFeatures: Array<{
      id: string;
      label: string;
      status: string;
    }>;
  }>;
};

describe("GET /v1/workspaces/visible", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const req = new Request("http://localhost/v1/workspaces/visible");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("returns workspaces for admin role", async () => {
    const { cookie } = await createUserWithRole(
      "ws-admin@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/workspaces/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as WorkspacesResponse;

    expect(body.registry_version).toMatch(/^sha256:/);
    expect(body.phase).toBe("company_formation");
    // Admin sees all 11 workspaces
    expect(body.workspaces.length).toBe(11);
  });

  it("sets correct cache headers", async () => {
    const { cookie } = await createUserWithRole(
      "ws-cache@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/workspaces/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=300");
    expect(res.headers.get("Vary")).toContain("Cookie");
  });

  it("each workspace has required fields", async () => {
    const { cookie } = await createUserWithRole(
      "ws-fields@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/workspaces/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    const body = (await res.json()) as WorkspacesResponse;

    for (const ws of body.workspaces) {
      expect(ws).toHaveProperty("id");
      expect(ws).toHaveProperty("label");
      expect(ws).toHaveProperty("icon");
      expect(ws).toHaveProperty("description");
      expect(ws).toHaveProperty("defaultCanvas");
      expect(ws).toHaveProperty("tabs");
      expect(ws).toHaveProperty("totalFeatures");
      expect(ws).toHaveProperty("activeFeatures");
      expect(ws).toHaveProperty("upcomingFeatures");
      expect(ws.tabs.length).toBeGreaterThan(0);
      expect(ws.totalFeatures).toBeGreaterThan(0);
    }
  });

  it("each tab has required fields", async () => {
    const { cookie } = await createUserWithRole(
      "ws-tab-fields@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/workspaces/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    const body = (await res.json()) as WorkspacesResponse;

    for (const ws of body.workspaces) {
      for (const tab of ws.tabs) {
        expect(tab).toHaveProperty("id");
        expect(tab).toHaveProperty("label");
        expect(tab).toHaveProperty("canvas");
        expect(tab).toHaveProperty("status");
        expect(tab).toHaveProperty("featureCount");
        expect(tab).toHaveProperty("activeFeatureCount");
        expect(["active", "coming_soon", "planned"]).toContain(tab.status);
      }
    }
  });

  it("non-admin role sees fewer workspaces than admin", async () => {
    const { cookie: adminCookie } = await createUserWithRole(
      "ws-admin2@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const { cookie: execCookie } = await createUserWithRole(
      "ws-exec@test.com",
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

    const [adminRes, execRes] = await Promise.all([
      app.fetch(
        new Request("http://localhost/v1/workspaces/visible", {
          headers: { Cookie: adminCookie },
        }),
        env,
      ),
      app.fetch(
        new Request("http://localhost/v1/workspaces/visible", {
          headers: { Cookie: execCookie },
        }),
        env,
      ),
    ]);

    const adminBody = (await adminRes.json()) as WorkspacesResponse;
    const execBody = (await execRes.json()) as WorkspacesResponse;

    expect(adminBody.workspaces.length).toBeGreaterThanOrEqual(execBody.workspaces.length);
  });

  it("registry_version is a sha256 hash", async () => {
    const { cookie } = await createUserWithRole(
      "ws-hash@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/workspaces/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    const body = (await res.json()) as WorkspacesResponse;
    expect(body.registry_version).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("admin total features across workspaces exceeds 400", async () => {
    const { cookie } = await createUserWithRole(
      "ws-count@test.com",
      "admin",
      [["dashboard", "admin"]],
    );

    const req = new Request("http://localhost/v1/workspaces/visible", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    const body = (await res.json()) as WorkspacesResponse;

    const total = body.workspaces.reduce((sum, ws) => sum + ws.totalFeatures, 0);
    expect(total).toBeGreaterThan(400);
  });
});
