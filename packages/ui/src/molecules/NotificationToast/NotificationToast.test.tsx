import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationToast } from "./NotificationToast";

describe("NotificationToast", () => {
  it("renders message text", () => {
    render(<NotificationToast message="New EOI received" />);
    expect(screen.getByText("New EOI received")).toBeInTheDocument();
  });

  it("has role=alert", () => {
    render(<NotificationToast message="Test" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses aria-live=polite for info variant", () => {
    render(<NotificationToast message="Test" variant="info" />);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "polite");
  });

  it("uses aria-live=assertive for warning variant", () => {
    render(<NotificationToast message="Urgent" variant="warning" />);
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });

  it("calls onDismiss when dismiss button clicked", () => {
    const onDismiss = vi.fn();
    render(<NotificationToast message="Test" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText("Dismiss notification"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not render dismiss button when onDismiss is not provided", () => {
    render(<NotificationToast message="Test" />);
    expect(screen.queryByLabelText("Dismiss notification")).toBeNull();
  });

  it("renders optional icon", () => {
    render(<NotificationToast message="Test" icon={<span data-testid="icon">!</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
