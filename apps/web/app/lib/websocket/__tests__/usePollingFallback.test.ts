/**
 * Tests for usePollingFallback — delivery status polling with pause/resume.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePollingFallback } from "../usePollingFallback";

vi.mock("../../api-client", () => ({
  getDeliveryStatus: vi.fn(),
}));

import { getDeliveryStatus } from "../../api-client";

const mockGetDeliveryStatus = getDeliveryStatus as ReturnType<typeof vi.fn>;

describe("usePollingFallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockGetDeliveryStatus.mockResolvedValue({
      ok: true,
      data: { status: "sending" },
      status: 200,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with null status when no requestId", () => {
    const { result } = renderHook(() =>
      usePollingFallback({ requestId: null }),
    );
    expect(result.current.status).toBeNull();
  });

  it("starts polling when requestId is provided", async () => {
    const { result } = renderHook(() =>
      usePollingFallback({ requestId: "req-123" }),
    );

    expect(result.current.status).toBe("sending");

    // Advance past first poll interval
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(mockGetDeliveryStatus).toHaveBeenCalledWith("req-123");
  });

  it("stops polling on terminal status", async () => {
    mockGetDeliveryStatus.mockResolvedValue({
      ok: true,
      data: { status: "delivered" },
      status: 200,
    });

    const { result } = renderHook(() =>
      usePollingFallback({ requestId: "req-123" }),
    );

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(result.current.status).toBe("delivered");

    // Should not poll again
    mockGetDeliveryStatus.mockClear();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockGetDeliveryStatus).not.toHaveBeenCalled();
  });

  it("can be paused and resumed", async () => {
    const { result } = renderHook(() =>
      usePollingFallback({ requestId: "req-123" }),
    );

    // Pause
    act(() => {
      result.current.pause();
    });

    mockGetDeliveryStatus.mockClear();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockGetDeliveryStatus).not.toHaveBeenCalled();

    // Resume
    act(() => {
      result.current.resume();
    });

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockGetDeliveryStatus).toHaveBeenCalled();
  });

  it("calls onStatusChange callback", async () => {
    mockGetDeliveryStatus.mockResolvedValue({
      ok: true,
      data: { status: "delivered" },
      status: 200,
    });

    const onStatusChange = vi.fn();
    renderHook(() =>
      usePollingFallback({ requestId: "req-123", onStatusChange }),
    );

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(onStatusChange).toHaveBeenCalledWith("delivered");
  });

  it("does not poll when disabled", () => {
    const { result } = renderHook(() =>
      usePollingFallback({ requestId: "req-123", enabled: false }),
    );

    expect(result.current.status).toBeNull();
  });

  it("handles sendingTooLong after 10s", async () => {
    const { result } = renderHook(() =>
      usePollingFallback({ requestId: "req-123" }),
    );

    expect(result.current.sendingTooLong).toBe(false);

    // Advance past SENDING_FALLBACK_MS (10s) with enough time for polls to fire
    await act(async () => {
      vi.advanceTimersByTime(12000);
    });

    // The sendingTooLong flag is set during poll execution after 10s
    // Re-trigger another poll cycle to ensure state is updated
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.sendingTooLong).toBe(true);
  });
});
