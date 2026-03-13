# Contributing to @productioncity/holding-ui

This guide covers how to add new components to the Production City design system.

## Prerequisites

- Node.js (see `.nvmrc` at the monorepo root)
- pnpm 10+
- Familiarity with React 19, Tailwind v4, and TypeScript

## Setup

```bash
git clone https://github.com/productioncity/holding.git
cd holding
pnpm install --frozen-lockfile
pnpm --filter ./packages/design-tokens build
pnpm --filter ./packages/ui storybook
```

## Atomic Design Structure

Components live in `src/` organised by Atomic Design level:

```
src/
  atoms/          # Smallest building blocks (Button, Badge, Input)
  molecules/      # Combinations of atoms (SearchField, FormGroup)
  organisms/      # Complex UI sections (DataTable, NavigationHeader)
  templates/      # Page-level layout shells
  pages/          # Full page implementations
  foundations/    # Non-component utilities (motion, layering, positioning)
```

## Adding a New Component

### 1. Create the component directory

```bash
# Example: adding a new atom called "Tag"
mkdir -p src/atoms/Tag
```

### 2. Write the test first (TDD)

```bash
# src/atoms/Tag/Tag.test.tsx
```

Write failing tests before implementation. Cover:
- Renders with required props
- All variant/size combinations render
- Keyboard interactions work as expected
- axe-core violations are zero (use the `expectNoViolations` helper from `storybook-a11y.test.tsx`)

### 3. Implement the component

Follow these rules:

**CSS logical properties only** — no physical direction properties:
```tsx
// Bad
<div className="pl-4 mr-2 border-left" />

// Good
<div className="ps-4 me-2 border-s" />
```

**No hardcoded English strings** — all user-visible text via props:
```tsx
// Bad
<span aria-label="close">×</span>

// Good
<span aria-label={closeLabel}>×</span>
```

**No inline style for visual styling** — use Tailwind classes:
```tsx
// Bad — blocks CSP 'style-src: none'
<div style={{ color: "red" }} />

// Good
<div className="text-destructive" />
```

**Token-driven styling** — use CSS custom properties from the token system:
```tsx
// Bad — hardcoded colour
<div className="bg-[#111827]" />

// Good — token-driven
<div className="bg-background" />
```

**Semantic HTML** — use the correct element:
```tsx
// Bad
<div role="button" onClick={handler}>Click</div>

// Good
<button type="button" onClick={handler}>Click</button>
```

### 4. Create the Storybook story

```bash
# src/atoms/Tag/Tag.stories.tsx
```

Every story file must:
- Have a `Default` story showing the most common usage
- Cover all meaningful states (disabled, error, loading, etc.)
- Cover all size/variant combinations
- Include an `RTL` story with `dir="rtl"` to verify layout
- Include a `TextExpansion` story with 40% longer strings

### 5. Export the component

Add the export to `src/atoms/index.ts`:

```ts
export { Tag, tagVariants } from "./Tag/Tag";
export type { TagProps } from "./Tag/Tag";
```

### 6. Verify

```bash
# Tests pass
pnpm --filter ./packages/ui test

# Storybook builds
pnpm --filter ./packages/ui build-storybook

# TypeScript is clean
pnpm --filter ./packages/ui typecheck

# Lint passes
pnpm --filter ./packages/ui lint
```

### 7. Open a PR

Follow the branch convention: `issue/<number>-<short-slug>`. Reference the GitHub issue in the PR body.

## Component Checklist

- [ ] CSS logical properties used throughout (no `pl-`, `pr-`, `ml-`, `mr-`, `border-l`, `border-r`, `left-`, `right-` as layout)
- [ ] No hardcoded English strings in render output
- [ ] No inline `style` for visual styling
- [ ] Semantic HTML element used (not `div` with `role`)
- [ ] `aria-*` attributes correct
- [ ] Keyboard operable
- [ ] Focus ring visible (`focus-visible:outline-2 focus-visible:outline-offset-2`)
- [ ] Tests written before implementation
- [ ] axe-core zero violations in test
- [ ] All states covered in stories
- [ ] RTL story present
- [ ] Text expansion story present
- [ ] Exported from the correct index.ts
- [ ] TSDoc on all exported types and the component

## Token Usage

Import and use design tokens through Tailwind custom properties — do not reference token CSS variables directly in component code. The `globals.css` maps token variables to Tailwind colour names (e.g. `--pc-color-neutral-900` → `--color-foreground` → `text-foreground`).

## Questions

Open a GitHub issue tagged `question` in the `productioncity/holding` repository.
