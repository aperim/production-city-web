# @productioncity/holding-design-tokens

Production City design tokens — CSS custom properties, TypeScript constants, and JSON tokens for the Production City design system.

## Installation

```bash
# Scope must be routed to GitHub Packages
echo "@productioncity:registry=https://npm.pkg.github.com" >> .npmrc
pnpm add @productioncity/holding-design-tokens
```

Authentication: use a GitHub Personal Access Token with `read:packages` scope in your `.npmrc`:
```
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```
Never commit auth tokens. Store them in environment variables or a secrets manager.

## Usage

### CSS custom properties (recommended)

```css
/* In your global CSS */
@import "@productioncity/holding-design-tokens/tokens.css";

/* Then reference tokens anywhere */
.my-element {
  color: var(--pc-color-neutral-900);
  font-family: var(--pc-font-family-primary);
  padding: var(--pc-spacing-4);
}
```

### TypeScript constants

```ts
import { tokens } from "@productioncity/holding-design-tokens";

// Access token values as typed constants
const primaryFont = tokens.fontFamily.primary;
const spacing4 = tokens.spacing[4];
```

## Token Namespacing

All tokens are prefixed with `--pc-` to avoid collisions:

| Category | Example |
|----------|---------|
| Colour | `--pc-color-neutral-900`, `--pc-color-semantic-error-500` |
| Typography | `--pc-font-family-primary`, `--pc-font-size-base` |
| Spacing | `--pc-spacing-1` through `--pc-spacing-16` |
| Border radius | `--pc-radius-sm`, `--pc-radius-md`, `--pc-radius-lg` |
| Motion | `--pc-motion-duration-fast`, `--pc-motion-easing-standard` |

## Overriding Tokens

Override tokens at `:root` or any selector scope:

```css
@import "@productioncity/holding-design-tokens/tokens.css";

/* Campus theme override */
:root[data-theme="campus"] {
  --pc-color-neutral-900: #1a1a2e;
}
```

## Performance

- Token CSS: ~3KB raw / ~800 bytes gzipped — well within the 50KB budget.
- `sideEffects: false` — safe for tree-shaking.

## Contributing

See `../../CONTRIBUTING.md` for the monorepo contributing guide.
