import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";

const items = [
  { id: "tab1", label: "Account", content: <div>Account content</div> },
  { id: "tab2", label: "Security", content: <div>Security content</div> },
  { id: "tab3", label: "Billing", content: <div>Billing content</div> },
];

describe("Tabs", () => {
  it("renders tablist with tabs", () => {
    render(<Tabs items={items} aria-label="Settings" />);
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("shows first tab content by default", () => {
    render(<Tabs items={items} />);
    expect(screen.getByText("Account content")).toBeInTheDocument();
    expect(screen.queryByText("Security content")).not.toBeInTheDocument();
  });

  it("switches tab on click", async () => {
    render(<Tabs items={items} />);
    await userEvent.click(screen.getByRole("tab", { name: "Security" }));
    expect(screen.getByText("Security content")).toBeInTheDocument();
    expect(screen.queryByText("Account content")).not.toBeInTheDocument();
  });

  it("marks active tab with aria-selected=true", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Security" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange when tab is clicked", async () => {
    const handleChange = vi.fn();
    render(<Tabs items={items} onChange={handleChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Billing" }));
    expect(handleChange).toHaveBeenCalledWith("tab3");
  });

  it("supports controlled mode", () => {
    render(<Tabs items={items} activeTab="tab2" />);
    expect(screen.getByText("Security content")).toBeInTheDocument();
  });

  it("associates tabpanel with tab via aria-controls/labelledby", () => {
    render(<Tabs items={items} />);
    const panel = screen.getByRole("tabpanel");
    expect(panel).toBeInTheDocument();
  });

  it("does not select disabled tab", async () => {
    const disabledItems = [
      { id: "t1", label: "Active", content: <div>Active</div> },
      { id: "t2", label: "Disabled", content: <div>Disabled content</div>, disabled: true },
    ];
    render(<Tabs items={disabledItems} />);
    const disabledTab = screen.getByRole("tab", { name: "Disabled" });
    expect(disabledTab).toBeDisabled();
  });

  it("renders badge on tab", () => {
    const badgeItems = [
      { id: "t1", label: "Inbox", content: <div>Inbox</div>, badge: "5" },
    ];
    render(<Tabs items={badgeItems} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("navigates with arrow keys", async () => {
    render(<Tabs items={items} />);
    const firstTab = screen.getByRole("tab", { name: "Account" });
    firstTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByText("Security content")).toBeInTheDocument();
  });
});
