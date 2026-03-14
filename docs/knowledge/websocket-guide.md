# WebSocket Integration Guide

Production City uses WebSocket connections powered by Cloudflare Durable Objects with the Hibernation API for real-time push notifications and delivery status tracking.

## Architecture Overview

The WebSocket system uses a single Durable Object class (`WebSocketHibernationServer`) that manages all connections. The Hibernation API means idle connections cost nothing — the DO is only woken when a message arrives.

Key components:
- **Durable Object**: `WebSocketHibernationServer` at `apps/backend/src/durable-objects/websocket-server.ts`
- **Protocol**: `apps/backend/src/durable-objects/protocol.ts` — typed envelope format
- **Channel Manager**: `apps/backend/src/durable-objects/channel-manager.ts` — pub/sub within the DO
- **Push Helpers**: `apps/backend/src/durable-objects/push-helpers.ts` — server-initiated push from Workers
- **Event Log**: `apps/backend/src/durable-objects/event-log.ts` — recent event replay on reconnect

DO storage is ephemeral/transient — connection state only, never business data. All persistent data goes through D1/Prisma via the Worker.

## Two Upgrade Endpoints

### `/v1/ws` — Authenticated (Cookie Auth)

Used by the admin dashboard for real-time notifications.

- Authentication: `__Host-session` cookie (HttpOnly, Secure, SameSite=Lax)
- Origin validation against allowed origins
- Session revalidation every 5 minutes
- Auto-subscribes to `user:{userId}` channel
- Can subscribe to `admin:*` channels if user has appropriate roles

### `/v1/ws/delivery` — Token Auth

Used by the login page for magic link delivery status tracking.

- Authentication: One-time delivery token via `?token=` query parameter
- Token is consumed on use (single-use)
- Auto-subscribes to `delivery:{magicLinkId}` channel
- No access to user/admin channels
- Connection is delivery-only (`deliveryOnly: true` in attachment)

## Connection Lifecycle

1. **Connect**: Client opens WebSocket to one of the upgrade endpoints
2. **Authenticate**: Server validates credentials (cookie or token)
3. **Acknowledge**: Server sends `connection_ack` with session info and initial channels
4. **Subscribe**: Client subscribes to additional channels via `subscribe` messages
5. **Receive**: Server pushes notifications and status updates
6. **Replay**: On reconnect, client receives missed events via `replay` message type
7. **Reconnect**: On disconnect, client uses exponential backoff with jitter
8. **Shutdown**: On deploy, server sends `server_shutdown` before closing connections

## Message Protocol

All messages use the `WSEnvelope` format:

```typescript
interface WSEnvelope<T = unknown> {
  v: 1;           // Protocol version
  type: string;   // Message type
  channel?: string; // Target channel (optional)
  payload: T;     // Message-specific data
  ts: number;     // Unix timestamp (ms)
  id: string;     // UUID for deduplication
}
```

### Client to Server Message Types

| Type | Payload | Description |
|------|---------|-------------|
| `subscribe` | `{ channel: string }` | Subscribe to a channel |
| `unsubscribe` | `{ channel: string }` | Unsubscribe from a channel |
| `ping` | `{}` | Heartbeat (auto-responded without waking DO) |
| `replay` | `{ since: number }` | Request missed events since timestamp |

### Server to Client Message Types

| Type | Payload | Description |
|------|---------|-------------|
| `connection_ack` | `{ sessionId, channels, protocolVersion }` | Connection established |
| `subscribed` | `{ channel }` | Subscription confirmed |
| `unsubscribed` | `{ channel }` | Unsubscription confirmed |
| `notification` | `{ title, body, category? }` | Real-time notification |
| `delivery_status` | `{ magicLinkId, status, timestamp }` | Email delivery update |
| `error` | `{ code, message }` | Protocol error |
| `pong` | `{}` | Heartbeat response |
| `server_shutdown` | `{ reason }` | Server shutting down |

### Channel Naming Convention

Channels follow the pattern `(user|admin|delivery):<identifier>`:

| Channel | Description | Auth Required |
|---------|-------------|---------------|
| `user:{userId}` | Per-user notifications | Cookie auth |
| `admin:notifications` | Admin-wide broadcasts | Cookie auth + admin role |
| `admin:eoi` | New EOI notifications | Cookie auth + admin role |
| `admin:approvals` | Approval requests | Cookie auth + admin role |
| `delivery:{magicLinkId}` | Delivery status | Delivery token |

## Authentication

### Cookie-Based Auth (`/v1/ws`)

The `__Host-session` cookie is validated on upgrade. The session is revalidated every 5 minutes while the connection is active. If the session expires or the user is deactivated, the connection is closed with code 4001.

### Delivery Token Auth (`/v1/ws/delivery`)

A one-time delivery token is passed via the `token` query parameter. The token is stored in the `MagicLink.deliveryToken` field and is consumed on use. The connection is auto-subscribed to the delivery channel for the associated magic link.

### HMAC-Signed Internal Communication

Server-to-DO communication (push helpers) uses HMAC-SHA256 signed messages to prevent unauthorized message injection. The shared secret is stored in the `WS_HMAC_SECRET` environment variable.

## Frontend Integration

### WebSocketProvider

Wrap your app (or the authenticated section) with `WebSocketProvider`:

```tsx
import { WebSocketProvider } from '@/lib/websocket';

function AuthenticatedApp() {
  return (
    <WebSocketProvider url="/v1/ws">
      <Dashboard />
    </WebSocketProvider>
  );
}
```

### useWebSocket

Access connection state:

```tsx
import { useWebSocket } from '@/lib/websocket';

function StatusIndicator() {
  const { state } = useWebSocket();
  // state: 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
}
```

### useChannel

Subscribe to a channel and receive messages:

```tsx
import { useChannel } from '@/lib/websocket';

function EOINotifications() {
  useChannel('admin:eoi', (message) => {
    // Handle new EOI notification
    console.log(message.payload);
  });
}
```

### useDeliveryStatus

Track magic link delivery status (used on the login page):

```tsx
import { useDeliveryStatus } from '@/lib/websocket';

function LoginPage({ deliveryToken }: { deliveryToken: string }) {
  const { status } = useDeliveryStatus(deliveryToken);
  // status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed'
}
```

### TabCoordinator

The `TabCoordinator` uses BroadcastChannel to elect a leader tab that holds the WebSocket connection. Other tabs receive messages via BroadcastChannel relay. This prevents redundant connections from multiple tabs.

## Adding New Channels

1. Define the channel name constant in `protocol.ts`
2. Add the message payload type to `protocol.ts`
3. Add the channel to `ChannelManager` if it needs special access control
4. Add push helper function in `push-helpers.ts`
5. Update the AsyncAPI spec at `apps/backend/src/asyncapi.yaml`
6. Add i18n strings for the notification in all 10 locale files
7. Add `useChannel` hook usage in the frontend component
8. Add tests for the new channel subscription and message handling

## Multi-Tab Coordination

The `TabCoordinator` (at `apps/web/app/lib/websocket/TabCoordinator.ts`) implements leader election via BroadcastChannel:

1. Each tab announces itself on the `ws-tab-coordinator` BroadcastChannel
2. The tab with the lowest random ID becomes the leader
3. The leader holds the WebSocket connection
4. Non-leader tabs receive messages relayed by the leader via BroadcastChannel
5. If the leader tab closes, a new election is triggered
6. Heartbeats detect stale leaders (timeout: 10 seconds)

## Deployment Behavior

When a new version is deployed, Cloudflare terminates the Durable Object:

1. The DO sends `server_shutdown` to all connected clients with reason "deploy"
2. Clients receive the shutdown message and begin reconnection with backoff
3. New connections are established to the new DO instance
4. The `EventLog` replays recent events to fill any gaps

## Debugging

### Common Issues

- **HTTPS required for cookies**: `__Host-session` cookies require HTTPS. Use `wrangler dev --local-protocol=https` for local development.
- **Origin mismatch**: WebSocket upgrade validates the Origin header. Ensure the client origin matches the allowed origins list.
- **Token consumed**: Delivery tokens are single-use. A second connection attempt with the same token will fail with 401.

### Cloudflare Dashboard

Monitor WebSocket connections via:
- Durable Object metrics in the Cloudflare dashboard
- Analytics Engine events logged by `EventLog`
- Worker request logs for upgrade failures

## Security

- **Rate limiting**: Max 30 messages/second per connection, max 10 connections per user
- **Message size**: Inbound max 32 KB, outbound max 64 KB
- **Malformed messages**: 5 strikes then disconnect
- **Origin validation**: Checked on upgrade request
- **HMAC signing**: All internal push messages are HMAC-signed
- **No PII in payloads**: WebSocket payloads contain reference IDs only. Display names are fetched client-side via REST.
- **Channel ACL**: Users can only subscribe to channels they have permission for

## Monitoring

The `EventLog` class records recent events for replay and debugging:
- Events are stored in-memory within the DO (not persisted to D1)
- Max 1000 events retained per DO instance
- Events include: subscribe, unsubscribe, notification, delivery_status
- Analytics Engine integration for aggregate metrics

## Scaling

- Each Durable Object instance handles connections for one admin hub
- Admin channels are routed to a shared DO instance per deployment
- User channels route to user-specific DO instances
- Delivery channels route to per-magic-link DO instances
- Connection limits: 10 per user, 20 subscriptions per connection

## Local Development

```bash
# Start the backend worker with HTTPS (required for __Host-session cookies)
cd apps/backend
pnpm dev  # uses wrangler dev

# The web dev server proxies WebSocket connections to the backend
cd apps/web
pnpm dev  # port 4321
```

For local WebSocket testing, ensure:
1. Backend runs with HTTPS (`--local-protocol=https` in wrangler.toml)
2. Web dev server proxies `/v1/ws` and `/v1/ws/delivery` to the backend
3. Browser allows self-signed certificates for localhost
