import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecTable } from "./SpecTable";

const rows = [
  { label: "Floor area", value: "2,025 m²" },
  { label: "To grid", value: "15 m" },
];

describe("SpecTable", () => {
  it("renders a description list", () => {
    const { container } = render(<SpecTable rows={rows} />);
    expect(container.querySelector("dl")).toBeInTheDocument();
  });

  it("renders all labels as dt", () => {
    render(<SpecTable rows={rows} />);
    expect(screen.getByText("Floor area")).toBeInTheDocument();
    expect(screen.getByText("To grid")).toBeInTheDocument();
  });

  it("renders all values as dd", () => {
    render(<SpecTable rows={rows} />);
    expect(screen.getByText("2,025 m²")).toBeInTheDocument();
    expect(screen.getByText("15 m")).toBeInTheDocument();
  });

  it("renders empty with no rows", () => {
    const { container } = render(<SpecTable rows={[]} />);
    expect(container.querySelector("dl")?.children).toHaveLength(0);
  });
});
