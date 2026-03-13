import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders label", () => {
    render(<Tag label="React" />);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders remove button when onRemove provided", () => {
    render(<Tag label="React" onRemove={() => {}} />);
    expect(screen.getByRole("button", { name: "Remove React" })).toBeInTheDocument();
  });

  it("calls onRemove when remove button clicked", async () => {
    const handleRemove = vi.fn();
    render(<Tag label="React" onRemove={handleRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove React" }));
    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it("does not render remove button without onRemove", () => {
    render(<Tag label="React" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders as button when selectable (onSelect provided)", () => {
    render(<Tag label="TypeScript" onSelect={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onSelect when selectable tag clicked", async () => {
    const handleSelect = vi.fn();
    render(<Tag label="TypeScript" onSelect={handleSelect} />);
    await userEvent.click(screen.getByRole("button"));
    expect(handleSelect).toHaveBeenCalledOnce();
  });

  it("sets aria-pressed when selectable", () => {
    render(<Tag label="TypeScript" onSelect={() => {}} selected={true} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("renders icon when provided", () => {
    render(<Tag label="React" icon={<span>★</span>} />);
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("applies size variant", () => {
    const { container } = render(<Tag label="small" size="sm" />);
    expect(container.firstChild).toHaveClass("text-xs");
  });

  it("applies variant class", () => {
    const { container } = render(<Tag label="error" variant="error" />);
    expect(container.firstChild).toHaveClass("text-red-800");
  });
});
