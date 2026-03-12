/** Approved duration scale in milliseconds for design-system motion. */
const motionDurationsMs = {
  instant: 0,
  hover: 100,
  enter: 150,
  exit: 150,
  emphasize: 200,
} as const;

/** Approved easing curves for subtle UI motion only. */
const motionEasings = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

/** Shared union for motion duration token names. */
type MotionDurationToken = keyof typeof motionDurationsMs;

/**
 * Returns the motion duration for the requested token.
 *
 * Reduced-motion mode collapses all non-instant durations to zero so component
 * code can stay declarative.
 */
function getMotionDuration(
  token: MotionDurationToken,
  prefersReducedMotion = false,
): number {
  if (prefersReducedMotion) {
    return motionDurationsMs.instant;
  }

  return motionDurationsMs[token];
}

export { getMotionDuration, motionDurationsMs, motionEasings };
export type { MotionDurationToken };
