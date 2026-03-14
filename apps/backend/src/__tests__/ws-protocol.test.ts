/**
 * Tests for WebSocket protocol types, validation, and helpers.
 */

import { describe, it, expect } from "vitest";
import {
  WS_PROTOCOL_VERSION,
  MAX_INBOUND_MESSAGE_SIZE,
  MAX_CLOSE_REASON_LENGTH,
  MAX_ATTACHMENT_SIZE,
  CHANNEL_NAME_REGEX,
  ChannelNameSchema,
  WSEnvelopeSchema,
  createServerMessage,
  parseClientMessage,
  truncateCloseReason,
} from "../durable-objects/protocol.js";

describe("WS Protocol", () => {
  describe("constants", () => {
    it("protocol version is 1", () => {
      expect(WS_PROTOCOL_VERSION).toBe(1);
    });

    it("max inbound message size is 32 KB", () => {
      expect(MAX_INBOUND_MESSAGE_SIZE).toBe(32 * 1024);
    });

    it("max attachment size is 2048 bytes", () => {
      expect(MAX_ATTACHMENT_SIZE).toBe(2048);
    });

    it("max close reason length is 128", () => {
      expect(MAX_CLOSE_REASON_LENGTH).toBe(128);
    });
  });

  describe("channel name validation", () => {
    it("accepts valid user channel", () => {
      expect(CHANNEL_NAME_REGEX.test("user:abc123")).toBe(true);
    });

    it("accepts valid admin channel", () => {
      expect(CHANNEL_NAME_REGEX.test("admin:notifications")).toBe(true);
    });

    it("accepts valid delivery channel", () => {
      expect(CHANNEL_NAME_REGEX.test("delivery:clx123abc")).toBe(true);
    });

    it("accepts channel with hyphens and underscores", () => {
      expect(CHANNEL_NAME_REGEX.test("admin:my_channel-name")).toBe(true);
    });

    it("rejects empty channel", () => {
      expect(CHANNEL_NAME_REGEX.test("")).toBe(false);
    });

    it("rejects unknown prefix", () => {
      expect(CHANNEL_NAME_REGEX.test("custom:channel")).toBe(false);
    });

    it("rejects channel without colon", () => {
      expect(CHANNEL_NAME_REGEX.test("admin")).toBe(false);
    });

    it("rejects channel with special characters", () => {
      expect(CHANNEL_NAME_REGEX.test("admin:ch@nnel")).toBe(false);
    });

    it("rejects channel with spaces", () => {
      expect(CHANNEL_NAME_REGEX.test("admin:my channel")).toBe(false);
    });

    it("rejects overlong channel identifier (>128 chars)", () => {
      const longId = "a".repeat(129);
      expect(CHANNEL_NAME_REGEX.test(`admin:${longId}`)).toBe(false);
    });

    it("accepts max-length channel identifier (128 chars)", () => {
      const maxId = "a".repeat(128);
      expect(CHANNEL_NAME_REGEX.test(`admin:${maxId}`)).toBe(true);
    });

    it("rejects path traversal attempt", () => {
      expect(CHANNEL_NAME_REGEX.test("admin:../../../etc/passwd")).toBe(false);
    });

    it("Zod schema validates correctly", () => {
      expect(ChannelNameSchema.safeParse("admin:notifications").success).toBe(true);
      expect(ChannelNameSchema.safeParse("bad:channel").success).toBe(false);
    });
  });

  describe("WSEnvelopeSchema", () => {
    it("validates a correct envelope", () => {
      const envelope = {
        v: 1,
        type: "subscribe",
        channel: "admin:notifications",
        payload: { channel: "admin:notifications" },
        ts: Date.now(),
        id: crypto.randomUUID(),
      };
      expect(WSEnvelopeSchema.safeParse(envelope).success).toBe(true);
    });

    it("rejects wrong protocol version", () => {
      const envelope = {
        v: 2,
        type: "subscribe",
        payload: null,
        ts: Date.now(),
        id: crypto.randomUUID(),
      };
      expect(WSEnvelopeSchema.safeParse(envelope).success).toBe(false);
    });

    it("rejects missing type", () => {
      const envelope = {
        v: 1,
        payload: null,
        ts: Date.now(),
        id: crypto.randomUUID(),
      };
      expect(WSEnvelopeSchema.safeParse(envelope).success).toBe(false);
    });

    it("rejects missing id", () => {
      const envelope = {
        v: 1,
        type: "ping",
        payload: null,
        ts: Date.now(),
      };
      expect(WSEnvelopeSchema.safeParse(envelope).success).toBe(false);
    });

    it("rejects invalid UUID for id", () => {
      const envelope = {
        v: 1,
        type: "ping",
        payload: null,
        ts: Date.now(),
        id: "not-a-uuid",
      };
      expect(WSEnvelopeSchema.safeParse(envelope).success).toBe(false);
    });

    it("accepts envelope without channel", () => {
      const envelope = {
        v: 1,
        type: "ping",
        payload: null,
        ts: Date.now(),
        id: crypto.randomUUID(),
      };
      expect(WSEnvelopeSchema.safeParse(envelope).success).toBe(true);
    });
  });

  describe("createServerMessage", () => {
    it("creates a valid server message", () => {
      const msg = createServerMessage("connection_ack", { sessionId: "test", channels: [], protocolVersion: 1 });
      expect(msg.v).toBe(1);
      expect(msg.type).toBe("connection_ack");
      expect(msg.payload).toEqual({ sessionId: "test", channels: [], protocolVersion: 1 });
      expect(msg.ts).toBeGreaterThan(0);
      expect(msg.id).toBeDefined();
    });

    it("includes channel when provided", () => {
      const msg = createServerMessage("subscribed", { channel: "admin:eoi" }, "admin:eoi");
      expect(msg.channel).toBe("admin:eoi");
    });

    it("channel is undefined when not provided", () => {
      const msg = createServerMessage("pong", null);
      expect(msg.channel).toBeUndefined();
    });

    it("generates unique IDs", () => {
      const msg1 = createServerMessage("pong", null);
      const msg2 = createServerMessage("pong", null);
      expect(msg1.id).not.toBe(msg2.id);
    });
  });

  describe("parseClientMessage", () => {
    it("parses a valid client message", () => {
      const raw = JSON.stringify({
        v: 1,
        type: "subscribe",
        payload: { channel: "admin:notifications" },
        ts: Date.now(),
        id: crypto.randomUUID(),
      });
      const result = parseClientMessage(raw);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("subscribe");
    });

    it("returns null for invalid JSON", () => {
      expect(parseClientMessage("not json")).toBeNull();
    });

    it("returns null for missing required fields", () => {
      expect(parseClientMessage(JSON.stringify({ type: "ping" }))).toBeNull();
    });

    it("returns null for wrong protocol version", () => {
      const raw = JSON.stringify({
        v: 99,
        type: "ping",
        payload: null,
        ts: Date.now(),
        id: crypto.randomUUID(),
      });
      expect(parseClientMessage(raw)).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseClientMessage("")).toBeNull();
    });
  });

  describe("truncateCloseReason", () => {
    it("returns short reason unchanged", () => {
      expect(truncateCloseReason("Normal closure")).toBe("Normal closure");
    });

    it("truncates reason exceeding MAX_CLOSE_REASON_LENGTH", () => {
      const longReason = "x".repeat(200);
      const result = truncateCloseReason(longReason);
      expect(result.length).toBe(MAX_CLOSE_REASON_LENGTH);
    });

    it("handles empty string", () => {
      expect(truncateCloseReason("")).toBe("");
    });

    it("handles exactly max length", () => {
      const exact = "x".repeat(MAX_CLOSE_REASON_LENGTH);
      expect(truncateCloseReason(exact)).toBe(exact);
    });
  });
});
