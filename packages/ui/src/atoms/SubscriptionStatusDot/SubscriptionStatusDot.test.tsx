import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubscriptionStatusDot } from "./SubscriptionStatusDot";

describe("SubscriptionStatusDot", () => {
  it("renders pending label", () => {
    render(<SubscriptionStatusDot status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders confirmed label", () => {
    render(<SubscriptionStatusDot status="confirmed" />);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("renders declined label", () => {
    render(<SubscriptionStatusDot status="declined" />);
    expect(screen.getByText("Declined")).toBeInTheDocument();
  });

  it("renders expired label", () => {
    render(<SubscriptionStatusDot status="expired" />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("applies amber colour for pending", () => {
    const { container } = render(
      <SubscriptionStatusDot status="pending" />,
    );
    const dot = container.querySelectorAll("span")[1];
    expect(dot?.className).toContain("bg-amber");
  });

  it("applies emerald colour for confirmed", () => {
    const { container } = render(
      <SubscriptionStatusDot status="confirmed" />,
    );
    const dot = container.querySelectorAll("span")[1];
    expect(dot?.className).toContain("bg-emerald");
  });
});
