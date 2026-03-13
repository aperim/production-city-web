/**
 * Chromatic visual regression configuration.
 *
 * To activate visual regression testing:
 * 1. Create a Chromatic project at https://www.chromatic.com/
 * 2. Add CHROMATIC_PROJECT_TOKEN to GitHub Actions secrets
 * 3. The CI workflow will pick it up automatically
 *
 * @see https://www.chromatic.com/docs/configuration
 */
const config = {
  /** Only test stories affected by code changes (faster CI). */
  onlyChanged: true,

  /**
   * Skip snapshots for stories tagged with "skip-chromatic".
   * Useful for stories with animations or non-deterministic output.
   */
  skip: "skip-chromatic",

  /**
   * Pause before snapshot to allow animations to settle.
   * 300ms matches the longest transition in the design system (motion.ts).
   */
  pauseAnimationAtEnd: true,

  /**
   * Threshold for pixel-level diff detection (0–1, default 0.063).
   * Keep at default to catch genuine regressions.
   */
  threshold: 0.063,
};

export default config;
