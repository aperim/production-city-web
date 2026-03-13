import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionDivider } from "./SectionDivider";

describe("SectionDivider", () => {
  it("renders with separator role", () => {
    render(<SectionDivider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("renders line variant by default", () => {
    const { container } = render(<SectionDivider />);
    const el = container.querySelector('[role="separator"]');
    expect(el?.getAttribute("class")).toContain("border-t");
  });

  it("renders spacing-only variant without visible line", () => {
    const { container } = render(<SectionDivider variant="spacing-only" />);
    const el = container.querySelector('[role="separator"]');
    expect(el?.getAttribute("class")).not.toContain("border-t");
  });

  it("renders with-accent variant with accent color", () => {
    const { container } = render(<SectionDivider variant="with-accent" />);
    const el = container.querySelector('[role="separator"]');
    expect(el?.getAttribute("class")).toContain("bg-primary");
  });

  it("merges custom className", () => {
    const { container } = render(<SectionDivider className="custom-class" />);
    const el = container.querySelector('[role="separator"]');
    expect(el?.getAttribute("class")).toContain("custom-class");
  });

  it("renders with aria-orientation horizontal", () => {
    render(<SectionDivider />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
  });
});
