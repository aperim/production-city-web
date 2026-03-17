import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CanvasBoard, type CanvasBoardProps } from "./CanvasBoard";

const defaultProps: CanvasBoardProps = {
  lanes: [
    { id: "todo", label: "To Do", wipLimit: 5 },
    { id: "in-progress", label: "In Progress", wipLimit: 3 },
    { id: "done", label: "Done" },
  ],
  cards: [
    { id: "1", laneId: "todo", title: "Script Breakdown", subtitle: "Project Alpha", assignee: "JD" },
    { id: "2", laneId: "in-progress", title: "Location Scouting", subtitle: "Project Beta", assignee: "AB" },
    { id: "3", laneId: "done", title: "Casting", subtitle: "Project Alpha" },
  ],
  onCardMove: vi.fn(),
  onCardClick: vi.fn(),
};

describe("CanvasBoard", () => {
  it("renders all lanes", () => {
    render(<CanvasBoard {...defaultProps} />);
    expect(screen.getByText("To Do")).toBeDefined();
    expect(screen.getByText("In Progress")).toBeDefined();
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("renders cards in correct lanes", () => {
    render(<CanvasBoard {...defaultProps} />);
    expect(screen.getByText("Script Breakdown")).toBeDefined();
    expect(screen.getByText("Location Scouting")).toBeDefined();
    expect(screen.getByText("Casting")).toBeDefined();
  });

  it("shows lane card counts", () => {
    render(<CanvasBoard {...defaultProps} />);
    // Each lane header should show count — "1/5" for To Do lane (1 card, wipLimit 5)
    expect(screen.getByText("1/5")).toBeDefined();
  });

  it("shows WIP limit indicator when set", () => {
    render(<CanvasBoard {...defaultProps} />);
    // "To Do" lane has wipLimit 5, with 1 card — should show "1/5"
    expect(screen.getByText(/\/5/)).toBeDefined();
  });

  it("calls onCardClick when card is clicked", () => {
    const onCardClick = vi.fn();
    render(<CanvasBoard {...defaultProps} onCardClick={onCardClick} />);
    screen.getByText("Script Breakdown").click();
    expect(onCardClick).toHaveBeenCalledWith("1");
  });

  it("renders empty lane", () => {
    render(<CanvasBoard {...defaultProps} cards={[]} />);
    expect(screen.getByText("To Do")).toBeDefined();
    // Lanes should still render even with no cards
  });

  it("has ARIA live region for drag announcements", () => {
    const { container } = render(<CanvasBoard {...defaultProps} />);
    expect(container.querySelector("[aria-live]")).not.toBeNull();
  });
});
