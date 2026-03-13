import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./Accordion";

const items = [
  { id: "a1", heading: "What is this?", content: <div>This is an accordion.</div> },
  { id: "a2", heading: "How does it work?", content: <div>Click to expand.</div> },
  { id: "a3", heading: "Can I disable items?", content: <div>Yes, use disabled prop.</div>, disabled: true },
];

describe("Accordion", () => {
  it("renders all item headings", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("What is this?")).toBeInTheDocument();
    expect(screen.getByText("How does it work?")).toBeInTheDocument();
    expect(screen.getByText("Can I disable items?")).toBeInTheDocument();
  });

  it("all items collapsed by default", () => {
    render(<Accordion items={items} />);
    const triggers = screen.getAllByRole("button");
    triggers.filter((t) => !(t as HTMLButtonElement).disabled).forEach((trigger) => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("expands item on click", async () => {
    render(<Accordion items={items} />);
    await userEvent.click(screen.getByRole("button", { name: /What is this?/ }));
    expect(screen.getByRole("button", { name: /What is this?/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("This is an accordion.")).toBeVisible();
  });

  it("collapses already-open item on click", async () => {
    render(<Accordion items={items} />);
    const trigger = screen.getByRole("button", { name: /What is this?/ });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes others in single mode", async () => {
    render(<Accordion items={items} />);
    await userEvent.click(screen.getByRole("button", { name: /What is this?/ }));
    await userEvent.click(screen.getByRole("button", { name: /How does it work?/ }));
    expect(screen.getByRole("button", { name: /What is this?/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /How does it work?/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("allows multiple open in multiple mode", async () => {
    render(<Accordion items={items} multiple />);
    await userEvent.click(screen.getByRole("button", { name: /What is this?/ }));
    await userEvent.click(screen.getByRole("button", { name: /How does it work?/ }));
    expect(screen.getByRole("button", { name: /What is this?/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /How does it work?/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("disabled item cannot be clicked", () => {
    render(<Accordion items={items} />);
    expect(screen.getByRole("button", { name: /Can I disable items?/ })).toBeDisabled();
  });

  it("calls onOpenChange when item toggled", async () => {
    const handleChange = vi.fn();
    render(<Accordion items={items} onOpenChange={handleChange} />);
    await userEvent.click(screen.getByRole("button", { name: /What is this?/ }));
    expect(handleChange).toHaveBeenCalledWith(["a1"]);
  });

  it("supports defaultOpen on item", () => {
    const withDefault = [
      { id: "d1", heading: "Open by default", content: <div>Default open content</div>, defaultOpen: true },
    ];
    render(<Accordion items={withDefault} />);
    expect(screen.getByRole("button", { name: /Open by default/ })).toHaveAttribute("aria-expanded", "true");
  });

  it("supports controlled mode", () => {
    render(<Accordion items={items} openItems={["a2"]} />);
    expect(screen.getByRole("button", { name: /How does it work?/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /What is this?/ })).toHaveAttribute("aria-expanded", "false");
  });
});
