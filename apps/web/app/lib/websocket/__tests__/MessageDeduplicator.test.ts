/**
 * Tests for MessageDeduplicator — LRU message deduplication.
 */

import { describe, it, expect } from "vitest";
import { MessageDeduplicator } from "../MessageDeduplicator";

describe("MessageDeduplicator", () => {
  it("accepts new messages", () => {
    const dedup = new MessageDeduplicator();
    expect(dedup.check("msg-1")).toBe(true);
    expect(dedup.check("msg-2")).toBe(true);
  });

  it("rejects duplicate messages", () => {
    const dedup = new MessageDeduplicator();
    expect(dedup.check("msg-1")).toBe(true);
    expect(dedup.check("msg-1")).toBe(false);
  });

  it("evicts oldest entries when capacity exceeded", () => {
    const dedup = new MessageDeduplicator(3);

    dedup.check("msg-1");
    dedup.check("msg-2");
    dedup.check("msg-3");
    expect(dedup.size).toBe(3);

    // Adding a 4th should evict msg-1
    dedup.check("msg-4");
    expect(dedup.size).toBe(3);

    // msg-1 should be accepted again (evicted)
    expect(dedup.check("msg-1")).toBe(true);

    // msg-2 should still be rejected (was evicted by msg-1 insert)
    // Actually msg-2 was evicted when msg-1 was re-added
    expect(dedup.check("msg-2")).toBe(true);
  });

  it("handles large number of messages", () => {
    const dedup = new MessageDeduplicator(1000);

    for (let i = 0; i < 1500; i++) {
      dedup.check(`msg-${i}`);
    }

    expect(dedup.size).toBe(1000);

    // Early messages should have been evicted
    expect(dedup.check("msg-0")).toBe(true);

    // Recent messages should still be present
    expect(dedup.check("msg-1499")).toBe(false);
  });

  it("clear resets the deduplicator", () => {
    const dedup = new MessageDeduplicator();
    dedup.check("msg-1");
    dedup.check("msg-2");

    dedup.clear();

    expect(dedup.size).toBe(0);
    expect(dedup.check("msg-1")).toBe(true); // Accepted again
  });
});
