import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasTimeline, type CanvasTimelineProps } from "./CanvasTimeline";

const defaultProps: CanvasTimelineProps = {
  tasks: [
    { id: "1", title: "Design Phase", start: "2026-03-01", end: "2026-03-15", progress: 0.8 },
    { id: "2", title: "Construction", start: "2026-03-16", end: "2026-06-30", progress: 0.2, dependsOn: ["1"] },
    { id: "3", title: "Phase 1 Complete", start: "2026-06-30", end: "2026-06-30", milestone: true },
  ],
  zoom: "month",
  onZoomChange: vi.fn(),
  onTaskClick: vi.fn(),
  startDate: "2026-03-01",
  endDate: "2026-09-30",
};

describe("CanvasTimeline", () => {
  it("renders task bars", () => {
    render(<CanvasTimeline {...defaultProps} />);
    expect(screen.getAllByText("Design Phase").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Construction").length).toBeGreaterThanOrEqual(1);
  });

  it("renders milestones as diamond markers", () => {
    const { container } = render(<CanvasTimeline {...defaultProps} />);
    expect(container.querySelector("[data-milestone]")).not.toBeNull();
  });

  it("renders dependency arrows", () => {
    const { container } = render(<CanvasTimeline {...defaultProps} />);
    expect(container.querySelector("[data-dependency]")).not.toBeNull();
  });

  it("changes zoom level", () => {
    const onZoomChange = vi.fn();
    render(<CanvasTimeline {...defaultProps} onZoomChange={onZoomChange} />);
    const weekBtn = screen.getByText(/week/i);
    fireEvent.click(weekBtn);
    expect(onZoomChange).toHaveBeenCalledWith("week");
  });

  it("calls onTaskClick when task bar is clicked", () => {
    const onTaskClick = vi.fn();
    render(<CanvasTimeline {...defaultProps} onTaskClick={onTaskClick} />);
    // Click the task bar (role=button with aria-label)
    fireEvent.click(screen.getByLabelText("Design Phase"));
    expect(onTaskClick).toHaveBeenCalledWith("1");
  });

  it("shows progress on task bars", () => {
    const { container } = render(<CanvasTimeline {...defaultProps} />);
    expect(container.querySelector("[data-progress]")).not.toBeNull();
  });

  it("renders zoom controls", () => {
    render(<CanvasTimeline {...defaultProps} />);
    expect(screen.getByText("day")).toBeDefined();
    expect(screen.getByText("week")).toBeDefined();
    expect(screen.getByText("month")).toBeDefined();
    expect(screen.getByText("quarter")).toBeDefined();
  });

  it("renders time headers", () => {
    render(<CanvasTimeline {...defaultProps} />);
    expect(screen.getByText("Task")).toBeDefined();
  });
});
