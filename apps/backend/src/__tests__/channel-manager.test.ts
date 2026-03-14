/**
 * Tests for ChannelManager — channel subscription management.
 */

import { describe, it, expect, vi } from "vitest";
import { ChannelManager } from "../durable-objects/channel-manager.js";
import type { WSAttachment } from "../durable-objects/protocol.js";
import { createServerMessage } from "../durable-objects/protocol.js";

/** Create a mock WebSocket for testing. */
function createMockWebSocket(attachment?: WSAttachment): WebSocket {
  const sent: string[] = [];
  const ws = {
    send: vi.fn((data: string) => sent.push(data)),
    close: vi.fn(),
    deserializeAttachment: vi.fn(() => attachment ?? null),
    serializeAttachment: vi.fn(),
    _sent: sent,
  };
  return ws as unknown as WebSocket;
}

describe("ChannelManager", () => {
  describe("subscribe", () => {
    it("subscribes a WebSocket to a channel", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      cm.subscribe(ws, "admin:notifications");

      expect(cm.getSubscribers("admin:notifications").has(ws)).toBe(true);
      expect(cm.getChannels(ws)).toEqual(["admin:notifications"]);
    });

    it("creates channel lazily on first subscription", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      expect(cm.getActiveChannels()).toEqual([]);
      cm.subscribe(ws, "admin:eoi");
      expect(cm.getActiveChannels()).toEqual(["admin:eoi"]);
    });

    it("throws on invalid channel name", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      expect(() => cm.subscribe(ws, "invalid")).toThrow("Invalid channel name");
      expect(() => cm.subscribe(ws, "")).toThrow("Invalid channel name");
      expect(() => cm.subscribe(ws, "admin:")).toThrow("Invalid channel name");
    });

    it("allows multiple WebSockets on the same channel", () => {
      const cm = new ChannelManager();
      const ws1 = createMockWebSocket();
      const ws2 = createMockWebSocket();

      cm.subscribe(ws1, "admin:notifications");
      cm.subscribe(ws2, "admin:notifications");

      expect(cm.getSubscribers("admin:notifications").size).toBe(2);
    });

    it("is idempotent for same WebSocket + channel", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      cm.subscribe(ws, "admin:notifications");
      cm.subscribe(ws, "admin:notifications");

      expect(cm.getSubscribers("admin:notifications").size).toBe(1);
    });
  });

  describe("unsubscribe", () => {
    it("unsubscribes a WebSocket from a channel", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      cm.subscribe(ws, "admin:notifications");
      cm.unsubscribe(ws, "admin:notifications");

      expect(cm.getSubscribers("admin:notifications").size).toBe(0);
      expect(cm.getChannels(ws)).toEqual([]);
    });

    it("cleans up empty channels", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      cm.subscribe(ws, "admin:eoi");
      cm.unsubscribe(ws, "admin:eoi");

      expect(cm.getActiveChannels()).toEqual([]);
    });

    it("is safe to call on non-existent channel", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      expect(() => cm.unsubscribe(ws, "admin:notifications")).not.toThrow();
    });

    it("only removes the specified WebSocket", () => {
      const cm = new ChannelManager();
      const ws1 = createMockWebSocket();
      const ws2 = createMockWebSocket();

      cm.subscribe(ws1, "admin:notifications");
      cm.subscribe(ws2, "admin:notifications");
      cm.unsubscribe(ws1, "admin:notifications");

      expect(cm.getSubscribers("admin:notifications").size).toBe(1);
      expect(cm.getSubscribers("admin:notifications").has(ws2)).toBe(true);
    });
  });

  describe("unsubscribeAll", () => {
    it("removes WebSocket from all channels", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      cm.subscribe(ws, "admin:notifications");
      cm.subscribe(ws, "admin:eoi");
      cm.subscribe(ws, "admin:approvals");
      cm.unsubscribeAll(ws);

      expect(cm.getChannels(ws)).toEqual([]);
    });

    it("cleans up empty channels after unsubscribeAll", () => {
      const cm = new ChannelManager();
      const ws1 = createMockWebSocket();
      const ws2 = createMockWebSocket();

      cm.subscribe(ws1, "admin:notifications");
      cm.subscribe(ws2, "admin:notifications");
      cm.subscribe(ws1, "admin:eoi");

      cm.unsubscribeAll(ws1);

      // admin:notifications still has ws2
      expect(cm.getActiveChannels()).toEqual(["admin:notifications"]);
    });
  });

  describe("broadcast", () => {
    it("sends message to all subscribers", () => {
      const cm = new ChannelManager();
      const ws1 = createMockWebSocket();
      const ws2 = createMockWebSocket();

      cm.subscribe(ws1, "admin:notifications");
      cm.subscribe(ws2, "admin:notifications");

      const message = createServerMessage("notification", { title: "test", body: "test-id" }, "admin:notifications");
      const sent = cm.broadcast("admin:notifications", message);

      expect(sent).toBe(2);
      expect(ws1.send).toHaveBeenCalledOnce();
      expect(ws2.send).toHaveBeenCalledOnce();
    });

    it("returns 0 for non-existent channel", () => {
      const cm = new ChannelManager();
      const message = createServerMessage("notification", { title: "test", body: "test-id" });
      expect(cm.broadcast("admin:nonexistent", message)).toBe(0);
    });

    it("handles send errors gracefully", () => {
      const cm = new ChannelManager();
      const ws1 = createMockWebSocket();
      const ws2 = createMockWebSocket();

      // Make ws1.send throw
      (ws1.send as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("WebSocket closed");
      });

      cm.subscribe(ws1, "admin:notifications");
      cm.subscribe(ws2, "admin:notifications");

      const message = createServerMessage("notification", { title: "test", body: "test-id" });
      const sent = cm.broadcast("admin:notifications", message);

      expect(sent).toBe(1); // Only ws2 succeeded
    });

    it("does not send to WebSockets not subscribed to the channel", () => {
      const cm = new ChannelManager();
      const ws1 = createMockWebSocket();
      const ws2 = createMockWebSocket();

      cm.subscribe(ws1, "admin:notifications");
      cm.subscribe(ws2, "admin:eoi");

      const message = createServerMessage("notification", { title: "test", body: "test-id" });
      cm.broadcast("admin:notifications", message);

      expect(ws1.send).toHaveBeenCalledOnce();
      expect(ws2.send).not.toHaveBeenCalled();
    });
  });

  describe("getSubscribers", () => {
    it("returns empty set for unknown channel", () => {
      const cm = new ChannelManager();
      expect(cm.getSubscribers("admin:unknown").size).toBe(0);
    });
  });

  describe("getChannels", () => {
    it("returns all channels for a WebSocket", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();

      cm.subscribe(ws, "admin:notifications");
      cm.subscribe(ws, "admin:eoi");

      const channels = cm.getChannels(ws);
      expect(channels).toContain("admin:notifications");
      expect(channels).toContain("admin:eoi");
      expect(channels).toHaveLength(2);
    });

    it("returns empty array for unknown WebSocket", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();
      expect(cm.getChannels(ws)).toEqual([]);
    });
  });

  describe("reconstructFromWebSockets", () => {
    it("reconstructs channels from WebSocket attachments", () => {
      const cm = new ChannelManager();

      const attachment1: WSAttachment = {
        userId: "user1",
        roles: ["admin"],
        permissions: ["user:read"],
        channels: ["admin:notifications", "admin:eoi"],
        sessionId: "sess1",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
      };

      const attachment2: WSAttachment = {
        userId: "user2",
        roles: ["admin"],
        permissions: ["user:read"],
        channels: ["admin:notifications"],
        sessionId: "sess2",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
      };

      const ws1 = createMockWebSocket(attachment1);
      const ws2 = createMockWebSocket(attachment2);

      cm.reconstructFromWebSockets([ws1, ws2]);

      expect(cm.getSubscribers("admin:notifications").size).toBe(2);
      expect(cm.getSubscribers("admin:eoi").size).toBe(1);
      expect(cm.getActiveChannels()).toContain("admin:notifications");
      expect(cm.getActiveChannels()).toContain("admin:eoi");
    });

    it("clears existing channels before reconstruction", () => {
      const cm = new ChannelManager();
      const ws1 = createMockWebSocket();
      cm.subscribe(ws1, "admin:notifications");

      cm.reconstructFromWebSockets([]);

      expect(cm.getActiveChannels()).toEqual([]);
    });

    it("skips WebSockets with invalid attachments", () => {
      const cm = new ChannelManager();
      const ws = createMockWebSocket();
      (ws.deserializeAttachment as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("corrupt");
      });

      expect(() => cm.reconstructFromWebSockets([ws])).not.toThrow();
      expect(cm.getActiveChannels()).toEqual([]);
    });

    it("skips invalid channel names in attachments", () => {
      const cm = new ChannelManager();
      const attachment: WSAttachment = {
        userId: "user1",
        roles: [],
        permissions: [],
        channels: ["admin:notifications", "invalid-channel"],
        sessionId: "sess1",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
      };
      const ws = createMockWebSocket(attachment);

      cm.reconstructFromWebSockets([ws]);

      expect(cm.getActiveChannels()).toEqual(["admin:notifications"]);
    });

    it("handles delivery-only connections", () => {
      const cm = new ChannelManager();
      const attachment: WSAttachment = {
        userId: "delivery:abc123",
        roles: [],
        permissions: [],
        channels: ["delivery:abc123"],
        sessionId: "delivery:abc123",
        connectedAt: Date.now(),
        sessionEpoch: Date.now(),
        deliveryOnly: true,
        deliveryChannel: "delivery:abc123",
      };
      const ws = createMockWebSocket(attachment);

      cm.reconstructFromWebSockets([ws]);

      expect(cm.getSubscribers("delivery:abc123").size).toBe(1);
    });
  });
});
