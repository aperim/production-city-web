import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BadgeCount } from "./BadgeCount";

describe("BadgeCount", () => {
  it("renders count when > 0", () => {
    render(<BadgeCount count={3} />);
    expect(screen.getByText("3")).toBeDefined();
  });

  it("renders nothing when count is 0", () => {
    const { container } = render(<BadgeCount count={0} />);
    expect(container.textContent).toBe("");
  });

  it("renders 99+ when count exceeds 99", () => {
    render(<BadgeCount count={150} />);
    expect(screen.getByText("99+")).toBeDefined();
  });

  it("has aria-label for screen readers", () => {
    render(<BadgeCount count={5} />);
    const badge = screen.getByText("5");
    expect(badge.closest("[aria-label]")?.getAttribute("aria-label")).toBe("5 unread items");
  });
});
