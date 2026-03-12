# Foundation Tooling Recommendation

Addresses issue [#58](https://github.com/productioncity/holding/issues/58).

## Final decisions

- **Design-system codename:** `Greenroom`
- **Token build tool:** adopt **Style Dictionary** as the build pipeline
- **Token authoring posture:** keep the source of truth in repository-owned DTCG JSON; treat **Tokens Studio** as optional upstream authoring input, not as the build system
- **Positioning engine:** adopt **Floating UI** when the first overlay component lands
- **Icon library:** adopt **Lucide**
- **Visual regression:** start with **Playwright visual comparisons** in-repo; do not adopt Chromatic or Percy until the team explicitly accepts SaaS cost/privacy trade-offs

## Codename decision

`Greenroom` fits the Production City stagecraft metaphor without sounding like a product feature. Tokens, primitives, and components are prepared here before they appear on stage in apps or marketing pages.

## Version check

Verified on 2026-03-12 with `pnpm view`:

| Tool | Verified version |
| --- | --- |
| `style-dictionary` | `5.3.3` |
| `@cobalt-ui/core` | `1.12.0` |
| `@tokens-studio/sd-transforms` | `2.0.3` |
| `@floating-ui/react` | `0.27.19` |
| `lucide-react` | `0.577.0` |
| `@heroicons/react` | `2.2.0` |
| `@phosphor-icons/react` | `2.1.10` |

## Tool evaluation

| Option | DTCG fit | OKLCH / modern color | Output quality | Storybook fit | Theme support | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Style Dictionary | Strong | Strong with custom transforms and direct CSS token output | Strong CSS, JSON, TS-ready build outputs | Good; generated artifacts are easy to surface in docs/autodocs | Strong | **Adopt** |
| Cobalt UI | Moderate | Good raw token handling | Good CSS output, thinner TS/documentation story | Moderate | Strong | Not primary choice |
| Tokens Studio | Moderate by itself; stronger when paired with transforms/build tooling | Strong authoring UX for modern color values | Good authoring/export workflow, but not the build pipeline we should standardize on | Moderate | Strong | Optional upstream input only |
| Custom build | Whatever we make it | Whatever we make it | Flexible, but expensive to maintain | Flexible | Flexible | Reject for Phase 1 |

## Why Style Dictionary

- It is the best fit for a repo-owned, spec-oriented token pipeline that can emit CSS custom properties, JSON artifacts, and TypeScript-friendly outputs from one source tree.
- It keeps the team on a common industry path instead of inventing a private build system before the design system has shipped its first token package.
- It gives us enough control to keep colors in OKLCH/OKLab-oriented source values and transform them deliberately for CSS output.
- It works cleanly with Storybook because the generated outputs can be imported directly into docs pages, stories, or token inspection utilities without forcing Storybook to become the source of truth.

## Why not Cobalt UI

- Cobalt is promising, but the ecosystem, examples, and long-term maintenance signal are thinner than Style Dictionary right now.
- The repo needs a low-risk foundational choice. Style Dictionary has the more predictable path for generated multi-target output and future contributor familiarity.

## Why not Tokens Studio as the primary system

- Tokens Studio is useful when design needs Figma-based authoring and sync.
- It is not enough by itself as the canonical build pipeline for this repository.
- If the team later adopts it, the safe model is: Tokens Studio exports into repository-owned token source, then Style Dictionary performs the deterministic build.

## Why not a custom build

- A custom builder would force us to own DTCG edge cases, docs generation, format compatibility, and maintenance before the design system has proven its first stable token contract.
- There is no meaningful upside yet that justifies the maintenance debt.

## Recommended implementation shape

1. Keep raw token source in repository-owned DTCG-style JSON.
2. Preserve color values in perceptual color notation where possible.
3. Use Style Dictionary to emit:
   - CSS custom properties for apps and Storybook
   - JSON artifacts for docs and inspection tooling
   - TypeScript constants/types for application code
4. Reserve custom transforms for naming, layering, and any browser-targeted color fallback work.

## Additional recommendations

### Icon library

Choose **Lucide**.

- Best fit for simple monochrome UI primitives.
- Tree-shakeable React package.
- Visual style matches the repo's restrained UI direction better than Heroicons or multi-weight Phosphor.

Do not choose Heroicons as the default:

- Good quality, but the set is more opinionated around the Tailwind ecosystem and offers less breadth for general product UI.

Do not choose Phosphor as the default:

- Great coverage and weights, but the extra visual personality and package surface are unnecessary for this design system's baseline.

### Visual regression

Choose **Playwright visual comparisons** first.

- Lowest privacy risk because screenshots remain in our CI/storage choices.
- No per-snapshot SaaS pricing lock-in during foundation work.
- Already aligns with the repo's existing Playwright direction.

Do not choose Chromatic or Percy yet:

- Both are credible products, but they introduce external screenshot storage and recurring cost before we have enough UI volume to justify the trade.

### Overlay positioning

Choose **Floating UI** over a custom positioning engine.

- It solves collision handling, flipping, shifting, and arrow alignment without forcing us to build geometry logic ourselves.
- It is the right abstraction boundary: keep positioning delegated, keep dismissal/focus/layer policy inside `packages/ui`.

## Consequences

- The first token implementation issue should introduce Style Dictionary config and generated outputs, not reopen tool selection.
- The first overlay component issue should use Floating UI for placement and the shared foundation contracts documented in [component-foundations.md](component-foundations.md).

## Sources

- Style Dictionary: https://styledictionary.com/
- Tokens Studio: https://tokens.studio/
- Cobalt UI: https://cobalt-ui.pages.dev/
- Floating UI: https://floating-ui.com/
- Lucide: https://lucide.dev/
- Heroicons: https://heroicons.com/
- Phosphor Icons: https://phosphoricons.com/
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
- Chromatic: https://www.chromatic.com/
- Percy: https://www.browserstack.com/percy
