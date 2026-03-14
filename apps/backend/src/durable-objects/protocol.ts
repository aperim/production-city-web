/**
 * WebSocket message protocol types for Durable Object communication.
 * All WebSocket messages follow the WSEnvelope format.
 */

import { z } from "zod";

/** Protocol version — increment on breaking changes */
export const WS_PROTOCOL_VERSION = 1 as const;

/** Maximum inbound message size in bytes (32 KB) */
export const MAX_INBOUND_MESSAGE_SIZE = 32 * 1024;

/** Maximum outbound message size in bytes (64 KB) */
export const MAX_OUTBOUND_MESSAGE_SIZE = 64 * 1024;

/** Maximum attachment size in bytes (2,048) */
export const MAX_ATTACHMENT_SIZE = 2048;

/** Maximum WebSocket close reason length */
export const MAX_CLOSE_REASON_LENGTH = 128;

/**
 * Channel name validation regex.
 * Must match: (user|admin|delivery):<alphanumeric/underscore/hyphen, 1-128 chars>
 */
export const CHANNEL_NAME_REGEX = /^(user|admin|delivery):[a-zA-Z0-9_-]{1,128}$/;

/** Zod schema for channel name validation */
export const ChannelNameSchema = z.string().regex(
  CHANNEL_NAME_REGEX,
  "Channel name must match pattern: (user|admin|delivery):<identifier>",
);

/** Base envelope for all WebSocket messages */
export interface WSEnvelope<T = unknown> {
  v: typeof WS_PROTOCOL_VERSION;
  type: string;
  channel?: string;
  payload: T;
  ts: number;
  id: string;
}

/** Zod schema for inbound message envelope validation */
export const WSEnvelopeSchema = z.object({
  v: z.literal(WS_PROTOCOL_VERSION),
  type: z.string().min(1).max(64),
  channel: z.string().max(200).optional(),
  payload: z.unknown(),
  ts: z.number().int().positive(),
  id: z.string().uuid(),
});

/** Client -> Server message types */
export type ClientMessageType = "subscribe" | "unsubscribe" | "ping" | "replay";

/** Client -> Server message payloads */
export interface SubscribePayload {
  channel: string;
}

export interface UnsubscribePayload {
  channel: string;
}

/** Server -> Client message types */
export type ServerMessageType =
  | "connection_ack"
  | "subscribed"
  | "unsubscribed"
  | "delivery_status"
  | "notification"
  | "error"
  | "pong"
  | "server_shutdown";

/** Server -> Client payloads */
export interface ConnectionAckPayload {
  sessionId: string;
  channels: string[];
  protocolVersion: number;
}

export interface SubscribedPayload {
  channel: string;
}

export interface UnsubscribedPayload {
  channel: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export interface ServerShutdownPayload {
  reason: string;
}

export interface DeliveryStatusPayload {
  magicLinkId: string;
  status: string;
  timestamp: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  category?: string;
}

/** WebSocket attachment data persisted across hibernation */
export interface WSAttachment {
  userId: string;
  roles: string[];
  permissions: string[];
  channels: string[];
  sessionId: string;
  connectedAt: number;
  sessionEpoch: number;
  /** True if this is a delivery-only connection */
  deliveryOnly?: boolean;
  /** The delivery channel for delivery-only connections */
  deliveryChannel?: string;
}

/**
 * Creates a server message envelope.
 */
export function createServerMessage<T>(
  type: ServerMessageType,
  payload: T,
  channel?: string,
): WSEnvelope<T> {
  return {
    v: WS_PROTOCOL_VERSION,
    type,
    channel,
    payload,
    ts: Date.now(),
    id: crypto.randomUUID(),
  };
}

/**
 * Validates and parses an inbound message envelope.
 * Returns null if validation fails.
 */
export function parseClientMessage(raw: string): WSEnvelope | null {
  try {
    const parsed = JSON.parse(raw);
    const result = WSEnvelopeSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data as WSEnvelope;
  } catch {
    return null;
  }
}

/**
 * Truncate close reason to MAX_CLOSE_REASON_LENGTH characters.
 */
export function truncateCloseReason(reason: string): string {
  if (reason.length <= MAX_CLOSE_REASON_LENGTH) return reason;
  return reason.slice(0, MAX_CLOSE_REASON_LENGTH);
}
