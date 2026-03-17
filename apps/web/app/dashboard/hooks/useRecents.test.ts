import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecents, type RecentEntry } from "./useRecents";

// Mock localStorage for jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

describe("useRecents", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it("returns empty array when no recents exist", () => {
    const { result } = renderHook(() => useRecents());
    expect(result.current.recents).toEqual([]);
  });

  it("adds a recent entry", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      result.current.addRecent({
        path: "/dashboard/productions/shooting",
        label: "Shooting — Productions",
      });
    });
    expect(result.current.recents.length).toBe(1);
    expect(result.current.recents[0]!.path).toBe("/dashboard/productions/shooting");
  });

  it("limits recents to 5 entries", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      for (let i = 0; i < 7; i++) {
        result.current.addRecent({
          path: `/dashboard/workspace/tab-${i}`,
          label: `Tab ${i} — Workspace`,
        });
      }
    });
    expect(result.current.recents.length).toBe(5);
  });

  it("moves duplicate path to top instead of adding", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      result.current.addRecent({ path: "/dashboard/a/b", label: "B — A" });
      result.current.addRecent({ path: "/dashboard/c/d", label: "D — C" });
      result.current.addRecent({ path: "/dashboard/a/b", label: "B — A" });
    });
    expect(result.current.recents.length).toBe(2);
    expect(result.current.recents[0]!.path).toBe("/dashboard/a/b");
  });

  it("persists to localStorage under key 'pc-recents'", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      result.current.addRecent({ path: "/dashboard/a/b", label: "B — A" });
    });
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const stored = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)?.[1] ?? "[]");
    expect(stored.length).toBe(1);
  });

  it("revalidates recents against visible workspaces", () => {
    const entries: RecentEntry[] = [
      { path: "/dashboard/productions/shooting", label: "Shooting — Productions", timestamp: new Date().toISOString() },
      { path: "/dashboard/administration/users", label: "Users — Administration", timestamp: new Date().toISOString() },
    ];
    localStorageMock.setItem("pc-recents", JSON.stringify(entries));

    const visibleWorkspaceIds = ["productions"];
    const { result } = renderHook(() => useRecents({ visibleWorkspaceIds }));
    expect(result.current.recents.length).toBe(1);
    expect(result.current.recents[0]!.path).toContain("productions");
  });

  it("revalidates recents by workspace AND tab visibility", () => {
    const entries: RecentEntry[] = [
      { path: "/dashboard/productions/shooting", label: "Shooting — Productions", timestamp: new Date().toISOString() },
      { path: "/dashboard/productions/overview", label: "Overview — Productions", timestamp: new Date().toISOString() },
      { path: "/dashboard/finance/invoices", label: "Invoices — Finance", timestamp: new Date().toISOString() },
    ];
    localStorageMock.setItem("pc-recents", JSON.stringify(entries));

    const visibleWorkspaceIds = ["productions", "finance"];
    const visibleTabs = [
      { workspace: "productions", tab: "overview" },
      { workspace: "finance", tab: "invoices" },
    ];
    const { result } = renderHook(() => useRecents({ visibleWorkspaceIds, visibleTabs }));
    expect(result.current.recents.length).toBe(2);
    expect(result.current.recents.some(r => r.path.includes("shooting"))).toBe(false);
  });
});
