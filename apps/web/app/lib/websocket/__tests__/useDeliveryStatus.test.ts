/**
 * Tests for useDeliveryStatus — WebSocket push + polling fallback.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeliveryStatus } from "../useDeliveryStatus";

// Mock API client
vi.mock("../../api-client", () => ({
  getDeliveryStatus: vi.fn().mockResolvedValue({
    ok: true,
    data: { status: "sending" },
    status: 200,
  }),
}));

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  readyState = 0; // CONNECTING
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code: 1000 }));
  }

  send(_data: string): void {
    // no-op in tests
  }

  // Test helpers
  simulateOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateMessage(data: unknown): void {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(data) }));
  }

  simulateClose(code = 1000): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code }));
  }

  static reset(): void {
    MockWebSocket.instances = [];
  }
}

describe("useDeliveryStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.reset();
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    MockWebSocket.reset();
  });

  it("returns null status when no magicLinkId", () => {
    const { result } = renderHook(() =>
      useDeliveryStatus(null, null),
    );
    expect(result.current.status).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });

  it("starts polling immediately when magicLinkId is provided", () => {
    const { result } = renderHook(() =>
      useDeliveryStatus("ml-123", "dt-456"),
    );

    // Initial status from polling
    expect(result.current.status).toBe("sending");
  });

  it("connects to delivery WebSocket endpoint", () => {
    renderHook(() =>
      useDeliveryStatus("ml-123", "dt-456"),
    );

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0]!.url).toContain("/v1/ws/delivery?token=dt-456");
  });

  it("sets isConnected on WebSocket open", () => {
    const { result } = renderHook(() =>
      useDeliveryStatus("ml-123", "dt-456"),
    );

    act(() => {
      MockWebSocket.instances[0]!.simulateOpen();
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("updates status from WebSocket delivery_status message", () => {
    const { result } = renderHook(() =>
      useDeliveryStatus("ml-123", "dt-456"),
    );

    act(() => {
      MockWebSocket.instances[0]!.simulateOpen();
    });

    act(() => {
      MockWebSocket.instances[0]!.simulateMessage({
        v: 1,
        type: "delivery_status",
        payload: { magicLinkId: "ml-123", status: "delivered", timestamp: Date.now() },
        ts: Date.now(),
        id: "msg-1",
      });
    });

    expect(result.current.status).toBe("delivered");
  });

  it("sets isConnected to false on WebSocket close", () => {
    const { result } = renderHook(() =>
      useDeliveryStatus("ml-123", "dt-456"),
    );

    act(() => {
      MockWebSocket.instances[0]!.simulateOpen();
    });

    expect(result.current.isConnected).toBe(true);

    act(() => {
      MockWebSocket.instances[0]!.simulateClose();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it("does not create WebSocket when WebSocket is unavailable", () => {
    vi.stubGlobal("WebSocket", undefined);

    renderHook(() =>
      useDeliveryStatus("ml-123", "dt-456"),
    );

    // No WebSocket created, polling should still work
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("cleans up WebSocket on unmount", () => {
    const { unmount } = renderHook(() =>
      useDeliveryStatus("ml-123", "dt-456"),
    );

    const ws = MockWebSocket.instances[0]!;
    act(() => {
      ws.simulateOpen();
    });

    unmount();

    expect(ws.readyState).toBe(MockWebSocket.CLOSED);
  });
});
