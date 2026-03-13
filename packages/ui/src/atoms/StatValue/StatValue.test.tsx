import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatValue } from "./StatValue";

describe("StatValue", () => {
  it("renders value and label", () => {
    render(<StatValue value="2,025 sqm" label="Total Area" />);
    expect(screen.getByText("2,025 sqm")).toBeInTheDocument();
    expect(screen.getByText("Total Area")).toBeInTheDocument();
  });

  it("renders compact variant", () => {
    const { container } = render(<StatValue value="450" label="Seats" variant="compact" />);
    const el = container.firstElementChild;
    expect(el?.getAttribute("class")).toContain("gap-1");
  });

  it("renders default variant with larger gap", () => {
    const { container } = render(<StatValue value="450" label="Seats" />);
    const el = container.firstElementChild;
    expect(el?.getAttribute("class")).toContain("gap-2");
  });

  it("merges custom className", () => {
    const { container } = render(<StatValue value="10" label="Items" className="custom-class" />);
    const el = container.firstElementChild;
    expect(el?.getAttribute("class")).toContain("custom-class");
  });

  it("uses design system text colors for contrast", () => {
    const { container } = render(<StatValue value="100" label="Test" />);
    const valueEl = container.querySelector(".text-foreground");
    const labelEl = container.querySelector(".text-muted-foreground");
    expect(valueEl).toBeInTheDocument();
    expect(labelEl).toBeInTheDocument();
  });
});
