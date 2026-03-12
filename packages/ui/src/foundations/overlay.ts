import type { OverlayLayer } from "./layering";
import type { OverlayPlacement } from "./positioning";

/** Shared strategy options for the planned portal primitive. */
interface PortalRootOptions {
  /** Named stacking layer to apply to the portal container. */
  layer: OverlayLayer;
  /** Optional custom mount target. Defaults to `document.body` in the browser. */
  target?: HTMLElement | null;
}

/** Shared strategy options for the planned focus-scope primitive. */
interface FocusScopeOptions {
  /** `trap` keeps focus inside a modal; `contain` restores focus without trapping. */
  mode: "trap" | "contain";
  /** Whether focus should return to the trigger when the layer closes. */
  restoreFocus?: boolean;
}

/** Shared strategy options for the planned dismissable-layer primitive. */
interface DismissableLayerOptions {
  /** Whether the topmost layer should close on `Escape`. */
  closeOnEscape?: boolean;
  /** Whether clicking outside the layer should dismiss it. */
  closeOnPointerDownOutside?: boolean;
}

/** Shared strategy options for the planned positioning primitive. */
interface PositioningOptions {
  /** Preferred anchor placement using the approved 12-position model. */
  placement: OverlayPlacement;
  /** Pixel offset between anchor and floating surface. */
  offset?: number;
  /** Whether the primitive should render an aligned arrow treatment. */
  withArrow?: boolean;
}

export type {
  DismissableLayerOptions,
  FocusScopeOptions,
  PortalRootOptions,
  PositioningOptions,
};
