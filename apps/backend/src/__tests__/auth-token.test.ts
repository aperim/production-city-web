import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { createPrismaClient } from "../lib/prisma.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });
import {
  generateSessionToken,
  sha256Hex,
  timingSafeEqual,
  hmacSha256Hex,
  verifyMagicLinkToken,
  verifyMagicCode,
  TOKEN_INVALID_ERROR,
} from "../auth/token.js";

describe("Token generation", () => {
  it("generates unique tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateSessionToken());
    }
    expect(tokens.size).toBe(100);
  });

  it("generates base64url-encoded tokens (no +, /, =)", () => {
    const token = generateSessionToken();
    expect(token).not.toMatch(/[+/=]/);
    expect(token.length).toBeGreaterThan(0);
  });
});

describe("SHA-256 hashing", () => {
  it("produces consistent hex output", async () => {
    const hash1 = await sha256Hex("test-input");
    const hash2 = await sha256Hex("test-input");
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different inputs", async () => {
    const hash1 = await sha256Hex("input-a");
    const hash2 = await sha256Hex("input-b");
    expect(hash1).not.toBe(hash2);
  });
});

describe("Timing-safe comparison", () => {
  it("returns true for equal strings", async () => {
    expect(await timingSafeEqual("abc123", "abc123")).toBe(true);
  });

  it("returns false for different strings", async () => {
    expect(await timingSafeEqual("abc123", "abc456")).toBe(false);
  });

  it("returns false for different length strings", async () => {
    expect(await timingSafeEqual("short", "longer-string")).toBe(false);
  });
});

describe("HMAC-SHA256", () => {
  it("produces consistent keyed hash", async () => {
    const h1 = await hmacSha256Hex("secret", "message");
    const h2 = await hmacSha256Hex("secret", "message");
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different keys", async () => {
    const h1 = await hmacSha256Hex("key1", "message");
    const h2 = await hmacSha256Hex("key2", "message");
    expect(h1).not.toBe(h2);
  });
});

describe("Magic link token verification", () => {
  it("verifies a valid token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);

      // Create user
      const user = await prisma.user.create({
        data: { email: "verify-token@test.com", status: "active" },
      });

      // Create magic link
      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email: user.email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const result = await verifyMagicLinkToken(prisma, token);
      expect(result).not.toBeNull();
      expect(result!.ok).toBe(true);
      expect(result!.magicLink.email).toBe("verify-token@test.com");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects an expired token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);

      const user = await prisma.user.create({
        data: { email: "expired-token@test.com", status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email: user.email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });

      const result = await verifyMagicLinkToken(prisma, token);
      expect(result).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects a used token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);

      const user = await prisma.user.create({
        data: { email: "used-token@test.com", status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email: user.email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          usedAt: new Date(), // Already used
        },
      });

      const result = await verifyMagicLinkToken(prisma, token);
      expect(result).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects an invalid token", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const result = await verifyMagicLinkToken(prisma, "nonexistent-token");
      expect(result).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("atomic consumption: second verification returns null", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);

      const user = await prisma.user.create({
        data: { email: "atomic-token@test.com", status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email: user.email,
          tokenHash,
          codeHash: "fakehash",
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      // First verification succeeds
      const result1 = await verifyMagicLinkToken(prisma, token);
      expect(result1).not.toBeNull();

      // Second verification fails (already consumed)
      const result2 = await verifyMagicLinkToken(prisma, token);
      expect(result2).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Magic code verification", () => {
  const HMAC_SECRET = "test-hmac-secret";

  it("verifies a valid code", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "code-valid@test.com";
      const code = "123456";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);
      const codeHash = await hmacSha256Hex(HMAC_SECRET, `${email}login${tokenHash}${code}`);

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash,
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      const { result } = await verifyMagicCode(prisma, email, code, HMAC_SECRET);
      expect(result).not.toBeNull();
      expect(result!.ok).toBe(true);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects an invalid code and decrements attempts", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "code-invalid@test.com";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);
      const codeHash = await hmacSha256Hex(HMAC_SECRET, `${email}login${tokenHash}123456`);

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash,
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          maxAttempts: 5,
        },
      });

      const { result, remainingAttempts } = await verifyMagicCode(
        prisma,
        email,
        "000000",
        HMAC_SECRET,
      );
      expect(result).toBeNull();
      expect(remainingAttempts).toBe(4);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejects after max attempts exceeded", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const email = "code-maxed@test.com";
      const token = generateSessionToken();
      const tokenHash = await sha256Hex(token);
      const codeHash = await hmacSha256Hex(HMAC_SECRET, `${email}login${tokenHash}123456`);

      const user = await prisma.user.create({
        data: { email, status: "active" },
      });

      await prisma.magicLink.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          codeHash,
          purpose: "login",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          attempts: 5,
          maxAttempts: 5,
        },
      });

      const { result, remainingAttempts, reason } = await verifyMagicCode(
        prisma,
        email,
        "123456",
        HMAC_SECRET,
      );
      expect(result).toBeNull();
      expect(remainingAttempts).toBe(0);
      expect(reason).toBe("max_attempts_exceeded");
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("TOKEN_INVALID_ERROR", () => {
  it("has generic error message", () => {
    expect(TOKEN_INVALID_ERROR.error).toBe("token_invalid");
    expect(TOKEN_INVALID_ERROR.message).toContain("invalid or has expired");
  });
});
