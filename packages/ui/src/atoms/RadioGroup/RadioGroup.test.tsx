import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup";

const options = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

describe("RadioGroup", () => {
  it("renders all options", () => {
    render(<RadioGroup options={options} />);
    expect(screen.getByLabelText("Small")).toBeInTheDocument();
    expect(screen.getByLabelText("Medium")).toBeInTheDocument();
    expect(screen.getByLabelText("Large")).toBeInTheDocument();
  });

  it("renders legend when label provided", () => {
    render(<RadioGroup label="Size" options={options} />);
    expect(screen.getByText("Size")).toBeInTheDocument();
  });

  it("renders all radios with the same name", () => {
    render(<RadioGroup name="size" options={options} />);
    const radios = screen.getAllByRole("radio");
    const allSameName = radios.every((r) => r.getAttribute("name") === "size");
    expect(allSameName).toBe(true);
  });

  it("selects option when value is provided", () => {
    render(<RadioGroup options={options} value="medium" onValueChange={() => {}} />);
    expect(screen.getByLabelText("Medium")).toBeChecked();
    expect(screen.getByLabelText("Small")).not.toBeChecked();
  });

  it("fires onValueChange when selecting", async () => {
    const handleChange = vi.fn();
    render(<RadioGroup options={options} onValueChange={handleChange} />);
    await userEvent.click(screen.getByLabelText("Large"));
    expect(handleChange).toHaveBeenCalledWith("large");
  });

  it("renders description for each option", () => {
    const withDesc = [
      { value: "a", label: "A", description: "Description A" },
    ];
    render(<RadioGroup options={withDesc} />);
    expect(screen.getByText("Description A")).toBeInTheDocument();
  });

  it("disables all radios when group disabled", () => {
    render(<RadioGroup options={options} disabled />);
    const radios = screen.getAllByRole("radio");
    expect(radios.every((r) => (r as HTMLInputElement).disabled)).toBe(true);
  });

  it("disables individual option when option.disabled is set", () => {
    const withDisabled = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
    ];
    render(<RadioGroup options={withDisabled} />);
    expect(screen.getByLabelText("B")).toBeDisabled();
    expect(screen.getByLabelText("A")).not.toBeDisabled();
  });

  it("renders in horizontal orientation", () => {
    const { container } = render(<RadioGroup options={options} orientation="horizontal" />);
    const optionsContainer = container.querySelector(".flex-row");
    expect(optionsContainer).toBeInTheDocument();
  });

  it("renders with defaultValue in uncontrolled mode", () => {
    render(<RadioGroup options={options} defaultValue="medium" />);
    expect(screen.getByLabelText("Medium")).toBeChecked();
  });
});
