import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceTable } from "./ServiceTable";

const rows = [
  { number: "01", name: "Virtual production", description: "Pre-vis to final composite." },
  { number: "02", name: "Set construction", description: "Full-scale fabrication on site." },
];

describe("ServiceTable", () => {
  it("renders all service names as h3", () => {
    render(<ServiceTable rows={rows} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent("Virtual production");
    expect(headings[1]).toHaveTextContent("Set construction");
  });

  it("renders descriptions", () => {
    render(<ServiceTable rows={rows} />);
    expect(screen.getByText("Pre-vis to final composite.")).toBeInTheDocument();
    expect(screen.getByText("Full-scale fabrication on site.")).toBeInTheDocument();
  });

  it("renders numbers as aria-hidden", () => {
    render(<ServiceTable rows={rows} />);
    const nums = screen.getAllByText(/^0[12]$/);
    nums.forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"));
  });

  it("renders empty list gracefully", () => {
    const { container } = render(<ServiceTable rows={[]} />);
    expect(container.firstElementChild?.children).toHaveLength(0);
  });
});
