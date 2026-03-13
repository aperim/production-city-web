import { describe, it, expect } from "vitest";
import {
  generateRequestId,
  generateCode,
  generateToken,
  sha256Hex,
  hmacSha256Hex,
} from "../service.js";

describe("generateRequestId", () => {
  it("generates a base64url string", () => {
    const id = generateRequestId();
    // base64url: alphanumeric, -, _ (no +, /, =)
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates 32-byte tokens (43-44 chars in base64url)", () => {
    const id = generateRequestId();
    // 32 bytes → ceil(32*4/3) = 43 chars in base64url (no padding)
    expect(id.length).toBeGreaterThanOrEqual(42);
    expect(id.length).toBeLessThanOrEqual(44);
  });

  it("generates unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});

describe("generateCode", () => {
  it("generates a 6-digit string", () => {
    const code = generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("pads with leading zeros", () => {
    // Run multiple times to verify padding
    for (let i = 0; i < 50; i++) {
      const code = generateCode();
      expect(code.length).toBe(6);
    }
  });
});

describe("generateToken", () => {
  it("generates a base64url string", () => {
    const token = generateToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates unique values", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});

describe("sha256Hex", () => {
  it("produces a 64-character hex string", async () => {
    const hash = await sha256Hex("hello");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces consistent output for same input", async () => {
    const hash1 = await sha256Hex("test-input");
    const hash2 = await sha256Hex("test-input");
    expect(hash1).toBe(hash2);
  });

  it("produces different output for different input", async () => {
    const hash1 = await sha256Hex("input-a");
    const hash2 = await sha256Hex("input-b");
    expect(hash1).not.toBe(hash2);
  });
});

describe("hmacSha256Hex", () => {
  it("produces a 64-character hex string", async () => {
    const hmac = await hmacSha256Hex("secret", "message");
    expect(hmac).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces consistent output for same key and message", async () => {
    const hmac1 = await hmacSha256Hex("key", "msg");
    const hmac2 = await hmacSha256Hex("key", "msg");
    expect(hmac1).toBe(hmac2);
  });

  it("produces different output for different keys", async () => {
    const hmac1 = await hmacSha256Hex("key-a", "message");
    const hmac2 = await hmacSha256Hex("key-b", "message");
    expect(hmac1).not.toBe(hmac2);
  });

  it("produces different output for different messages", async () => {
    const hmac1 = await hmacSha256Hex("key", "msg-a");
    const hmac2 = await hmacSha256Hex("key", "msg-b");
    expect(hmac1).not.toBe(hmac2);
  });
});
