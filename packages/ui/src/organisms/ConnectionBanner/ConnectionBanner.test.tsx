import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectionBanner } from "./ConnectionBanner";

describe("ConnectionBanner", () => {
  it("renders nothing when state is null", () => {
    const { container } = render(<ConnectionBanner state={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when state is undefined", () => {
    const { container } = render(<ConnectionBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders disconnected banner with default message", () => {
    render(<ConnectionBanner state="disconnected" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Real-time updates unavailable. You may experience delays.")).toBeInTheDocument();
  });

  it("renders reconnecting banner with default message", () => {
    render(<ConnectionBanner state="reconnecting" />);
    expect(screen.getByText("Reconnecting to real-time updates...")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ConnectionBanner state="disconnected" message="Custom message" />);
    expect(screen.getByText("Custom message")).toBeInTheDocument();
  });

  it("dismisses on button click", () => {
    const onDismiss = vi.fn();
    render(<ConnectionBanner state="disconnected" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("applies amber styling for reconnecting state", () => {
    render(<ConnectionBanner state="reconnecting" />);
    expect(screen.getByRole("alert").className).toContain("bg-amber-500/10");
  });

  it("applies red styling for disconnected state", () => {
    render(<ConnectionBanner state="disconnected" />);
    expect(screen.getByRole("alert").className).toContain("bg-red-500/10");
  });

  it("re-shows after dismiss when state changes", () => {
    const { rerender } = render(<ConnectionBanner state="disconnected" />);
    fireEvent.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByRole("alert")).toBeNull();

    // State changes to reconnecting — banner should re-appear
    rerender(<ConnectionBanner state="reconnecting" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Reconnecting to real-time updates...")).toBeInTheDocument();
  });
});
