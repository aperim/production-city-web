import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContentBlockPicker } from "./ContentBlockPicker";

describe("ContentBlockPicker", () => {
  it("renders all block type buttons", () => {
    render(<ContentBlockPicker onSelect={vi.fn()} />);
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Spacer")).toBeInTheDocument();
  });

  it("calls onSelect with correct type when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ContentBlockPicker onSelect={onSelect} />);
    await user.click(screen.getByText("Header"));
    expect(onSelect).toHaveBeenCalledWith("header");
  });

  it("disables all buttons when disabled", () => {
    render(<ContentBlockPicker onSelect={vi.fn()} disabled />);
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
  });

  it("has aria-label for the picker container", () => {
    render(<ContentBlockPicker onSelect={vi.fn()} />);
    expect(screen.getByLabelText("Add content block")).toBeInTheDocument();
  });
});
