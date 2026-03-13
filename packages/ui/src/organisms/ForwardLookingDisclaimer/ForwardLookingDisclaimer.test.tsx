import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ForwardLookingDisclaimer } from "./ForwardLookingDisclaimer";

describe("ForwardLookingDisclaimer", () => {
  it("renders disclaimer text", () => {
    render(<ForwardLookingDisclaimer text="This page contains forward-looking statements." />);
    expect(screen.getByText(/forward-looking statements/)).toBeInTheDocument();
  });

  it("uses subtle styling", () => {
    const { container } = render(<ForwardLookingDisclaimer text="Disclaimer text." />);
    const el = container.firstElementChild;
    expect(el?.getAttribute("class")).toContain("text-muted-foreground");
    expect(el?.getAttribute("class")).toContain("text-xs");
  });

  it("merges custom className", () => {
    const { container } = render(<ForwardLookingDisclaimer text="Test" className="custom" />);
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });
});
