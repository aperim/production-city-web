# Production City Design Guidelines

**Owner:** Design System Team
**Last reviewed:** 2026-03-14
**Review cadence:** Monthly

---

## Philosophy: Cinematic Storytelling

Production City's visual identity draws from the cinematic world it serves. Every screen should feel like a frame from a film — imagery-first, dark-mode-first, with dramatic typography that commands attention.

### Aspirational References

The following brands inform our design language as **aspirational direction, not pixel-copy targets**:

- **Disney** — World-building through narrative and immersive environments
- **Apple** — Precision, restraint, and hero imagery that speaks for itself
- **ILM (Industrial Light & Magic)** — Technical excellence conveyed through visual craft
- **Weta Workshop** — Artisanal quality and tangible depth

These references guide tone and ambition. We do not replicate their specific visual assets or layouts.

---

## Color System

### Dark-Mode-First

Production City defaults to dark mode. `:root` carries the dark palette. Light mode is an override via the `.light` class on `<html>`.

### Brand Colors

| Role | Token | Meaning |
|------|-------|---------|
| **Primary** | `--pc-color-primary-400` (dark) / `--pc-color-primary-700` (light) | Trust, technology, reliability |
| **Secondary** | `--pc-color-secondary-400` (dark) / `--pc-color-secondary-700` (light) | Creative energy, production craft |
| **Background** | `--pc-color-neutral-950` (dark) / `--pc-color-neutral-50` (light) | Deep cinema dark / clean light |
| **Foreground** | `--pc-color-neutral-100` (dark) / `--pc-color-neutral-950` (light) | High-contrast readable text |

### Usage Rules

- **Primary blue** = trust, technology, interactive elements, links, focus rings
- **Secondary magenta** = creative energy, accents, highlights, secondary CTAs
- Background and foreground use neutral scale only — never tinted
- Semantic colors (success, warning, error, info) follow their established tokens
- Overlay text on images must meet **WCAG AA** contrast: 4.5:1 for body text, 3:1 for large text (Finding #8)

---

## Typography

### Scale

| Tier | Size Range | Weight | Usage |
|------|-----------|--------|-------|
| **Display** | 48-72px (`--font-size-display`) | Bold (700) | Hero headlines, page titles |
| **Heading** | 24-36px (`--font-size-heading`) | Semibold (600) | Section headings |
| **Body** | 16-18px (`--font-size-body`) | Regular (400) | Paragraph text, descriptions |
| **Caption** | 12-14px (`--font-size-caption`) | Medium (500) | Labels, metadata, timestamps |

### Font Stack

- **Primary:** Inter, system-ui, -apple-system, sans-serif
- **Secondary:** Merriweather, serif (reserved for editorial/long-form)
- **Monospace:** Fira Code, monospace

### Rules

- Display type uses tight letter-spacing (`-0.05em` to `-0.025em`)
- Body text uses normal letter-spacing
- Line height: 1.25 (tight) for headings, 1.5 (normal) for body, 1.75 (relaxed) for long-form

---

## Spacing

### Section Padding

- Vertical section padding: 80-120px (`--section-padding: clamp(5rem, 8vw, 7.5rem)`)
- Content max-width: 1200px (`--content-max-width: 75rem`)

### Component Spacing

Follow the existing spacing scale from design tokens:
- `--pc-spacing-1` (4px) through `--pc-spacing-64` (256px)
- Use consistent increments: 4, 8, 12, 16, 24, 32, 48, 64px

---

## Motion

### Transition Standards

- Duration: 200-300ms for UI interactions
- Easing: `ease` for standard transitions
- Scroll-reveal: fade-in on intersection, 200ms duration

### Accessibility

- **All motion must respect `prefers-reduced-motion`** (Finding #5)
- `scroll-behavior: smooth` is gated behind `@media (prefers-reduced-motion: no-preference)`
- Animations should degrade to instant state changes when reduced motion is preferred

---

## Image & Media

### Hero Images

- Full-bleed heroes at 100vh (`--hero-height`)
- Always provide meaningful alt text
- Use `loading="lazy"` for below-fold images

### Media Panels

- Preserve aspect ratio on all media elements
- Subtle hover zoom (scale 1.02-1.05) on interactive media, gated behind prefers-reduced-motion
- Attribution required for all sourced media

---

## Accessibility

### Color Contrast

- Body text on backgrounds: minimum 4.5:1 ratio (WCAG AA)
- Large text (24px+ or 18.66px bold): minimum 3:1 ratio
- Interactive elements: visible focus indicators using `--color-ring`

### Color Scheme

- `color-scheme: dark` set on `:root` in CSS and via `<meta name="color-scheme" content="dark">` (Finding #19)
- Ensures native form controls, scrollbars, and system UI respect dark mode

---

## Governance

This document is the single source of truth for Production City's visual design language. Changes require:

1. Update this document with the proposed change
2. Update relevant design tokens and CSS custom properties
3. Verify all Storybook stories still render correctly
4. PR review by at least one team member
