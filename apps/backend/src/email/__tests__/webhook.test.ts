import { describe, it, expect } from "vitest";
import {
  verifyWebhookSignature,
  isTimestampFresh,
  isValidTransition,
} from "../webhook.js";

describe("verifyWebhookSignature", () => {
  const secret = "test-webhook-secret";

  async function computeHmac(body: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  it("returns true for a valid HMAC signature", async () => {
    const body = '{"RecordType":"Delivery","MessageID":"abc-123"}';
    const signature = await computeHmac(body, secret);
    const result = await verifyWebhookSignature(body, signature, secret);
    expect(result).toBe(true);
  });

  it("returns false for an invalid signature", async () => {
    const body = '{"RecordType":"Delivery","MessageID":"abc-123"}';
    const result = await verifyWebhookSignature(body, "invalid-signature", secret);
    expect(result).toBe(false);
  });

  it("returns false for empty signature", async () => {
    const body = '{"test":"data"}';
    const result = await verifyWebhookSignature(body, "", secret);
    expect(result).toBe(false);
  });

  it("returns false for empty secret", async () => {
    const body = '{"test":"data"}';
    const result = await verifyWebhookSignature(body, "some-sig", "");
    expect(result).toBe(false);
  });

  it("returns false when body is tampered", async () => {
    const body = '{"RecordType":"Delivery","MessageID":"abc-123"}';
    const signature = await computeHmac(body, secret);
    const tampered = '{"RecordType":"Delivery","MessageID":"abc-124"}';
    const result = await verifyWebhookSignature(tampered, signature, secret);
    expect(result).toBe(false);
  });

  it("verifies against raw body, not re-serialized JSON", async () => {
    // Ensure whitespace matters — raw body verification
    const body = '{"RecordType": "Delivery"}';
    const compacted = '{"RecordType":"Delivery"}';
    const signature = await computeHmac(body, secret);
    expect(await verifyWebhookSignature(body, signature, secret)).toBe(true);
    expect(await verifyWebhookSignature(compacted, signature, secret)).toBe(false);
  });
});

describe("isTimestampFresh", () => {
  const NOW = 1710300000000; // Fixed timestamp for testing

  it("returns true for a timestamp within the 5-minute window", () => {
    const ts = new Date(NOW - 2 * 60 * 1000).toISOString(); // 2 minutes ago
    expect(isTimestampFresh(ts, NOW)).toBe(true);
  });

  it("returns true for a timestamp exactly at the 5-minute boundary", () => {
    const ts = new Date(NOW - 5 * 60 * 1000).toISOString(); // Exactly 5 minutes ago
    expect(isTimestampFresh(ts, NOW)).toBe(true);
  });

  it("returns false for a timestamp older than 5 minutes", () => {
    const ts = new Date(NOW - 6 * 60 * 1000).toISOString(); // 6 minutes ago
    expect(isTimestampFresh(ts, NOW)).toBe(false);
  });

  it("returns false for undefined timestamp", () => {
    expect(isTimestampFresh(undefined, NOW)).toBe(false);
  });

  it("returns false for invalid date string", () => {
    expect(isTimestampFresh("not-a-date", NOW)).toBe(false);
  });

  it("returns false for future timestamp beyond window", () => {
    const ts = new Date(NOW + 6 * 60 * 1000).toISOString(); // 6 minutes in future
    expect(isTimestampFresh(ts, NOW)).toBe(false);
  });
});

describe("isValidTransition (delivery status state machine)", () => {
  it("allows pending → sending", () => {
    expect(isValidTransition("pending", "sending")).toBe(true);
  });

  it("allows sending → sent", () => {
    expect(isValidTransition("sending", "sent")).toBe(true);
  });

  it("allows sending → failed", () => {
    expect(isValidTransition("sending", "failed")).toBe(true);
  });

  it("allows sent → delivered", () => {
    expect(isValidTransition("sent", "delivered")).toBe(true);
  });

  it("allows sent → bounced", () => {
    expect(isValidTransition("sent", "bounced")).toBe(true);
  });

  it("allows sent → failed", () => {
    expect(isValidTransition("sent", "failed")).toBe(true);
  });

  it("disallows pending → delivered (must go through sending/sent)", () => {
    expect(isValidTransition("pending", "delivered")).toBe(false);
  });

  it("disallows delivered → bounced (terminal state)", () => {
    expect(isValidTransition("delivered", "bounced")).toBe(false);
  });

  it("disallows bounced → delivered (terminal state)", () => {
    expect(isValidTransition("bounced", "delivered")).toBe(false);
  });

  it("disallows failed → sent (terminal state)", () => {
    expect(isValidTransition("failed", "sent")).toBe(false);
  });

  it("returns false for unknown states", () => {
    expect(isValidTransition("unknown", "sent")).toBe(false);
  });
});
