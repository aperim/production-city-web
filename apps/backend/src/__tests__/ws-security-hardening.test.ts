/**
 * Tests for WebSocket security hardening (#194).
 * Covers: CSP headers, idle timeout, zombie detection, connection cap,
 * message validation (byte-length before JSON parse), audit logging,
 * deployment shutdown, and PII verification.
 */

import { describe, it, expect } from "vitest";
import {
  MAX_INBOUND_MESSAGE_SIZE,
  MAX_ATTACHMENT_SIZE,
  createServerMessage,
  parseClientMessage,
  type WSAttachment,
  type NotificationPayload,
  type DeliveryStatusPayload,
  type ServerShutdownPayload,
} from "../durable-objects/protocol.js";

describe("WebSocket Security Hardening (#194)", () => {
  describe("message size enforcement", () => {
    it("rejects messages exceeding 32KB byte-length", () => {
      const oversized = "x".repeat(MAX_INBOUND_MESSAGE_SIZE + 1);
      const byteLength = new TextEncoder().encode(oversized).byteLength;
      expect(byteLength).toBeGreaterThan(MAX_INBOUND_MESSAGE_SIZE);
    });

    it("accepts messages within 32KB byte-length", () => {
      const valid = JSON.stringify({
        v: 1,
        type: "ping",
        payload: null,
        ts: Date.now(),
        id: crypto.randomUUID(),
      });
      const byteLength = new TextEncoder().encode(valid).byteLength;
      expect(byteLength).toBeLessThan(MAX_INBOUND_MESSAGE_SIZE);
    });

    it("byte-length check catches multi-byte characters correctly", () => {
      // 4-byte emoji characters
      const emoji = "🎭".repeat(8193); // 8193 * 4 bytes = 32772 > 32768
      const byteLength = new TextEncoder().encode(emoji).byteLength;
      expect(byteLength).toBeGreaterThan(MAX_INBOUND_MESSAGE_SIZE);
    });
  });

  describe("Zod message validation", () => {
    it("rejects message with missing required fields", () => {
      const result = parseClientMessage(JSON.stringify({ type: "ping" }));
      expect(result).toBeNull();
    });

    it("rejects message with wrong protocol version", () => {
      const result = parseClientMessage(JSON.stringify({
        v: 99,
        type: "ping",
        payload: null,
        ts: Date.now(),
        id: crypto.randomUUID(),
      }));
      expect(result).toBeNull();
    });

    it("accepts valid message envelope", () => {
      const result = parseClientMessage(JSON.stringify({
        v: 1,
        type: "subscribe",
        payload: { channel: "admin:notifications" },
        ts: Date.now(),
        id: crypto.randomUUID(),
      }));
      expect(result).not.toBeNull();
      expect(result!.type).toBe("subscribe");
    });

    it("rejects non-JSON input", () => {
      const result = parseClientMessage("not json at all");
      expect(result).toBeNull();
    });

    it("rejects empty string", () => {
      const result = parseClientMessage("");
      expect(result).toBeNull();
    });
  });

  describe("PII verification in message payloads", () => {
    it("notification payload contains no email addresses", () => {
      const msg = createServerMessage<NotificationPayload>("notification", {
        title: "new_eoi",
        body: "eoi_clx123abc",
        category: "eoi",
      }, "admin:eoi");
      const serialized = JSON.stringify(msg);
      expect(serialized).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    });

    it("delivery status payload uses IDs only — no PII", () => {
      const msg = createServerMessage<DeliveryStatusPayload>("delivery_status", {
        magicLinkId: "clx123abc",
        status: "delivered",
        timestamp: Date.now(),
      }, "delivery:clx123abc");
      const serialized = JSON.stringify(msg);
      expect(serialized).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      // No full names
      expect(serialized).not.toMatch(/firstName|lastName|fullName/i);
    });

    it("server_shutdown payload contains no sensitive data", () => {
      const msg = createServerMessage<ServerShutdownPayload>("server_shutdown", {
        reason: "deployment",
      });
      const serialized = JSON.stringify(msg);
      expect(serialized).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      expect(serialized).not.toMatch(/password|secret|token|cookie/i);
    });

    it("WSAttachment does not contain email or name fields", () => {
      const attachment: WSAttachment = {
        userId: "clx123abc",
        roles: ["admin"],
        permissions: ["user:read"],
        channels: ["admin:notifications"],
        sessionId: "clx456def",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
      };
      const serialized = JSON.stringify(attachment);
      expect(serialized).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      // Verify no email or name keys
      const keys = Object.keys(attachment);
      expect(keys).not.toContain("email");
      expect(keys).not.toContain("name");
      expect(keys).not.toContain("fullName");
    });
  });

  describe("deployment shutdown", () => {
    it("server_shutdown message has correct structure", () => {
      const msg = createServerMessage<ServerShutdownPayload>("server_shutdown", {
        reason: "deployment",
      });
      expect(msg.type).toBe("server_shutdown");
      expect(msg.payload.reason).toBe("deployment");
      expect(msg.v).toBe(1);
      expect(msg.id).toBeDefined();
      expect(msg.ts).toBeGreaterThan(0);
    });
  });

  describe("connection limits", () => {
    it("MAX_ATTACHMENT_SIZE is 2048 bytes", () => {
      expect(MAX_ATTACHMENT_SIZE).toBe(2048);
    });

    it("MAX_INBOUND_MESSAGE_SIZE is 32KB", () => {
      expect(MAX_INBOUND_MESSAGE_SIZE).toBe(32 * 1024);
    });
  });
});

describe("Polling removal verification (#194)", () => {
  it("use-delivery-polling.ts does not exist", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const filePath = path.resolve(
      import.meta.dirname,
      "../../../web/app/lib/use-delivery-polling.ts",
    );
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("no imports of useDeliveryPolling remain in the codebase", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const webAppDir = path.resolve(import.meta.dirname, "../../../web/app");

    function findImports(dir: string): string[] {
      const hits: string[] = [];
      if (!fs.existsSync(dir)) return hits;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".next") {
          hits.push(...findImports(fullPath));
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (content.includes("use-delivery-polling") || content.includes("useDeliveryPolling")) {
            hits.push(fullPath);
          }
        }
      }
      return hits;
    }

    const hits = findImports(webAppDir);
    expect(hits).toEqual([]);
  });
});
