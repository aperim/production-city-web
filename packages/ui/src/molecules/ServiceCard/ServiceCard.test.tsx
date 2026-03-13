import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceCard } from "./ServiceCard";

describe("ServiceCard", () => {
  it("renders service name", () => {
    render(<ServiceCard name="Motion Capture" description="Full body capture" />);
    expect(screen.getByText("Motion Capture")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ServiceCard name="Motion Capture" description="Full body capture" />);
    expect(screen.getByText("Full body capture")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<ServiceCard name="Test" description="Test" icon={<span data-testid="icon">IC</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<ServiceCard name="Test" description="Test" className="custom" />);
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });

  it("has clean minimal styling per Uncodixify", () => {
    const { container } = render(<ServiceCard name="Test" description="Test" />);
    const classes = container.firstElementChild?.getAttribute("class") ?? "";
    expect(classes).not.toContain("shadow-lg");
    expect(classes).not.toContain("shadow-xl");
  });
});
