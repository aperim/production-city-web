import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GlobeHero } from "./GlobeHero";

const globeCoreMock = vi.hoisted(() => ({
  createProductionCityGlobe: vi.fn(),
  dispose: vi.fn(),
  updateLabels: vi.fn(),
}));

vi.mock("./globe-core", () => ({
  createProductionCityGlobe: globeCoreMock.createProductionCityGlobe,
}));

function mockWebGLSupport(supported: boolean) {
  return vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation(() => (supported ? ({} as RenderingContext) : null));
}

describe("GlobeHero", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    globeCoreMock.createProductionCityGlobe.mockReset();
    globeCoreMock.dispose.mockReset();
    globeCoreMock.updateLabels.mockReset();
  });

  it("renders a decorative globe container and preserves custom classes", () => {
    mockWebGLSupport(false);

    const { container } = render(<GlobeHero className="hero-fill" />);

    const globe = container.querySelector("[data-pc-globe]");
    expect(globe).toHaveClass("pc-globe-embed", "hero-fill");
    expect(globe).toHaveAttribute("role", "presentation");
    expect(globe).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".pc-globe-canvas")).toBeInTheDocument();
    expect(container.querySelector(".pc-globe-labels")).toBeInTheDocument();
    expect(globeCoreMock.createProductionCityGlobe).not.toHaveBeenCalled();
  });

  it("initializes the Three.js globe only when WebGL is available", async () => {
    mockWebGLSupport(true);
    globeCoreMock.createProductionCityGlobe.mockReturnValue({
      dispose: globeCoreMock.dispose,
      updateLabels: globeCoreMock.updateLabels,
    });

    const labels = { "australia-sydney": "AUSTRALIA" };
    const { unmount } = render(<GlobeHero labels={labels} />);

    await waitFor(() => {
      expect(globeCoreMock.createProductionCityGlobe).toHaveBeenCalledWith(
        expect.objectContaining({ dataset: expect.objectContaining({ pcGlobe: "" }) }),
        { labels }
      );
    });

    unmount();
    expect(globeCoreMock.dispose).toHaveBeenCalledTimes(1);
  });

  it("pushes label changes into the existing globe instance", async () => {
    mockWebGLSupport(true);
    globeCoreMock.createProductionCityGlobe.mockReturnValue({
      dispose: globeCoreMock.dispose,
      updateLabels: globeCoreMock.updateLabels,
    });

    const { rerender } = render(<GlobeHero labels={{ "australia-sydney": "AUSTRALIA" }} />);

    await waitFor(() => {
      expect(globeCoreMock.createProductionCityGlobe).toHaveBeenCalledTimes(1);
    });

    rerender(<GlobeHero labels={{ "australia-sydney": "AUSTRALIE" }} />);

    expect(globeCoreMock.updateLabels).toHaveBeenLastCalledWith({
      "australia-sydney": "AUSTRALIE",
    });
  });
});
