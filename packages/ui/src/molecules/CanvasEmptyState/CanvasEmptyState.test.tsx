import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CanvasEmptyState } from "./CanvasEmptyState";

describe("CanvasEmptyState", () => {
  it("renders activation label and description", () => {
    render(
      <CanvasEmptyState
        canvasType="table"
        activationLabel="Activates Q3 2026"
        description="Active production roster"
      />,
    );
    expect(screen.getByText("Activates Q3 2026")).toBeInTheDocument();
    expect(screen.getByText("Active production roster")).toBeInTheDocument();
  });

  it("never hardcodes 'Coming soon' copy", () => {
    render(
      <CanvasEmptyState
        canvasType="board"
        activationLabel="Activates Q4 2026"
        description="Pre-production pipeline"
      />,
    );
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
  });

  it("renders an aria-hidden canvas glyph for each canvas type", () => {
    const types = [
      "table",
      "chart",
      "charts",
      "board",
      "calendar",
      "documents",
      "timeline",
      "catalog",
      "communications",
    ] as const;

    for (const t of types) {
      const { container, unmount } = render(
        <CanvasEmptyState
          canvasType={t}
          activationLabel="Activates Q4 2026"
          description={`Surface for ${t}`}
        />,
      );
      const svg = container.querySelector("svg");
      expect(svg, `glyph for ${t}`).not.toBeNull();
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
      unmount();
    }
  });

  it("renders the optional note when supplied", () => {
    render(
      <CanvasEmptyState
        canvasType="calendar"
        activationLabel="Activates September 2026"
        description="Shooting schedule"
        note="Wired to CallSheet feed at activation."
      />,
    );
    expect(
      screen.getByText("Wired to CallSheet feed at activation."),
    ).toBeInTheDocument();
  });

  it("renders the optional tag slot above the glyph", () => {
    render(
      <CanvasEmptyState
        canvasType="board"
        activationLabel="Activates Q3 2026"
        description="Pre-production pipeline"
        tag={<span data-testid="canvas-tag">Concept</span>}
      />,
    );
    expect(screen.getByTestId("canvas-tag")).toBeInTheDocument();
  });

  it("renders the optional action when supplied", () => {
    render(
      <CanvasEmptyState
        canvasType="documents"
        activationLabel="Activates Q4 2026"
        description="Briefing pack library"
        action={<button>Notify me</button>}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Notify me" }),
    ).toBeInTheDocument();
  });

  it("uses page padding by default", () => {
    const { container } = render(
      <CanvasEmptyState
        canvasType="table"
        activationLabel="Activates Q3 2026"
        description="Roster"
      />,
    );
    expect(container.firstChild).toHaveClass("py-16");
  });

  it("uses inline padding for the inline variant", () => {
    const { container } = render(
      <CanvasEmptyState
        canvasType="table"
        variant="inline"
        activationLabel="Activates Q3 2026"
        description="Roster"
      />,
    );
    expect(container.firstChild).toHaveClass("py-8");
  });

  it("announces politely by default via role=status", () => {
    const { container } = render(
      <CanvasEmptyState
        canvasType="documents"
        activationLabel="Activates Q4 2026"
        description="Briefing pack library"
      />,
    );
    expect(container.firstChild).toHaveAttribute("role", "status");
    expect(container.firstChild).toHaveAttribute("aria-live", "polite");
  });

  it("does not announce when announce=false", () => {
    const { container } = render(
      <CanvasEmptyState
        canvasType="documents"
        announce={false}
        activationLabel="Activates Q4 2026"
        description="Briefing pack library"
      />,
    );
    expect(container.firstChild).not.toHaveAttribute("role");
    expect(container.firstChild).not.toHaveAttribute("aria-live");
  });
});
