# @productioncity/holding-ui

Production City design system — React components (atoms, molecules, organisms) built on Tailwind v4, shadcn/ui conventions, and the Production City design tokens.

## Installation

```bash
# Scope must be routed to GitHub Packages
echo "@productioncity:registry=https://npm.pkg.github.com" >> .npmrc
pnpm add @productioncity/holding-ui
```

Peer dependencies (install separately):
```bash
pnpm add react react-dom
```

## Usage

```tsx
import { Button, Badge, Text } from "@productioncity/holding-ui";
import "@productioncity/holding-ui/globals.css";

function App() {
  return (
    <div data-theme="light">
      <Text as="h1">Production City</Text>
      <Badge>Featured</Badge>
      <Button variant="default" size="md">Book a Visit</Button>
    </div>
  );
}
```

## Theme Setup

Import the globals CSS once at your application entry point. It imports design tokens and sets up Tailwind custom properties:

```css
/* app.css or global.css */
@import "@productioncity/holding-ui/globals.css";
```

Set the active theme with a data attribute:

```html
<html data-theme="light">  <!-- or data-theme="dark" -->
```

## Component Reference

All components are documented in the [Storybook](https://storybook.production.city).

### Atoms

| Component | Description |
|-----------|-------------|
| `Button` | Primary interactive control. Variants: default, destructive, outline, ghost, link. Sizes: sm, md, lg. |
| `Badge` | Status and label indicator. Variants: default, secondary, outline, destructive. |
| `Text` | Typographic element. Renders any heading or text element via `as` prop. |
| `Input` | Text field with label, helper text, error, and icon slots. |
| `Textarea` | Multi-line text input with auto-resize option. |
| `Select` | Native select with label, placeholder, and option groups. |
| `Checkbox` | Single checkbox or grouped CheckboxGroup with select-all. |
| `RadioGroup` | Accessible radio button group. |
| `Toggle` | Boolean toggle switch with role="switch". |
| `Avatar` | User avatar with fallback initials and status indicator. |
| `AvatarGroup` | Stacked avatar list with overflow count. |
| `Icon` | Inline SVG icon wrapper. Requires aria-label or aria-hidden. |
| `Tooltip` | Accessible tooltip with auto-flip. |
| `Link` | Styled anchor with XSS-safe href sanitisation. |
| `Divider` | Horizontal or vertical separator. |
| `Skeleton` | Loading placeholder with pulse animation. |

## RTL Support

All components use CSS logical properties (`padding-inline-start`, `margin-inline-end`, etc.) and Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`). Activate RTL with `dir="rtl"` on any ancestor element.

## Accessibility

- WCAG 2.2 AA compliant. Full compliance documentation in [Storybook](https://storybook.production.city).
- axe-core runs in CI on every PR.
- All interactive components are keyboard operable with visible focus indicators.

## Tree Shakeability

Named exports only. The `sideEffects` field marks only the CSS file as a side effect. Build tools (Vite, webpack, Rollup) will eliminate unused components.

```ts
// Imports only Button — no other components bundled
import { Button } from "@productioncity/holding-ui";
```

## Contributing

See `CONTRIBUTING.md` in this directory for the component contribution guide.
