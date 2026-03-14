/**
 * Shared types for the WebSocket client library.
 */

/** WebSocket connection states */
export type ConnectionState = "connecting" | "connected" | "disconnected" | "failed" | "unavailable";

/** Protocol version must match the server */
export const WS_PROTOCOL_VERSION = 1;

/** Server -> Client message envelope */
export interface WSEnvelope<T = unknown> {
  v: number;
  type: string;
  channel?: string;
  payload: T;
  ts: number;
  id: string;
}

/** Delivery status values */
export type DeliveryStatus = "sending" | "sent" | "delivered" | "bounced" | "failed";

/** Delivery status payload from server */
export interface DeliveryStatusPayload {
  magicLinkId: string;
  status: DeliveryStatus;
  timestamp: number;
}

/** Connection acknowledgement from server */
export interface ConnectionAckPayload {
  sessionId: string;
  channels: string[];
  protocolVersion: number;
}

/** Handler for incoming messages */
export type MessageHandler<T = unknown> = (payload: T, envelope: WSEnvelope<T>) => void;

/** Unsubscribe function */
export type Unsubscribe = () => void;

/** Terminal delivery statuses that stop polling/connection */
export const TERMINAL_STATUSES: DeliveryStatus[] = ["delivered", "bounced", "failed"];

export function isTerminalStatus(status: DeliveryStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
