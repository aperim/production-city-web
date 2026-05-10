import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CanvasTag, CanvasTagWrapper } from "./CanvasTag";

describe("CanvasTag", () => {
  it("renders Live label", () => {
    render(<CanvasTag variant="live" />);
    expect(screen.getByRole("status")).toHaveTextContent("Live");
  });

  it("renders Provisional label", () => {
    render(<CanvasTag variant="provisional" />);
    expect(screen.getByRole("status")).toHaveTextContent("Provisional");
  });

  it("renders Concept label", () => {
    render(<CanvasTag variant="concept" />);
    expect(screen.getByRole("status")).toHaveTextContent("Concept");
  });

  it("sets data-canvas-tag attribute", () => {
    render(<CanvasTag variant="provisional" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-canvas-tag",
      "provisional",
    );
  });

  it("includes generic aria-label by default", () => {
    render(<CanvasTag variant="live" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Status: Live",
    );
  });

  it("includes canvas type in aria-label when provided", () => {
    render(<CanvasTag variant="provisional" canvasType="chart" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "chart status: Provisional",
    );
  });

  it("sets data-canvas-type attribute", () => {
    render(<CanvasTag variant="concept" canvasType="table" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "data-canvas-type",
      "table",
    );
  });

  it("live variant renders the indicator dot", () => {
    const { container } = render(<CanvasTag variant="live" />);
    expect(container.querySelector(".bg-emerald-400\\/80")).toBeInTheDocument();
  });

  it("concept variant has transparent bg class", () => {
    const { container } = render(<CanvasTag variant="concept" />);
    const el = container.querySelector("[data-canvas-tag='concept']");
    expect(el?.className).toContain("bg-transparent");
  });

  it("forwards extra className", () => {
    render(<CanvasTag variant="live" className="custom-cls" />);
    expect(screen.getByRole("status").className).toContain("custom-cls");
  });
});

describe("CanvasTagWrapper", () => {
  it("renders children", () => {
    render(
      <CanvasTagWrapper variant="live">
        <div data-testid="child">content</div>
      </CanvasTagWrapper>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders embedded CanvasTag", () => {
    render(
      <CanvasTagWrapper variant="provisional">
        <div>content</div>
      </CanvasTagWrapper>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Provisional");
  });

  it("renders watermark overlay for concept variant", () => {
    const { container } = render(
      <CanvasTagWrapper variant="concept">
        <div>content</div>
      </CanvasTagWrapper>,
    );
    // Watermark aria-hidden overlay exists
    const overlay = container.querySelector("[aria-hidden='true']");
    expect(overlay).toBeInTheDocument();
  });

  it("does not render watermark for live variant", () => {
    const { container } = render(
      <CanvasTagWrapper variant="live">
        <div>content</div>
      </CanvasTagWrapper>,
    );
    // The live wrapper should have no aria-hidden watermark overlay
    const overlays = container.querySelectorAll("[aria-hidden='true']");
    // Only the live-dot indicator inside CanvasTag; no full overlay
    expect(overlays.length).toBe(1); // just the emerald dot
  });

  it("sets data-canvas-wrapper attribute", () => {
    const { container } = render(
      <CanvasTagWrapper variant="concept">
        <div>content</div>
      </CanvasTagWrapper>,
    );
    expect(
      container.querySelector("[data-canvas-wrapper='concept']"),
    ).toBeInTheDocument();
  });
});
