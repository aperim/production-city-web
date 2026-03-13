import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FacilityShowcase } from "./FacilityShowcase";

const facilities = [
  { name: "Sound Stage A", description: "Professional stage" },
  { name: "Sound Stage B", description: "Smaller stage" },
  { name: "Broadcast Theatre", description: "Multi-camera facility" },
];

describe("FacilityShowcase", () => {
  it("renders section heading", () => {
    render(<FacilityShowcase heading="Our Facilities" facilities={facilities} />);
    expect(screen.getByText("Our Facilities")).toBeInTheDocument();
  });

  it("renders all facility cards", () => {
    render(<FacilityShowcase heading="Facilities" facilities={facilities} />);
    expect(screen.getByText("Sound Stage A")).toBeInTheDocument();
    expect(screen.getByText("Sound Stage B")).toBeInTheDocument();
    expect(screen.getByText("Broadcast Theatre")).toBeInTheDocument();
  });

  it("renders intro text when provided", () => {
    render(<FacilityShowcase heading="Facilities" intro="World-class facilities." facilities={facilities} />);
    expect(screen.getByText("World-class facilities.")).toBeInTheDocument();
  });

  it("renders loading state with skeletons", () => {
    const { container } = render(<FacilityShowcase heading="Facilities" facilities={[]} loading />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state", () => {
    render(<FacilityShowcase heading="Facilities" facilities={[]} emptyMessage="No facilities found." />);
    expect(screen.getByText("No facilities found.")).toBeInTheDocument();
  });

  it("uses responsive grid layout", () => {
    const { container } = render(<FacilityShowcase heading="Facilities" facilities={facilities} />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });
});
