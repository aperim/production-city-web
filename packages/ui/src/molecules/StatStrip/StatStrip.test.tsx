import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatStrip } from "./StatStrip";

const stats = [
  { value: "1", label: "operator" },
  { value: "2", label: "lanes, in parallel" },
  { value: "19", label: "stations from idea to audience" },
];

describe("StatStrip", () => {
  it("renders all stats as list items", () => {
    render(<StatStrip stats={stats} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders labels", () => {
    render(<StatStrip stats={stats} />);
    expect(screen.getByText("operator")).toBeInTheDocument();
    expect(screen.getByText("lanes, in parallel")).toBeInTheDocument();
  });

  it("renders unit when provided", () => {
    render(<StatStrip stats={[{ value: "1", unit: " loop", label: "feedback" }]} />);
    // Unit is inside aria-hidden; the sr-only span carries the accessible combined text
    expect(screen.getByText("1 loop feedback")).toBeInTheDocument();
  });

  it("renders empty gracefully", () => {
    const { container } = render(<StatStrip stats={[]} />);
    expect(container.firstElementChild?.children).toHaveLength(0);
  });
});
