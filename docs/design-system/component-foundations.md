# Component Foundation Conventions

Addresses issue [#74](https://github.com/productioncity/holding/issues/74).

## Scope

This document records the approved API conventions, shared primitive strategy, overlay positioning posture, layering model, and motion rules for the initial `packages/ui` foundation. The current branch also adds lightweight tested exports in `packages/ui/src/foundations` so downstream component work can import the decisions instead of restating them.

## API conventions

| Concern | Convention |
| --- | --- |
| Variant prop | Always `variant` |
| Size prop | Always `sm`, `md`, `lg` string unions unless a component has a real domain-specific scale |
| Boolean props | Use HTML-style names: `disabled`, `loading`, `open`, `pressed`; avoid `is*` prefixes |
| Non-native state events | Use `onValueChange`, `onOpenChange`, `onPressedChange`, not bare `onChange` |
| Controlled / uncontrolled | Support both only when a component has meaningful local state; otherwise stay stateless |
| Refs | Interactive atoms and overlay primitives must expose a DOM ref; presentational-only components do not need cargo-cult ref plumbing |
| Polymorphism | Prefer `asChild` only where composition demands it; do not introduce a generic `as` prop on every component |
| Children | Accept `ReactNode`; do not allow `dangerouslySetInnerHTML` |
| Class merging | Keep `className` as the override escape hatch and merge with `cn(...)` |
| Accessibility names | Name props after semantics, not implementation details |

## Shared primitive strategy

Overlay-capable components should be built from four internal primitives:

| Primitive | Responsibility |
| --- | --- |
| `PortalRoot` | Chooses the mount target and named stacking layer |
| `FocusScope` | Traps or contains focus and restores it on close |
| `DismissableLayer` | Handles `Escape`, outside pointer dismissal, and stacked-layer ownership |
| `Positioning` | Delegates placement, flip, shift, and arrow alignment to Floating UI |

This branch does not ship consumer-facing dialog/popover components yet. It does ship the shared contracts and constants that those components should consume:

- [packages/ui/src/foundations/layering.ts](/tmp/issue-57-foundation-research/packages/ui/src/foundations/layering.ts)
- [packages/ui/src/foundations/positioning.ts](/tmp/issue-57-foundation-research/packages/ui/src/foundations/positioning.ts)
- [packages/ui/src/foundations/motion.ts](/tmp/issue-57-foundation-research/packages/ui/src/foundations/motion.ts)
- [packages/ui/src/foundations/overlay.ts](/tmp/issue-57-foundation-research/packages/ui/src/foundations/overlay.ts)

## Layering model

Approved z-index layers:

| Layer | Token value | Intended use |
| --- | --- | --- |
| `base` | `0` | Document flow |
| `raised` | `100` | Elevated surfaces inside layout flow |
| `sticky` | `200` | Sticky headers / rails |
| `overlay-backdrop` | `1100` | Modal or popover backdrops |
| `overlay` | `1200` | Dialogs, popovers, dropdowns |
| `toast` | `1300` | Toast stacks |
| `tooltip` | `1400` | Tooltips and teaching UI |

These values are a temporary hand-authored foundation until the token build pipeline emits generated token files.

## Overlay and positioning strategy

- Use the 12-position model: `top|right|bottom|left` × `start|center|end`.
- Preferred fallback order is: requested placement, flipped placement, cross-axis option one, cross-axis option two.
- Do not build custom geometry math.
- Use Floating UI for actual collision detection, offset, shift, flip, and arrow middleware.
- Keep layer ownership, focus management, and outside-dismiss policy inside our own primitives.

## Motion strategy

- No runtime animation library by default.
- Use CSS transitions and `@starting-style` where enter motion is needed.
- Approved durations live in [packages/ui/src/foundations/motion.ts](/tmp/issue-57-foundation-research/packages/ui/src/foundations/motion.ts): `100ms`, `150ms`, `200ms`.
- Use one easing curve: `cubic-bezier(0.2, 0, 0, 1)`.
- Respect `prefers-reduced-motion`: all non-instant motion collapses to `0ms`.
- Avoid scale, bounce, spring, or decorative transform choreography.

## SSR and client rules

- Presentational atoms should stay server-compatible by default.
- Interactive components must declare `'use client'` at the boundary where browser APIs, event handlers, refs, or effects are required.
- Portals must no-op safely during SSR and only attach in the browser.
- Overlay primitives must never assume `document` or `window` exists during module evaluation.

## What future component issues should do

1. Use these conventions without reopening naming debates.
2. Reuse the shared foundation exports instead of hardcoding placements, z-index values, or motion timings.
3. Introduce actual overlay primitives and their Storybook coverage when the first consumer component lands.
