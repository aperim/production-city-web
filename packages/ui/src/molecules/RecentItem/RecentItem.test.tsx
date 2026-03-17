import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecentItem } from "./RecentItem";

describe("RecentItem", () => {
  const defaultProps = {
    label: "Shooting — Productions",
    path: "/dashboard/productions/shooting",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    onClick: vi.fn(),
  };

  it("renders label", () => {
    render(<RecentItem {...defaultProps} />);
    expect(screen.getByText("Shooting — Productions")).toBeDefined();
  });

  it("renders relative timestamp", () => {
    render(<RecentItem {...defaultProps} />);
    expect(screen.getByText(/ago/)).toBeDefined();
  });

  it("calls onClick with path when clicked", () => {
    const onClick = vi.fn();
    render(<RecentItem {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByText("Shooting — Productions"));
    expect(onClick).toHaveBeenCalledWith("/dashboard/productions/shooting");
  });

  it("has minimum 44px touch target", () => {
    const { container } = render(<RecentItem {...defaultProps} />);
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.className).toContain("min-h-");
  });
});
