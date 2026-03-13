import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";

const trigger = <button className="rounded border px-3 py-1.5">Info</button>;
const content = <div><p>Popover content</p><button>Action</button></div>;

describe("Popover", () => {
  it("renders trigger", () => {
    render(<Popover trigger={trigger} content={content} />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("panel is hidden initially", () => {
    render(<Popover trigger={trigger} content={content} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens panel on trigger click", async () => {
    render(<Popover trigger={trigger} content={content} />);
    await userEvent.click(screen.getByText("Info"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows content when open", async () => {
    render(<Popover trigger={trigger} content={content} />);
    await userEvent.click(screen.getByText("Info"));
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    render(<Popover trigger={trigger} content={content} />);
    await userEvent.click(screen.getByText("Info"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows close button when showClose=true", async () => {
    render(<Popover trigger={trigger} content={<p>Info</p>} showClose />);
    await userEvent.click(screen.getByText("Info"));
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("closes when close button clicked", async () => {
    render(<Popover trigger={trigger} content={<p>Info</p>} showClose />);
    await userEvent.click(screen.getByText("Info"));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onOpenChange when toggled", async () => {
    const handleChange = vi.fn();
    render(<Popover trigger={trigger} content={content} onOpenChange={handleChange} />);
    await userEvent.click(screen.getByText("Info"));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("sets aria-modal on dialog", async () => {
    render(<Popover trigger={trigger} content={content} aria-label="Details" />);
    await userEvent.click(screen.getByText("Info"));
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("supports controlled mode", () => {
    render(<Popover trigger={trigger} content={content} open={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not show panel when controlled open=false", () => {
    render(<Popover trigger={trigger} content={content} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
