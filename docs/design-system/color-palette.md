# Color Palette

**Epic:** #211 — Site Design Refactor
**Issue:** #213 — Brand Color Integration
**Last Updated:** 2026-03-14

---

## Overview

Production City uses a three-tier color system: **brand colors** (primary, secondary), **neutrals**, and **semantic colors**. All colors are defined as design tokens in `packages/design-tokens` and consumed via CSS custom properties throughout the application.

## Brand Colors

### Primary — Sky Blue

The primary palette is a sky-blue scale used for interactive elements, focus rings, links, and primary CTAs.

| Token | Hex | Usage |
|-------|-----|-------|
| `--pc-color-primary-50` | `#f0f9ff` | Light mode accent background |
| `--pc-color-primary-400` | `#38bdf8` | Dark mode primary, dark mode focus ring |
| `--pc-color-primary-700` | `#0369a1` | Light mode primary, light mode focus ring |
| `--pc-color-primary-900` | `#0c4a6e` | Light mode accent foreground text |
| `--pc-color-primary-950` | `#082f49` | Dark mode primary foreground text |

### Secondary — Fuchsia / Magenta

The secondary palette is a fuchsia scale used for secondary buttons, badges, and accent highlights.

| Token | Hex | Usage |
|-------|-----|-------|
| `--pc-color-secondary-400` | `#e879f9` | Dark mode secondary |
| `--pc-color-secondary-700` | `#a21caf` | Light mode secondary |
| `--pc-color-secondary-950` | `#4a044e` | Dark mode secondary foreground |

### Neutrals — Slate

Neutrals use a slate scale for backgrounds, text, borders, and muted surfaces. Per Uncodixify compliance, backgrounds must remain neutral (no tinted or gradient backgrounds).

| Token | Hex | Usage |
|-------|-----|-------|
| `--pc-color-neutral-50` | `#f8fafc` | Light mode background, primary foreground |
| `--pc-color-neutral-200` | `#e2e8f0` | Light mode border |
| `--pc-color-neutral-400` | `#94a3b8` | Dark mode muted foreground |
| `--pc-color-neutral-500` | `#64748b` | Light mode muted foreground |
| `--pc-color-neutral-700` | `#334155` | Dark mode border |
| `--pc-color-neutral-800` | `#1e293b` | Dark mode muted background |
| `--pc-color-neutral-950` | `#020617` | Dark mode background, light mode foreground |

### Semantic Colors

| Purpose | Token (500) | Hex |
|---------|-------------|-----|
| Success | `--pc-color-semantic-success-500` | `#22c55e` |
| Warning | `--pc-color-semantic-warning-500` | `#eab308` |
| Error | `--pc-color-semantic-error-500` | `#ef4444` |
| Info | `--pc-color-semantic-info-500` | `#3b82f6` |

## Token Pipeline

```
packages/design-tokens/src/tokens/colors.ts   (source of truth)
        |
        v
packages/design-tokens/dist/tokens.css          (generated CSS custom properties)
        |
        v
packages/ui/src/globals.css                    (semantic theme mapping)
        |
        v
Tailwind v4 @theme inline                      (Tailwind utility class registration)
```

1. **Source tokens** are defined in TypeScript (`packages/design-tokens/src/tokens/colors.ts`) as hex values.
2. **Build step** generates `tokens.css` with `--pc-color-*` custom properties.
3. **Theme mapping** in `globals.css` maps tokens to semantic variables (`--color-primary`, `--color-background`, etc.) for both light and dark themes.
4. **Tailwind v4** picks up semantic variables via the `@theme inline` block, enabling utility classes like `bg-primary`, `text-foreground`.

## Theme Modes

Light and dark themes are toggled via the `data-theme` attribute on the root element.

- `:root` and `[data-theme="light"]` map to light mode tokens.
- `[data-theme="dark"]` maps to dark mode tokens with inverted luminance relationships.

## Uncodixify Compliance

The following rules from `docs/knowledge/Uncodixify.md` govern color usage:

- **No gradient backgrounds** — solid colors only.
- **No oversized border-radius** — maximum 12px (`--radius-lg`).
- **Neutral backgrounds** — never use brand-tinted backgrounds for page surfaces.
- **Brand colors for interactive elements only** — buttons, links, focus rings, badges.
- **Sufficient contrast** — foreground/background pairings must meet WCAG AA.

## Related Files

- Token definitions: `packages/design-tokens/src/tokens/colors.ts`
- Theme mapping: `packages/ui/src/globals.css`
- Brand color tests: `packages/ui/src/__tests__/brand-colors.test.ts`
- Token integration tests: `packages/ui/src/__tests__/design-token-integration.test.ts`
- Foundation tooling: `docs/design-system/foundation-tooling.md`
