/**
 * Tests for seed idempotency — seeds must be safe to run multiple times.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { setupTestDatabase } from "./test-helpers.js";
import { createPrismaClient } from "../lib/prisma.js";

beforeAll(async () => {
  await setupTestDatabase();
});

describe("seed idempotency", () => {
  it("can seed categories twice without error", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      // First seed
      await prisma.announcementCategory.upsert({
        where: { slug: "test-category" },
        update: { name: "Test Category", description: "Test", sortOrder: 0 },
        create: { name: "Test Category", slug: "test-category", description: "Test", sortOrder: 0 },
      });

      // Second seed (should not throw)
      await prisma.announcementCategory.upsert({
        where: { slug: "test-category" },
        update: { name: "Test Category", description: "Test", sortOrder: 0 },
        create: { name: "Test Category", slug: "test-category", description: "Test", sortOrder: 0 },
      });

      const cat = await prisma.announcementCategory.findUnique({
        where: { slug: "test-category" },
      });
      expect(cat).not.toBeNull();
      expect(cat!.name).toBe("Test Category");
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("can seed permissions twice without error", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const perm = {
        resource: "announcement",
        action: "read",
        description: "Public read access",
      };

      // First seed
      await prisma.permission.upsert({
        where: { resource_action: { resource: perm.resource, action: perm.action } },
        update: { description: perm.description },
        create: perm,
      });

      // Second seed (should not throw)
      await prisma.permission.upsert({
        where: { resource_action: { resource: perm.resource, action: perm.action } },
        update: { description: perm.description },
        create: perm,
      });

      const found = await prisma.permission.findUnique({
        where: { resource_action: { resource: perm.resource, action: perm.action } },
      });
      expect(found).not.toBeNull();
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });

  it("can seed twilio routes twice without error", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const route = {
        phoneNumber: "+19995550001",
        prefixes: JSON.stringify(["+1999"]),
        isDefault: 0,
      };

      await prisma.twilioSenderRoute.upsert({
        where: { phoneNumber: route.phoneNumber },
        update: { prefixes: route.prefixes, isDefault: route.isDefault },
        create: route,
      });

      await prisma.twilioSenderRoute.upsert({
        where: { phoneNumber: route.phoneNumber },
        update: { prefixes: route.prefixes, isDefault: route.isDefault },
        create: route,
      });

      const found = await prisma.twilioSenderRoute.findUnique({
        where: { phoneNumber: route.phoneNumber },
      });
      expect(found).not.toBeNull();
      expect(found!.phoneNumber).toBe("+19995550001");
    } finally {
      await prisma.$disconnect().catch(() => {});
    }
  });
});
