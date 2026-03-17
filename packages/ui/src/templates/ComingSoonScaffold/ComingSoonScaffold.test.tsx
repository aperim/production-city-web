import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComingSoonScaffold, type ComingSoonScaffoldProps } from "./ComingSoonScaffold";

const defaultProps: ComingSoonScaffoldProps = {
  featureId: "productions.shooting.shoot_scheduling",
  featureName: "Shoot Scheduling",
  description: "Plan and manage shooting schedules for your productions.",
  status: "coming_soon",
  targetQuarter: "Q3 2026",
  wireframeType: "calendar",
  subscribeState: "idle",
  onSubscribe: vi.fn(),
  relatedFeatures: [
    { id: "feat.1", label: "Overview", path: "/dashboard/productions/overview" },
    { id: "feat.2", label: "Team", path: "/dashboard/productions/team" },
  ],
};

describe("ComingSoonScaffold", () => {
  it("renders feature name", () => {
    render(<ComingSoonScaffold {...defaultProps} />);
    expect(screen.getByText("Shoot Scheduling")).toBeDefined();
  });

  it("renders description", () => {
    render(<ComingSoonScaffold {...defaultProps} />);
    expect(screen.getByText(/Plan and manage shooting schedules/)).toBeDefined();
  });

  it("renders ComingSoonBanner", () => {
    render(<ComingSoonScaffold {...defaultProps} />);
    expect(screen.getByText(/Coming Q3 2026/)).toBeDefined();
  });

  it("renders wireframe preview", () => {
    const { container } = render(<ComingSoonScaffold {...defaultProps} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders related features section", () => {
    render(<ComingSoonScaffold {...defaultProps} />);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Team")).toBeDefined();
  });

  it("omits related features section when empty", () => {
    render(<ComingSoonScaffold {...defaultProps} relatedFeatures={[]} />);
    expect(screen.queryByText("Active features")).toBeNull();
  });
});
