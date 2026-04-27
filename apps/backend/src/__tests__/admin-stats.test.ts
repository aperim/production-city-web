/**
 * Tests for GET /v1/admin/stats
 */
import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

const BASE = "http://localhost";

beforeAll(async () => {
  await setupTestDatabase();
});

describe("GET /v1/admin/stats", () => {
  it("returns counts for totalUsers, pendingApprovals, activeInvitations", async () => {
    const prisma = await createPrismaClient(env.DB);

    try {
      const user = await prisma.user.create({
        data: { email: "stats-test@test.com", status: "active" },
      });
      await prisma.user.create({
        data: { email: "stats-pending@test.com", status: "pending_approval" },
      });
      await prisma.invitation.create({
        data: {
          email: "stats-invite@test.com",
          invitedById: user.id,
          activeEmail: "stats-invite@test.com",
          expiresAt: new Date(Date.now() + 86400000),
        },
      });

      // Grant user:read via RBAC
      const role = await prisma.role.upsert({
        where: { name: "stats_test_role" },
        update: {},
        create: { name: "stats_test_role", isSystem: false },
      });
      const perm = await prisma.permission.upsert({
        where: { resource_action: { resource: "user", action: "read" } },
        update: {},
        create: { resource: "user", action: "read" },
      });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });

      const session = await createSession(prisma, user.id);
      const req = new Request(`${BASE}/v1/admin/stats`, {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          Origin: BASE,
        },
      });

      const { app } = await import("../index.js");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = (await res.json()) as {
        totalUsers: number;
        pendingApprovals: number;
        activeInvitations: number;
      };
      expect(body.totalUsers).toBeGreaterThanOrEqual(2);
      expect(body.pendingApprovals).toBeGreaterThanOrEqual(1);
      expect(body.activeInvitations).toBeGreaterThanOrEqual(1);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 401 without auth", async () => {
    const { app } = await import("../index.js");
    const req = new Request(`${BASE}/v1/admin/stats`, {
      headers: { Origin: BASE },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });
});
