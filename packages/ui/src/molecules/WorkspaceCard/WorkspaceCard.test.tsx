import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceCard, type WorkspaceCardProps } from "./WorkspaceCard";

const defaultProps: WorkspaceCardProps = {
  workspace: {
    id: "productions",
    label: "Productions",
    icon: "film",
    description: "Film, TV, and broadcast production lifecycle",
  },
  stats: [{ label: "Active Productions", value: "3" }, { label: "In Post", value: "1" }],
  activeFeatureCount: 8,
  upcomingFeatureCount: 15,
  tabs: [
    { id: "overview", label: "Overview", status: "active" as const },
    { id: "shooting", label: "Shooting", status: "coming_soon" as const },
    { id: "workflow", label: "Workflow", status: "planned" as const },
  ],
  primaryAction: { label: "My Productions", onClick: vi.fn() },
  onNavigate: vi.fn(),
};

describe("WorkspaceCard", () => {
  it("renders workspace name", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText("Productions")).toBeDefined();
  });

  it("renders summary stats", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText(/Active Productions/)).toBeDefined();
  });

  it("renders feature counts", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText(/8 active/)).toBeDefined();
    expect(screen.getByText(/15 upcoming/)).toBeDefined();
  });

  it("renders primary action button", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText("My Productions")).toBeDefined();
  });

  it("calls primaryAction onClick when button is clicked", () => {
    const onClick = vi.fn();
    render(<WorkspaceCard {...defaultProps} primaryAction={{ label: "Test", onClick }} />);
    fireEvent.click(screen.getByText("Test"));
    expect(onClick).toHaveBeenCalled();
  });

  it("expands to show tabs on chevron click", () => {
    render(<WorkspaceCard {...defaultProps} />);
    // Tabs should be hidden initially
    expect(screen.queryByText("Overview")).toBeNull();
    // Click expand
    const expandBtn = screen.getByLabelText(/expand/i);
    fireEvent.click(expandBtn);
    // Tabs should now be visible
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Shooting")).toBeDefined();
    expect(screen.getByText("Workflow")).toBeDefined();
  });

  it("calls onNavigate when card body is clicked", () => {
    const onNavigate = vi.fn();
    render(<WorkspaceCard {...defaultProps} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Productions"));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard/productions");
  });

  it("renders no stats when stats array is empty", () => {
    render(<WorkspaceCard {...defaultProps} stats={[]} />);
    expect(screen.queryByText("Active Productions")).toBeNull();
  });

  it("renders no primary action when not provided", () => {
    render(<WorkspaceCard {...defaultProps} primaryAction={undefined} />);
    expect(screen.queryByText("My Productions")).toBeNull();
  });
});
