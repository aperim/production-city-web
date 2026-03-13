import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

describe("Select", () => {
  it("renders without errors", () => {
    render(<Select label="Fruit" options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("associates label with select", () => {
    render(<Select label="Fruit" id="fruit-select" options={options} />);
    expect(screen.getByText("Fruit")).toHaveAttribute("for", "fruit-select");
    expect(screen.getByRole("combobox")).toHaveAttribute("id", "fruit-select");
  });

  it("renders all options", () => {
    render(<Select label="Fruit" options={options} />);
    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cherry" })).toBeInTheDocument();
  });

  it("renders placeholder as disabled option", () => {
    render(<Select label="Fruit" options={options} placeholder="Select a fruit" />);
    const placeholder = screen.getByRole("option", { name: "Select a fruit" });
    expect(placeholder).toBeDisabled();
  });

  it("renders grouped options", () => {
    const grouped = [
      {
        label: "Citrus",
        options: [
          { label: "Lemon", value: "lemon" },
          { label: "Orange", value: "orange" },
        ],
      },
    ];
    render(<Select label="Fruit" options={grouped} />);
    expect(screen.getByRole("option", { name: "Lemon" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Orange" })).toBeInTheDocument();
  });

  it("shows helper text", () => {
    render(<Select label="Fruit" options={options} helperText="Pick your favourite" />);
    expect(screen.getByText("Pick your favourite")).toBeInTheDocument();
  });

  it("shows error message and sets aria-invalid", () => {
    render(<Select label="Fruit" options={options} errorMessage="Please select a fruit" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Please select a fruit")).toBeInTheDocument();
  });

  it("renders disabled state", () => {
    render(<Select label="Fruit" options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("fires onChange when value changes", async () => {
    const handleChange = vi.fn();
    render(<Select label="Fruit" options={options} onChange={handleChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "banana");
    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards ref to select element", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<Select label="Fruit" options={options} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});
