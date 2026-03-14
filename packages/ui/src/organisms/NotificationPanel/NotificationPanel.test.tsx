import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationPanel } from "./NotificationPanel";

const sampleNotifications = [
  { id: "1", message: "New EOI received", timestamp: "2 min ago", read: false },
  { id: "2", message: "User approved", timestamp: "1 hr ago", read: true },
  { id: "3", message: "Approval needed", timestamp: "Just now", read: false, actionLabel: "View" },
];

describe("NotificationPanel", () => {
  it("renders notifications list", () => {
    render(<NotificationPanel notifications={sampleNotifications} />);
    expect(screen.getByText("New EOI received")).toBeInTheDocument();
    expect(screen.getByText("User approved")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<NotificationPanel notifications={[]} />);
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<NotificationPanel notifications={[]} loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows mark all read button when there are unread items", () => {
    const onMarkAllRead = vi.fn();
    render(<NotificationPanel notifications={sampleNotifications} onMarkAllRead={onMarkAllRead} />);
    fireEvent.click(screen.getByText("Mark all as read"));
    expect(onMarkAllRead).toHaveBeenCalledOnce();
  });

  it("hides mark all read when all are read", () => {
    render(
      <NotificationPanel
        notifications={[{ id: "1", message: "Test", read: true }]}
        onMarkAllRead={() => {}}
      />,
    );
    expect(screen.queryByText("Mark all as read")).toBeNull();
  });

  it("calls onSelect with notification id", () => {
    const onSelect = vi.fn();
    render(<NotificationPanel notifications={sampleNotifications} onSelect={onSelect} />);
    fireEvent.click(screen.getAllByRole("button")[0]!);
    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("uses custom title", () => {
    render(<NotificationPanel notifications={[]} title="Alerts" />);
    expect(screen.getByText("Alerts")).toBeInTheDocument();
  });
});
