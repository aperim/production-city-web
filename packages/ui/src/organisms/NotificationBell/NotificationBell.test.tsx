import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationBell } from "./NotificationBell";

describe("NotificationBell", () => {
  it("renders bell button", () => {
    render(<NotificationBell />);
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("shows badge when count > 0", () => {
    render(<NotificationBell count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("hides badge when count is 0", () => {
    render(<NotificationBell count={0} />);
    expect(screen.queryByText("0")).toBeNull();
  });

  it("toggles panel on click", () => {
    const onToggle = vi.fn();
    render(
      <NotificationBell
        onToggle={onToggle}
        panel={<div data-testid="panel">Panel content</div>}
      />,
    );
    fireEvent.click(screen.getByLabelText("Notifications"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();
    expect(onToggle).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByLabelText("Notifications"));
    expect(screen.queryByTestId("panel")).toBeNull();
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("sets aria-expanded and aria-haspopup correctly", () => {
    render(<NotificationBell panel={<div>Panel</div>} />);
    const button = screen.getByLabelText("Notifications");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls");
  });

  it("closes on Escape key", () => {
    render(<NotificationBell panel={<div data-testid="panel">Panel</div>} />);
    fireEvent.click(screen.getByLabelText("Notifications"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("panel")).toBeNull();
  });
});
