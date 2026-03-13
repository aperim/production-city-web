import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttributionLink } from "./AttributionLink";

describe("AttributionLink", () => {
  it("renders photographer name with link when URL provided", () => {
    render(
      <AttributionLink
        photographer="Jane Doe"
        photographerUrl="https://example.com/jane"
        source="Pexels"
      />,
    );
    const link = screen.getByRole("link", { name: /Jane Doe/ });
    expect(link).toHaveAttribute("href", "https://example.com/jane");
  });

  it("renders photographer name as plain text when URL missing", () => {
    render(<AttributionLink photographer="Jane Doe" source="Pexels" />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Jane Doe/ })).not.toBeInTheDocument();
  });

  it("renders source name with link when source URL provided", () => {
    render(
      <AttributionLink
        photographer="Jane Doe"
        source="Pexels"
        sourceUrl="https://pexels.com"
      />,
    );
    const link = screen.getByRole("link", { name: /Pexels/ });
    expect(link).toHaveAttribute("href", "https://pexels.com");
  });

  it("renders source as plain text when source URL missing", () => {
    render(<AttributionLink photographer="Jane Doe" source="Pexels" />);
    expect(screen.getByText("Pexels")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Pexels/ })).not.toBeInTheDocument();
  });

  it("formats attribution as 'Photo by {name} on {source}'", () => {
    const { container } = render(
      <AttributionLink photographer="Jane Doe" source="Pexels" />,
    );
    expect(container.textContent).toContain("Photo by");
    expect(container.textContent).toContain("Jane Doe");
    expect(container.textContent).toContain("on");
    expect(container.textContent).toContain("Pexels");
  });

  it("links open in new tab with correct rel", () => {
    render(
      <AttributionLink
        photographer="Jane Doe"
        photographerUrl="https://example.com/jane"
        source="Pexels"
        sourceUrl="https://pexels.com"
      />,
    );
    const links = screen.getAllByRole("link");
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("truncates long photographer names via CSS class", () => {
    const { container } = render(
      <AttributionLink
        photographer="Extremely Long Photographer Name That Should Be Truncated"
        source="Pexels"
      />,
    );
    const nameEl = container.querySelector("[data-testid='photographer-name']");
    expect(nameEl?.className).toContain("truncate");
  });

  it("rejects javascript: URLs and renders plain text", () => {
    render(
      <AttributionLink
        photographer="Jane Doe"
        photographerUrl="javascript:alert(1)"
        source="Pexels"
      />,
    );
    // Should not render as a link
    expect(screen.queryByRole("link", { name: /Jane Doe/ })).not.toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("rejects data: URLs and renders plain text", () => {
    render(
      <AttributionLink
        photographer="Jane Doe"
        photographerUrl="data:text/html,<script>alert(1)</script>"
        source="Pexels"
      />,
    );
    expect(screen.queryByRole("link", { name: /Jane Doe/ })).not.toBeInTheDocument();
  });

  it("includes screen reader text for new tab links", () => {
    render(
      <AttributionLink
        photographer="Jane Doe"
        photographerUrl="https://example.com/jane"
        source="Pexels"
      />,
    );
    expect(screen.getByText("(opens in a new tab)")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <AttributionLink
        photographer="Jane"
        source="Pexels"
        className="custom-test"
      />,
    );
    expect(container.firstElementChild?.className).toContain("custom-test");
  });
});
