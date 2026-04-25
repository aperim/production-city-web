/**
 * Production City — Breakpoint Tokens
 * Source of truth: reference/assets/site.css media queries.
 * Values are pixel numbers for use in JS/TS — CSS custom properties cannot be
 * used inside @media rules, so use these in matchMedia or CSS-in-JS contexts.
 */
export const breakpoints = {
  /** 560px — audience grid single column */
  sm:  560,
  /** 720px — service rows, section heads */
  md:  720,
  /** 820px — 12-col grid, footer, network grid */
  lg:  820,
  /** 900px — company / facilities 2-col layouts */
  xl:  900,
  /** 980px — header nav visible, audience grid */
  '2xl': 980,
} as const;
