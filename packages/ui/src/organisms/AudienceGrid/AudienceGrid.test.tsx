import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AudienceGrid } from "./AudienceGrid";

const cards = [
  { numeral: "I", heading: "For producers", description: "Book stages.", href: "/for-producers" },
  { numeral: "II", heading: "For government", description: "Screen investment.", href: "/for-government" },
];

describe("AudienceGrid", () => {
  it("renders all cards as links", () => {
    render(<AudienceGrid cards={cards} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });

  it("renders headings as h3", () => {
    render(<AudienceGrid cards={cards} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(2);
  });

  it("renders correct hrefs", () => {
    render(<AudienceGrid cards={cards} />);
    expect(screen.getByRole("link", { name: /For producers/ })).toHaveAttribute("href", "/for-producers");
    expect(screen.getByRole("link", { name: /For government/ })).toHaveAttribute("href", "/for-government");
  });

  it("sanitizes unsafe hrefs", () => {
    render(
      <AudienceGrid
        cards={[{ numeral: "I", heading: "Evil", description: "x", href: "javascript:alert(1)" }]}
      />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });

  it("renders descriptions", () => {
    render(<AudienceGrid cards={cards} />);
    expect(screen.getByText("Book stages.")).toBeInTheDocument();
  });

  it("uses custom linkLabel when provided", () => {
    render(
      <AudienceGrid
        cards={[{ numeral: "I", heading: "Heading", description: "Desc", href: "/", linkLabel: "Explore" }]}
      />,
    );
    expect(screen.getByText(/Explore/)).toBeInTheDocument();
  });
});
