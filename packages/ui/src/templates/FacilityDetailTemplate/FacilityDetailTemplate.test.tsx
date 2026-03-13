import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FacilityDetailTemplate } from "./FacilityDetailTemplate";

describe("FacilityDetailTemplate", () => {
  it("renders facility name", () => {
    render(
      <FacilityDetailTemplate
        name="Screen & Sound Stage"
        description="Professional sound stage."
      />
    );
    expect(screen.getByText("Screen & Sound Stage")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <FacilityDetailTemplate
        name="Test"
        description="A professional facility."
      />
    );
    expect(screen.getByText("A professional facility.")).toBeInTheDocument();
  });

  it("renders specs when provided", () => {
    render(
      <FacilityDetailTemplate
        name="Test"
        description="Desc"
        specs={[
          { label: "Dimensions", value: "30m x 20m" },
          { label: "Capacity", value: "200" },
        ]}
      />
    );
    expect(screen.getByText("Dimensions")).toBeInTheDocument();
    expect(screen.getByText("30m x 20m")).toBeInTheDocument();
  });

  it("renders use cases when provided", () => {
    render(
      <FacilityDetailTemplate
        name="Test"
        description="Desc"
        useCases={["Feature films", "TV series"]}
      />
    );
    expect(screen.getByText("Feature films")).toBeInTheDocument();
    expect(screen.getByText("TV series")).toBeInTheDocument();
  });

  it("renders children (CTA slot)", () => {
    render(
      <FacilityDetailTemplate name="Test" description="Desc">
        <button>Book Now</button>
      </FacilityDetailTemplate>
    );
    expect(screen.getByText("Book Now")).toBeInTheDocument();
  });
});
