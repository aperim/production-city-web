/**
 * Tests for EventLog — bounded event log for replay on reconnection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventLog } from "../durable-objects/event-log.js";
import { createServerMessage } from "../durable-objects/protocol.js";

describe("EventLog", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores events and replays them", () => {
    const log = new EventLog();
    const msg = createServerMessage("notification", { title: "test", body: "id1" }, "admin:eoi");

    log.push("admin:eoi", msg);

    const replayed = log.replay(0, ["admin:eoi"]);
    expect(replayed).toHaveLength(1);
    expect(replayed[0]!.channel).toBe("admin:eoi");
    expect(replayed[0]!.message).toBe(msg);
  });

  it("filters by lastMessageTs", () => {
    const log = new EventLog();

    vi.setSystemTime(new Date("2026-03-14T12:00:00Z"));
    const msg1 = createServerMessage("notification", { title: "old", body: "id1" });
    log.push("admin:eoi", msg1);

    vi.setSystemTime(new Date("2026-03-14T12:01:00Z"));
    const msg2 = createServerMessage("notification", { title: "new", body: "id2" });
    log.push("admin:eoi", msg2);

    // Request events after msg1's timestamp
    const replayed = log.replay(new Date("2026-03-14T12:00:30Z").getTime(), ["admin:eoi"]);
    expect(replayed).toHaveLength(1);
    expect(replayed[0]!.message).toBe(msg2);
  });

  it("filters by subscribed channels", () => {
    const log = new EventLog();
    const msg1 = createServerMessage("notification", { title: "a", body: "id1" }, "admin:eoi");
    const msg2 = createServerMessage("notification", { title: "b", body: "id2" }, "admin:approvals");

    log.push("admin:eoi", msg1);
    log.push("admin:approvals", msg2);

    const replayed = log.replay(0, ["admin:eoi"]);
    expect(replayed).toHaveLength(1);
    expect(replayed[0]!.channel).toBe("admin:eoi");
  });

  it("respects TTL (5 minutes)", () => {
    const log = new EventLog();

    vi.setSystemTime(new Date("2026-03-14T12:00:00Z"));
    const msg = createServerMessage("notification", { title: "old", body: "id1" });
    log.push("admin:eoi", msg);

    // Advance 6 minutes
    vi.setSystemTime(new Date("2026-03-14T12:06:00Z"));

    const replayed = log.replay(0, ["admin:eoi"]);
    expect(replayed).toHaveLength(0);
  });

  it("evicts oldest entries when capacity exceeded", () => {
    const log = new EventLog();

    // Push 101 events
    for (let i = 0; i < 101; i++) {
      const msg = createServerMessage("notification", { title: `msg${i}`, body: `id${i}` });
      log.push("admin:eoi", msg);
    }

    expect(log.size).toBe(100);

    // The first message should have been evicted
    const replayed = log.replay(0, ["admin:eoi"]);
    expect(replayed).toHaveLength(100);
  });

  it("clear removes all entries", () => {
    const log = new EventLog();
    const msg = createServerMessage("notification", { title: "test", body: "id1" });
    log.push("admin:eoi", msg);

    log.clear();

    expect(log.size).toBe(0);
    expect(log.replay(0, ["admin:eoi"])).toHaveLength(0);
  });

  it("returns empty for no matching channels", () => {
    const log = new EventLog();
    const msg = createServerMessage("notification", { title: "test", body: "id1" });
    log.push("admin:eoi", msg);

    const replayed = log.replay(0, ["admin:approvals"]);
    expect(replayed).toHaveLength(0);
  });
});
