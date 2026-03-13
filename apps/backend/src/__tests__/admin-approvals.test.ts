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
    ["role", "read"], ["role", "update"],
    ["audit", "read"],
  ];

  const role = await prisma.role.create({
    data: { name: `admin-appr-${user.id.slice(0, 8)}`, description: "Admin" },
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
      // skip
    }
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  const session = await createSession(prisma, user.id);
  return { user, role, session };
}

describe("GET /v1/admin/approvals", () => {
  it("lists pending approval users", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-appr-list@test.com");

      // Create a pending user
      await prisma.user.create({
        data: { email: "pending-user@test.com", status: "pending_approval" },
      });

      const req = new Request("http://localhost/v1/admin/approvals", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as { users: Array<Record<string, unknown>> };
      expect(body.users.length).toBeGreaterThan(0);
      expect(body.users.some((u) => u.email === "pending-user@test.com")).toBe(true);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("POST /v1/admin/approvals/:userId/approve", () => {
  it("approves a pending user", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session, role } = await createAdmin(prisma, "admin-approve@test.com");

      const pending = await prisma.user.create({
        data: { email: "to-approve@test.com", status: "pending_approval" },
      });

      // User needs at least one role to be approved
      await prisma.userRole.create({
        data: { userId: pending.id, roleId: role.id },
      });

      const req = new Request(
        `http://localhost/v1/admin/approvals/${pending.id}/approve`,
        {
          method: "POST",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
            Origin: "http://localhost",
            "Content-Type": "application/json",
          },
        },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const updated = await prisma.user.findUnique({ where: { id: pending.id } });
      expect(updated!.status).toBe("active");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects approval for already active user", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-approve-active@test.com");

      const active = await prisma.user.create({
        data: { email: "already-active@test.com", status: "active" },
      });

      const req = new Request(
        `http://localhost/v1/admin/approvals/${active.id}/approve`,
        {
          method: "POST",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
            Origin: "http://localhost",
            "Content-Type": "application/json",
          },
        },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("POST /v1/admin/approvals/:userId/reject", () => {
  it("rejects a pending user", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-reject@test.com");

      const pending = await prisma.user.create({
        data: { email: "to-reject@test.com", status: "pending_approval" },
      });

      const req = new Request(
        `http://localhost/v1/admin/approvals/${pending.id}/reject`,
        {
          method: "POST",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
            Origin: "http://localhost",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Not affiliated" }),
        },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const updated = await prisma.user.findUnique({ where: { id: pending.id } });
      expect(updated!.status).toBe("deactivated");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects HTML in reason field", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(prisma, "admin-reject-html@test.com");

      const pending = await prisma.user.create({
        data: { email: "reject-html@test.com", status: "pending_approval" },
      });

      const req = new Request(
        `http://localhost/v1/admin/approvals/${pending.id}/reject`,
        {
          method: "POST",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
            Origin: "http://localhost",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "<img onerror=alert(1) src=x>" }),
        },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("creates audit log entries on rejection", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdmin(
        prisma,
        "admin-reject-audit@test.com",
      );

      const pending = await prisma.user.create({
        data: { email: "reject-audit@test.com", status: "pending_approval" },
      });

      await app.fetch(
        new Request(`http://localhost/v1/admin/approvals/${pending.id}/reject`, {
          method: "POST",
          headers: {
            Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
            Origin: "http://localhost",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }),
        env,
      );

      const logs = await prisma.auditLog.findMany({
        where: { subjectId: pending.id },
      });
      const actions = logs.map((l) => l.action);
      expect(actions).toContain("approval.rejected");
      expect(actions).toContain("user.status_changed");
    } finally {
      await prisma.$disconnect();
    }
  });
});
