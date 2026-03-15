import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders without errors", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has role=status for accessibility", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it("has default aria-label", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveAttribute("aria-label", "Loading");
  });

  it("accepts custom aria-label", () => {
    const { container } = render(<Spinner label="Submitting" />);
    expect(container.firstChild).toHaveAttribute("aria-label", "Submitting");
  });

  it("renders sm size", () => {
    const { container } = render(<Spinner size="sm" />);
    const cls = (container.firstChild as SVGElement).getAttribute("class") ?? "";
    expect(cls).toContain("h-4");
    expect(cls).toContain("w-4");
  });

  it("renders md size by default", () => {
    const { container } = render(<Spinner />);
    const cls = (container.firstChild as SVGElement).getAttribute("class") ?? "";
    expect(cls).toContain("h-5");
    expect(cls).toContain("w-5");
  });

  it("renders lg size", () => {
    const { container } = render(<Spinner size="lg" />);
    const cls = (container.firstChild as SVGElement).getAttribute("class") ?? "";
    expect(cls).toContain("h-6");
    expect(cls).toContain("w-6");
  });

  it("has spin animation class", () => {
    const { container } = render(<Spinner />);
    const cls = (container.firstChild as SVGElement).getAttribute("class") ?? "";
    expect(cls).toContain("animate-spin");
  });
});
