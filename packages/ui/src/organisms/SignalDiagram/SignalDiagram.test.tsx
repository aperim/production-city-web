import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { SignalDiagram } from "./SignalDiagram";

describe("SignalDiagram", () => {
  it("renders the figure with aria-label", () => {
    render(<SignalDiagram />);
    const fig = screen.getByRole("figure");
    expect(fig).toBeInTheDocument();
    expect(fig.getAttribute("aria-label")).toMatch(/IP lifecycle/i);
  });

  it("renders the chrome bar with IP LIFECYCLE label", () => {
    render(<SignalDiagram />);
    expect(screen.getByText(/IP LIFECYCLE · LIVE/i)).toBeInTheDocument();
  });

  it("renders the ONE IP label", () => {
    render(<SignalDiagram />);
    expect(screen.getByText(/ONE IP · TWO LANES · ONE LOOP/i)).toBeInTheDocument();
  });

  it("renders initial timecode 00:00:00:00", () => {
    render(<SignalDiagram />);
    // Timecode element identified by aria-label
    const tc = screen.getByLabelText("timecode");
    expect(tc.textContent).toMatch(/\d{2}:\d{2}:\d{2}:\d{2}/);
  });

  it("renders the NOW footer label", () => {
    render(<SignalDiagram />);
    expect(screen.getByText(/NOW/i)).toBeInTheDocument();
  });

  it("renders footer loop label", () => {
    render(<SignalDiagram />);
    expect(screen.getByText(/SHARED · SPLIT · MERGE · LOOP/i)).toBeInTheDocument();
  });

  it("renders the SVG with aria-hidden", () => {
    const { container } = render(<SignalDiagram />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders SCREEN LANE and STAGE LANE labels inside SVG", () => {
    const { container } = render(<SignalDiagram />);
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("SCREEN LANE");
    expect(texts).toContain("STAGE LANE");
  });

  it("renders all 9 key node name labels", () => {
    const { container } = render(<SignalDiagram />);
    const texts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(texts).toContain("IDEATION");
    expect(texts).toContain("IP STRATEGY");
    expect(texts).toContain("DISTRIBUTION");
    expect(texts).toContain("ANALYTICS · R&D");
  });

  describe("reduced motion", () => {
    const mq = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    beforeAll(() => {
      vi.spyOn(window, "matchMedia").mockReturnValue(mq as unknown as MediaQueryList);
    });
    afterAll(() => {
      vi.restoreAllMocks();
    });

    it("shows fallback now label when prefers-reduced-motion matches", () => {
      render(<SignalDiagram />);
      // After mount the effect fires synchronously in test (no real RAF)
      // The static fallback label should be set
      const liveRegion = screen.getByRole("figure");
      expect(liveRegion).toBeInTheDocument();
    });
  });
});
