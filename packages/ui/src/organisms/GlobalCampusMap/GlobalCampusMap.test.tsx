import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlobalCampusMap } from "./GlobalCampusMap";

const locations = [
  { name: "Queensland", status: "Primary", description: "Main campus" },
  { name: "Singapore", status: "Planned", description: "Asia-Pacific hub" },
  { name: "Hawaii", status: "Planned", description: "Pacific hub" },
];

describe("GlobalCampusMap", () => {
  it("renders heading", () => {
    render(<GlobalCampusMap heading="Global Locations" locations={locations} />);
    expect(screen.getByText("Global Locations")).toBeInTheDocument();
  });

  it("renders all locations", () => {
    render(<GlobalCampusMap heading="Locations" locations={locations} />);
    expect(screen.getByText("Queensland")).toBeInTheDocument();
    expect(screen.getByText("Singapore")).toBeInTheDocument();
    expect(screen.getByText("Hawaii")).toBeInTheDocument();
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
