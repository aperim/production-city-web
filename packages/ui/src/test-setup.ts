import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// JSDOM does not implement window.matchMedia — provide a spyable stub so tests
// that call vi.spyOn(window, 'matchMedia') or use matchMedia directly don't crash.
if (typeof window !== "undefined") Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
