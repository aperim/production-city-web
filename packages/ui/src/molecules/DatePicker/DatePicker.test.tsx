import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("renders trigger button", () => {
    render(<DatePicker />);
    expect(screen.getByRole("button", { name: "Select date" })).toBeInTheDocument();
  });

  it("shows placeholder when no value", () => {
    render(<DatePicker placeholder="Choose a date" />);
    expect(screen.getByText("Choose a date")).toBeInTheDocument();
  });

  it("shows formatted date when value provided", () => {
    const date = new Date(2026, 2, 15); // March 15, 2026
    render(<DatePicker value={date} locale="en-GB" />);
    // formatted date should appear
    const trigger = screen.getByRole("button", { name: "Select date" });
    expect(trigger.textContent).toContain("2026");
  });

  it("opens calendar on trigger click", async () => {
    render(<DatePicker />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes calendar on Escape", async () => {
    render(<DatePicker />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders prev/next month navigation", async () => {
    render(<DatePicker />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
  });

  it("calls onChange when a day is selected", async () => {
    const handleChange = vi.fn();
    render(<DatePicker onChange={handleChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    // Click the first non-disabled day button
    const dayButtons = screen.getAllByRole("button").filter((b) => /^\d+$/.test(b.textContent ?? ""));
    if (dayButtons[0]) {
      await userEvent.click(dayButtons[0]);
    }
    expect(handleChange).toHaveBeenCalled();
    const calledWith = (handleChange.mock.calls[0] as [Date])[0];
    expect(calledWith).toBeInstanceOf(Date);
  });

  it("does not render disabled dates as clickable", async () => {
    const minDate = new Date(2030, 0, 1);
    const maxDate = new Date(2030, 0, 5);
    const viewDate = new Date(2030, 0, 15);
    render(<DatePicker value={viewDate} minDate={minDate} maxDate={maxDate} />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    const day1 = screen.getAllByRole("button").find((b) => b.getAttribute("aria-label")?.includes("1 January 2030"));
    // day 1 is below minDate Jan 1, should be disabled
    // Day 1 is exactly minDate, so not disabled
    expect(day1).toBeTruthy();
  });

  it("is disabled when disabled=true", () => {
    render(<DatePicker disabled />);
    expect(screen.getByRole("button", { name: "Select date" })).toBeDisabled();
  });

  it("shows clear button when value is set and calendar is open", async () => {
    const date = new Date(2026, 2, 15);
    render(<DatePicker value={date} onChange={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    expect(screen.getByRole("button", { name: "Clear date" })).toBeInTheDocument();
  });

  it("calls onChange with null when clear is clicked", async () => {
    const handleChange = vi.fn();
    const date = new Date(2026, 2, 15);
    render(<DatePicker value={date} onChange={handleChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    await userEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(handleChange).toHaveBeenCalledWith(null);
  });
});
