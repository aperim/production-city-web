import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FacilityCard } from "./FacilityCard";

describe("FacilityCard", () => {
  it("renders facility name", () => {
    render(<FacilityCard name="Sound Stage A" description="Professional sound stage" />);
    expect(screen.getByText("Sound Stage A")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<FacilityCard name="Sound Stage A" description="Professional sound stage" />);
    expect(screen.getByText("Professional sound stage")).toBeInTheDocument();
  });

  it("renders specs when provided", () => {
    render(
      <FacilityCard
        name="Sound Stage A"
        description="Professional sound stage"
        specs={[
          { label: "Dimensions", value: "30m x 20m" },
          { label: "Capacity", value: "200 people" },
        ]}
      />
    );
    expect(screen.getByText("Dimensions")).toBeInTheDocument();
    expect(screen.getByText("30m x 20m")).toBeInTheDocument();
  });

  it("renders as link when href is provided", () => {
    render(<FacilityCard name="Sound Stage A" description="Test" href="#stage-a" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#stage-a");
  });

  it("merges custom className", () => {
    const { container } = render(<FacilityCard name="Test" description="Test" className="custom-class" />);
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom-class");
  });

  it("uses subtle border styling per Uncodixify", () => {
    const { container } = render(<FacilityCard name="Test" description="Test" />);
    const el = container.firstElementChild;
    const classes = el?.getAttribute("class") ?? "";
    expect(classes).toContain("border");
    expect(classes).toContain("rounded-md");
  });
});
