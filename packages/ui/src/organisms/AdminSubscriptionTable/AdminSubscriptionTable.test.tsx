import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminSubscriptionTable, maskPhone } from "./AdminSubscriptionTable";
import type { AdminSubscription } from "../../types/announcements";

const subscriptions: AdminSubscription[] = [
  {
    id: "s1",
    categoryId: "c1",
    channel: "email",
    status: "confirmed",
    userName: "Alice",
    email: "alice@example.com",
    phone: "+61412345678",
    createdAt: "2026-03-10T00:00:00Z",
    categoryName: "News",
  },
  {
    id: "s2",
    categoryId: "c2",
    channel: "sms",
    status: "pending",
    userName: "Bob",
    email: "bob@example.com",
    phone: null,
    createdAt: "2026-03-11T00:00:00Z",
    categoryName: "Events",
  },
];

const defaultPagination = { page: 1, totalPages: 1, onPageChange: vi.fn() };

describe("maskPhone", () => {
  it("masks middle digits", () => {
    expect(maskPhone("+61412345678")).toBe("+61*******78");
  });

  it("handles short numbers", () => {
    expect(maskPhone("123")).toBe("***");
  });
});

describe("AdminSubscriptionTable", () => {
  it("renders subscriber names", () => {
    render(
      <AdminSubscriptionTable
        subscriptions={subscriptions}
        onRemove={vi.fn()}
        filters={{}}
        onFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <AdminSubscriptionTable
        subscriptions={[]}
        onRemove={vi.fn()}
        filters={{}}
        onFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("No subscriptions found.")).toBeInTheDocument();
  });

  it("masks phone numbers", () => {
    render(
      <AdminSubscriptionTable
        subscriptions={subscriptions}
        onRemove={vi.fn()}
        filters={{}}
        onFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    // Full phone should not appear
    expect(screen.queryByText("+61412345678")).not.toBeInTheDocument();
    // Masked phone should appear
    expect(screen.getByText("+61*******78")).toBeInTheDocument();
  });

  it("shows dash for null phone", () => {
    render(
      <AdminSubscriptionTable
        subscriptions={subscriptions}
        onRemove={vi.fn()}
        filters={{}}
        onFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("calls onRemove when Remove is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <AdminSubscriptionTable
        subscriptions={subscriptions}
        onRemove={onRemove}
        filters={{}}
        onFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    const removeBtns = screen.getAllByText("Remove");
    await user.click(removeBtns[0]!);
    expect(onRemove).toHaveBeenCalledWith("s1");
  });

  it("renders filter dropdowns", () => {
    render(
      <AdminSubscriptionTable
        subscriptions={subscriptions}
        onRemove={vi.fn()}
        filters={{}}
        onFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by channel")).toBeInTheDocument();
  });

  it("calls onFilter when status filter changes", async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(
      <AdminSubscriptionTable
        subscriptions={subscriptions}
        onRemove={vi.fn()}
        filters={{}}
        onFilter={onFilter}
        pagination={defaultPagination}
      />,
    );
    await user.selectOptions(screen.getByLabelText("Filter by status"), "confirmed");
    expect(onFilter).toHaveBeenCalledWith({ status: "confirmed" });
  });
});
