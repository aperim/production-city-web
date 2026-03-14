import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationItem } from "./NotificationItem";

describe("NotificationItem", () => {
  it("renders message text", () => {
    render(<NotificationItem message="New EOI received" />);
    expect(screen.getByText("New EOI received")).toBeInTheDocument();
  });

  it("renders timestamp", () => {
    render(<NotificationItem message="Test" timestamp="2 min ago" />);
    expect(screen.getByText("2 min ago")).toBeInTheDocument();
  });

  it("shows unread indicator dot when not read", () => {
    const { container } = render(<NotificationItem message="Test" read={false} />);
    expect(container.querySelector(".rounded-full.bg-primary")).toBeInTheDocument();
  });

  it("hides unread indicator when read", () => {
    const { container } = render(<NotificationItem message="Test" read />);
    expect(container.querySelector(".rounded-full.bg-primary")).toBeNull();
  });

  it("applies muted text style when read", () => {
    render(<NotificationItem message="Test" read />);
    expect(screen.getByText("Test").className).toContain("text-muted-foreground");
  });

  it("renders action button and fires callback", () => {
    const onAction = vi.fn();
    render(<NotificationItem message="Test" actionLabel="View" onAction={onAction} />);
    fireEvent.click(screen.getByText("View"));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("fires onSelect when clicked", () => {
    const onSelect = vi.fn();
    render(<NotificationItem message="Test" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("action click does not trigger onSelect", () => {
    const onSelect = vi.fn();
    const onAction = vi.fn();
    render(<NotificationItem message="Test" onSelect={onSelect} actionLabel="View" onAction={onAction} />);
    fireEvent.click(screen.getByText("View"));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
