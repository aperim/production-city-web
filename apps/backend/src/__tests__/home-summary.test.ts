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
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active" },
      update: {},
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-home-${user.id.slice(0, 8)}`, description: roleName },
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

/** Shape of the home summary response for type assertions. */
interface HomeSummaryBody {
  attention: { total: number; items: Array<{ id: string; workspace: string | null; activatedAt?: string }> };
  workspaceStats: Record<string, { stats: Array<{ label: string; value: string }> }>;
  whatsNew: Array<{ featureId: string; label: string; workspace: string; activatedAt: string }>;
}

describe("GET /v1/home/summary", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary"),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with correct shape for authenticated user", async () => {
    const { cookie } = await createUserWithRole("home-admin@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as HomeSummaryBody;
    expect(body.attention).toBeDefined();
    expect(body.attention.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.attention.items)).toBe(true);
    expect(typeof body.workspaceStats).toBe("object");
    expect(body.workspaceStats).not.toBeNull();
    expect(Array.isArray(body.workspaceStats)).toBe(false);
    expect(Array.isArray(body.whatsNew)).toBe(true);
  });

  it("sets correct cache headers", async () => {
    const { cookie } = await createUserWithRole("home-cache@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=60");
    // CSRF middleware appends "Origin" to Vary
    expect(res.headers.get("Vary")).toContain("Cookie");
  });

  it("limits attention items to 5", async () => {
    const { cookie } = await createUserWithRole("home-attn@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = (await res.json()) as HomeSummaryBody;
    expect(body.attention.items.length).toBeLessThanOrEqual(5);
  });

  it("whatsNew includes only features activated in last 30 days", async () => {
    const { cookie } = await createUserWithRole("home-new@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = (await res.json()) as HomeSummaryBody;
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    for (const item of body.whatsNew) {
      expect(new Date(item.activatedAt).getTime()).toBeGreaterThan(thirtyDaysAgo);
    }
  });
});
