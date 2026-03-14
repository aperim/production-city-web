/**
 * Message deduplication using an LRU set of message IDs.
 * Prevents duplicate processing during reconnection overlap and replay.
 */

const DEFAULT_MAX_SIZE = 1000;

export class MessageDeduplicator {
  private seen: Set<string>;
  private order: string[];
  private maxSize: number;

  constructor(maxSize = DEFAULT_MAX_SIZE) {
    this.seen = new Set();
    this.order = [];
    this.maxSize = maxSize;
  }

  /**
   * Check if a message ID has been seen before.
   * If not, adds it to the set. Returns true if the message is new (not duplicate).
   */
  check(messageId: string): boolean {
    if (this.seen.has(messageId)) {
      return false; // Duplicate
    }

    this.seen.add(messageId);
    this.order.push(messageId);

    // Evict oldest if over capacity
    while (this.order.length > this.maxSize) {
      const oldest = this.order.shift();
      if (oldest) {
        this.seen.delete(oldest);
      }
    }

    return true; // New message
  }

  get size(): number {
    return this.seen.size;
  }

  clear(): void {
    this.seen.clear();
    this.order = [];
  }
}
