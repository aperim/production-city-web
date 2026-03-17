import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AttentionItem } from "./AttentionItem";

const defaultProps = {
  id: "item-1",
  type: "approval",
  summary: "Invoice #1234 needs approval",
  workspace: "finance",
  sourceUrl: "/dashboard/finance/invoices",
  priority: "action" as const,
  read: false,
  onMarkRead: vi.fn(),
  onDismiss: vi.fn(),
  onNavigate: vi.fn(),
};

describe("AttentionItem", () => {
  it("renders summary text", () => {
    render(<AttentionItem {...defaultProps} />);
    expect(screen.getByText("Invoice #1234 needs approval")).toBeDefined();
  });

  it("shows mark-read button for unread items", () => {
    render(<AttentionItem {...defaultProps} />);
    expect(screen.getByLabelText(/mark as read/i)).toBeDefined();
  });

  it("hides mark-read button for read items", () => {
    render(<AttentionItem {...defaultProps} read />);
    expect(screen.queryByLabelText(/mark as read/i)).toBeNull();
  });

  it("calls onMarkRead with item ID", () => {
    const onMarkRead = vi.fn();
    render(<AttentionItem {...defaultProps} onMarkRead={onMarkRead} />);
    fireEvent.click(screen.getByLabelText(/mark as read/i));
    expect(onMarkRead).toHaveBeenCalledWith("item-1");
  });

  it("calls onDismiss with item ID", () => {
    const onDismiss = vi.fn();
    render(<AttentionItem {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText(/dismiss/i));
    expect(onDismiss).toHaveBeenCalledWith("item-1");
  });

  it("calls onNavigate when summary is clicked", () => {
    const onNavigate = vi.fn();
    render(<AttentionItem {...defaultProps} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Invoice #1234 needs approval"));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard/finance/invoices");
  });
});
