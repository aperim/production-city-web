import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHero } from "./PageHero";

describe("PageHero", () => {
  it("renders heading as h1", () => {
    render(<PageHero heading="Facilities" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Facilities");
  });

  it("renders eyebrow when provided", () => {
    render(<PageHero heading="Facilities" eyebrow="Facilities — 01/04" />);
    expect(screen.getByText("Facilities — 01/04")).toBeInTheDocument();
  });

  it("renders lead when provided", () => {
    render(<PageHero heading="Facilities" lead="Built together, in one place." />);
    expect(screen.getByText("Built together, in one place.")).toBeInTheDocument();
  });

  it("does not render eyebrow when omitted", () => {
    const { container } = render(<PageHero heading="Facilities" />);
    const ps = container.querySelectorAll("p");
    expect(ps).toHaveLength(0);
  });

  it("renders ghost text as aria-hidden", () => {
    const { container } = render(<PageHero heading="Services" ghost="02" />);
    const ghostEl = container.querySelector('[aria-hidden="true"]');
    expect(ghostEl).toBeInTheDocument();
    expect(ghostEl?.textContent).toBe("02");
  });

  it("renders CTA links with correct hrefs", () => {
    render(
      <PageHero
        heading="Company"
        ctas={[
          { label: "Facilities", href: "/facilities", variant: "primary" },
          { label: "Network", href: "/network", variant: "secondary" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Facilities" })).toHaveAttribute("href", "/facilities");
    expect(screen.getByRole("link", { name: "Network" })).toHaveAttribute("href", "/network");
  });

  it("sanitizes unsafe CTA hrefs", () => {
    render(
      <PageHero
        heading="Company"
        ctas={[{ label: "Evil", href: "javascript:alert(1)", variant: "primary" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "Evil" })).toHaveAttribute("href", "#");
  });
});
