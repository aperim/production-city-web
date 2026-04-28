import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlobalCampusMap } from "./GlobalCampusMap";

const locations = [
  { name: "Australia", status: "Primary", description: "Main campus" },
  { name: "Asia Pacific", status: "Planned", description: "Asia-Pacific hub" },
  { name: "North America", status: "Planned", description: "Pacific hub" },
];

describe("GlobalCampusMap", () => {
  it("renders heading", () => {
    render(<GlobalCampusMap heading="Global Locations" locations={locations} />);
    expect(screen.getByText("Global Locations")).toBeInTheDocument();
  });

  it("renders all locations", () => {
    render(<GlobalCampusMap heading="Locations" locations={locations} />);
    expect(screen.getByText("Australia")).toBeInTheDocument();
    expect(screen.getByText("Asia Pacific")).toBeInTheDocument();
    expect(screen.getByText("North America")).toBeInTheDocument();
  });

  it("renders location statuses", () => {
    render(<GlobalCampusMap heading="Locations" locations={locations} />);
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getAllByText("Planned")).toHaveLength(2);
  });

  it("renders location descriptions", () => {
    render(<GlobalCampusMap heading="Locations" locations={locations} />);
    expect(screen.getByText("Main campus")).toBeInTheDocument();
  });
});
