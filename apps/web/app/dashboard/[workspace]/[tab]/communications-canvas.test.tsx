/**
 * Integration tests for Communications canvas wiring.
 *
 * Tests routing, sub-view switching, and permission gating
 * for the Communications tab in the Administration workspace.
 *
 * @see Issue #444
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CommunicationsCanvas } from "@productioncity/holding-ui";

describe("Communications canvas integration", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders CommunicationsCanvas with all 4 sub-views", () => {
    render(
      <CommunicationsCanvas
        activeView="announcements"
        onTabChange={() => {}}
        hasPermission={() => true}
        announcementsContent={<div>Announcements</div>}
        categoriesContent={<div>Categories</div>}
        tagsContent={<div>Tags</div>}
        subscriptionsContent={<div>Subscriptions</div>}
      />,
    );
    expect(screen.getByRole("tab", { name: "Announcements" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Categories" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Tags" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Subscriptions" })).toBeDefined();
  });

  it("switches sub-view on tab click", () => {
    const onTabChange = vi.fn();
    render(
      <CommunicationsCanvas
        activeView="announcements"
        onTabChange={onTabChange}
        hasPermission={() => true}
        announcementsContent={<div>Announcements</div>}
        categoriesContent={<div>Categories</div>}
        tagsContent={<div>Tags</div>}
        subscriptionsContent={<div>Subscriptions</div>}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Categories" }));
    expect(onTabChange).toHaveBeenCalledWith("categories");
  });

  it("hides sub-views user lacks permission for", () => {
    render(
      <CommunicationsCanvas
        activeView="announcements"
        onTabChange={() => {}}
        hasPermission={(p) => p === "announcement:read_admin" || p === "tag:manage"}
        announcementsContent={<div>Announcements</div>}
        categoriesContent={<div>Categories</div>}
        tagsContent={<div>Tags</div>}
        subscriptionsContent={<div>Subscriptions</div>}
      />,
    );
    // Only Announcements and Tags tabs visible (2 tabs, so tablist renders)
    expect(screen.getByRole("tab", { name: "Announcements" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Tags" })).toBeDefined();
    expect(screen.queryByRole("tab", { name: "Categories" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Subscriptions" })).toBeNull();
  });

  it("renders correct content for active view", () => {
    render(
      <CommunicationsCanvas
        activeView="tags"
        onTabChange={() => {}}
        hasPermission={() => true}
        announcementsContent={<div data-testid="ann">Ann</div>}
        categoriesContent={<div data-testid="cat">Cat</div>}
        tagsContent={<div data-testid="tag">Tags content</div>}
        subscriptionsContent={<div data-testid="sub">Sub</div>}
      />,
    );
    expect(screen.getByTestId("tag")).toBeDefined();
    expect(screen.queryByTestId("ann")).toBeNull();
  });
});
