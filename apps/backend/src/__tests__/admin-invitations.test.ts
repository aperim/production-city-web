import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });

async function createAdmin(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  email: string,
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });

  const perms = [
    ["user", "read"], ["user", "update"],
    ["invitation", "read"], ["invitation", "create"], ["invitation", "revoke"],
    ["role", "read"], ["role", "update"],
  ];

  const role = await prisma.role.create({
    data: { name: `admin-inv-${user.id.slice(0, 8)}`, description: "Admin" },
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
      // skip duplicate
    }
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  const session = await createSession(prisma, user.id);
  return { user, role, session };
}

describe("GET /v1/admin/invitations", () => {
  it("returns paginated invitation list", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-inv-list@test.com");

      const req = new Request("http://localhost/v1/admin/invitations", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("invitations");
      expect(body).toHaveProperty("pagination");
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("POST /v1/admin/invitations", () => {
  it("rejects invitation to existing user email", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session, role } = await createAdmin(prisma, "admin-inv-dup@test.com");

      // Create an existing user
      await prisma.user.create({
        data: { email: "existing-user@test.com", status: "active" },
      });

      const req = new Request("http://localhost/v1/admin/invitations", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          email: "existing-user@test.com",
          roleIds: [role.id],
        }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("already exists");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects duplicate pending invitation", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session, role } = await createAdmin(prisma, "admin-inv-dupinv@test.com");

      // Create a pending invitation
      await prisma.invitation.create({
        data: {
          email: "pending-invite@test.com",
          invitedById: user.id,
          status: "pending",
          activeEmail: "pending-invite@test.com",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const req = new Request("http://localhost/v1/admin/invitations", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          email: "pending-invite@test.com",
          roleIds: [role.id],
        }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
      const body = await res.json() as Record<string, unknown>;
      expect(body.message).toContain("pending invitation already exists");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects HTML in invitation message", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session, role } = await createAdmin(prisma, "admin-inv-html@test.com");

      const req = new Request("http://localhost/v1/admin/invitations", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          email: "invite-html@test.com",
          roleIds: [role.id],
          message: "<script>alert('xss')</script>",
        }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("creates invitation successfully", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session, role } = await createAdmin(prisma, "admin-inv-create@test.com");

      const req = new Request("http://localhost/v1/admin/invitations", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          email: "new-invite@test.com",
          roleIds: [role.id],
          message: "Welcome to the team!",
        }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(201);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("invitation");
      expect(body).toHaveProperty("deliveryStatus");

      const inv = body.invitation as Record<string, unknown>;
      expect(inv.email).toBe("new-invite@test.com");
      expect(inv.status).toBe("pending");
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("DELETE /v1/admin/invitations/:id", () => {
  it("revokes a pending invitation", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAdmin(prisma, "admin-inv-revoke@test.com");

      const invitation = await prisma.invitation.create({
        data: {
          email: "revoke-me@test.com",
          invitedById: user.id,
          status: "pending",
          activeEmail: "revoke-me@test.com",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const req = new Request(
        `http://localhost/v1/admin/invitations/${invitation.id}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
            Origin: "http://localhost",
          },
        },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      // Verify revoked
      const updated = await prisma.invitation.findUnique({
        where: { id: invitation.id },
      });
      expect(updated!.status).toBe("revoked");
    } finally {
      await prisma.$disconnect();
    }
  });
});
