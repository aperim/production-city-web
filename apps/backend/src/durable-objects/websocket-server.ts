/**
 * WebSocket Hibernation Server — Cloudflare Durable Object.
 *
 * Uses the Hibernation API so idle connections cost nothing:
 * - acceptWebSocket() (NOT ws.accept()) enables hibernation
 * - serializeAttachment()/deserializeAttachment() persist session data across hibernation
 * - setWebSocketAutoResponse() handles ping/pong without waking the DO
 *
 * DO storage is ephemeral/transient — connection state only, never business data.
 * All persistent data goes through D1/Prisma via the Worker.
 */

import { DurableObject } from "cloudflare:workers";
import {
  type WSAttachment,
  type WSEnvelope,
  type ErrorPayload,
  type ConnectionAckPayload,
  type SubscribedPayload,
  type UnsubscribedPayload,
  WS_PROTOCOL_VERSION,
  MAX_INBOUND_MESSAGE_SIZE,
  MAX_ATTACHMENT_SIZE,
  CHANNEL_NAME_REGEX,
  createServerMessage,
  parseClientMessage,
  truncateCloseReason,
} from "./protocol.js";
import { hmacSha256Hex, timingSafeEqual } from "../auth/token.js";
import { ChannelManager } from "./channel-manager.js";
import { EventLog } from "./event-log.js";

/** Rate limiting constants */
const MAX_CONNECTIONS_PER_USER = 10;
const MAX_MESSAGES_PER_SECOND = 30;
const MAX_SUBSCRIPTIONS_PER_CONNECTION = 20;
const MAX_MALFORMED_STRIKES = 5;
const MESSAGE_RATE_WINDOW_MS = 1000;

/** Session revalidation interval (5 minutes) */
const SESSION_REVALIDATION_INTERVAL_MS = 5 * 60 * 1000;

/** Idle timeout: close connections idle for 10 minutes */
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

/** Zombie detection: close if no pong within 2 minutes */
const ZOMBIE_TIMEOUT_MS = 2 * 60 * 1000;

/** Alarm check interval (30 seconds — aligns with auto-response ping) */
const ALARM_INTERVAL_MS = 30 * 1000;

/** Maximum total WebSocket connections per DO instance */
const MAX_CONNECTIONS_PER_DO = 1000;

/** Audit log rate limit: max validation failures logged per source per minute */
const MAX_AUDIT_LOGS_PER_SOURCE_PER_MINUTE = 5;

/** Channel authorization rules */
const CHANNEL_PERMISSIONS: Record<string, string[]> = {
  "admin:notifications": ["user:read"],
  "admin:eoi": ["eoi:read"],
  "admin:approvals": ["user:approve"],
  "admin:audit": ["audit:read"],
};

interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  POSTMARK_API_TOKEN: string;
}

/** Per-connection rate limiting state (in-memory, resets on hibernation) */
interface ConnectionRateState {
  messageCount: number;
  windowStart: number;
  malformedStrikes: number;
}

export class WebSocketHibernationServer extends DurableObject<Env> {
  /** In-memory rate limiting state per WebSocket (resets on hibernation wake) */
  private rateLimits = new Map<WebSocket, ConnectionRateState>();

  /** Channel subscription manager (reconstructed on hibernation wake) */
  private channelManager = new ChannelManager();

  /** Bounded event log for replay on reconnection */
  private eventLog = new EventLog();

  /** Whether channels have been reconstructed after hibernation wake */
  private channelsReconstructed = false;

  /** Tracks last activity time per WebSocket for idle timeout */
  private lastActivity = new Map<WebSocket, number>();

  /** Audit log rate limiting: source -> { count, windowStart } */
  private auditLogRates = new Map<string, { count: number; windowStart: number }>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Configure auto-response for ping/pong (does not wake DO from hibernation)
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('{"v":1,"type":"ping","payload":null,"ts":0,"id":"auto"}', '{"v":1,"type":"pong","payload":null,"ts":0,"id":"auto"}'),
    );
    // Schedule alarm for idle/zombie cleanup
    this.ctx.storage.setAlarm(Date.now() + ALARM_INTERVAL_MS);
  }

  /**
   * Alarm handler — runs periodically for idle timeout, zombie detection,
   * and session revalidation.
   */
  async alarm(): Promise<void> {
    const now = Date.now();
    const sockets = this.ctx.getWebSockets();

    for (const ws of sockets) {
      const attachment = ws.deserializeAttachment() as WSAttachment | null;
      if (!attachment) continue;

      // Zombie detection: check last auto-response pong timestamp.
      // getWebSocketAutoResponseTimestamp returns the last time the auto-response
      // was triggered. If it's been more than ZOMBIE_TIMEOUT_MS, the client
      // likely disconnected without sending a close frame.
      const lastPong = this.ctx.getWebSocketAutoResponseTimestamp(ws);
      if (lastPong !== null) {
        const pongAge = now - lastPong.getTime();
        if (pongAge > ZOMBIE_TIMEOUT_MS) {
          console.log(JSON.stringify({
            event: "ws.zombie_detected",
            userId: attachment.userId,
            lastPongAge: pongAge,
          }));
          ws.close(1001, "Connection timed out (no pong)");
          continue;
        }
      }

      // Idle timeout: close connections with no subscriptions and no recent activity
      if (attachment.channels.length === 0 && !attachment.deliveryOnly) {
        const lastActive = this.lastActivity.get(ws) ?? attachment.connectedAt;
        if (now - lastActive > IDLE_TIMEOUT_MS) {
          console.log(JSON.stringify({
            event: "ws.idle_timeout",
            userId: attachment.userId,
            idleDuration: now - lastActive,
          }));
          ws.close(1000, "Idle timeout");
          continue;
        }
      }

      // Session revalidation: mark stale sessions for revalidation on next message
      if (now - attachment.sessionEpoch > SESSION_REVALIDATION_INTERVAL_MS) {
        attachment.sessionEpoch = now;
        ws.serializeAttachment(attachment);
      }
    }

    // Re-schedule alarm if there are active connections
    if (sockets.length > 0) {
      this.ctx.storage.setAlarm(now + ALARM_INTERVAL_MS);
    }
  }

  /**
   * Ensure channels are reconstructed after hibernation wake.
   * Called lazily on first message/broadcast after wake.
   */
  private ensureChannelsReconstructed(): void {
    if (this.channelsReconstructed) return;
    this.channelManager.reconstructFromWebSockets(this.ctx.getWebSockets());
    this.channelsReconstructed = true;
  }

  /**
   * Handle incoming HTTP requests:
   * - WebSocket upgrade requests from the Worker
   * - Internal broadcast POST from the Worker (HMAC-signed)
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Internal broadcast endpoint
    if (url.pathname === "/broadcast" && request.method === "POST") {
      return this.handleBroadcast(request);
    }

    // WebSocket upgrade
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // Verify HMAC-signed auth context from Worker
    const authPayload = request.headers.get("X-WS-Auth-Payload");
    const authSignature = request.headers.get("X-WS-Auth-Signature");

    if (!authPayload || !authSignature) {
      return new Response("Missing auth context", { status: 401 });
    }

    const expectedSig = await hmacSha256Hex(this.env.HMAC_SECRET, authPayload);
    const sigValid = await timingSafeEqual(expectedSig, authSignature);
    if (!sigValid) {
      return new Response("Invalid auth signature", { status: 403 });
    }

    let auth: { userId: string; roles: string[]; permissions: string[]; sessionId: string; deliveryOnly?: boolean; deliveryChannel?: string; ts?: number };
    try {
      auth = JSON.parse(authPayload);
    } catch {
      return new Response("Invalid auth payload", { status: 400 });
    }

    // Reject stale auth payloads (>60s) to prevent replay attacks
    if (!auth.ts || Math.abs(Date.now() - auth.ts) > 60_000) {
      return new Response("Stale auth payload", { status: 403 });
    }

    // Per-DO connection cap
    const existingConnections = this.ctx.getWebSockets();
    if (existingConnections.length >= MAX_CONNECTIONS_PER_DO) {
      return new Response("Connection limit exceeded", { status: 503 });
    }

    // Per-user connection limit: close oldest if exceeded
    if (!auth.deliveryOnly) {
      const userConnections = existingConnections.filter((ws) => {
        const attachment = ws.deserializeAttachment() as WSAttachment | null;
        return attachment?.userId === auth.userId;
      });

      if (userConnections.length >= MAX_CONNECTIONS_PER_USER) {
        // Close oldest connection gracefully
        const oldest = userConnections[0];
        if (oldest) {
          const shutdownMsg = createServerMessage("server_shutdown", { reason: "Connection limit exceeded — newer connection opened" });
          oldest.send(JSON.stringify(shutdownMsg));
          oldest.close(1000, "Connection limit exceeded");
        }
      }
    }

    // Accept WebSocket with hibernation
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    const attachment: WSAttachment = {
      userId: auth.userId,
      roles: auth.roles,
      permissions: auth.permissions,
      channels: auth.deliveryOnly && auth.deliveryChannel ? [auth.deliveryChannel] : [],
      sessionId: auth.sessionId,
      connectedAt: Date.now(),
      sessionEpoch: Date.now(),
      deliveryOnly: auth.deliveryOnly,
      deliveryChannel: auth.deliveryChannel,
    };

    // Verify attachment size
    const attachmentJson = JSON.stringify(attachment);
    if (new TextEncoder().encode(attachmentJson).byteLength > MAX_ATTACHMENT_SIZE) {
      return new Response("Session data too large", { status: 500 });
    }

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(attachment);

    // Register delivery-only connections in ChannelManager
    if (auth.deliveryOnly && auth.deliveryChannel) {
      this.ensureChannelsReconstructed();
      this.channelManager.subscribe(server, auth.deliveryChannel);
    }

    // Send connection_ack
    const ackPayload: ConnectionAckPayload = {
      sessionId: auth.sessionId,
      channels: attachment.channels,
      protocolVersion: WS_PROTOCOL_VERSION,
    };
    server.send(JSON.stringify(createServerMessage("connection_ack", ackPayload)));

    // For delivery-only connections, replay the latest event so the client
    // gets current status immediately without waiting for a new webhook
    if (auth.deliveryOnly && auth.deliveryChannel) {
      const recent = this.eventLog.replay(0, [auth.deliveryChannel]);
      const lastEvent = recent[recent.length - 1];
      if (lastEvent) {
        server.send(JSON.stringify(lastEvent.message));
      }
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  /**
   * Handle inbound WebSocket messages.
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // Track activity for idle timeout
    this.lastActivity.set(ws, Date.now());

    // Enforce message size limit BEFORE parsing
    const messageSize = typeof message === "string"
      ? new TextEncoder().encode(message).byteLength
      : message.byteLength;

    if (messageSize > MAX_INBOUND_MESSAGE_SIZE) {
      this.sendError(ws, "MESSAGE_TOO_LARGE", "Message exceeds maximum size of 32 KB");
      this.addStrike(ws);
      return;
    }

    // Rate limiting
    if (!this.checkMessageRate(ws)) {
      this.sendError(ws, "RATE_LIMITED", "Message rate limit exceeded");
      return;
    }

    const raw = typeof message === "string" ? message : new TextDecoder().decode(message);
    const envelope = parseClientMessage(raw);

    if (!envelope) {
      this.sendError(ws, "INVALID_MESSAGE", "Could not parse message envelope");
      this.addStrike(ws);
      return;
    }

    const attachment = ws.deserializeAttachment() as WSAttachment | null;
    if (!attachment) {
      this.sendError(ws, "SESSION_LOST", "Session data not found");
      ws.close(1011, "Session data lost");
      return;
    }

    // Session revalidation check (see #194 for full implementation).
    // The DO cannot access D1 directly. Full revalidation requires the DO to
    // call back to the Worker via fetch to re-check the session against D1.
    // For PR1 we update the epoch to track staleness; #194 adds the callback.
    if (Date.now() - attachment.sessionEpoch > SESSION_REVALIDATION_INTERVAL_MS) {
      attachment.sessionEpoch = Date.now();
      ws.serializeAttachment(attachment);
    }

    // Delivery-only connections cannot subscribe/unsubscribe
    if (attachment.deliveryOnly && (envelope.type === "subscribe" || envelope.type === "unsubscribe")) {
      this.sendError(ws, "DELIVERY_ONLY", "Delivery connections cannot manage subscriptions");
      return;
    }

    switch (envelope.type) {
      case "subscribe":
        this.handleSubscribe(ws, envelope, attachment);
        break;
      case "unsubscribe":
        this.handleUnsubscribe(ws, envelope, attachment);
        break;
      case "replay":
        this.handleReplay(ws, envelope, attachment);
        break;
      case "ping":
        ws.send(JSON.stringify(createServerMessage("pong", null)));
        break;
      default:
        this.sendError(ws, "UNKNOWN_TYPE", `Unknown message type: ${envelope.type}`);
        this.addStrike(ws);
        break;
    }
  }

  /**
   * Handle WebSocket close.
   */
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    const truncatedReason = truncateCloseReason(reason);
    const attachment = ws.deserializeAttachment() as WSAttachment | null;

    console.log(JSON.stringify({
      event: "ws.close",
      userId: attachment?.userId,
      code,
      reason: truncatedReason,
      wasClean,
      duration: attachment ? Date.now() - attachment.connectedAt : undefined,
    }));

    this.channelManager.unsubscribeAll(ws);
    this.rateLimits.delete(ws);
    this.lastActivity.delete(ws);
  }

  /**
   * Handle WebSocket error.
   */
  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    const attachment = ws.deserializeAttachment() as WSAttachment | null;

    console.error(JSON.stringify({
      event: "ws.error",
      userId: attachment?.userId,
      error: String(error),
    }));

    this.rateLimits.delete(ws);
    this.lastActivity.delete(ws);
  }

  /**
   * Handle channel subscription request.
   */
  private handleSubscribe(ws: WebSocket, envelope: WSEnvelope, attachment: WSAttachment): void {
    const payload = envelope.payload as { channel?: string };
    const channel = payload?.channel ?? envelope.channel;

    if (!channel || !CHANNEL_NAME_REGEX.test(channel)) {
      this.sendError(ws, "INVALID_CHANNEL", "Invalid channel name format");
      return;
    }

    // Check subscription limit
    if (attachment.channels.length >= MAX_SUBSCRIPTIONS_PER_CONNECTION) {
      this.sendError(ws, "SUBSCRIPTION_LIMIT", `Maximum ${MAX_SUBSCRIPTIONS_PER_CONNECTION} subscriptions per connection`);
      return;
    }

    // Already subscribed — idempotent
    if (attachment.channels.includes(channel)) {
      ws.send(JSON.stringify(createServerMessage<SubscribedPayload>("subscribed", { channel }, channel)));
      return;
    }

    // Authorization check
    if (!this.isAuthorizedForChannel(channel, attachment)) {
      this.sendError(ws, "CHANNEL_DENIED", `Not authorized for channel: ${channel}`);
      return;
    }

    this.ensureChannelsReconstructed();
    attachment.channels.push(channel);
    ws.serializeAttachment(attachment);
    this.channelManager.subscribe(ws, channel);
    ws.send(JSON.stringify(createServerMessage<SubscribedPayload>("subscribed", { channel }, channel)));
  }

  /**
   * Handle channel unsubscription request.
   */
  private handleUnsubscribe(ws: WebSocket, envelope: WSEnvelope, attachment: WSAttachment): void {
    const payload = envelope.payload as { channel?: string };
    const channel = payload?.channel ?? envelope.channel;

    if (!channel) {
      this.sendError(ws, "INVALID_CHANNEL", "Channel name required");
      return;
    }

    this.ensureChannelsReconstructed();
    attachment.channels = attachment.channels.filter((c) => c !== channel);
    ws.serializeAttachment(attachment);
    this.channelManager.unsubscribe(ws, channel);
    ws.send(JSON.stringify(createServerMessage<UnsubscribedPayload>("unsubscribed", { channel }, channel)));
  }

  /**
   * Handle replay request — send missed events since the given timestamp.
   */
  private handleReplay(ws: WebSocket, envelope: WSEnvelope, attachment: WSAttachment): void {
    const payload = envelope.payload as { lastMessageTs?: number };
    const lastMessageTs = payload?.lastMessageTs;

    if (typeof lastMessageTs !== "number" || lastMessageTs <= 0) {
      this.sendError(ws, "INVALID_REPLAY", "lastMessageTs must be a positive number");
      return;
    }

    const missed = this.eventLog.replay(lastMessageTs, attachment.channels);
    for (const entry of missed) {
      ws.send(JSON.stringify(entry.message));
    }
  }

  /**
   * Check if user is authorized for a channel.
   */
  private isAuthorizedForChannel(channel: string, attachment: WSAttachment): boolean {
    // user:{userId} — must match own userId
    if (channel.startsWith("user:")) {
      const targetUserId = channel.slice(5);
      return targetUserId === attachment.userId;
    }

    // delivery:{magicLinkId} — only via delivery-only connections
    if (channel.startsWith("delivery:")) {
      return false; // Regular connections cannot subscribe to delivery channels
    }

    // Admin channels — check permissions
    const requiredPermissions = CHANNEL_PERMISSIONS[channel];
    if (requiredPermissions) {
      return requiredPermissions.some((perm) => attachment.permissions.includes(perm));
    }

    // Unknown channel prefix — deny by default
    return false;
  }

  /**
   * Broadcast server_shutdown to all connected clients.
   * Called before deployment to allow graceful reconnection.
   */
  broadcastShutdown(reason = "deployment"): void {
    const shutdownMsg = createServerMessage("server_shutdown", { reason });
    const serialized = JSON.stringify(shutdownMsg);
    const sockets = this.ctx.getWebSockets();

    for (const ws of sockets) {
      try {
        ws.send(serialized);
      } catch {
        // Connection may already be closing
      }
    }
  }

  /**
   * Handle internal broadcast (HMAC-authenticated from Worker).
   */
  private async handleBroadcast(request: Request): Promise<Response> {
    const timestamp = request.headers.get("X-Internal-Timestamp");
    const signature = request.headers.get("X-Internal-Signature");

    if (!timestamp || !signature) {
      return new Response("Missing broadcast auth headers", { status: 403 });
    }

    // Reject stale timestamps (>60s)
    if (Math.abs(Date.now() - parseInt(timestamp, 10)) > 60_000) {
      return new Response("Stale request", { status: 403 });
    }

    const body = await request.text();
    const expectedSig = await hmacSha256Hex(this.env.HMAC_SECRET, `${timestamp}:${body}`);
    const sigValid = await timingSafeEqual(expectedSig, signature);

    if (!sigValid) {
      return new Response("Invalid broadcast signature", { status: 403 });
    }

    let parsed: { channel: string; message: WSEnvelope };
    try {
      parsed = JSON.parse(body);
    } catch {
      return new Response("Invalid broadcast body", { status: 400 });
    }

    // Reconstruct channels if waking from hibernation
    this.ensureChannelsReconstructed();

    // Log the event for replay
    this.eventLog.push(parsed.channel, parsed.message);

    // Send to all WebSockets subscribed to this channel via ChannelManager
    const sent = this.channelManager.broadcast(parsed.channel, parsed.message);

    // Auto-close delivery channels on terminal status
    if (parsed.channel.startsWith("delivery:") && parsed.message.type === "delivery_status") {
      const payload = parsed.message.payload as { status?: string };
      if (payload?.status && ["delivered", "bounced", "failed", "sent"].includes(payload.status)) {
        const subscribers = this.channelManager.getSubscribers(parsed.channel);
        for (const ws of subscribers) {
          ws.close(1000, "Delivery complete");
        }
      }
    }

    return new Response(JSON.stringify({ sent }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * Send an error message to a WebSocket. Logs validation failures
   * with rate limiting (max 5 per source per minute).
   */
  private sendError(ws: WebSocket, code: string, message: string): void {
    const errorMsg = createServerMessage<ErrorPayload>("error", { code, message });
    ws.send(JSON.stringify(errorMsg));

    // Rate-limited audit logging
    const attachment = ws.deserializeAttachment() as WSAttachment | null;
    const source = attachment?.userId ?? "unknown";
    this.logAuditEvent(source, code, message);
  }

  /**
   * Log a validation failure, rate-limited per source.
   */
  private logAuditEvent(source: string, code: string, message: string): void {
    const now = Date.now();
    let rateState = this.auditLogRates.get(source);

    if (!rateState || now - rateState.windowStart > 60_000) {
      rateState = { count: 0, windowStart: now };
      this.auditLogRates.set(source, rateState);
    }

    if (rateState.count >= MAX_AUDIT_LOGS_PER_SOURCE_PER_MINUTE) return;
    rateState.count++;

    console.log(JSON.stringify({
      event: "ws.validation_failure",
      source,
      code,
      message,
      timestamp: now,
    }));
  }

  /**
   * Check message rate limit. Returns true if within limit.
   */
  private checkMessageRate(ws: WebSocket): boolean {
    const now = Date.now();
    let state = this.rateLimits.get(ws);

    if (!state) {
      state = { messageCount: 0, windowStart: now, malformedStrikes: 0 };
      this.rateLimits.set(ws, state);
    }

    // Reset window if elapsed
    if (now - state.windowStart > MESSAGE_RATE_WINDOW_MS) {
      state.messageCount = 0;
      state.windowStart = now;
    }

    state.messageCount++;
    return state.messageCount <= MAX_MESSAGES_PER_SECOND;
  }

  /**
   * Add a malformed message strike. Close connection after threshold.
   */
  private addStrike(ws: WebSocket): void {
    let state = this.rateLimits.get(ws);
    if (!state) {
      state = { messageCount: 0, windowStart: Date.now(), malformedStrikes: 0 };
      this.rateLimits.set(ws, state);
    }

    state.malformedStrikes++;
    if (state.malformedStrikes >= MAX_MALFORMED_STRIKES) {
      this.sendError(ws, "TOO_MANY_ERRORS", "Connection closed due to repeated malformed messages");
      ws.close(1008, "Too many malformed messages");
      this.rateLimits.delete(ws);
    }
  }
}
