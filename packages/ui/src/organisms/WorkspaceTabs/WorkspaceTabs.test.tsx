import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceTabs } from "./WorkspaceTabs";

const tabs = [
  { id: "overview", label: "Overview", path: "/dashboard/productions/overview" },
  { id: "shooting", label: "Shooting", path: "/dashboard/productions/shooting", status: "active" as const },
  { id: "vfx", label: "VFX Pipeline", path: "/dashboard/productions/vfx", status: "coming_soon" as const },
];

describe("WorkspaceTabs", () => {
  it("renders all tabs", () => {
    render(<WorkspaceTabs tabs={tabs} />);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Shooting")).toBeDefined();
    expect(screen.getByText("VFX Pipeline")).toBeDefined();
  });

  it("renders tablist role", () => {
    render(<WorkspaceTabs tabs={tabs} />);
    expect(screen.getByRole("tablist")).toBeDefined();
  });

  it("marks active tab", () => {
    render(<WorkspaceTabs tabs={tabs} activeTab="shooting" />);
    const allTabs = screen.getAllByRole("tab");
    const shootingTab = allTabs.find(t => t.textContent?.includes("Shooting"));
    expect(shootingTab?.getAttribute("aria-selected")).toBe("true");
  });

  it("calls onTabChange with tab id and path", () => {
    const onTabChange = vi.fn();
    render(<WorkspaceTabs tabs={tabs} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("VFX Pipeline"));
    expect(onTabChange).toHaveBeenCalledWith("vfx", "/dashboard/productions/vfx");
  });

  it("renders status dots for tabs with status", () => {
    render(<WorkspaceTabs tabs={tabs} />);
    const statusDots = screen.getAllByRole("status");
    expect(statusDots.length).toBe(2); // shooting (active) + vfx (coming_soon)
  });
});
