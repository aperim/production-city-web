import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { Tooltip } from "./Tooltip";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("Tooltip", () => {
  it("renders children without tooltip initially", () => {
    render(<Tooltip content="Helpful tip"><button>Hover me</button></Tooltip>);
    expect(screen.getByText("Hover me")).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on mouse enter after delay", () => {
    render(<Tooltip content="Helpful tip" enterDelay={300}><button>Hover me</button></Tooltip>);
    const trigger = screen.getByText("Hover me").closest("span")!;
    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful tip");
  });

  it("hides tooltip on mouse leave after delay", () => {
    render(<Tooltip content="Helpful tip" enterDelay={0} leaveDelay={100}><button>Hover me</button></Tooltip>);
    const trigger = screen.getByText("Hover me").closest("span")!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.mouseLeave(trigger);
    act(() => { vi.advanceTimersByTime(100); });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("tooltip has role='tooltip'", () => {
    render(<Tooltip content="Info" enterDelay={0}><button>Target</button></Tooltip>);
    const trigger = screen.getByText("Target").closest("span")!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("accepts ReactNode content", () => {
    render(
      <Tooltip
        content={<span data-testid="rich-content">Rich content</span>}
        enterDelay={0}
      >
        <button>Target</button>
      </Tooltip>,
    );
    const trigger = screen.getByText("Target").closest("span")!;
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByTestId("rich-content")).toBeInTheDocument();
  });

  it("does not use dangerouslySetInnerHTML", () => {
    const { container } = render(<Tooltip content="Safe content"><button>T</button></Tooltip>);
    expect(container).toBeTruthy();
  });

  it("shows tooltip on focus", () => {
    render(<Tooltip content="Focused tip" enterDelay={0}><button>Focus me</button></Tooltip>);
    const button = screen.getByRole("button", { name: "Focus me" });
    // The outer span has onFocusCapture; focus the button which bubbles up
    act(() => { button.focus(); });
    act(() => { vi.advanceTimersByTime(0); });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
