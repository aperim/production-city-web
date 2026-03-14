import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionDot } from "./ConnectionDot";

describe("ConnectionDot", () => {
  it("renders with connected state by default", () => {
    render(<ConnectionDot />);
    const dot = screen.getByRole("status");
    expect(dot).toHaveAttribute("aria-label", "Connected");
    expect(dot.className).toContain("bg-emerald-500");
  });

  it("renders reconnecting state with pulse animation", () => {
    render(<ConnectionDot state="reconnecting" />);
    const dot = screen.getByRole("status");
    expect(dot).toHaveAttribute("aria-label", "Reconnecting");
    expect(dot.className).toContain("bg-amber-500");
    expect(dot.className).toContain("animate-pulse");
  });

  it("renders disconnected state", () => {
    render(<ConnectionDot state="disconnected" />);
    const dot = screen.getByRole("status");
    expect(dot).toHaveAttribute("aria-label", "Disconnected");
    expect(dot.className).toContain("bg-red-500");
  });

  it("applies custom size", () => {
    render(<ConnectionDot size="lg" />);
    const dot = screen.getByRole("status");
    expect(dot.className).toContain("h-3");
    expect(dot.className).toContain("w-3");
  });

  it("applies custom className", () => {
    render(<ConnectionDot className="ms-2" />);
    expect(screen.getByRole("status").className).toContain("ms-2");
  });
});
