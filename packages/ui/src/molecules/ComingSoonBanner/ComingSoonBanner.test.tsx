import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComingSoonBanner, type ComingSoonBannerProps } from "./ComingSoonBanner";

const defaultProps: ComingSoonBannerProps = {
  status: "coming_soon",
  targetQuarter: "Q3 2026",
  featureId: "productions.shooting.shoot_scheduling",
  subscribeState: "idle",
  onSubscribe: vi.fn(),
};

describe("ComingSoonBanner", () => {
  it("shows target date for coming_soon status", () => {
    render(<ComingSoonBanner {...defaultProps} />);
    expect(screen.getByText(/Coming Q3 2026/)).toBeDefined();
  });

  it("shows 'Planned' for planned status", () => {
    render(<ComingSoonBanner {...defaultProps} status="planned" targetQuarter={null} />);
    expect(screen.getByText(/Planned/)).toBeDefined();
  });

  it("renders Notify Me button in idle state", () => {
    render(<ComingSoonBanner {...defaultProps} />);
    expect(screen.getByText(/notify me/i)).toBeDefined();
  });

  it("calls onSubscribe when Notify Me is clicked", () => {
    const onSubscribe = vi.fn();
    render(<ComingSoonBanner {...defaultProps} onSubscribe={onSubscribe} />);
    fireEvent.click(screen.getByText(/notify me/i));
    expect(onSubscribe).toHaveBeenCalledWith("productions.shooting.shoot_scheduling");
  });

  it("shows loading state when submitting", () => {
    render(<ComingSoonBanner {...defaultProps} subscribeState="submitting" />);
    expect(screen.getByText(/subscribing/i)).toBeDefined();
  });

  it("shows subscribed confirmation", () => {
    render(<ComingSoonBanner {...defaultProps} subscribeState="subscribed" />);
    expect(screen.getByText(/subscribed/i)).toBeDefined();
  });

  it("shows error state", () => {
    render(<ComingSoonBanner {...defaultProps} subscribeState="error" />);
    expect(screen.getByText(/try again/i)).toBeDefined();
  });
});
