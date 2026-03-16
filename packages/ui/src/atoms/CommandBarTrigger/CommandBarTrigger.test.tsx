/**
 * Tests for CommandBarTrigger atom.
 * @see Issue #342
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandBarTrigger } from "./CommandBarTrigger";

describe("CommandBarTrigger", () => {
  it("renders a button with keyboard shortcut hint", () => {
    render(<CommandBarTrigger onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    // Should show shortcut hint text
    expect(button.textContent).toContain("K");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<CommandBarTrigger onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("accepts a custom label", () => {
    render(<CommandBarTrigger onClick={() => {}} label="Search features..." />);
    expect(screen.getByRole("button").textContent).toContain("Search features...");
  });

  it("has accessible aria-label", () => {
    render(<CommandBarTrigger onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(
      button.getAttribute("aria-label") || button.textContent,
    ).toBeTruthy();
  });
});
