import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlannedFeatureCard } from "./PlannedFeatureCard";

describe("PlannedFeatureCard", () => {
  it("renders feature name", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Shoot Scheduling" description="Plan shooting schedules" status="coming_soon" targetQuarter="Q3 2026" onNotify={vi.fn()} />);
    expect(screen.getByText("Shoot Scheduling")).toBeDefined();
  });

  it("renders description", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="A description" status="planned" onNotify={vi.fn()} />);
    expect(screen.getByText("A description")).toBeDefined();
  });

  it("shows target date for coming_soon", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="coming_soon" targetQuarter="Q3 2026" onNotify={vi.fn()} />);
    expect(screen.getByText(/Q3 2026/)).toBeDefined();
  });

  it("uses the actual targetQuarter prop (not hardcoded)", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="coming_soon" targetQuarter="Q4 2027" onNotify={vi.fn()} />);
    expect(screen.getByText(/Q4 2027/)).toBeDefined();
  });

  it("shows 'Planned' for planned status", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="planned" onNotify={vi.fn()} />);
    expect(screen.getByText(/Planned/i)).toBeDefined();
  });

  it("renders notify button", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="planned" onNotify={vi.fn()} />);
    expect(screen.getByText(/notify/i)).toBeDefined();
  });

  it("calls onNotify when notify button clicked", () => {
    const onNotify = vi.fn();
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="planned" onNotify={onNotify} />);
    fireEvent.click(screen.getByText(/notify/i));
    expect(onNotify).toHaveBeenCalledWith("feat.1");
  });

  it("truncates long descriptions to 2 lines", () => {
    const { container } = render(<PlannedFeatureCard featureId="feat.1" label="Test" description="A very long description that should be truncated after two lines of text" status="planned" onNotify={vi.fn()} />);
    const desc = container.querySelector("[data-description]");
    expect(desc?.className).toContain("line-clamp-2");
  });
});
