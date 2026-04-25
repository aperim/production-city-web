import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PullQuote } from "./PullQuote";

describe("PullQuote", () => {
  it("renders children inside a blockquote", () => {
    render(<PullQuote>The first site carries an advantage.</PullQuote>);
    expect(screen.getByRole("blockquote")).toHaveTextContent("The first site carries an advantage.");
  });

  it("wraps in a figure element", () => {
    const { container } = render(<PullQuote>Quote text</PullQuote>);
    expect(container.querySelector("figure")).toBeInTheDocument();
  });

  it("renders attribution as figcaption", () => {
    render(<PullQuote attribution="Sydney, 2026">Quote</PullQuote>);
    expect(screen.getByText("Sydney, 2026")).toBeInTheDocument();
    const { container } = render(<PullQuote attribution="Sydney, 2026">Quote</PullQuote>);
    expect(container.querySelector("figcaption")).toBeInTheDocument();
  });

  it("does not render figcaption when no attribution", () => {
    const { container } = render(<PullQuote>Quote</PullQuote>);
    expect(container.querySelector("figcaption")).toBeNull();
  });
});
