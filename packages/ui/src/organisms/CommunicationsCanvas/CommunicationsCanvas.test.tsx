/**
 * Tests for CommunicationsCanvas organism.
 * TDD: written before implementation.
 *
 * @see Issue #442
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommunicationsCanvas } from "./CommunicationsCanvas";

const defaultProps = {
  onTabChange: vi.fn(),
  hasPermission: () => true,
  announcementsContent: <div data-testid="announcements-content">Announcements</div>,
  categoriesContent: <div data-testid="categories-content">Categories</div>,
  tagsContent: <div data-testid="tags-content">Tags</div>,
  subscriptionsContent: <div data-testid="subscriptions-content">Subscriptions</div>,
};

describe("CommunicationsCanvas", () => {
  it("renders SubViewTabs with 4 sub-views", () => {
    render(<CommunicationsCanvas {...defaultProps} />);
    expect(screen.getByRole("tab", { name: "Announcements" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Categories" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Tags" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Subscriptions" })).toBeDefined();
  });

  it("defaults to announcements sub-view", () => {
    render(<CommunicationsCanvas {...defaultProps} />);
    expect(screen.getByTestId("announcements-content")).toBeDefined();
  });

  it("renders specified active view", () => {
    render(<CommunicationsCanvas {...defaultProps} activeView="categories" />);
    expect(screen.getByTestId("categories-content")).toBeDefined();
  });

  it("switches content when tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<CommunicationsCanvas {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "Tags" }));
    expect(onTabChange).toHaveBeenCalledWith("tags");
  });

  it("hides tabs user lacks permission for", () => {
    const hasPermission = (p: string) => p !== "category:manage";
    render(
      <CommunicationsCanvas
        {...defaultProps}
        hasPermission={hasPermission}
      />,
    );
    expect(screen.queryByRole("tab", { name: "Categories" })).toBeNull();
    expect(screen.getByRole("tab", { name: "Announcements" })).toBeDefined();
  });

  it("renders loading state", () => {
    render(
      <CommunicationsCanvas
        {...defaultProps}
        loading
        activeView="announcements"
      />,
    );
    // Loading should show skeleton/loading indicator
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("renders error state", () => {
    render(
      <CommunicationsCanvas
        {...defaultProps}
        error="Something went wrong"
        activeView="announcements"
      />,
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();
  });

  it("renders empty state", () => {
    render(
      <CommunicationsCanvas
        {...defaultProps}
        empty
        activeView="announcements"
      />,
    );
    expect(screen.getByText(/no announcements/i)).toBeDefined();
  });

  it("renders access denied for specific sub-view", () => {
    render(
      <CommunicationsCanvas
        {...defaultProps}
        accessDenied
        activeView="announcements"
      />,
    );
    expect(screen.getByText(/access denied/i)).toBeDefined();
  });

  it("accepts custom className", () => {
    const { container } = render(
      <CommunicationsCanvas {...defaultProps} className="custom" />,
    );
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});
