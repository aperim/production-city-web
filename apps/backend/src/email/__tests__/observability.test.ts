/**
 * Tests for email observability: structured logging when magic link emails
 * are skipped or when the Postmark API token is missing.
 *
 * Issue #365: Magic link emails never sent because POSTMARK_API_TOKEN is not deployed.
 */
import { describe, it, expect, beforeAll, vi } from "vitest";
import { env } from "cloudflare:workers";
import { createPrismaClient } from "../../lib/prisma.js";
import { handleMagicLinkRequest } from "../service.js";
import { setupTestDatabase } from "../../__tests__/test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

describe("handleMagicLinkRequest observability", () => {
  it("logs email.magic_link.skipped when shouldSend is false (unregistered, no invitation)", async () => {
    const prisma = await createPrismaClient(env.DB);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const result = await handleMagicLinkRequest(
        {
          prisma,
          postmarkApiToken: "test-token",
          hmacSecret: "test-secret",
          baseUrl: "http://localhost:4321",
        },
        {
          email: "observability-unregistered@test.com",
          ipAddress: "127.0.0.1",
        },
      );

      // Anti-enumeration: still returns 200
      expect(result.status).toBe(200);

      // Should have logged a skip warning
      expect(warnSpy).toHaveBeenCalled();
      const logCalls = warnSpy.mock.calls.map((args) => args[0]);
      const skipLog = logCalls.find((msg) => {
        if (typeof msg !== "string") return false;
        const parsed = JSON.parse(msg);
        return parsed.short_message === "email.magic_link.skipped";
      });
      expect(skipLog).toBeDefined();

      const parsed = JSON.parse(skipLog as string);
      expect(parsed._reason).toBe("no_user_or_invitation");
    } finally {
      warnSpy.mockRestore();
      await prisma.$disconnect();
    }
  });

  it("logs email.magic_link.skipped with reason email_suppressed when email is suppressed", async () => {
    const prisma = await createPrismaClient(env.DB);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const email = "observability-suppressed@test.com";

      // Create user and suppression
      await prisma.user.create({
        data: { email, status: "active" },
      });
      await prisma.emailSuppression.create({
        data: { email, reason: "hard_bounce" },
      });

      const result = await handleMagicLinkRequest(
        {
          prisma,
          postmarkApiToken: "test-token",
          hmacSecret: "test-secret",
          baseUrl: "http://localhost:4321",
        },
        { email, ipAddress: "127.0.0.1" },
      );

      expect(result.status).toBe(200);

      const logCalls = warnSpy.mock.calls.map((args) => args[0]);
      const skipLog = logCalls.find((msg) => {
        if (typeof msg !== "string") return false;
        const parsed = JSON.parse(msg);
        return parsed.short_message === "email.magic_link.skipped";
      });
      expect(skipLog).toBeDefined();

      const parsed = JSON.parse(skipLog as string);
      expect(parsed._reason).toBe("email_suppressed");
    } finally {
      warnSpy.mockRestore();
      await prisma.$disconnect();
    }
  });

  it("does NOT log email.magic_link.skipped when shouldSend is true (registered user)", async () => {
    const prisma = await createPrismaClient(env.DB);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const email = "observability-registered@test.com";
      await prisma.user.create({
        data: { email, status: "active" },
      });

      await handleMagicLinkRequest(
        {
          prisma,
          postmarkApiToken: "test-token",
          hmacSecret: "test-secret",
          baseUrl: "http://localhost:4321",
        },
        { email, ipAddress: "127.0.0.1" },
      );

      const logCalls = warnSpy.mock.calls.map((args) => args[0]);
      const skipLog = logCalls.find((msg) => {
        if (typeof msg !== "string") return false;
        try {
          const parsed = JSON.parse(msg);
          return parsed.event === "email.magic_link.skipped";
        } catch {
          return false;
        }
      });
      expect(skipLog).toBeUndefined();
    } finally {
      warnSpy.mockRestore();
      await prisma.$disconnect();
    }
  });

  it("sets deliveryStatus to failed when sendEmail fails with empty token", async () => {
    const prisma = await createPrismaClient(env.DB);

    try {
      const email = "observability-empty-token@test.com";
      await prisma.user.create({
        data: { email, status: "active" },
      });

      const result = await handleMagicLinkRequest(
        {
          prisma,
          postmarkApiToken: "", // empty token — sendEmail will fail
          hmacSecret: "test-secret",
          baseUrl: "http://localhost:4321",
        },
        { email, ipAddress: "127.0.0.1" },
      );

      // Anti-enumeration: still returns 200
      expect(result.status).toBe(200);

      // The magic link record should have deliveryStatus = "failed"
      const magicLinks = await prisma.magicLink.findMany({
        where: { email },
        orderBy: { createdAt: "desc" },
      });
      expect(magicLinks.length).toBeGreaterThanOrEqual(1);
      expect(magicLinks[0]!.deliveryStatus).toBe("failed");
    } finally {
      await prisma.$disconnect();
    }
  });
});
