import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("pc-theme");
    } catch {
      // localStorage may not be available in test env
    }
  });

  it("renders with light/dark labels", () => {
    render(<ThemeToggle />);
    expect(screen.getByText("Light")).toBeDefined();
    expect(screen.getByText("Dark")).toBeDefined();
  });

  it("toggles dark class on html element", () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists preference to localStorage", () => {
    // Mock localStorage for this test
    const store: Record<string, string> = {};
    const mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
    };
    Object.defineProperty(window, "localStorage", { value: mockStorage, writable: true });

    render(<ThemeToggle />);
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(store["pc-theme"]).toBe("dark");
    fireEvent.click(toggle);
    expect(store["pc-theme"]).toBe("light");
  });

  it("syncs across tabs via storage event", () => {
    render(<ThemeToggle />);
    // Simulate storage event from another tab
    fireEvent(
      window,
      new StorageEvent("storage", {
        key: "pc-theme",
        newValue: "dark",
      }),
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("renders custom labels", () => {
    render(<ThemeToggle lightLabel="Day" darkLabel="Night" />);
    expect(screen.getByText("Day")).toBeDefined();
    expect(screen.getByText("Night")).toBeDefined();
  });
});
