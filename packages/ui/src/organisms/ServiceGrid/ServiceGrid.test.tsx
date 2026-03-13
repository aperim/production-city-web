import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceGrid } from "./ServiceGrid";

const services = [
  { name: "Motion Capture", description: "Full body capture" },
  { name: "Set Construction", description: "Custom builds" },
  { name: "Post-Production", description: "Editing and grading" },
];

describe("ServiceGrid", () => {
  it("renders heading", () => {
    render(<ServiceGrid heading="Creative Services" services={services} />);
    expect(screen.getByText("Creative Services")).toBeInTheDocument();
  });

  it("renders all service cards", () => {
    render(<ServiceGrid heading="Services" services={services} />);
    expect(screen.getByText("Motion Capture")).toBeInTheDocument();
    expect(screen.getByText("Set Construction")).toBeInTheDocument();
  });

  it("renders loading state with skeletons", () => {
    const { container } = render(<ServiceGrid heading="Services" services={[]} loading />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders empty state", () => {
    render(<ServiceGrid heading="Services" services={[]} emptyMessage="No services." />);
    expect(screen.getByText("No services.")).toBeInTheDocument();
  });

  it("uses responsive grid layout", () => {
    const { container } = render(<ServiceGrid heading="Services" services={services} />);
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });
});
