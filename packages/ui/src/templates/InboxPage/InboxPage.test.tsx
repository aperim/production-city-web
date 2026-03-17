import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InboxPage, type InboxPageProps } from "./InboxPage";
import type { InboxFeedItem } from "../../organisms/InboxFeed/InboxFeed";

const mockItems: InboxFeedItem[] = [
  {
    id: "item-1",
    type: "approval",
    summary: "Invoice needs approval",
    workspace: "finance",
    sourceUrl: "/dashboard/finance",
    priority: "action",
    read: false,
    dismissed: false,
    actionable: true,
    createdAt: new Date().toISOString(),
  },
];

const defaultProps: InboxPageProps = {
  items: mockItems,
  loading: false,
  totalUnread: 1,
  totalActionable: 1,
  hasMore: false,
  onMarkRead: vi.fn(),
  onDismiss: vi.fn(),
  onLoadMore: vi.fn(),
  onMarkAllRead: vi.fn(),
  onNavigate: vi.fn(),
  activeFilters: {},
  onFilterChange: vi.fn(),
};

describe("InboxPage", () => {
  it("renders page title", () => {
    render(<InboxPage {...defaultProps} />);
    expect(screen.getByText("Inbox")).toBeDefined();
  });

  it("renders mark all as read button when unread items exist", () => {
    render(<InboxPage {...defaultProps} />);
    expect(screen.getByText(/mark all as read/i)).toBeDefined();
  });

  it("hides mark all as read when no unread items", () => {
    render(<InboxPage {...defaultProps} totalUnread={0} />);
    expect(screen.queryByText(/mark all as read/i)).toBeNull();
  });

  it("calls onMarkAllRead when button clicked", () => {
    const onMarkAllRead = vi.fn();
    render(<InboxPage {...defaultProps} onMarkAllRead={onMarkAllRead} />);
    fireEvent.click(screen.getByText(/mark all as read/i));
    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it("renders inbox feed items", () => {
    render(<InboxPage {...defaultProps} />);
    expect(screen.getByText("Invoice needs approval")).toBeDefined();
  });

  it("renders empty state when no items", () => {
    render(<InboxPage {...defaultProps} items={[]} totalUnread={0} totalActionable={0} />);
    expect(screen.getByText(/no items/i)).toBeDefined();
  });
});
