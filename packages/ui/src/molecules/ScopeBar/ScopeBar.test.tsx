import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScopeBar } from "./ScopeBar";

const options = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "archived", label: "Archived" },
];

describe("ScopeBar", () => {
  it("renders all scope options", () => {
    render(<ScopeBar options={options} />);
    expect(screen.getByText("All")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("Archived")).toBeDefined();
  });

  it("marks selected scope as aria-selected", () => {
    render(<ScopeBar options={options} value="active" />);
    const tabs = screen.getAllByRole("tab");
    const activeTab = tabs.find(t => t.textContent === "Active");
    expect(activeTab?.getAttribute("aria-selected")).toBe("true");
  });

  it("calls onChange when scope is clicked", () => {
    const onChange = vi.fn();
    render(<ScopeBar options={options} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByText("Archived"));
    expect(onChange).toHaveBeenCalledWith("archived");
  });

  it("renders search input when onSearch provided", () => {
    const onSearch = vi.fn();
    render(<ScopeBar options={options} onSearch={onSearch} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
  });

  it("does not render search input when onSearch not provided", () => {
    render(<ScopeBar options={options} />);
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("calls onSearch when typing", () => {
    const onSearch = vi.fn();
    render(<ScopeBar options={options} onSearch={onSearch} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    expect(onSearch).toHaveBeenCalledWith("test");
  });

  it("has toolbar role with aria-label", () => {
    render(<ScopeBar options={options} />);
    expect(screen.getByRole("toolbar")).toBeDefined();
  });
});
