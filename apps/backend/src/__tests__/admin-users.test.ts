import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });

/**
 * Helper to create an admin user with full permissions.
 */
async function createAdmin(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  email: string,
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });

  // Create permissions
  const perms = [
    ["user", "read"], ["user", "update"], ["user", "create"],
    ["role", "read"], ["role", "update"],
    ["invitation", "read"], ["invitation", "create"], ["invitation", "revoke"],
    ["audit", "read"],
  ];

  const role = await prisma.role.create({
    data: { name: `admin-${user.id.slice(0, 8)}`, description: "Admin" },
  });

  for (const pair of perms) {
    const resource = pair[0]!;
    const action = pair[1]!;
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
      // Skip duplicate
    }
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  const session = await createSession(prisma, user.id);
  return { user, role, session };
}

describe("GET /v1/admin/users", () => {
  it("returns paginated user list", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-list@test.com");

      const req = new Request("http://localhost/v1/admin/users?page=1&pageSize=10", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("users");
      expect(body).toHaveProperty("pagination");
      const pagination = body.pagination as Record<string, unknown>;
      expect(pagination.page).toBe(1);
      expect(pagination.pageSize).toBe(10);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects invalid sortBy", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-badsort@test.com");

      const req = new Request(
        "http://localhost/v1/admin/users?sortBy=INVALID_FIELD",
        { headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` } },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
      const body = await res.json() as Record<string, unknown>;
      expect(body.error).toBe("invalid_param");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects search over 200 chars", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-longsearch@test.com");

      const longSearch = "a".repeat(201);
      const req = new Request(
        `http://localhost/v1/admin/users?search=${longSearch}`,
        { headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` } },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("filters by status", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-filter@test.com");

      // Create users with different statuses
      await prisma.user.create({
        data: { email: "filter-active@test.com", status: "active" },
      });
      await prisma.user.create({
        data: { email: "filter-pending@test.com", status: "pending_approval" },
      });

      const req = new Request(
        "http://localhost/v1/admin/users?status=pending_approval",
        { headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` } },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as { users: Array<{ status: string }> };
      for (const user of body.users) {
        expect(user.status).toBe("pending_approval");
      }
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("PATCH /v1/admin/users/:id", () => {
  it("deactivates user and revokes all sessions", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session: adminSession } = await createAdmin(prisma, "admin-deact@test.com");

      // Create target user with sessions
      const target = await prisma.user.create({
        data: { email: "deactivate-target@test.com", status: "active" },
      });

      // Create a role and assign to target
      const viewerRole = await prisma.role.create({
        data: { name: `viewer-${target.id.slice(0, 8)}`, description: "Viewer" },
      });
      await prisma.userRole.create({
        data: { userId: target.id, roleId: viewerRole.id },
      });

      await createSession(prisma, target.id);
      await createSession(prisma, target.id);

      const req = new Request(`http://localhost/v1/admin/users/${target.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${adminSession.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ status: "deactivated" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body.revokedSessionCount).toBe(2);

      const user = body.user as Record<string, unknown>;
      expect(user.status).toBe("deactivated");

      // Verify sessions are revoked
      const activeSessions = await prisma.session.count({
        where: { userId: target.id, revokedAt: null },
      });
      expect(activeSessions).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("cannot deactivate self", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAdmin(prisma, "admin-selfdeact@test.com");

      const req = new Request(`http://localhost/v1/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ status: "deactivated" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("Cannot deactivate your own");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("cannot deactivate last super_admin", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session: adminSession } = await createAdmin(prisma, "admin-lastsuperadmin@test.com");

      // Create a user with super_admin role
      const superAdminUser = await prisma.user.create({
        data: { email: "super-admin-target@test.com", status: "active" },
      });
      let superAdminRole = await prisma.role.findFirst({
        where: { name: "super_admin" },
      });
      if (!superAdminRole) {
        superAdminRole = await prisma.role.create({
          data: { name: "super_admin", description: "Super Admin", isSystem: true },
        });
      }
      await prisma.userRole.create({
        data: { userId: superAdminUser.id, roleId: superAdminRole.id },
      });

      const req = new Request(`http://localhost/v1/admin/users/${superAdminUser.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${adminSession.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ status: "deactivated" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("last active super_admin");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects HTML in name field", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session: adminSession } = await createAdmin(prisma, "admin-htmlname@test.com");

      const target = await prisma.user.create({
        data: { email: "htmlname-target@test.com", status: "active" },
      });

      const req = new Request(`http://localhost/v1/admin/users/${target.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${adminSession.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ name: "<script>alert('xss')</script>" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Role management", () => {
  it("cannot remove last role from user", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session: adminSession } = await createAdmin(
        prisma,
        "admin-lastrole@test.com",
      );

      const target = await prisma.user.create({
        data: { email: "lastrole-target@test.com", status: "active" },
      });
      const viewerRole = await prisma.role.create({
        data: { name: `viewer-${target.id.slice(0, 8)}`, description: "Viewer" },
      });
      await prisma.userRole.create({
        data: { userId: target.id, roleId: viewerRole.id },
      });

      const req = new Request(
        `http://localhost/v1/admin/users/${target.id}/roles/${viewerRole.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${adminSession.token}`,
            Origin: "http://localhost",
          },
        },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("last role");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("self-demotion prevention: cannot remove own admin role", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session, role } = await createAdmin(
        prisma,
        "admin-selfdemotion@test.com",
      );

      // Rename the role to "admin" for the test
      await prisma.role.update({
        where: { id: role.id },
        data: { name: "admin" },
      });

      // Add a second role so it's not "last role"
      const extraRole = await prisma.role.create({
        data: { name: `extra-${user.id.slice(0, 8)}`, description: "Extra" },
      });
      await prisma.userRole.create({
        data: { userId: user.id, roleId: extraRole.id },
      });

      const req = new Request(
        `http://localhost/v1/admin/users/${user.id}/roles/${role.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
            Origin: "http://localhost",
          },
        },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("Cannot remove your own");
    } finally {
      await prisma.$disconnect();
    }
  });
});
