import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeDashboard, type HomeDashboardProps } from "./HomeDashboard";

const defaultProps: HomeDashboardProps = {
  attentionItems: [
    { id: "1", type: "approval", summary: "Invoice #1234 needs approval", workspace: "finance", sourceUrl: "/dashboard/finance/invoices", priority: "action", createdAt: new Date().toISOString() },
  ],
  recents: [
    { label: "Shooting — Productions", path: "/dashboard/productions/shooting", timestamp: new Date().toISOString() },
  ],
  workspaceCards: [
    {
      workspace: { id: "productions", label: "Productions", icon: "film", description: "Film production" },
      stats: [{ label: "Active", value: "3" }],
      activeFeatureCount: 5,
      upcomingFeatureCount: 10,
      tabs: [{ id: "overview", label: "Overview", status: "active" as const }],
      onNavigate: vi.fn(),
    },
  ],
  whatsNew: [
    { featureId: "feat.1", label: "Crew Directory", workspace: "people", activatedAt: new Date().toISOString() },
  ],
  onNavigate: vi.fn(),
  onRecentClick: vi.fn(),
};

describe("HomeDashboard", () => {
  it("renders attention section with items", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText(/needs your attention/i)).toBeDefined();
    expect(screen.getByText(/Invoice #1234/)).toBeDefined();
  });

  it("renders empty attention state", () => {
    render(<HomeDashboard {...defaultProps} attentionItems={[]} />);
    expect(screen.getByText(/all caught up/i)).toBeDefined();
  });

  it("renders recents section", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText("Shooting — Productions")).toBeDefined();
  });

  it("renders empty recents state", () => {
    render(<HomeDashboard {...defaultProps} recents={[]} />);
    expect(screen.getByText(/start exploring/i)).toBeDefined();
  });

  it("renders workspace cards", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText("Productions")).toBeDefined();
  });

  it("renders what's new section", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText("Crew Directory")).toBeDefined();
  });

  it("hides what's new when empty", () => {
    render(<HomeDashboard {...defaultProps} whatsNew={[]} />);
    expect(screen.queryByText(/what's new/i)).toBeNull();
  });
});
