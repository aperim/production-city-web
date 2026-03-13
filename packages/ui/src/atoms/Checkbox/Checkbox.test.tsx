import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox, CheckboxGroup } from "./Checkbox";

describe("Checkbox", () => {
  it("renders without errors", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("associates label with checkbox", () => {
    render(<Checkbox label="Accept" id="accept" />);
    expect(screen.getByText("Accept")).toHaveAttribute("for", "accept");
    expect(screen.getByRole("checkbox")).toHaveAttribute("id", "accept");
  });

  it("auto-generates id", () => {
    render(<Checkbox label="Accept" />);
    const label = screen.getByText("Accept");
    const checkbox = screen.getByRole("checkbox");
    const forAttr = label.getAttribute("for");
    expect(forAttr).toBeTruthy();
    expect(checkbox.getAttribute("id")).toBe(forAttr);
  });

  it("renders description", () => {
    render(<Checkbox label="Accept" description="You must accept to continue" />);
    expect(screen.getByText("You must accept to continue")).toBeInTheDocument();
  });

  it("renders disabled state", () => {
    render(<Checkbox label="Accept" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("renders checked state", () => {
    render(<Checkbox label="Accept" defaultChecked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("fires onChange when clicked", async () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Accept" onChange={handleChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledOnce();
  });

  it("sets indeterminate property", () => {
    render(<Checkbox label="Select all" indeterminate />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it("sets aria-checked='mixed' when indeterminate", () => {
    render(<Checkbox label="Select all" indeterminate />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("forwards ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Accept" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe("CheckboxGroup", () => {
  it("renders all options", () => {
    const options = [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
    ];
    render(<CheckboxGroup options={options} />);
    expect(screen.getByLabelText("Option A")).toBeInTheDocument();
    expect(screen.getByLabelText("Option B")).toBeInTheDocument();
  });

  it("renders legend when label provided", () => {
    render(<CheckboxGroup label="Permissions" options={[{ value: "a", label: "A" }]} />);
    expect(screen.getByText("Permissions")).toBeInTheDocument();
  });

  it("renders select all checkbox", () => {
    const options = [
      { value: "a", label: "A", checked: false },
      { value: "b", label: "B", checked: false },
    ];
    render(<CheckboxGroup options={options} selectAll />);
    expect(screen.getByLabelText("Select all")).toBeInTheDocument();
  });

  it("select all is checked when all options are checked", () => {
    const options = [
      { value: "a", label: "A", checked: true },
      { value: "b", label: "B", checked: true },
    ];
    render(<CheckboxGroup options={options} selectAll />);
    expect(screen.getByLabelText("Select all")).toBeChecked();
  });
});
