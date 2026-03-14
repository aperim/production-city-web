/**
 * Tests for WebSocket-related schema changes:
 * - NotificationPreference CRUD and constraints
 * - MagicLink.deliveryToken and deliveryTokenUsed
 * - Seed idempotency for notification preferences
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { createPrismaClient } from "../lib/prisma.js";
import { setupTestDatabase } from "./test-helpers.js";
import { sha256Hex, generateSessionToken } from "../auth/token.js";

beforeAll(async () => {
  await setupTestDatabase();
});

describe("NotificationPreference model", () => {
  it("creates a notification preference", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `notif-create-${Date.now()}@test.com`;
      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      const pref = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          channel: "admin:notifications",
          enabled: true,
        },
      });

      expect(pref.id).toBeDefined();
      expect(pref.userId).toBe(user.id);
      expect(pref.channel).toBe("admin:notifications");
      expect(pref.enabled).toBe(true);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("enforces unique constraint on userId+channel", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `notif-unique-${Date.now()}@test.com`;
      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.notificationPreference.create({
        data: { userId: user.id, channel: "admin:eoi", enabled: true },
      });

      // Attempt duplicate
      await expect(
        prisma.notificationPreference.create({
          data: { userId: user.id, channel: "admin:eoi", enabled: false },
        }),
      ).rejects.toThrow();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("allows same channel for different users", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user1 = await prisma.user.create({
        data: { email: `notif-multi1-${Date.now()}@test.com`, status: "active" },
      });
      const user2 = await prisma.user.create({
        data: { email: `notif-multi2-${Date.now()}@test.com`, status: "active" },
      });

      const pref1 = await prisma.notificationPreference.create({
        data: { userId: user1.id, channel: "admin:approvals", enabled: true },
      });
      const pref2 = await prisma.notificationPreference.create({
        data: { userId: user2.id, channel: "admin:approvals", enabled: true },
      });

      expect(pref1.id).not.toBe(pref2.id);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("updates a notification preference", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: `notif-update-${Date.now()}@test.com`, status: "active" },
      });

      const pref = await prisma.notificationPreference.create({
        data: { userId: user.id, channel: "admin:audit", enabled: true },
      });

      const updated = await prisma.notificationPreference.update({
        where: { id: pref.id },
        data: { enabled: false },
      });

      expect(updated.enabled).toBe(false);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("cascade deletes preferences when user is deleted", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: `notif-cascade-${Date.now()}@test.com`, status: "active" },
      });

      await prisma.notificationPreference.create({
        data: { userId: user.id, channel: "admin:notifications", enabled: true },
      });
      await prisma.notificationPreference.create({
        data: { userId: user.id, channel: "admin:eoi", enabled: true },
      });

      // Delete the user
      await prisma.user.delete({ where: { id: user.id } });

      // Preferences should be gone
      const remaining = await prisma.notificationPreference.findMany({
        where: { userId: user.id },
      });
      expect(remaining).toHaveLength(0);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("upsert is idempotent (seed simulation)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: `notif-seed-${Date.now()}@test.com`, status: "active" },
      });

      const channel = "admin:notifications";

      // First upsert
      await prisma.notificationPreference.upsert({
        where: { userId_channel: { userId: user.id, channel } },
        update: {},
        create: { userId: user.id, channel, enabled: true },
      });

      // Second upsert (idempotent)
      await prisma.notificationPreference.upsert({
        where: { userId_channel: { userId: user.id, channel } },
        update: {},
        create: { userId: user.id, channel, enabled: true },
      });

      const prefs = await prisma.notificationPreference.findMany({
        where: { userId: user.id, channel },
      });
      expect(prefs).toHaveLength(1);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe("MagicLink.deliveryToken", () => {
  it("creates magic link with delivery token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `delivery-create-${Date.now()}@test.com`;
      const tokenHash = await sha256Hex(generateSessionToken());
      const deliveryToken = crypto.randomUUID();

      const magicLink = await prisma.magicLink.create({
        data: {
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          deliveryToken,
        },
      });

      expect(magicLink.deliveryToken).toBe(deliveryToken);
      expect(magicLink.deliveryTokenUsed).toBe(false);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("enforces uniqueness on delivery token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const deliveryToken = crypto.randomUUID();
      const tokenHash1 = await sha256Hex(generateSessionToken());
      const tokenHash2 = await sha256Hex(generateSessionToken());

      await prisma.magicLink.create({
        data: {
          email: `delivery-uniq1-${Date.now()}@test.com`,
          tokenHash: tokenHash1,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          deliveryToken,
        },
      });

      await expect(
        prisma.magicLink.create({
          data: {
            email: `delivery-uniq2-${Date.now()}@test.com`,
            tokenHash: tokenHash2,
            codeHash: "fakehash",
            purpose: "login",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            deliveryToken,
          },
        }),
      ).rejects.toThrow();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("marks delivery token as used (single-use)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `delivery-used-${Date.now()}@test.com`;
      const tokenHash = await sha256Hex(generateSessionToken());
      const deliveryToken = crypto.randomUUID();

      await prisma.magicLink.create({
        data: {
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          deliveryToken,
          deliveryTokenUsed: false,
        },
      });

      const updated = await prisma.magicLink.update({
        where: { deliveryToken },
        data: { deliveryTokenUsed: true },
      });

      expect(updated.deliveryTokenUsed).toBe(true);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("allows magic link without delivery token (nullable)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `delivery-null-${Date.now()}@test.com`;
      const tokenHash = await sha256Hex(generateSessionToken());

      const magicLink = await prisma.magicLink.create({
        data: {
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      expect(magicLink.deliveryToken).toBeNull();
      expect(magicLink.deliveryTokenUsed).toBe(false);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("looks up magic link by delivery token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = `delivery-lookup-${Date.now()}@test.com`;
      const tokenHash = await sha256Hex(generateSessionToken());
      const deliveryToken = crypto.randomUUID();

      const created = await prisma.magicLink.create({
        data: {
          email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          deliveryToken,
        },
      });

      const found = await prisma.magicLink.findUnique({
        where: { deliveryToken },
      });

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});

describe("AuditLog WebSocket actions", () => {
  it("creates ws_connect audit log entry", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const user = await prisma.user.create({
        data: { email: `audit-ws-${Date.now()}@test.com`, status: "active" },
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "ws_connect",
          resource: "websocket",
          details: JSON.stringify({ durableObjectId: "do-123" }),
        },
      });

      const log = await prisma.auditLog.findFirst({
        where: { actorId: user.id, action: "ws_connect" },
      });

      expect(log).not.toBeNull();
      expect(log!.resource).toBe("websocket");
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});
