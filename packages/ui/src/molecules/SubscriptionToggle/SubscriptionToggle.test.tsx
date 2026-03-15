import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionToggle } from "./SubscriptionToggle";

const category = { id: "1", name: "News", slug: "news", description: "Latest news" };
const noop = vi.fn();

describe("SubscriptionToggle", () => {
  it("renders category name", () => {
    render(
      <SubscriptionToggle
        category={category}
        emailStatus={null}
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("News")).toBeInTheDocument();
  });

  it("renders category description", () => {
    render(
      <SubscriptionToggle
        category={category}
        emailStatus={null}
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("Latest news")).toBeInTheDocument();
  });

  it("shows subscribe buttons when not subscribed", () => {
    render(
      <SubscriptionToggle
        category={category}
        emailStatus={null}
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    const subscribeBtns = screen.getAllByText("Subscribe");
    expect(subscribeBtns).toHaveLength(2);
  });

  it("shows unsubscribe button when email is confirmed", () => {
    render(
      <SubscriptionToggle
        category={category}
        emailStatus="confirmed"
        emailSubscriptionId="sub-1"
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("Unsubscribe")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("shows resend button when email is pending", () => {
    render(
      <SubscriptionToggle
        category={category}
        emailStatus="pending"
        emailSubscriptionId="sub-1"
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("Resend")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("calls onSubscribe with email channel", async () => {
    const user = userEvent.setup();
    const onSubscribe = vi.fn();
    render(
      <SubscriptionToggle
        category={category}
        emailStatus={null}
        smsStatus={null}
        hasPhone
        onSubscribe={onSubscribe}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    const subscribeBtns = screen.getAllByText("Subscribe");
    await user.click(subscribeBtns[0]!);
    expect(onSubscribe).toHaveBeenCalledWith("email");
  });

  it("calls onResend for pending subscription", async () => {
    const user = userEvent.setup();
    const onResend = vi.fn();
    render(
      <SubscriptionToggle
        category={category}
        emailStatus="pending"
        emailSubscriptionId="sub-1"
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={onResend}
      />,
    );
    await user.click(screen.getByText("Resend"));
    expect(onResend).toHaveBeenCalledWith("sub-1");
  });

  it("disables SMS subscribe button when hasPhone is false", () => {
    render(
      <SubscriptionToggle
        category={category}
        emailStatus={null}
        smsStatus={null}
        hasPhone={false}
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    const subscribeBtns = screen.getAllByText("Subscribe");
    // Second subscribe button is SMS
    expect(subscribeBtns[1]).toBeDisabled();
  });

  it("shows error message", () => {
    render(
      <SubscriptionToggle
        category={category}
        emailStatus={null}
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
        error="Failed to update subscription"
      />,
    );
    expect(
      screen.getByText("Failed to update subscription"),
    ).toBeInTheDocument();
  });

  it("applies loading state", () => {
    const { container } = render(
      <SubscriptionToggle
        category={category}
        emailStatus={null}
        smsStatus={null}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
        loading
      />,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("opacity-60");
  });
});
