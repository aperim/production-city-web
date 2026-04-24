import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperatingPillars } from "./OperatingPillars";

const pillars = [
  { numeral: "i", heading: "One IP · two formats", body: "Script and score authored once." },
  { numeral: "ii", heading: "One operator · one campus", body: "Venue and stack under one brand." },
];

describe("OperatingPillars", () => {
  it("renders all pillars", () => {
    render(<OperatingPillars pillars={pillars} />);
    expect(screen.getByText("One IP · two formats")).toBeInTheDocument();
    expect(screen.getByText("One operator · one campus")).toBeInTheDocument();
  });

  it("renders headings as h4", () => {
    render(<OperatingPillars pillars={pillars} />);
    const headings = screen.getAllByRole("heading", { level: 4 });
    expect(headings).toHaveLength(2);
  });

  it("renders body text", () => {
    render(<OperatingPillars pillars={pillars} />);
    expect(screen.getByText("Script and score authored once.")).toBeInTheDocument();
  });

  it("renders numerals", () => {
    render(<OperatingPillars pillars={pillars} />);
    expect(screen.getByText("i")).toBeInTheDocument();
    expect(screen.getByText("ii")).toBeInTheDocument();
  });

  it("renders nothing for empty pillars array", () => {
    const { container } = render(<OperatingPillars pillars={[]} />);
    // Only the wrapper div
    expect(container.firstElementChild?.children).toHaveLength(0);
  });
});
