import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WireframePreview, WIREFRAME_TYPES } from "./WireframePreview";

describe("WireframePreview", () => {
  it("renders all 8 wireframe variants without error", () => {
    for (const type of WIREFRAME_TYPES) {
      const { container } = render(<WireframePreview type={type} />);
      expect(container.querySelector("svg")).not.toBeNull();
    }
  });

  it("has 8 wireframe types", () => {
    expect(WIREFRAME_TYPES.length).toBe(8);
  });

  it("renders SVG with viewBox for responsive scaling", () => {
    const { container } = render(<WireframePreview type="board" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBeDefined();
  });

  it("includes labelled text zones", () => {
    const { container } = render(<WireframePreview type="calendar" />);
    const texts = container.querySelectorAll("text");
    expect(texts.length).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { container } = render(<WireframePreview type="table" className="w-full" />);
    const svg = container.querySelector("svg");
    expect(svg?.classList.contains("w-full")).toBe(true);
  });

  it("renders fallback for unknown type", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing runtime fallback for invalid input
    const { container } = render(<WireframePreview type={"unknown" as any} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
