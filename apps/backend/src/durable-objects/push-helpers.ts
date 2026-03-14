/**
 * Server-push helpers for broadcasting events via Durable Objects.
 *
 * These helpers handle HMAC-signed communication from the Worker
 * to the Durable Object's internal /broadcast endpoint.
 */

import { createServerMessage, type DeliveryStatusPayload, type NotificationPayload } from "./protocol.js";
import { hmacSha256Hex } from "../auth/token.js";

interface BroadcastEnv {
  WEBSOCKET_SERVER: DurableObjectNamespace;
  HMAC_SECRET: string;
}

/**
 * Send an HMAC-signed broadcast request to a Durable Object.
 * The DO validates the signature before relaying the message.
 */
export async function signedBroadcast(
  env: BroadcastEnv,
  doStub: DurableObjectStub,
  payload: { channel: string; message: unknown },
): Promise<{ sent: number }> {
  const timestamp = String(Date.now());
  const body = JSON.stringify(payload);
  const signature = await hmacSha256Hex(env.HMAC_SECRET, `${timestamp}:${body}`);

  const response = await doStub.fetch(new Request("https://internal/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Timestamp": timestamp,
      "X-Internal-Signature": signature,
    },
    body,
  }));

  if (!response.ok) {
    throw new Error(`Broadcast failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<{ sent: number }>;
}

/**
 * Push a delivery status update to a specific delivery channel.
 * Routes to the delivery-specific DO instance.
 */
export async function pushDeliveryStatus(
  env: BroadcastEnv,
  magicLinkId: string,
  status: string,
): Promise<void> {
  const channel = `delivery:${magicLinkId}`;
  const doId = env.WEBSOCKET_SERVER.idFromName(channel);
  const doStub = env.WEBSOCKET_SERVER.get(doId);

  const message = createServerMessage<DeliveryStatusPayload>("delivery_status", {
    magicLinkId,
    status,
    timestamp: Date.now(),
  }, channel);

  await signedBroadcast(env, doStub, { channel, message });
}

/**
 * Push an admin notification to the admin-hub DO.
 * All admin channels share a single DO instance for simplicity.
 */
export async function pushAdminNotification(
  env: BroadcastEnv,
  channel: string,
  notification: { kind: string; resourceId: string; category?: string },
): Promise<void> {
  const doId = env.WEBSOCKET_SERVER.idFromName("admin-hub");
  const doStub = env.WEBSOCKET_SERVER.get(doId);

  const message = createServerMessage<NotificationPayload>("notification", {
    title: notification.kind,
    body: notification.resourceId,
    category: notification.category,
  }, channel);

  await signedBroadcast(env, doStub, { channel, message });
}
