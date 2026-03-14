import { readFileSync, readdirSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

const ROOT = resolve(import.meta.dirname, "..");
const MIGRATIONS_DIR = resolve(ROOT, "prisma/migrations");

/** All migration SQL files in order. */
const MIGRATION_FILES = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

/** Combined SQL from all migrations (for schema validation). */
const ALL_MIGRATION_SQL = MIGRATION_FILES.map((f) =>
  readFileSync(resolve(MIGRATIONS_DIR, f), "utf-8"),
).join("\n");

/** RBAC migration — kept for backward-compatible assertions. */
const MIGRATION_SQL = readFileSync(
  resolve(MIGRATIONS_DIR, "0001_rbac_schema.sql"),
  "utf-8",
);

/**
 * Helper: create a test database file and return a PrismaClient pointed at it.
 * Applies ALL migration files in order so every table is available.
 */
function createTestPrisma() {
  const tmpFile = `/tmp/test-rbac-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
  const sqliteDb = new Database(tmpFile);
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("foreign_keys = ON");

  for (const file of MIGRATION_FILES) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf-8");
    sqliteDb.exec(sql);
  }
  sqliteDb.close();

  const adapter = new PrismaBetterSqlite3({ url: `file:${tmpFile}` });
  const prisma = new PrismaClient({ adapter });
  return { prisma, tmpFile };
}

function cleanupDb(tmpFile: string) {
  try {
    unlinkSync(tmpFile);
  } catch {
    /* ignore */
  }
  try {
    unlinkSync(tmpFile + "-wal");
  } catch {
    /* ignore */
  }
  try {
    unlinkSync(tmpFile + "-shm");
  } catch {
    /* ignore */
  }
}

// ============================================================================
// Schema compilation test
// ============================================================================
describe("Schema compilation", () => {
  it("prisma generate succeeds (client is importable)", async () => {
    const { PrismaClient: PC } = await import("@prisma/client");
    expect(PC).toBeDefined();
  });

  it("migration SQL files exist and contain all tables", () => {
    expect(ALL_MIGRATION_SQL.length).toBeGreaterThan(100);
    const expectedTables = [
      "User",
      "Role",
      "Permission",
      "RolePermission",
      "UserRole",
      "Session",
      "MagicLink",
      "Invitation",
      "InvitationRole",
      "AuditLog",
      "EmailSuppression",
      "MediaAsset",
      "MediaPair",
      "ExpressionOfInterest",
    ];
    for (const table of expectedTables) {
      expect(ALL_MIGRATION_SQL).toContain(`CREATE TABLE "${table}"`);
    }
  });
});

// ============================================================================
// Model CRUD tests
// ============================================================================
describe("RBAC schema CRUD", () => {
  let prisma: PrismaClient;
  let tmpFile: string;

  beforeAll(() => {
    const result = createTestPrisma();
    prisma = result.prisma;
    tmpFile = result.tmpFile;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    cleanupDb(tmpFile);
  });

  it("creates a User", async () => {
    const user = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });
    expect(user.id).toBeTruthy();
    expect(user.email).toBe("test@example.com");
    expect(user.status).toBe("pending_approval");
    expect(user.emailVerified).toBe(false);
  });

  it("enforces User email uniqueness", async () => {
    await expect(
      prisma.user.create({
        data: { email: "test@example.com", name: "Duplicate" },
      }),
    ).rejects.toThrow();
  });

  it("creates a Role", async () => {
    const role = await prisma.role.create({
      data: { name: "test_role", description: "Test role", isSystem: true },
    });
    expect(role.id).toBeTruthy();
    expect(role.name).toBe("test_role");
    expect(role.isSystem).toBe(true);
  });

  it("enforces Role name uniqueness", async () => {
    await expect(
      prisma.role.create({ data: { name: "test_role" } }),
    ).rejects.toThrow();
  });

  it("creates a Permission with composite unique constraint", async () => {
    const perm = await prisma.permission.create({
      data: { resource: "user", action: "read", description: "Read users" },
    });
    expect(perm.id).toBeTruthy();

    await expect(
      prisma.permission.create({
        data: { resource: "user", action: "read" },
      }),
    ).rejects.toThrow();
  });

  it("creates RolePermission mapping", async () => {
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: "test_role" },
    });
    const perm = await prisma.permission.findUniqueOrThrow({
      where: { resource_action: { resource: "user", action: "read" } },
    });
    const rp = await prisma.rolePermission.create({
      data: { roleId: role.id, permissionId: perm.id },
    });
    expect(rp.id).toBeTruthy();

    await expect(
      prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm.id },
      }),
    ).rejects.toThrow();
  });

  it("creates UserRole with grantedBy relation", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: "test_role" },
    });
    const ur = await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id, grantedBy: user.id },
    });
    expect(ur.id).toBeTruthy();

    const loaded = await prisma.userRole.findUniqueOrThrow({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      include: { grantedByUser: true },
    });
    expect(loaded.grantedByUser?.email).toBe("test@example.com");
  });

  it("enforces UserRole composite uniqueness", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: "test_role" },
    });
    await expect(
      prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      }),
    ).rejects.toThrow();
  });

  it("creates a Session", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: "sha256-hash-of-session-token",
        expiresAt: new Date(Date.now() + 86400000),
        ipAddress: "127.0.0.1",
        userAgent: "Test/1.0",
      },
    });
    expect(session.id).toBeTruthy();
    expect(session.token).toBe("sha256-hash-of-session-token");
  });

  it("enforces Session token uniqueness", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    await expect(
      prisma.session.create({
        data: {
          userId: user.id,
          token: "sha256-hash-of-session-token",
          expiresAt: new Date(Date.now() + 86400000),
        },
      }),
    ).rejects.toThrow();
  });

  it("creates a MagicLink without codeSalt", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    const ml = await prisma.magicLink.create({
      data: {
        userId: user.id,
        email: "test@example.com",
        tokenHash: "sha256-hash-of-token",
        codeHash: "hmac-keyed-code-hash",
        purpose: "login",
        expiresAt: new Date(Date.now() + 900000),
      },
    });
    expect(ml.id).toBeTruthy();
    expect(ml.codeHash).toBe("hmac-keyed-code-hash");
    expect(ml.attempts).toBe(0);
    expect(ml.maxAttempts).toBe(5);
    expect(ml.deliveryStatus).toBe("pending");
    // Verify no codeSalt field exists
    expect("codeSalt" in ml).toBe(false);
  });

  it("creates an Invitation with activeEmail uniqueness", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    const inv = await prisma.invitation.create({
      data: {
        email: "invite@example.com",
        invitedById: user.id,
        activeEmail: "invite@example.com",
        expiresAt: new Date(Date.now() + 604800000),
      },
    });
    expect(inv.status).toBe("pending");
    expect(inv.activeEmail).toBe("invite@example.com");

    await expect(
      prisma.invitation.create({
        data: {
          email: "invite@example.com",
          invitedById: user.id,
          activeEmail: "invite@example.com",
          expiresAt: new Date(Date.now() + 604800000),
        },
      }),
    ).rejects.toThrow();
  });

  it("allows NULL activeEmail (non-pending invitations)", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    const inv1 = await prisma.invitation.create({
      data: {
        email: "old@example.com",
        invitedById: user.id,
        activeEmail: null,
        status: "accepted",
        expiresAt: new Date(Date.now() + 604800000),
      },
    });
    const inv2 = await prisma.invitation.create({
      data: {
        email: "old2@example.com",
        invitedById: user.id,
        activeEmail: null,
        status: "expired",
        expiresAt: new Date(Date.now() + 604800000),
      },
    });
    expect(inv1.id).not.toBe(inv2.id);
  });

  it("creates InvitationRole mapping", async () => {
    const inv = await prisma.invitation.findFirst({
      where: { email: "invite@example.com" },
    });
    const role = await prisma.role.findUniqueOrThrow({
      where: { name: "test_role" },
    });
    const ir = await prisma.invitationRole.create({
      data: { invitationId: inv!.id, roleId: role.id },
    });
    expect(ir.id).toBeTruthy();
  });

  it("creates an AuditLog entry", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    const log = await prisma.auditLog.create({
      data: {
        actorId: user.id,
        subjectId: user.id,
        action: "user.login",
        resource: "session",
        details: JSON.stringify({ method: "magic_link" }),
        ipAddress: "127.0.0.1",
      },
    });
    expect(log.id).toBeTruthy();
    expect(log.action).toBe("user.login");
    expect(log.details).toBe('{"method":"magic_link"}');
  });

  it("creates an EmailSuppression record", async () => {
    const supp = await prisma.emailSuppression.create({
      data: {
        email: "bounced@example.com",
        reason: "hard_bounce",
        details: JSON.stringify({ bounceType: "HardBounce" }),
      },
    });
    expect(supp.id).toBeTruthy();
    expect(supp.email).toBe("bounced@example.com");
    expect(supp.reason).toBe("hard_bounce");
    expect(supp.removedAt).toBeNull();
  });

  it("enforces EmailSuppression email uniqueness", async () => {
    await expect(
      prisma.emailSuppression.create({
        data: { email: "bounced@example.com", reason: "spam_complaint" },
      }),
    ).rejects.toThrow();
  });

  it("upserts EmailSuppression (re-bounce after removal)", async () => {
    // Use a real user FK for removedBy
    const adminUser = await prisma.user.findUniqueOrThrow({
      where: { email: "test@example.com" },
    });
    await prisma.emailSuppression.update({
      where: { email: "bounced@example.com" },
      data: { removedAt: new Date(), removedBy: adminUser.id },
    });

    const upserted = await prisma.emailSuppression.upsert({
      where: { email: "bounced@example.com" },
      update: {
        reason: "hard_bounce",
        details: JSON.stringify({ bounceType: "HardBounce", count: 2 }),
        removedAt: null,
        removedBy: null,
      },
      create: {
        email: "bounced@example.com",
        reason: "hard_bounce",
      },
    });
    expect(upserted.removedAt).toBeNull();
    expect(upserted.reason).toBe("hard_bounce");
  });

  it("cascades delete from User to Sessions", async () => {
    // Use a fresh user to avoid FK conflicts from other test records
    const user = await prisma.user.create({
      data: { email: "cascade-test@example.com" },
    });
    await prisma.session.create({
      data: {
        userId: user.id,
        token: "cascade-test-token",
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const sessionsBefore = await prisma.session.findMany({
      where: { userId: user.id },
    });
    expect(sessionsBefore.length).toBe(1);

    await prisma.user.delete({ where: { id: user.id } });
    const sessionsAfter = await prisma.session.findMany({
      where: { userId: user.id },
    });
    expect(sessionsAfter.length).toBe(0);
  });

  it("loads full relation chain: User -> UserRoles -> Role -> Permissions", async () => {
    const user = await prisma.user.create({
      data: { email: "relation-test@example.com", status: "active" },
    });
    const role = await prisma.role.create({
      data: { name: "relation_test_role" },
    });
    const perm = await prisma.permission.create({
      data: { resource: "test", action: "verify" },
    });
    await prisma.rolePermission.create({
      data: { roleId: role.id, permissionId: perm.id },
    });
    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const loaded = await prisma.user.findUniqueOrThrow({
      where: { email: "relation-test@example.com" },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    expect(loaded.userRoles).toHaveLength(1);
    expect(loaded.userRoles[0]!.role.name).toBe("relation_test_role");
    expect(loaded.userRoles[0]!.role.rolePermissions).toHaveLength(1);
    expect(
      loaded.userRoles[0]!.role.rolePermissions[0]!.permission.resource,
    ).toBe("test");
  });
});

// ============================================================================
// Seed tests
// ============================================================================
describe("Seed script", () => {
  let prisma: PrismaClient;
  let tmpFile: string;

  beforeAll(() => {
    const result = createTestPrisma();
    prisma = result.prisma;
    tmpFile = result.tmpFile;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    cleanupDb(tmpFile);
  });

  async function runSeed(
    client: PrismaClient,
    env: string = "development",
    adminEmail?: string,
  ) {
    const { seedDatabase } = await import("../prisma/seed-logic.js");
    return seedDatabase(client, { nodeEnv: env, adminEmail });
  }

  it("creates all expected roles", async () => {
    await runSeed(prisma);
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    const roleNames = roles.map((r) => r.name);
    expect(roleNames).toContain("super_admin");
    expect(roleNames).toContain("admin");
    expect(roleNames).toContain("member");
    expect(roleNames).toContain("viewer");
    expect(roles.every((r) => r.isSystem)).toBe(true);
  });

  it("creates all expected permissions", async () => {
    const perms = await prisma.permission.findMany();
    const permKeys = perms.map((p) => `${p.resource}:${p.action}`);
    expect(permKeys).toContain("user:read");
    expect(permKeys).toContain("user:create");
    expect(permKeys).toContain("user:update");
    expect(permKeys).toContain("user:delete");
    expect(permKeys).toContain("user:admin");
    expect(permKeys).toContain("role:read");
    expect(permKeys).toContain("invitation:create");
    expect(permKeys).toContain("audit:read");
    expect(permKeys).toContain("system:admin");
  });

  it("super_admin has ALL permissions", async () => {
    const totalPerms = await prisma.permission.count();
    const superAdmin = await prisma.role.findUniqueOrThrow({
      where: { name: "super_admin" },
      include: { rolePermissions: true },
    });
    expect(superAdmin.rolePermissions.length).toBe(totalPerms);
  });

  it("admin has correct subset of permissions", async () => {
    const admin = await prisma.role.findUniqueOrThrow({
      where: { name: "admin" },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
    const permKeys = admin.rolePermissions.map(
      (rp) => `${rp.permission.resource}:${rp.permission.action}`,
    );
    expect(permKeys).toContain("user:read");
    expect(permKeys).toContain("user:create");
    expect(permKeys).toContain("user:update");
    expect(permKeys).toContain("user:delete");
    expect(permKeys).toContain("user:admin");
    expect(permKeys).toContain("role:read");
    expect(permKeys).toContain("invitation:read");
    expect(permKeys).toContain("invitation:create");
    expect(permKeys).toContain("invitation:revoke");
    expect(permKeys).toContain("audit:read");
    expect(permKeys).not.toContain("system:admin");
  });

  it("member has only user:read", async () => {
    const member = await prisma.role.findUniqueOrThrow({
      where: { name: "member" },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
    const permKeys = member.rolePermissions.map(
      (rp) => `${rp.permission.resource}:${rp.permission.action}`,
    );
    expect(permKeys).toEqual(["user:read"]);
  });

  it("viewer has only user:read", async () => {
    const viewer = await prisma.role.findUniqueOrThrow({
      where: { name: "viewer" },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
    const permKeys = viewer.rolePermissions.map(
      (rp) => `${rp.permission.resource}:${rp.permission.action}`,
    );
    expect(permKeys).toEqual(["user:read"]);
  });

  it("creates dev admin user in development", async () => {
    const admin = await prisma.user.findUnique({
      where: { email: "admin@production.city" },
      include: { userRoles: { include: { role: true } } },
    });
    expect(admin).not.toBeNull();
    expect(admin!.status).toBe("active");
    expect(admin!.emailVerified).toBe(true);
    expect(admin!.userRoles.some((ur) => ur.role.name === "super_admin")).toBe(
      true,
    );
  });

  it("is idempotent: running twice produces no errors or duplicates", async () => {
    const rolesBefore = await prisma.role.count();
    const permsBefore = await prisma.permission.count();
    const rpBefore = await prisma.rolePermission.count();
    const usersBefore = await prisma.user.count();

    await runSeed(prisma);

    expect(await prisma.role.count()).toBe(rolesBefore);
    expect(await prisma.permission.count()).toBe(permsBefore);
    expect(await prisma.rolePermission.count()).toBe(rpBefore);
    expect(await prisma.user.count()).toBe(usersBefore);
  });

  it("respects SEED_ADMIN_EMAIL", async () => {
    const fresh = createTestPrisma();
    try {
      await runSeed(fresh.prisma, "development", "custom@test.com");
      const admin = await fresh.prisma.user.findUnique({
        where: { email: "custom@test.com" },
      });
      expect(admin).not.toBeNull();
      expect(admin!.status).toBe("active");
    } finally {
      await fresh.prisma.$disconnect();
      cleanupDb(fresh.tmpFile);
    }
  });
});

describe("Seed production safety", () => {
  let prisma: PrismaClient;
  let tmpFile: string;

  beforeAll(() => {
    const result = createTestPrisma();
    prisma = result.prisma;
    tmpFile = result.tmpFile;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    cleanupDb(tmpFile);
  });

  it("blocks admin creation in production", async () => {
    const { seedDatabase } = await import("../prisma/seed-logic.js");
    await seedDatabase(prisma, { nodeEnv: "production" });
    const admin = await prisma.user.findUnique({
      where: { email: "admin@production.city" },
    });
    expect(admin).toBeNull();
  });

  it("blocks admin creation when NODE_ENV is undefined", async () => {
    const fresh = createTestPrisma();
    try {
      const { seedDatabase } = await import("../prisma/seed-logic.js");
      await seedDatabase(fresh.prisma, { nodeEnv: null });
      const admin = await fresh.prisma.user.findUnique({
        where: { email: "admin@production.city" },
      });
      expect(admin).toBeNull();
    } finally {
      await fresh.prisma.$disconnect();
      cleanupDb(fresh.tmpFile);
    }
  });

  it("still creates roles and permissions in production", async () => {
    expect(await prisma.role.count()).toBe(4);
    expect(await prisma.permission.count()).toBeGreaterThan(0);
  });
});
