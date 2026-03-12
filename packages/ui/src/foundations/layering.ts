/** Approved overlay layer names in ascending stacking order. */
const overlayLayers = [
  "base",
  "raised",
  "sticky",
  "overlay-backdrop",
  "overlay",
  "toast",
  "tooltip",
] as const;

/** Named z-index tokens to use until the token pipeline emits generated values. */
const zIndexTokens: Record<(typeof overlayLayers)[number], number> = {
  base: 0,
  raised: 100,
  sticky: 200,
  "overlay-backdrop": 1100,
  overlay: 1200,
  toast: 1300,
  tooltip: 1400,
};

/** Shared union for approved overlay layer names. */
type OverlayLayer = (typeof overlayLayers)[number];

/**
 * Returns the z-index token for the requested overlay layer.
 *
 * Keeping the lookup behind a function allows generated tokens to replace this
 * implementation later without changing the consumer API.
 */
function getZIndex(layer: OverlayLayer): number {
  return zIndexTokens[layer];
}

export { getZIndex, overlayLayers, zIndexTokens };
export type { OverlayLayer };
