/** Approved side names for overlay positioning. */
const overlaySides = ["top", "right", "bottom", "left"] as const;

/** Approved alignment names for overlay positioning. */
const overlayAlignments = ["start", "center", "end"] as const;

/** Approved placements for anchored overlays. */
const overlayPlacements = [
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
] as const;

/** Shared union for approved placement values. */
type OverlayPlacement = (typeof overlayPlacements)[number];

const oppositeSideMap = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
} as const satisfies Record<(typeof overlaySides)[number], (typeof overlaySides)[number]>;

function splitPlacement(placement: OverlayPlacement): {
  side: (typeof overlaySides)[number];
  alignment: (typeof overlayAlignments)[number];
} {
  const [side, rawAlignment] = placement.split("-") as [
    (typeof overlaySides)[number],
    (typeof overlayAlignments)[number] | undefined,
  ];

  return {
    side,
    alignment: rawAlignment ?? "center",
  };
}

function buildPlacement(
  side: (typeof overlaySides)[number],
  alignment: (typeof overlayAlignments)[number],
): OverlayPlacement {
  if (alignment === "center") {
    return side;
  }

  return `${side}-${alignment}` as OverlayPlacement;
}

/**
 * Flips a placement to the opposite side while preserving its alignment.
 */
function getOppositePlacement(placement: OverlayPlacement): OverlayPlacement {
  const { side, alignment } = splitPlacement(placement);
  return buildPlacement(oppositeSideMap[side], alignment);
}

/**
 * Returns the preferred placement followed by the sanctioned fallback order.
 *
 * The strategy first flips across the main axis, then tries the cross-axis
 * alternatives on the same alignment.
 */
function getFallbackPlacements(placement: OverlayPlacement): OverlayPlacement[] {
  const { side, alignment } = splitPlacement(placement);
  const crossAxisSides =
    side === "top" || side === "bottom" ? (["right", "left"] as const) : (["top", "bottom"] as const);

  return [
    placement,
    getOppositePlacement(placement),
    buildPlacement(crossAxisSides[0], alignment),
    buildPlacement(crossAxisSides[1], alignment),
  ];
}

export {
  getFallbackPlacements,
  getOppositePlacement,
  overlayAlignments,
  overlayPlacements,
  overlaySides,
};
export type { OverlayPlacement };
