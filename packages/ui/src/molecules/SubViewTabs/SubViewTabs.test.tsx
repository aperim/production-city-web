/**
 * Tests for SubViewTabs molecule.
 * TDD: written before implementation.
 *
 * @see Issue #442
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SubViewTabs, type SubViewTab } from "./SubViewTabs";

const baseTabs: SubViewTab[] = [
  { id: "announcements", label: "Announcements" },
  { id: "categories", label: "Categories" },
  { id: "tags", label: "Tags" },
  { id: "subscriptions", label: "Subscriptions" },
];

describe("SubViewTabs", () => {
  it("renders all tabs", () => {
    render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="announcements"
        onTabChange={() => {}}
      />,
    );
    expect(screen.getByRole("tab", { name: "Announcements" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Categories" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Tags" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Subscriptions" })).toBeDefined();
  });

  it("renders tablist with correct aria-label", () => {
    render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="announcements"
        onTabChange={() => {}}
      />,
    );
    const tablist = screen.getByRole("tablist");
    expect(tablist.getAttribute("aria-label")).toBe("Sub-view navigation");
  });

  it("marks active tab with aria-selected", () => {
    render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="categories"
        onTabChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("tab", { name: "Categories" }).getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen.getByRole("tab", { name: "Announcements" }).getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("calls onTabChange when tab clicked", () => {
    const onTabChange = vi.fn();
    render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="announcements"
        onTabChange={onTabChange}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Tags" }));
    expect(onTabChange).toHaveBeenCalledWith("tags");
  });

  it("renders badges when provided", () => {
    const tabsWithBadge: SubViewTab[] = [
      { id: "announcements", label: "Announcements", badge: 42 },
      { id: "categories", label: "Categories" },
    ];
    render(
      <SubViewTabs
        tabs={tabsWithBadge}
        activeTab="announcements"
        onTabChange={() => {}}
      />,
    );
    expect(screen.getByText("42")).toBeDefined();
  });

  it("filters tabs by permission", () => {
    const tabsWithPerms: SubViewTab[] = [
      { id: "announcements", label: "Announcements", permission: "announcement:read_admin" },
      { id: "categories", label: "Categories", permission: "category:manage" },
      { id: "tags", label: "Tags" },
    ];
    const hasPermission = (p: string) => p === "announcement:read_admin";
    render(
      <SubViewTabs
        tabs={tabsWithPerms}
        activeTab="announcements"
        onTabChange={() => {}}
        hasPermission={hasPermission}
      />,
    );
    expect(screen.getByRole("tab", { name: "Announcements" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Tags" })).toBeDefined();
    expect(screen.queryByRole("tab", { name: "Categories" })).toBeNull();
  });

  it("defaults to first authorized tab when active tab not authorized", () => {
    const tabsWithPerms: SubViewTab[] = [
      { id: "announcements", label: "Announcements", permission: "announcement:read_admin" },
      { id: "categories", label: "Categories", permission: "category:manage" },
      { id: "tags", label: "Tags" },
      { id: "subscriptions", label: "Subscriptions" },
    ];
    const onTabChange = vi.fn();
    const hasPermission = (_p: string) => false;
    render(
      <SubViewTabs
        tabs={tabsWithPerms}
        activeTab="announcements"
        onTabChange={onTabChange}
        hasPermission={hasPermission}
      />,
    );
    // "Tags" and "Subscriptions" (no permission required) should render
    expect(screen.getByRole("tab", { name: "Tags" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Subscriptions" })).toBeDefined();
    expect(onTabChange).toHaveBeenCalledWith("tags");
  });

  it("supports keyboard arrow navigation", () => {
    render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="announcements"
        onTabChange={() => {}}
      />,
    );
    const firstTab = screen.getByRole("tab", { name: "Announcements" });
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    // After arrow right, focus should move to next tab
    expect(document.activeElement?.textContent).toContain("Categories");
  });

  it("wraps keyboard navigation at boundaries", () => {
    render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="subscriptions"
        onTabChange={() => {}}
      />,
    );
    const lastTab = screen.getByRole("tab", { name: "Subscriptions" });
    lastTab.focus();
    fireEvent.keyDown(lastTab, { key: "ArrowRight" });
    expect(document.activeElement?.textContent).toContain("Announcements");
  });

  it("hides tablist when only one tab is visible", () => {
    render(
      <SubViewTabs
        tabs={[{ id: "only", label: "Only Tab" }]}
        activeTab="only"
        onTabChange={() => {}}
      />,
    );
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("handles Home/End keys", () => {
    render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="categories"
        onTabChange={() => {}}
      />,
    );
    const tab = screen.getByRole("tab", { name: "Categories" });
    tab.focus();
    fireEvent.keyDown(tab, { key: "Home" });
    expect(document.activeElement?.textContent).toContain("Announcements");
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement?.textContent).toContain("Subscriptions");
  });

  it("applies custom className", () => {
    const { container } = render(
      <SubViewTabs
        tabs={baseTabs}
        activeTab="announcements"
        onTabChange={() => {}}
        className="custom-class"
      />,
    );
    expect(container.firstElementChild?.classList.contains("custom-class")).toBe(true);
  });
});
