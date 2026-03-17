import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAIContext } from "./useAIContext";

// Mock useRegistry
vi.mock("../components/RegistryProvider", () => ({
  useRegistry: () => ({
    visibleWorkspaceIds: ["productions", "finance"],
    getVisibleTabIds: (wsId: string) => {
      if (wsId === "productions") return ["overview", "shooting", "pre-production"];
      if (wsId === "finance") return ["invoices", "budgets"];
      return [];
    },
    currentPhase: "company_formation",
  }),
}));

describe("useAIContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns workspace and tab from current path", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/productions/overview" },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useAIContext());
    expect(result.current.workspace).toBe("productions");
    expect(result.current.tab).toBe("overview");
  });

  it("returns null context when on home", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/home" },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useAIContext());
    expect(result.current.workspace).toBeNull();
    expect(result.current.tab).toBeNull();
  });

  it("returns null context when on inbox", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/inbox" },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useAIContext());
    expect(result.current.workspace).toBeNull();
    expect(result.current.tab).toBeNull();
  });

  it("returns visible workspace IDs", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/productions/overview" },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useAIContext());
    expect(result.current.visibleWorkspaceIds).toContain("productions");
    expect(result.current.visibleWorkspaceIds).toContain("finance");
  });

  it("returns workspace with no tab when only workspace segment present", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/productions" },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useAIContext());
    expect(result.current.workspace).toBe("productions");
    expect(result.current.tab).toBeNull();
  });

  it("formats context object for API submission", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/finance/invoices" },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useAIContext());
    const apiContext = result.current.toAPIContext();
    expect(apiContext).toEqual({
      workspace: "finance",
      tab: "invoices",
      visibleWorkspaceIds: ["productions", "finance"],
    });
  });

  it("formats null context for API when not in workspace", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/home" },
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useAIContext());
    const apiContext = result.current.toAPIContext();
    expect(apiContext).toEqual({
      workspace: null,
      tab: null,
      visibleWorkspaceIds: ["productions", "finance"],
    });
  });
});
