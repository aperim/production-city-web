/**
 * Bounded event log for WebSocket message replay.
 *
 * Maintains a ring buffer of recent events for replay on reconnection.
 * Events are evicted by capacity (MAX_EVENT_LOG) and TTL (EVENT_LOG_TTL_MS).
 */

import type { WSEnvelope } from "./protocol.js";

export interface EventLogEntry {
  channel: string;
  message: WSEnvelope;
  ts: number;
}

const MAX_EVENT_LOG = 100;
const EVENT_LOG_TTL_MS = 5 * 60 * 1000; // 5 minutes

export class EventLog {
  private entries: EventLogEntry[] = [];

  /**
   * Add an event to the log. Evicts oldest entries when capacity is reached.
   */
  push(channel: string, message: WSEnvelope): void {
    this.entries.push({ channel, message, ts: Date.now() });
    if (this.entries.length > MAX_EVENT_LOG) {
      this.entries.shift();
    }
  }

  /**
   * Get events after a given timestamp that match the subscribed channels.
   * Filters by TTL and channel membership.
   */
  replay(lastMessageTs: number, subscribedChannels: string[]): EventLogEntry[] {
    const cutoff = Date.now() - EVENT_LOG_TTL_MS;
    return this.entries.filter(
      (e) =>
        e.ts > lastMessageTs &&
        e.ts > cutoff &&
        subscribedChannels.includes(e.channel),
    );
  }

  /** Get the current number of entries. */
  get size(): number {
    return this.entries.length;
  }

  /** Clear all entries (e.g., on DO restart without hibernation). */
  clear(): void {
    this.entries = [];
  }
}
