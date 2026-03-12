import { describe, expect, it } from "vitest";
import {
  getFallbackPlacements,
  getOppositePlacement,
  overlayAlignments,
  overlayPlacements,
  overlaySides,
} from "./positioning";

describe("positioning foundation", () => {
  it("defines the approved 12-position overlay model", () => {
    expect(overlaySides).toEqual(["top", "right", "bottom", "left"]);
    expect(overlayAlignments).toEqual(["start", "center", "end"]);
    expect(overlayPlacements).toEqual([
      "top-start",
      "top",
      "top-end",
      "right-start",
      "right",
      "right-end",
      "bottom-start",
      "bottom",
      "bottom-end",
      "left-start",
      "left",
      "left-end",
    ]);
  });

  it("resolves the opposite side while preserving alignment", () => {
    expect(getOppositePlacement("top-start")).toBe("bottom-start");
    expect(getOppositePlacement("right-end")).toBe("left-end");
    expect(getOppositePlacement("bottom")).toBe("top");
  });

  it("builds a fallback chain that flips first, then swaps axis", () => {
    expect(getFallbackPlacements("top-start")).toEqual([
      "top-start",
      "bottom-start",
      "right-start",
      "left-start",
    ]);
  });
});
