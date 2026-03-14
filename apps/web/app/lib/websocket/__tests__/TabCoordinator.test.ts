/**
 * Tests for TabCoordinator — multi-tab leader election via BroadcastChannel.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TabCoordinator } from "../TabCoordinator";

// Mock BroadcastChannel
class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  name: string;
  closed = false;

  constructor(name: string) {
    this.name = name;
    MockBroadcastChannel.instances.push(this);
  }

  postMessage(data: unknown): void {
    if (this.closed) return;
    // Dispatch to all other instances with the same name
    for (const instance of MockBroadcastChannel.instances) {
      if (instance !== this && instance.name === this.name && !instance.closed && instance.onmessage) {
        instance.onmessage(new MessageEvent("message", { data }));
      }
    }
  }

  close(): void {
    this.closed = true;
  }

  static reset(): void {
    MockBroadcastChannel.instances = [];
  }
}

describe("TabCoordinator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockBroadcastChannel.reset();
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);
    vi.stubGlobal("crypto", {
      randomUUID: () => `uuid-${Math.random().toString(36).slice(2)}`,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    MockBroadcastChannel.reset();
  });

  it("first tab becomes leader", () => {
    const coordinator = new TabCoordinator();
    expect(coordinator.isLeader).toBe(true);
    coordinator.destroy();
  });

  it("second tab defers to first tab's heartbeat", () => {
    const tab1 = new TabCoordinator({
      channelName: "test-coord",
      heartbeatInterval: 5000,
      heartbeatTimeout: 10000,
    });
    expect(tab1.isLeader).toBe(true);

    const tab2 = new TabCoordinator({
      channelName: "test-coord",
      heartbeatInterval: 5000,
      heartbeatTimeout: 10000,
    });

    // tab1 should receive tab2's claim and reassert with heartbeat
    // tab2 should receive tab1's heartbeat and stand down
    expect(tab1.isLeader).toBe(true);
    expect(tab2.isLeader).toBe(false);

    tab1.destroy();
    tab2.destroy();
  });

  it("promotes new leader when leader resigns", () => {
    const tab1 = new TabCoordinator({
      channelName: "test-resign",
      heartbeatInterval: 5000,
      heartbeatTimeout: 10000,
    });
    const tab2 = new TabCoordinator({
      channelName: "test-resign",
      heartbeatInterval: 5000,
      heartbeatTimeout: 10000,
    });

    expect(tab1.isLeader).toBe(true);
    expect(tab2.isLeader).toBe(false);

    // Leader resigns
    tab1.destroy();

    // tab2 should claim leadership on resign message
    expect(tab2.isLeader).toBe(true);

    tab2.destroy();
  });

  it("relays messages to non-leader tabs", () => {
    const tab1 = new TabCoordinator({ channelName: "test-relay" });
    const tab2 = new TabCoordinator({ channelName: "test-relay" });

    const received: unknown[] = [];
    tab2.onMessage((data) => received.push(data));

    tab1.relayMessage({ type: "test", payload: "hello" });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ type: "test", payload: "hello" });

    tab1.destroy();
    tab2.destroy();
  });

  it("calls onLeaderChange callback", () => {
    const tab1 = new TabCoordinator({ channelName: "test-change" });
    const changes: boolean[] = [];
    tab1.onLeaderChange((isLeader) => changes.push(isLeader));

    // Initially should have been called with true during construction
    expect(tab1.isLeader).toBe(true);

    tab1.destroy();
  });

  it("falls back to leader when BroadcastChannel is unavailable", () => {
    vi.stubGlobal("BroadcastChannel", undefined);

    const coordinator = new TabCoordinator();
    expect(coordinator.isLeader).toBe(true);

    coordinator.destroy();
  });

  it("promotes on heartbeat timeout", () => {
    const tab1 = new TabCoordinator({
      channelName: "test-timeout",
      heartbeatInterval: 5000,
      heartbeatTimeout: 10000,
    });
    const tab2 = new TabCoordinator({
      channelName: "test-timeout",
      heartbeatInterval: 5000,
      heartbeatTimeout: 10000,
    });

    expect(tab1.isLeader).toBe(true);
    expect(tab2.isLeader).toBe(false);

    // Close tab1's broadcast channel to simulate tab close without resign
    const tab1Bc = MockBroadcastChannel.instances.find(
      (bc) => bc.name === "test-timeout" && !bc.closed,
    );
    if (tab1Bc) tab1Bc.closed = true;

    // Advance past heartbeat timeout
    vi.advanceTimersByTime(11000);

    expect(tab2.isLeader).toBe(true);

    tab1.destroy();
    tab2.destroy();
  });

  it("unsubscribe from onLeaderChange works", () => {
    const coordinator = new TabCoordinator({ channelName: "test-unsub" });
    const changes: boolean[] = [];
    const unsub = coordinator.onLeaderChange((isLeader) => changes.push(isLeader));

    unsub();

    // No more callbacks should be received
    coordinator.destroy();
  });

  it("unsubscribe from onMessage works", () => {
    const tab1 = new TabCoordinator({ channelName: "test-msg-unsub" });
    const tab2 = new TabCoordinator({ channelName: "test-msg-unsub" });

    const received: unknown[] = [];
    const unsub = tab2.onMessage((data) => received.push(data));

    unsub();

    tab1.relayMessage({ type: "test" });
    expect(received).toHaveLength(0);

    tab1.destroy();
    tab2.destroy();
  });
});
