import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationBadge } from "./NotificationBadge";

describe("NotificationBadge", () => {
  it("renders nothing when count is 0", () => {
    const { container } = render(<NotificationBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when count is undefined", () => {
    const { container } = render(<NotificationBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders count for values 1-99", () => {
    render(<NotificationBadge count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByLabelText("5 unread notifications")).toBeInTheDocument();
  });

  it("caps display at 99+", () => {
    render(<NotificationBadge count={150} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
    expect(screen.getByLabelText("150 unread notifications")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<NotificationBadge count={3} className="absolute top-0" />);
    expect(screen.getByText("3").className).toContain("absolute");
  });
});
