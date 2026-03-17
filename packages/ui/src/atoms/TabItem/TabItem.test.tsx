import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabItem } from "./TabItem";

describe("TabItem", () => {
  it("renders label text", () => {
    render(<TabItem label="Overview" />);
    expect(screen.getByRole("tab")).toBeDefined();
    expect(screen.getByText("Overview")).toBeDefined();
  });

  it("sets aria-selected when active", () => {
    render(<TabItem label="Overview" active />);
    expect(screen.getByRole("tab").getAttribute("aria-selected")).toBe("true");
  });

  it("does not set aria-selected when inactive", () => {
    render(<TabItem label="Overview" />);
    expect(screen.getByRole("tab").getAttribute("aria-selected")).not.toBe("true");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<TabItem label="Overview" onClick={onClick} />);
    fireEvent.click(screen.getByRole("tab"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders status dot when status provided", () => {
    render(<TabItem label="Overview" status="active" />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("does not render status dot when no status", () => {
    render(<TabItem label="Overview" />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
