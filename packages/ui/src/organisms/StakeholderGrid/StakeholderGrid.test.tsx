import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StakeholderGrid } from "./StakeholderGrid";

const stakeholders = [
  { type: "Creators", description: "Film, TV, and digital content makers.", benefits: ["Access facilities", "Network"] },
  { type: "Industry", description: "Production companies and studios.", benefits: ["Scale operations"] },
  { type: "Investors", description: "Growth capital partners.", benefits: ["Portfolio diversification"] },
];

describe("StakeholderGrid", () => {
  it("renders heading", () => {
    render(<StakeholderGrid heading="Who Benefits" stakeholders={stakeholders} />);
    expect(screen.getByText("Who Benefits")).toBeInTheDocument();
  });

  it("renders all stakeholder types", () => {
    render(<StakeholderGrid heading="Stakeholders" stakeholders={stakeholders} />);
    expect(screen.getByText("Creators")).toBeInTheDocument();
    expect(screen.getByText("Industry")).toBeInTheDocument();
    expect(screen.getByText("Investors")).toBeInTheDocument();
  });

  it("renders stakeholder descriptions", () => {
    render(<StakeholderGrid heading="Stakeholders" stakeholders={stakeholders} />);
    expect(screen.getByText(/Film, TV, and digital/)).toBeInTheDocument();
  });

  it("renders benefits list", () => {
    render(<StakeholderGrid heading="Stakeholders" stakeholders={stakeholders} />);
    expect(screen.getByText("Access facilities")).toBeInTheDocument();
    expect(screen.getByText("Network")).toBeInTheDocument();
  });
});
