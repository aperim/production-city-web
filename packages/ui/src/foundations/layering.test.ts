import { describe, expect, it } from "vitest";
import { getZIndex, overlayLayers, zIndexTokens } from "./layering";

describe("layering foundation", () => {
  it("exports the approved overlay layer order", () => {
    expect(overlayLayers).toEqual([
      "base",
      "raised",
      "sticky",
      "overlay-backdrop",
      "overlay",
      "toast",
      "tooltip",
    ]);
  });

  it("assigns strictly increasing z-index values", () => {
    const values = overlayLayers.map((layer) => zIndexTokens[layer]);
    expect(values).toEqual([...values].sort((left, right) => left - right));
  });

  it("returns the token value for a named layer", () => {
    expect(getZIndex("overlay")).toBe(1200);
    expect(getZIndex("tooltip")).toBe(1400);
  });
});
