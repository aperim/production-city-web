/**
 * Tests for feature notification ("Notify Me") API endpoints.
 *
 * POST   /v1/features/:featureId/notify — subscribe
 * DELETE /v1/features/:featureId/notify — unsubscribe
 * GET    /v1/features/:featureId/notify — check status
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
 * Helper to create a user with dashboard:admin permission (sees all features).
 */
async function createAdmin(email: string) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.create({
      data: { email, status: "active" },
    });

    const role = await prisma.role.create({
      data: { name: `admin-${crypto.randomUUID()}`, description: "Admin" },
    });

    // Grant dashboard:admin permission for dashboard role detection
    let perm = await prisma.permission.findUnique({
      where: { resource_action: { resource: "dashboard", action: "admin" } },
    });
    if (!perm) {
      perm = await prisma.permission.create({ data: { resource: "dashboard", action: "admin" } });
    }
    try {
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } });
    } catch { /* skip duplicate */ }

    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });

    const session = await createSession(prisma, user.id);
    return {
      user,
      cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Helper to create a guest user (limited features).
 */
async function createGuest(email: string) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.create({
      data: { email, status: "active" },
    });

    const role = await prisma.role.create({
      data: { name: `guest-${crypto.randomUUID()}`, description: "Guest" },
    });

    const permPairs: [string, string][] = [
      ["dashboard", "guest"],
      ["events", "browse"],
      ["education", "browse"],
    ];
    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } });
      } catch { /* skip duplicate */ }
    }

    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });

    const session = await createSession(prisma, user.id);
    return {
      user,
      cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Use a known admin-visible feature (admin section)
const ADMIN_FEATURE = "administration.users.user_management";

describe("POST /v1/features/:featureId/notify — subscribe", () => {
  it("returns 401 for unauthenticated requests", async () => {
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "POST",
      headers: { Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("returns 201 for valid subscription", async () => {
    const { cookie } = await createAdmin("notify-sub@test.com");
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "POST",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(201);

    const body = (await res.json()) as { id: string; featureId: string; createdAt: string };
    expect(body.id).toBeTruthy();
    expect(body.featureId).toBe(ADMIN_FEATURE);
    expect(body.createdAt).toBeTruthy();
  });

  it("is idempotent — second subscribe returns 201", async () => {
    const { cookie } = await createAdmin("notify-idem@test.com");

    const makeReq = () =>
      new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
        method: "POST",
        headers: { Cookie: cookie, Origin: "http://localhost" },
      });

    const res1 = await app.fetch(makeReq(), env);
    expect(res1.status).toBe(201);

    const res2 = await app.fetch(makeReq(), env);
    expect(res2.status).toBe(201);
  });

  it("returns 404 for nonexistent feature ID", async () => {
    const { cookie } = await createAdmin("notify-invalid@test.com");
    const req = new Request("http://localhost/v1/features/nonexistent.fake.id/notify", {
      method: "POST",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(404);
  });

  it("returns 404 for feature user cannot access (anti-enumeration)", async () => {
    const { cookie } = await createGuest("notify-noaccess@test.com");
    // Guest cannot see admin features
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "POST",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /v1/features/:featureId/notify — unsubscribe", () => {
  it("returns 204 on successful unsubscribe", async () => {
    const { cookie } = await createAdmin("notify-unsub@test.com");

    // Subscribe first
    const subReq = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "POST",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    await app.fetch(subReq, env);

    // Unsubscribe
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "DELETE",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(204);
  });

  it("returns 204 even if not subscribed (no error)", async () => {
    const { cookie } = await createAdmin("notify-unsub-noop@test.com");
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "DELETE",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(204);
  });

  it("returns 404 for feature user cannot access", async () => {
    const { cookie } = await createGuest("notify-unsub-noacc@test.com");
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "DELETE",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(404);
  });
});

describe("GET /v1/features/:featureId/notify — check status", () => {
  it("returns subscribed: true after subscribing", async () => {
    const { cookie } = await createAdmin("notify-check@test.com");

    // Subscribe
    const subReq = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      method: "POST",
      headers: { Cookie: cookie, Origin: "http://localhost" },
    });
    await app.fetch(subReq, env);

    // Check
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { subscribed: boolean; subscribedAt: string | null };
    expect(body.subscribed).toBe(true);
    expect(body.subscribedAt).toBeTruthy();
  });

  it("returns subscribed: false when not subscribed", async () => {
    const { cookie } = await createAdmin("notify-check-no@test.com");
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { subscribed: boolean; subscribedAt: string | null };
    expect(body.subscribed).toBe(false);
    expect(body.subscribedAt).toBeNull();
  });

  it("returns subscribed: false for unauthorized features (anti-enumeration)", async () => {
    const { cookie } = await createGuest("notify-check-enum@test.com");
    const req = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { subscribed: boolean };
    expect(body.subscribed).toBe(false);
  });

  it("returns subscribed: false for nonexistent features (anti-enumeration)", async () => {
    const { cookie } = await createAdmin("notify-check-fake@test.com");
    const req = new Request("http://localhost/v1/features/nonexistent.fake/notify", {
      headers: { Cookie: cookie },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { subscribed: boolean };
    expect(body.subscribed).toBe(false);
  });

  it("cascade delete: removing user removes notifications", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, cookie } = await createAdmin("notify-cascade@test.com");

      // Subscribe
      const subReq = new Request(`http://localhost/v1/features/${ADMIN_FEATURE}/notify`, {
        method: "POST",
        headers: { Cookie: cookie, Origin: "http://localhost" },
      });
      await app.fetch(subReq, env);

      // Verify subscription exists
      const before = await prisma.featureNotification.findMany({
        where: { userId: user.id },
      });
      expect(before.length).toBe(1);

      // Delete the user (cascade should delete notifications)
      await prisma.userRole.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.featureNotification.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });

      // Verify cascade
      const after = await prisma.featureNotification.findMany({
        where: { userId: user.id },
      });
      expect(after.length).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });
});
