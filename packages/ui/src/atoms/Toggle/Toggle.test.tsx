import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("renders without errors", () => {
    render(<Toggle label="Dark mode" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders label", () => {
    render(<Toggle label="Enable notifications" id="notif" />);
    expect(screen.getByText("Enable notifications")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<Toggle label="Dark mode" description="Switch between themes" />);
    expect(screen.getByText("Switch between themes")).toBeInTheDocument();
  });

  it("starts unchecked by default", () => {
    render(<Toggle label="Dark mode" />);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("renders checked state via defaultChecked", () => {
    render(<Toggle label="Dark mode" defaultChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("renders disabled state", () => {
    render(<Toggle label="Dark mode" disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("fires onChange when toggled", async () => {
    const handleChange = vi.fn();
    render(<Toggle label="Dark mode" onChange={handleChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(handleChange).toHaveBeenCalledOnce();
  });

  it("does not fire onChange when disabled", async () => {
    const handleChange = vi.fn();
    render(<Toggle label="Dark mode" disabled onChange={handleChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("forwards ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Toggle label="Dark mode" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
  });
});
