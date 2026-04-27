import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

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

const testStorage = new Map<string, string>();

if (typeof window !== "undefined") Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => testStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      testStorage.set(key, value);
    },
    removeItem: (key: string) => {
      testStorage.delete(key);
    },
    clear: () => {
      testStorage.clear();
    },
    get length() {
      return testStorage.size;
    },
    key: (index: number) => Array.from(testStorage.keys())[index] ?? null,
  } satisfies Storage,
});

beforeEach(() => {
  testStorage.clear();
});
