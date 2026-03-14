/**
 * Channel subscription manager for the WebSocket Durable Object.
 *
 * Manages channel subscriptions in-memory, with lazy creation and cleanup.
 * On DO wake from hibernation, channels are reconstructed from
 * getWebSockets() + deserializeAttachment().
 */

import { CHANNEL_NAME_REGEX, type WSAttachment, type WSEnvelope } from "./protocol.js";

export class ChannelManager {
  private channels = new Map<string, Set<WebSocket>>();

  /**
   * Subscribe a WebSocket to a channel.
   * Channel is created lazily on first subscription.
   */
  subscribe(ws: WebSocket, channel: string): void {
    if (!CHANNEL_NAME_REGEX.test(channel)) {
      throw new Error(`Invalid channel name: ${channel}`);
    }

    let subscribers = this.channels.get(channel);
    if (!subscribers) {
      subscribers = new Set();
      this.channels.set(channel, subscribers);
    }
    subscribers.add(ws);
  }

  /**
   * Unsubscribe a WebSocket from a channel.
   * Channel is cleaned up when the last subscriber leaves.
   */
  unsubscribe(ws: WebSocket, channel: string): void {
    const subscribers = this.channels.get(channel);
    if (!subscribers) return;
    subscribers.delete(ws);
    if (subscribers.size === 0) {
      this.channels.delete(channel);
    }
  }

  /**
   * Unsubscribe a WebSocket from all channels.
   * Channels are cleaned up when the last subscriber leaves.
   */
  unsubscribeAll(ws: WebSocket): void {
    for (const [channel, subscribers] of this.channels) {
      subscribers.delete(ws);
      if (subscribers.size === 0) {
        this.channels.delete(channel);
      }
    }
  }

  /**
   * Broadcast a message to all subscribers of a channel.
   * Returns the number of messages sent.
   */
  broadcast(channel: string, message: WSEnvelope): number {
    const subscribers = this.channels.get(channel);
    if (!subscribers || subscribers.size === 0) return 0;

    const serialized = JSON.stringify(message);
    let sent = 0;
    for (const ws of subscribers) {
      try {
        ws.send(serialized);
        sent++;
      } catch {
        // WebSocket may have closed between check and send
      }
    }
    return sent;
  }

  /**
   * Get the set of subscribers for a channel.
   * Returns an empty set if the channel does not exist.
   */
  getSubscribers(channel: string): Set<WebSocket> {
    return this.channels.get(channel) ?? new Set();
  }

  /**
   * Get all channels a WebSocket is subscribed to.
   */
  getChannels(ws: WebSocket): string[] {
    const result: string[] = [];
    for (const [channel, subscribers] of this.channels) {
      if (subscribers.has(ws)) {
        result.push(channel);
      }
    }
    return result;
  }

  /**
   * Get all active channel names.
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Reconstruct channels from existing WebSocket connections after hibernation wake.
   * Reads channel subscriptions from each WebSocket's serialized attachment.
   */
  reconstructFromWebSockets(webSockets: WebSocket[]): void {
    this.channels.clear();
    for (const ws of webSockets) {
      try {
        const attachment = ws.deserializeAttachment() as WSAttachment | null;
        if (attachment?.channels) {
          for (const channel of attachment.channels) {
            if (CHANNEL_NAME_REGEX.test(channel)) {
              let subscribers = this.channels.get(channel);
              if (!subscribers) {
                subscribers = new Set();
                this.channels.set(channel, subscribers);
              }
              subscribers.add(ws);
            }
          }
        }
      } catch {
        // Skip WebSockets with invalid attachments
      }
    }
  }
}
