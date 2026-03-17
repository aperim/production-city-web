import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

// Mock the RegistryProvider used by DashboardPage
vi.mock("../dashboard/components/RegistryProvider", () => {
  return {
    RegistryProvider: ({ children }: { children: React.ReactNode }) => children,
    useRegistry: () => ({
      visibleFeatureIds: [],
      currentPhase: "company_formation",
      visibleWorkspaceIds: [
        "productions", "facilities", "finance", "people", "campus",
        "events", "education", "analytics", "investor-relations",
        "partnerships", "administration",
      ],
      isWorkspaceVisible: () => true,
      getVisibleTabIds: (workspaceId: string) => {
        // Return a default tab for each workspace
        const tabMap: Record<string, string[]> = {
          productions: ["overview"],
          facilities: ["calendar"],
          finance: ["overview"],
          people: ["directory"],
          campus: ["master-plan"],
          events: ["calendar"],
          education: ["courses"],
          analytics: ["operational"],
          "investor-relations": ["portfolio"],
          partnerships: ["overview"],
          administration: ["users"],
        };
        return tabMap[workspaceId] ?? [];
      },
    }),
  };
});

import DashboardPage from "../dashboard/page";

describe("DashboardPage (Phase 2 — HomeDashboard)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders workspace cards grid", () => {
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Your Workspaces");
  });

  it("renders all 11 workspace cards for admin (all visible)", () => {
    const html = renderToString(createElement(DashboardPage));
    // All 11 workspaces should appear as cards
    expect(html).toContain("Productions");
    expect(html).toContain("Facilities");
    expect(html).toContain("Finance");
    expect(html).toContain("People");
    expect(html).toContain("Campus");
    expect(html).toContain("Events");
    expect(html).toContain("Education");
    expect(html).toContain("Analytics");
    expect(html).toContain("Investor Relations");
    expect(html).toContain("Partnerships");
    expect(html).toContain("Administration");
  });

  it("renders attention section with empty state", () => {
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Needs Your Attention");
    expect(html).toContain("all caught up");
  });

  it("renders recents section with empty state", () => {
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Pick Up Where You Left Off");
    expect(html).toContain("Start exploring");
  });

  it("does not render old RoleDashboard (Phase 1)", () => {
    const html = renderToString(createElement(DashboardPage));
    // Should NOT contain Phase 1 patterns
    expect(html).not.toContain("Welcome back");
    expect(html).not.toContain("Administrator");
  });
});
