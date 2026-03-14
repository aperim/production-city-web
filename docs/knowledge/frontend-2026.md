# Frontend Technology Reference — March 2026

**Last verified:** 2026-03-14
**Owner:** Engineering team
**Review cadence:** Monthly, or when any dependency is upgraded

> **This document is the source of truth for frontend tooling.**
> Agent training data is stale (2024). ALWAYS verify versions at task time.
> ALWAYS read this document before ANY frontend work.

---

## Current Versions (Verified 2026-03-14)

| Package | Latest | Installed | Action Required |
|---------|--------|-----------|-----------------|
| React | 19.2.4 | ^19.2.4 | None |
| Tailwind CSS | 4.2.1 | ^4.2.1 | None |
| Vite | **8.0.0** | ^7.3.1 | Upgrade planned |
| @tailwindcss/vite | 4.2.1 | ^4.2.1 | None |
| shadcn/ui CLI | v4 | — | March 2026 release |
| tw-animate-css | latest | — | Replaces tailwindcss-animate |

**Verify at task time:**
```bash
pnpm view tailwindcss dist-tags.latest
pnpm view vite dist-tags.latest
pnpm view react dist-tags.latest
```

---

## Tailwind CSS v4 — Complete Reference

### CSS Entry Point Pattern

Every Tailwind v4 project has ONE CSS entry point. Ours is `apps/web/app.css`:

```css
@import "../../packages/ui/src/globals.css";  /* design tokens + tailwind + theme */
@source "../../packages/ui/src";               /* scan UI package for class names */
```

**Critical rules:**
- `@import "tailwindcss"` appears ONCE (in globals.css), never duplicated
- `@source` is REQUIRED for monorepo packages outside the CSS file's directory
- Without `@source`, Tailwind will not generate utilities for classes in external packages

### @source Directive (Monorepo Critical)

Tailwind v4 auto-scans from the CSS file's directory. In a monorepo, component packages are elsewhere.

```css
/* Tell Tailwind to scan external packages */
@source "../../packages/ui/src";

/* Set base path for all scanning */
@import "tailwindcss" source("../../");

/* Ignore a directory */
@source not "../../packages/legacy";

/* Disable auto-detect, only scan explicit sources */
@import "tailwindcss" source(none);
@source "../../packages/ui/src";
@source "../../apps/web/app";

/* Force-generate a specific class */
@source inline("underline");

/* Force-generate with variants */
@source inline("{hover:,focus:,}bg-red-{50,{100..900..100},950}");
```

### @theme vs @theme inline

| Feature | `@theme` | `@theme inline` |
|---------|----------|-----------------|
| Generates global CSS vars | Yes | No |
| Generates utility classes | Yes | Yes |
| Runtime theme switching | No — value baked at build | Yes — var() resolved at runtime |
| Dark mode override | Must override theme var | Override the referenced var |

**Use `@theme inline` for any value that changes between light/dark mode.**

```css
/* CORRECT — runtime theme switching works */
:root {
  --background: oklch(0.145 0 0);
}
.dark {
  --background: oklch(0.985 0 0);
}
@theme inline {
  --color-background: var(--background);
}

/* WRONG — value baked at build time, dark mode won't work */
@theme {
  --color-background: var(--background);
}
```

### Color Format — OKLCH

shadcn/ui (2026) and Tailwind v4 use **OKLCH** color format, not HSL or hex.

```css
/* CORRECT (oklch) */
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
}

/* WRONG (hex via var indirection) */
:root {
  --color-primary: var(--pc-color-primary-400);  /* resolves to hex — works but non-standard */
}

/* WRONG (raw hex) */
:root {
  --primary: #38bdf8;
}
```

> **Note:** Our current codebase uses hex via `var(--pc-color-*)` indirection from design tokens.
> This works but is non-standard. Future refactoring should move to direct OKLCH values.

### shadcn/ui Color Convention

| CSS Variable | Background Utility | Text Utility |
|-------------|-------------------|--------------|
| `--background` | `bg-background` | — |
| `--foreground` | — | `text-foreground` |
| `--primary` | `bg-primary` | `text-primary` |
| `--primary-foreground` | — | `text-primary-foreground` |
| `--muted` | `bg-muted` | — |
| `--muted-foreground` | — | `text-muted-foreground` |

The `-foreground` suffix = text color for use ON that background.

### Dark Mode Strategy

We use the **class strategy** — dark is default, light via `.light` class:

```html
<html>          <!-- dark by default (our :root is dark) -->
<html class="light">  <!-- light mode override -->
```

In globals.css:
```css
:root { --background: oklch(0.145 0 0); }  /* dark values */
.light { --background: oklch(0.985 0 0); }  /* light overrides */
```

### Renamed Utilities (v3 to v4)

| v3 Class | v4 Class |
|----------|----------|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `rounded-sm` | `rounded-xs` |
| `rounded` | `rounded-sm` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |
| `bg-opacity-50` | `bg-black/50` |
| `blur-sm` | `blur-xs` |
| `blur` | `blur-sm` |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `decoration-slice` | `box-decoration-slice` |

### Hover Behavior Change (v4)

Tailwind v4 automatically gates `hover:` behind `@media (hover: hover)`.
Touch devices will NOT trigger hover states. This is correct behavior — no manual gating needed.

### Important Modifier Position (v4)

```html
<!-- v3 -->
<div class="!flex !bg-red-500">

<!-- v4: ! goes at the END -->
<div class="flex! bg-red-500!">
```

### Arbitrary Values with CSS Variables (v4)

```html
<!-- v3 -->
<div class="bg-[--brand-color]">

<!-- v4: use parentheses -->
<div class="bg-(--brand-color)">
```

### Custom Utilities (v4)

```css
/* v3 */
@layer utilities {
  .tab-4 { tab-size: 4; }
}

/* v4 */
@utility tab-4 {
  tab-size: 4;
}
```

### @apply in Separate Files (v4)

Separate CSS files (Vue SFC, CSS Modules) need `@reference`:

```css
@reference "../../app.css";

h1 {
  @apply text-2xl font-bold text-red-500;
}
```

### Animation Library

`tailwindcss-animate` is **deprecated**. Use `tw-animate-css`:
```css
@import "tw-animate-css";
```

### Default Border and Ring Colors Changed

v3 defaulted borders to `gray-200`. v4 uses `currentColor`. Specify colors explicitly:
```html
<div class="border border-gray-200">  <!-- must specify color -->
```

### Space and Divide Selectors Changed

Use flex/grid `gap` instead of `space-*`:
```html
<!-- v3 -->
<div class="space-y-4">

<!-- v4 recommended -->
<div class="flex flex-col gap-4">
```

### Variant Stacking Order Changed

```html
<!-- v3: right to left -->
<ul class="first:*:pt-0">

<!-- v4: left to right -->
<ul class="*:first:pt-0">
```

---

## React 19.2 — Key APIs

### Stable Hooks
- `useActionState(action, initialState)` — async action states (pending/fulfilled/rejected)
- `useOptimistic(state)` — optimistic UI updates
- `useFormStatus()` — form state without prop drilling
- `use(promise | context)` — read promises/context in render
- `useEffectEvent(fn)` — event handlers that see latest state without being effect deps

### Activity Component
```jsx
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <Page />  {/* pre-rendered but hidden, effects unmounted */}
</Activity>
```

### Removed / Deprecated
- `forwardRef` — ref is a regular prop in React 19
- Excessive `useMemo`/`useCallback` — React Compiler handles this
- `propTypes` — use TypeScript

### "use client" Directive

Components using hooks (`useState`, `useEffect`, `useRef`, etc.) MUST have `"use client"` at the top of the file, OR be imported through a barrel file that has `"use client"`.

**If a component uses any React hook and doesn't have "use client", it will fail silently in RSC environments** — hooks won't execute, state won't update, effects won't run.

---

## Vite 8.0 (Released 2026-03-12)

### Breaking Changes from v7
- **Rolldown bundler** — Rust-based, replaces esbuild+Rollup. 10-30x faster builds.
- **Node.js 20.19+ or 22.12+** required
- **@vitejs/plugin-react v6** — Babel removed, uses Oxc
- **ESM-only distribution**
- `resolve.tsconfigPaths: true` — built-in tsconfig paths (no plugin needed)
- `devtools` option — built-in Vite Devtools

---

## Our CSS Architecture

### File Structure

```
apps/web/app.css                              <- CSS entry point (imported by layout.tsx)
  |-- @import globals.css                     <- relative path to packages/ui
  |-- @source "../../packages/ui/src"         <- Tailwind scans UI package
  +-- app-specific styles (smooth scroll, fonts)

packages/ui/src/globals.css                   <- Design system CSS
  |-- @import design-tokens/dist/tokens.css   <- --pc-color-*, --pc-font-*, --pc-spacing-*
  |-- @import "tailwindcss"                   <- Tailwind base (ONLY instance)
  |-- :root { ... }                           <- Dark palette defaults
  |-- .light { ... }                          <- Light mode overrides
  |-- @theme inline { ... }                   <- Bridge CSS vars to Tailwind utilities
  |-- html/body base styles                   <- Background, color, font
  +-- Custom utility classes                  <- .pc-btn-hover, .pc-parallax-img, etc.

packages/design-tokens/dist/tokens.css        <- Generated from TS (must be built first)
  +-- :root { --pc-color-primary-50: #f0f9ff; ... }
```

### Build Order (Critical)

```
1. packages/design-tokens  (generates dist/tokens.css)
2. packages/ui             (compiles TS, copies globals.css)
3. apps/web                (vinext build — processes CSS through Tailwind)
```

If design-tokens is not built first, globals.css can't import tokens.css and ALL design variables will be undefined.

### Deploy Workflow Requirements

The deploy workflow (`.github/workflows/deploy.yml`) must:
1. Build `packages/design-tokens` before `packages/ui`
2. Include `packages/design-tokens/dist` in uploaded build artifacts
3. These artifacts must be available to staging/production deploy jobs

---

## Mistakes We've Made (Don't Repeat)

### 1. Missing @source in monorepo
**Symptom:** 59% of CSS utility classes missing in production.
**Cause:** Tailwind v4 only scans from the CSS file's directory. UI components in `packages/ui/src/` were never scanned.
**Fix:** `@source "../../packages/ui/src"` in app.css.

### 2. globals.css not imported
**Symptom:** All CSS custom properties undefined, site renders unstyled.
**Cause:** `app.css` imported `tailwindcss` directly but never imported `globals.css`.
**Fix:** `@import "../../packages/ui/src/globals.css"` in app.css.

### 3. Design tokens not built in CI
**Symptom:** Deploy fails with "Can't resolve tokens.css".
**Cause:** Deploy workflow built `packages/ui` but not `packages/design-tokens`.
**Fix:** Add `pnpm --filter ./packages/design-tokens build` before UI build.

### 4. Unit tests don't verify CSS
**Symptom:** All tests pass but production CSS is completely broken.
**Cause:** jsdom/happy-dom don't process real CSS. Tailwind utilities aren't generated in test environments.
**Lesson:** ALWAYS verify visual output in a real browser. ALWAYS check `vinext build` output locally. Test passing does not equal CSS working.

### 5. Missing "use client" directive
**Symptom:** Component renders but hooks don't execute.
**Cause:** Component uses React hooks but doesn't have `"use client"`. In RSC, hooks are silently ignored.
**Fix:** Add `"use client"` to the top of any component file using hooks.

---

## Verification Checklist (Before Every Frontend PR)

```bash
# 1. Build locally (catches CSS/import issues that tests miss)
pnpm --filter ./packages/design-tokens build
pnpm --filter ./packages/ui build
pnpm --filter ./apps/web... build

# 2. Check CSS output size (should be 50KB+ for a styled site)
wc -c apps/web/dist/client/assets/*.css

# 3. Check critical classes exist in output
grep -c "inset-0\|h-full\|lg:grid-cols" apps/web/dist/client/assets/*.css

# 4. Run dev server and check in a real browser
pnpm --filter ./apps/web dev
# Open http://localhost:4321 — visually verify the page

# 5. Standard quality gates
pnpm test
pnpm lint
pnpm typecheck
pnpm build-storybook
```

---

## Sources

- [Tailwind CSS v4 — Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS v4 — Detecting Classes](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Tailwind CSS v4 — Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [shadcn/ui — Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui — Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [shadcn/ui — Changelog](https://ui.shadcn.com/docs/changelog)
- [Vite 8.0 Announcement](https://vite.dev/blog/announcing-vite8)
- [React 19.2 Release](https://react.dev/blog/2025/10/01/react-19-2)
- [Tailwind v4 Monorepo Setup (Nx)](https://nx.dev/blog/setup-tailwind-4-npm-workspace)
- [GitHub #13136 — Monorepo Detection](https://github.com/tailwindlabs/tailwindcss/issues/13136)
