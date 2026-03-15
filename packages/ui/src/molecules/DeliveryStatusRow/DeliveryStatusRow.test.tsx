import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeliveryStatusRow } from "./DeliveryStatusRow";

function renderRow(props: Parameters<typeof DeliveryStatusRow>[0]) {
  return render(
    <table>
      <tbody>
        <DeliveryStatusRow {...props} />
      </tbody>
    </table>,
  );
}

describe("DeliveryStatusRow", () => {
  it("renders user name", () => {
    renderRow({
      userName: "Alice",
      channel: "email",
      status: "delivered",
      sentAt: "2026-03-10T10:00:00Z",
      deliveredAt: "2026-03-10T10:01:00Z",
      openedAt: null,
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders status label", () => {
    renderRow({
      userName: "Bob",
      channel: "sms",
      status: "queued",
      sentAt: null,
      deliveredAt: null,
      openedAt: null,
    });
    expect(screen.getByText("Queued")).toBeInTheDocument();
  });

  it("shows error message for failed status", () => {
    renderRow({
      userName: "Charlie",
      channel: "email",
      status: "failed",
      sentAt: "2026-03-10T10:00:00Z",
      deliveredAt: null,
      openedAt: null,
      error: "Mailbox full",
    });
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Mailbox full")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    const { container } = renderRow({
      userName: "Dave",
      channel: "email",
      status: "sent",
      sentAt: null,
      deliveredAt: null,
      openedAt: null,
      loading: true,
    });
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
    expect(screen.queryByText("Dave")).not.toBeInTheDocument();
  });

  it("shows dash for missing timestamps", () => {
    renderRow({
      userName: "Eve",
      channel: "email",
      status: "queued",
      sentAt: null,
      deliveredAt: null,
      openedAt: null,
    });
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(3);
  });

  it("renders delivered status with emerald styling", () => {
    const { container } = renderRow({
      userName: "Frank",
      channel: "email",
      status: "delivered",
      sentAt: "2026-03-10T10:00:00Z",
      deliveredAt: "2026-03-10T10:01:00Z",
      openedAt: null,
    });
    const statusEl = container.querySelector(".text-emerald-400");
    expect(statusEl).toBeInTheDocument();
  });

  it("renders suppressed status", () => {
    renderRow({
      userName: "Grace",
      channel: "email",
      status: "suppressed",
      sentAt: null,
      deliveredAt: null,
      openedAt: null,
    });
    expect(screen.getByText("Suppressed")).toBeInTheDocument();
  });
});
