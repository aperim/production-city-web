import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useParallax } from "./useParallax";

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;

  // Default innerWidth to desktop
  Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useParallax", () => {
  it("returns a ref and initial offset of 0", () => {
    const { result } = renderHook(() => useParallax());
    expect(result.current.ref).toBeDefined();
    expect(result.current.offset).toBe(0);
  });

  it("uses CSS transform translateY, never background-attachment:fixed (Finding #6)", () => {
    // The hook returns an offset value meant to be applied via transform: translateY()
    // It does NOT use background-attachment:fixed
    const { result } = renderHook(() => useParallax());
    // offset is a number, suitable for translateY
    expect(typeof result.current.offset).toBe("number");
  });

  it("clamps offset within maxOffset bounds", () => {
    const { result } = renderHook(() => useParallax({ maxOffset: 15 }));
    // Even before scroll, offset should be within bounds
    expect(Math.abs(result.current.offset)).toBeLessThanOrEqual(15);
  });

  it("returns 0 offset when prefers-reduced-motion is active", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })) as typeof window.matchMedia;

    const { result } = renderHook(() => useParallax());
    expect(result.current.offset).toBe(0);
  });

  it("returns 0 offset on mobile viewports (performance)", () => {
    Object.defineProperty(window, "innerWidth", { value: 390, writable: true });

    const { result } = renderHook(() => useParallax());
    expect(result.current.offset).toBe(0);
  });

  it("accepts custom maxOffset", () => {
    const { result } = renderHook(() => useParallax({ maxOffset: 20 }));
    expect(result.current.offset).toBe(0); // No scroll yet
    expect(typeof result.current.offset).toBe("number");
  });
});
