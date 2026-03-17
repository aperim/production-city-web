import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InboxFeed, type InboxFeedProps, type InboxFeedItem } from "./InboxFeed";

const mockItems: InboxFeedItem[] = [
  {
    id: "item-1",
    type: "approval",
    summary: "Invoice #1234 needs approval",
    workspace: "finance",
    sourceUrl: "/dashboard/finance/invoices",
    priority: "action",
    read: false,
    dismissed: false,
    actionable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-2",
    type: "mention",
    summary: "You were mentioned in Production Alpha",
    workspace: "productions",
    sourceUrl: "/dashboard/productions/overview",
    priority: "info",
    read: true,
    dismissed: false,
    actionable: false,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "item-3",
    type: "system",
    summary: "System maintenance scheduled",
    workspace: null,
    sourceUrl: "/dashboard/administration/health",
    priority: "info",
    read: false,
    dismissed: false,
    actionable: false,
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
];

const defaultProps: InboxFeedProps = {
  items: mockItems,
  loading: false,
  totalUnread: 2,
  totalActionable: 1,
  hasMore: false,
  onMarkRead: vi.fn(),
  onDismiss: vi.fn(),
  onLoadMore: vi.fn(),
  onNavigate: vi.fn(),
  activeFilters: {},
  onFilterChange: vi.fn(),
};

describe("InboxFeed", () => {
  it("renders list of inbox items", () => {
    render(<InboxFeed {...defaultProps} />);
    expect(screen.getByText("Invoice #1234 needs approval")).toBeDefined();
    expect(screen.getByText("You were mentioned in Production Alpha")).toBeDefined();
    expect(screen.getByText("System maintenance scheduled")).toBeDefined();
  });

  it("shows empty state when no items", () => {
    render(<InboxFeed {...defaultProps} items={[]} totalUnread={0} totalActionable={0} />);
    expect(screen.getByText(/no items/i)).toBeDefined();
  });

  it("calls onMarkRead when mark-read button clicked", () => {
    const onMarkRead = vi.fn();
    render(<InboxFeed {...defaultProps} onMarkRead={onMarkRead} />);
    const markReadBtn = screen.getAllByLabelText(/mark as read/i)[0]!;
    fireEvent.click(markReadBtn);
    expect(onMarkRead).toHaveBeenCalledWith("item-1");
  });

  it("calls onDismiss when dismiss button clicked", () => {
    const onDismiss = vi.fn();
    render(<InboxFeed {...defaultProps} onDismiss={onDismiss} />);
    const dismissBtn = screen.getAllByLabelText(/dismiss/i)[0]!;
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledWith("item-1");
  });

  it("filters by type", () => {
    const onFilterChange = vi.fn();
    render(<InboxFeed {...defaultProps} onFilterChange={onFilterChange} />);
    const typeFilter = screen.getByLabelText(/filter by type/i);
    fireEvent.change(typeFilter, { target: { value: "approval" } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ type: "approval" }));
  });

  it("filters by workspace", () => {
    const onFilterChange = vi.fn();
    render(<InboxFeed {...defaultProps} onFilterChange={onFilterChange} />);
    const wsFilter = screen.getByLabelText(/filter by workspace/i);
    fireEvent.change(wsFilter, { target: { value: "finance" } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ workspace: "finance" }));
  });

  it("loads more items on click", () => {
    const onLoadMore = vi.fn();
    render(<InboxFeed {...defaultProps} hasMore onLoadMore={onLoadMore} />);
    const loadMoreBtn = screen.getByText(/load more/i);
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<InboxFeed {...defaultProps} loading items={[]} />);
    expect(container.querySelectorAll('[data-testid="inbox-skeleton"]').length).toBeGreaterThan(0);
  });
});
