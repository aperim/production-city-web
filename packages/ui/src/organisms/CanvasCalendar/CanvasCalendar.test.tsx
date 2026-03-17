import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasCalendar, type CanvasCalendarProps } from "./CanvasCalendar";

const defaultProps: CanvasCalendarProps = {
  view: "month",
  date: new Date("2026-03-15"),
  events: [
    { id: "1", title: "Stage 1 Booking", start: "2026-03-15T09:00:00Z", end: "2026-03-15T17:00:00Z", resourceId: "stage-1" },
    { id: "2", title: "Stage 2 Booking", start: "2026-03-15T10:00:00Z", end: "2026-03-15T14:00:00Z", resourceId: "stage-2" },
  ],
  onViewChange: vi.fn(),
  onDateChange: vi.fn(),
  onEventClick: vi.fn(),
  onSlotClick: vi.fn(),
};

describe("CanvasCalendar", () => {
  it("renders month view by default", () => {
    render(<CanvasCalendar {...defaultProps} />);
    // Should show month name
    expect(screen.getByText(/March 2026/)).toBeDefined();
  });

  it("renders events", () => {
    render(<CanvasCalendar {...defaultProps} />);
    expect(screen.getByText("Stage 1 Booking")).toBeDefined();
  });

  it("switches to week view", () => {
    const onViewChange = vi.fn();
    render(<CanvasCalendar {...defaultProps} onViewChange={onViewChange} />);
    const weekBtn = screen.getByText(/week/i);
    fireEvent.click(weekBtn);
    expect(onViewChange).toHaveBeenCalledWith("week");
  });

  it("navigates to next month", () => {
    const onDateChange = vi.fn();
    render(<CanvasCalendar {...defaultProps} onDateChange={onDateChange} />);
    const nextBtn = screen.getByLabelText(/next/i);
    fireEvent.click(nextBtn);
    expect(onDateChange).toHaveBeenCalled();
  });

  it("calls onEventClick when event is clicked", () => {
    const onEventClick = vi.fn();
    render(<CanvasCalendar {...defaultProps} onEventClick={onEventClick} />);
    fireEvent.click(screen.getByText("Stage 1 Booking"));
    expect(onEventClick).toHaveBeenCalledWith("1");
  });

  it("shows conflict indicator for overlapping events", () => {
    const events = [
      { id: "1", title: "A", start: "2026-03-15T09:00:00Z", end: "2026-03-15T12:00:00Z", resourceId: "stage-1" },
      { id: "2", title: "B", start: "2026-03-15T10:00:00Z", end: "2026-03-15T14:00:00Z", resourceId: "stage-1" },
    ];
    const { container } = render(<CanvasCalendar {...defaultProps} events={events} view="day" />);
    // Overlapping events on same resource should have conflict styling
    expect(container.querySelector("[data-conflict]")).not.toBeNull();
  });

  it("renders today button", () => {
    render(<CanvasCalendar {...defaultProps} />);
    expect(screen.getByText(/today/i)).toBeDefined();
  });
});
