import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CTABanner } from "./CTABanner";

describe("CTABanner", () => {
  it("renders heading", () => {
    render(<CTABanner heading="Get Started" buttonLabel="Contact Us" />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders button with label", () => {
    render(<CTABanner heading="Get Started" buttonLabel="Contact Us" />);
    expect(screen.getByRole("link", { name: "Contact Us" })).toBeInTheDocument();
  });

  it("renders subtext when provided", () => {
    render(<CTABanner heading="Get Started" subtext="We'd love to hear from you" buttonLabel="Contact Us" />);
    expect(screen.getByText("We'd love to hear from you")).toBeInTheDocument();
  });

  it("renders inline variant by default", () => {
    const { container } = render(<CTABanner heading="Test" buttonLabel="Test" />);
    const classes = container.firstElementChild?.getAttribute("class") ?? "";
    expect(classes).not.toContain("border-t");
  });

  it("renders footer variant with top border", () => {
    const { container } = render(<CTABanner heading="Test" buttonLabel="Test" variant="footer" />);
    const classes = container.firstElementChild?.getAttribute("class") ?? "";
    expect(classes).toContain("border-t");
  });

  it("renders compact variant", () => {
    const { container } = render(<CTABanner heading="Test" buttonLabel="Test" compact />);
    const classes = container.firstElementChild?.getAttribute("class") ?? "";
    expect(classes).toContain("py-4");
  });

  it("passes buttonHref to link", () => {
    render(<CTABanner heading="Test" buttonLabel="Click" buttonHref="/contact" />);
    expect(screen.getByRole("link", { name: "Click" })).toHaveAttribute("href", "/contact");
  });

  it("merges custom className", () => {
    const { container } = render(<CTABanner heading="Test" buttonLabel="Test" className="custom" />);
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });
});
