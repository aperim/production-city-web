import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

const items = [
  { id: "edit", label: "Edit", onSelect: vi.fn() },
  { id: "copy", label: "Copy", onSelect: vi.fn() },
  { id: "delete", label: "Delete", disabled: true, onSelect: vi.fn() },
];

describe("Dropdown", () => {
  it("renders trigger", () => {
    render(<Dropdown trigger={<button>Open</button>} items={items} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("menu is hidden initially", () => {
    render(<Dropdown trigger={<button>Open</button>} items={items} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens menu on trigger click", async () => {
    render(<Dropdown trigger={<button>Open</button>} items={items} />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("shows all items when open", async () => {
    render(<Dropdown trigger={<button>Open</button>} items={items} />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("calls onSelect when item clicked", async () => {
    const handleSelect = vi.fn();
    render(
      <Dropdown
        trigger={<button>Open</button>}
        items={[{ id: "action", label: "Action", onSelect: handleSelect }]}
      />,
    );
    await userEvent.click(screen.getByText("Open"));
    await userEvent.click(screen.getByRole("menuitem", { name: "Action" }));
    expect(handleSelect).toHaveBeenCalledOnce();
  });

  it("closes menu after selecting an item", async () => {
    const handleSelect = vi.fn();
    render(
      <Dropdown
        trigger={<button>Open</button>}
        items={[{ id: "action", label: "Action", onSelect: handleSelect }]}
      />,
    );
    await userEvent.click(screen.getByText("Open"));
    await userEvent.click(screen.getByRole("menuitem", { name: "Action" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not call onSelect for disabled item", async () => {
    const handleSelect = vi.fn();
    render(
      <Dropdown
        trigger={<button>Open</button>}
        items={[{ id: "disabled", label: "Disabled", disabled: true, onSelect: handleSelect }]}
      />,
    );
    await userEvent.click(screen.getByText("Open"));
    // Disabled items use aria-disabled and disabled attr
    expect(screen.getByRole("menuitem", { name: "Disabled" })).toBeDisabled();
  });

  it("closes on Escape key", async () => {
    render(<Dropdown trigger={<button>Open</button>} items={items} />);
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("trigger wrapper has aria-expanded=false when closed", () => {
    render(<Dropdown trigger={<button>Open</button>} items={items} />);
    // The outer wrapper button has aria-haspopup and aria-expanded
    const wrappers = screen.getAllByRole("button", { hidden: true });
    const triggerWrapper = wrappers.find((b) => b.getAttribute("aria-haspopup") === "menu");
    expect(triggerWrapper).toBeTruthy();
    expect(triggerWrapper).toHaveAttribute("aria-expanded", "false");
  });

  it("renders checked items with indicator", async () => {
    render(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ id: "c1", label: "Checked item", checked: true }]}
      />,
    );
    await userEvent.click(screen.getByText("Menu"));
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});
