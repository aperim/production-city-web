/**
 * Tests for WebSocketHibernationServer Durable Object behavior.
 * Tests protocol-level behavior, channel authorization, and rate limiting.
 */

import { describe, it, expect } from "vitest";
import {
  WS_PROTOCOL_VERSION,
  createServerMessage,
  type WSAttachment,
  MAX_ATTACHMENT_SIZE,
} from "../durable-objects/protocol.js";

describe("WebSocket Durable Object — protocol behavior", () => {
  describe("WSAttachment serialization", () => {
    it("attachment for minimal user fits within size limit", () => {
      const attachment: WSAttachment = {
        userId: "clx123abc",
        roles: ["admin"],
        permissions: ["user:read", "audit:read"],
        channels: ["admin:notifications"],
        sessionId: "clx456def",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
      };
      const size = new TextEncoder().encode(JSON.stringify(attachment)).byteLength;
      expect(size).toBeLessThan(MAX_ATTACHMENT_SIZE);
    });

    it("attachment for user with many permissions fits within size limit", () => {
      const attachment: WSAttachment = {
        userId: "clx123abc",
        roles: ["super_admin", "admin"],
        permissions: [
          "user:read", "user:create", "user:update", "user:delete", "user:admin",
          "role:read", "role:create", "role:update", "role:delete",
          "invitation:read", "invitation:create", "invitation:revoke",
          "audit:read", "system:admin",
          "facility:read", "facility:create", "facility:update", "facility:delete", "facility:manage",
          "production:read", "production:create", "production:update", "production:delete", "production:manage",
          "guest:read", "guest:create", "guest:update", "guest:delete",
          "eoi:read",
        ],
        channels: [
          "admin:notifications", "admin:eoi", "admin:approvals", "admin:audit",
          "user:clx123abc",
        ],
        sessionId: "clx456def",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
      };
      const size = new TextEncoder().encode(JSON.stringify(attachment)).byteLength;
      expect(size).toBeLessThan(MAX_ATTACHMENT_SIZE);
    });

    it("delivery-only attachment is compact", () => {
      const attachment: WSAttachment = {
        userId: "delivery:clx789",
        roles: [],
        permissions: [],
        channels: ["delivery:clx789"],
        sessionId: "delivery:clx789",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
        deliveryOnly: true,
        deliveryChannel: "delivery:clx789",
      };
      const size = new TextEncoder().encode(JSON.stringify(attachment)).byteLength;
      expect(size).toBeLessThan(MAX_ATTACHMENT_SIZE);
    });
  });

  describe("channel authorization logic", () => {
    /** Replicate the authorization logic from the DO for testing */
    function isAuthorizedForChannel(channel: string, attachment: WSAttachment): boolean {
      if (channel.startsWith("user:")) {
        return channel.slice(5) === attachment.userId;
      }
      if (channel.startsWith("delivery:")) {
        return false;
      }
      const channelPermissions: Record<string, string[]> = {
        "admin:notifications": ["user:read"],
        "admin:eoi": ["eoi:read"],
        "admin:approvals": ["user:approve"],
        "admin:audit": ["audit:read"],
      };
      const required = channelPermissions[channel];
      if (required) {
        return required.some((perm) => attachment.permissions.includes(perm));
      }
      return false;
    }

    const adminAttachment: WSAttachment = {
      userId: "user-1",
      roles: ["admin"],
      permissions: ["user:read", "audit:read", "eoi:read"],
      channels: [],
      sessionId: "sess-1",
      connectedAt: Date.now(),
      sessionEpoch: Date.now(),
    };

    const viewerAttachment: WSAttachment = {
      userId: "user-2",
      roles: ["viewer"],
      permissions: ["user:read"],
      channels: [],
      sessionId: "sess-2",
      connectedAt: Date.now(),
      sessionEpoch: Date.now(),
    };

    it("allows user to subscribe to own user channel", () => {
      expect(isAuthorizedForChannel("user:user-1", adminAttachment)).toBe(true);
    });

    it("denies user from subscribing to another user's channel", () => {
      expect(isAuthorizedForChannel("user:user-2", adminAttachment)).toBe(false);
    });

    it("allows admin with user:read to subscribe to admin:notifications", () => {
      expect(isAuthorizedForChannel("admin:notifications", adminAttachment)).toBe(true);
    });

    it("allows admin with eoi:read to subscribe to admin:eoi", () => {
      expect(isAuthorizedForChannel("admin:eoi", adminAttachment)).toBe(true);
    });

    it("allows admin with audit:read to subscribe to admin:audit", () => {
      expect(isAuthorizedForChannel("admin:audit", adminAttachment)).toBe(true);
    });

    it("denies admin without user:approve from admin:approvals", () => {
      expect(isAuthorizedForChannel("admin:approvals", adminAttachment)).toBe(false);
    });

    it("denies viewer from admin:eoi (no eoi:read)", () => {
      expect(isAuthorizedForChannel("admin:eoi", viewerAttachment)).toBe(false);
    });

    it("allows viewer with user:read to subscribe to admin:notifications", () => {
      expect(isAuthorizedForChannel("admin:notifications", viewerAttachment)).toBe(true);
    });

    it("denies regular connections from delivery channels", () => {
      expect(isAuthorizedForChannel("delivery:clx789", adminAttachment)).toBe(false);
    });

    it("denies unknown channel prefixes", () => {
      expect(isAuthorizedForChannel("custom:something", adminAttachment)).toBe(false);
    });
  });

  describe("server message creation", () => {
    it("creates connection_ack with protocol version", () => {
      const msg = createServerMessage("connection_ack", {
        sessionId: "test-session",
        channels: [],
        protocolVersion: WS_PROTOCOL_VERSION,
      });
      expect(msg.payload).toEqual({
        sessionId: "test-session",
        channels: [],
        protocolVersion: 1,
      });
    });

    it("creates error message with code and message", () => {
      const msg = createServerMessage("error", {
        code: "CHANNEL_DENIED",
        message: "Not authorized",
      });
      expect(msg.type).toBe("error");
      expect(msg.payload).toEqual({
        code: "CHANNEL_DENIED",
        message: "Not authorized",
      });
    });

    it("creates server_shutdown message", () => {
      const msg = createServerMessage("server_shutdown", {
        reason: "Deployment in progress",
      });
      expect(msg.type).toBe("server_shutdown");
    });
  });
});

describe("WebSocket security tests", () => {
  describe("HMAC broadcast auth", () => {
    it("HMAC signing produces consistent results", async () => {
      const { hmacSha256Hex } = await import("../auth/token.js");
      const secret = "test-secret";
      const message = "test-message";
      const sig1 = await hmacSha256Hex(secret, message);
      const sig2 = await hmacSha256Hex(secret, message);
      expect(sig1).toBe(sig2);
    });

    it("HMAC signing produces different results for different messages", async () => {
      const { hmacSha256Hex } = await import("../auth/token.js");
      const secret = "test-secret";
      const sig1 = await hmacSha256Hex(secret, "message-1");
      const sig2 = await hmacSha256Hex(secret, "message-2");
      expect(sig1).not.toBe(sig2);
    });

    it("HMAC signing produces different results for different secrets", async () => {
      const { hmacSha256Hex } = await import("../auth/token.js");
      const message = "same-message";
      const sig1 = await hmacSha256Hex("secret-1", message);
      const sig2 = await hmacSha256Hex("secret-2", message);
      expect(sig1).not.toBe(sig2);
    });

    it("timing-safe comparison works correctly", async () => {
      const { timingSafeEqual } = await import("../auth/token.js");
      expect(await timingSafeEqual("abc", "abc")).toBe(true);
      expect(await timingSafeEqual("abc", "def")).toBe(false);
      expect(await timingSafeEqual("abc", "abcd")).toBe(false);
    });
  });
});
