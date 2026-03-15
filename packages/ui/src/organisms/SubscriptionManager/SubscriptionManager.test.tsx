import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionManager } from "./SubscriptionManager";
import type { Category, Subscription } from "../../types/announcements";

const categories: Category[] = [
  { id: "c1", name: "News", slug: "news" },
  { id: "c2", name: "Events", slug: "events" },
];

const subscriptions: Subscription[] = [
  { id: "s1", categoryId: "c1", channel: "email", status: "confirmed" },
  { id: "s2", categoryId: "c2", channel: "email", status: "pending" },
];

const noop = vi.fn();

describe("SubscriptionManager", () => {
  it("renders all categories", () => {
    render(
      <SubscriptionManager
        categories={categories}
        subscriptions={[]}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("News")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
  });

  it("renders empty state when no categories", () => {
    render(
      <SubscriptionManager
        categories={[]}
        subscriptions={[]}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("No categories available for subscription.")).toBeInTheDocument();
  });

  it("shows existing subscription status", () => {
    render(
      <SubscriptionManager
        categories={categories}
        subscriptions={subscriptions}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows no phone warning when hasPhone is false", () => {
    render(
      <SubscriptionManager
        categories={categories}
        subscriptions={[]}
        hasPhone={false}
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(
      screen.getByText(/Add a phone number/),
    ).toBeInTheDocument();
  });

  it("shows resend button for pending subscriptions", () => {
    render(
      <SubscriptionManager
        categories={categories}
        subscriptions={subscriptions}
        hasPhone
        onSubscribe={noop}
        onUnsubscribe={noop}
        onResend={noop}
      />,
    );
    expect(screen.getByText("Resend")).toBeInTheDocument();
  });
});
