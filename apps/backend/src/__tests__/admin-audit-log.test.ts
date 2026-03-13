import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { createAuditLog, redactIp } from "../auth/audit.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });

async function createAdminWithAuditPerm(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  email: string,
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });

  const perms = [
    ["audit", "read"], ["user", "read"],
  ];

  const role = await prisma.role.create({
    data: { name: `audit-admin-${user.id.slice(0, 8)}`, description: "Auditor" },
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
    } catch { /* skip */ }
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  const session = await createSession(prisma, user.id);
  return { user, role, session };
}

describe("IP redaction", () => {
  it("redacts IPv4 to /24", () => {
    expect(redactIp("192.168.1.42")).toBe("192.168.1.0/24");
  });

  it("redacts IPv6 to /48", () => {
    expect(redactIp("2001:db8:1234:5678:abcd:ef01:2345:6789")).toBe("2001:db8:1234::/48");
  });

  it("handles null", () => {
    expect(redactIp(null)).toBeNull();
  });
});

describe("Audit log field allowlist", () => {
  it("filters out non-allowed fields", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      await createAuditLog(prisma, {
        action: "auth.magic_link.verified",
        resource: "auth",
        details: {
          email: "test@test.com",
          purpose: "login",
          secretToken: "should-not-be-stored",
          fullUrl: "http://example.com/auth?token=secret",
        },
        ipAddress: "192.168.1.42",
      });

      const log = await prisma.auditLog.findFirst({
        where: { action: "auth.magic_link.verified" },
        orderBy: { createdAt: "desc" },
      });

      expect(log).not.toBeNull();
      const details = JSON.parse(log!.details!);
      expect(details.email).toBe("test@test.com");
      expect(details.purpose).toBe("login");
      // These should be filtered out
      expect(details.secretToken).toBeUndefined();
      expect(details.fullUrl).toBeUndefined();

      // IP should be redacted
      expect(log!.ipAddress).toBe("192.168.1.0/24");
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("GET /v1/admin/audit-log", () => {
  it("returns audit log with cursor-based pagination", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAdminWithAuditPerm(
        prisma,
        "admin-auditlog@test.com",
      );

      // Create some audit entries
      for (let i = 0; i < 5; i++) {
        await createAuditLog(prisma, {
          actorId: user.id,
          action: "auth.login",
          resource: "auth",
          details: { email: `user${i}@test.com`, method: "magic_link" },
        });
      }

      const req = new Request("http://localhost/v1/admin/audit-log?limit=3", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as {
        entries: Array<Record<string, unknown>>;
        nextCursor: string | null;
        hasMore: boolean;
      };
      expect(body.entries.length).toBe(3);
      expect(body.hasMore).toBe(true);
      expect(body.nextCursor).not.toBeNull();

      // Fetch next page using cursor
      const req2 = new Request(
        `http://localhost/v1/admin/audit-log?limit=3&cursor=${encodeURIComponent(body.nextCursor!)}`,
        { headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` } },
      );
      const res2 = await app.fetch(req2, env);
      expect(res2.status).toBe(200);

      const body2 = await res2.json() as {
        entries: Array<Record<string, unknown>>;
        hasMore: boolean;
      };
      expect(body2.entries.length).toBeGreaterThan(0);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("filters by action", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAdminWithAuditPerm(
        prisma,
        "admin-auditfilter@test.com",
      );

      await createAuditLog(prisma, {
        actorId: user.id,
        action: "auth.logout",
        resource: "auth",
      });

      const req = new Request(
        "http://localhost/v1/admin/audit-log?action=auth.logout",
        { headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` } },
      );
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as { entries: Array<{ action: string }> };
      for (const entry of body.entries) {
        expect(entry.action).toBe("auth.logout");
      }
    } finally {
      await prisma.$disconnect();
    }
  });
});
