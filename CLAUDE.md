# Production City — Claude Code Context

Production City is the initial landing page, marketing pages, and business systems for Production City™.
The entire stack runs **wholly within Cloudflare** (Workers, D1, Queues, Pages).

---

## STOP — Read This Before Touching Anything

### Worktree-only. No exceptions.

**NEVER modify files in the repository working directory directly.**
Every file change must be made inside a git worktree created under `/tmp`:

```bash
git worktree add /tmp/<branch-name> -b <branch-name>
# do all work inside /tmp/<branch-name>
```

### No direct commits to `main`

Unless the user explicitly instructs otherwise:
1. Confirm or create a GitHub issue with acceptance criteria
2. Create a branch: `issue/<number>-<short-slug>`
3. Work in a worktree, commit, push, open a PR

### Commit format

```
[#<issue>] Brief description of change
```

---

## Cloudflare Access

All infrastructure is Cloudflare. Credentials are in **1Password vault `Production City™`**,
item **`Cloudflare API - Production City`** (Global API Key).

---

## Frontend Knowledge Gate — MANDATORY

**Agent training data is stale (typically 2024). It is currently March 2026.**

Before ANY frontend work, read **all three**:

- `docs/knowledge/frontend-2026.md` — React 19.2, Tailwind v4 (with monorepo `@source`), shadcn/ui OKLCH theming, Vite 8, CSS architecture, past mistakes to avoid
- `docs/knowledge/design-guidelines.md` — Cinematic storytelling design philosophy, color usage, typography, spacing, motion
- `docs/knowledge/Uncodixify.md` — UI anti-patterns to avoid

Non-compliance produces incorrect, stale, or low-quality frontend code.

**Critical Tailwind v4 monorepo rule:** `app.css` MUST have `@source "../../packages/ui/src"` or Tailwind will not generate utility classes for components in the UI package. See `frontend-2026.md` § "Mistakes We've Made" for the full list of CSS architecture pitfalls.

### Storybook-first (Atomic Design)

Every UI component must be defined in `packages/ui` Storybook before it exists in any app.
Order: atom → molecule → organism → template → page.
Stories must cover all meaningful states before the component is used elsewhere.

---

## Version Discipline — CURRENT RELEASE ONLY

**Always use the current release version. Never default to LTS, "stable", or "latest stable" unless explicitly instructed otherwise.**

Agent training data is stale. Assume all version numbers in memory are wrong. Verify at task time:

```bash
pnpm view <package> dist-tags.latest          # npm packages
node --version                                # confirm Node runtime
wrangler --version                            # confirm Wrangler
```

For non-npm tooling (Node.js, Wrangler, etc.), check the official release page at task time — do not guess.

Record the verified version in the PR description.

---

## TypeScript Execution — Node Native Only

**TypeScript files are executed exclusively via Node's native type stripping.**

```bash
node --experimental-transform-types --experimental-detect-module <file.ts>
```

**Never use:** ts-node, tsx, or any other TypeScript runner or transpiler.

Node 25 has stable Amaro/SWC-based type stripping. There is no need for external runners.

---

## Monorepo Structure

```
production-city/
├── apps/
│   ├── web/          # vinext (Next.js API surface on Vite + Cloudflare Workers) — port 4321
│   ├── backend/      # Cloudflare Worker (API/business logic)
│   └── workers/      # Queue subscriber workers (Cloudflare Queues)
├── packages/
│   └── ui/           # Storybook component library (Atomic Design, shadcn/ui base)
├── prisma/           # Shared Prisma schema, migrations, seeds
└── docs/knowledge/   # frontend-2026.md, design-guidelines.md, Uncodixify.md
```

---

## Key Commands

```bash
# Dependencies
pnpm install --frozen-lockfile

# Dev servers
pnpm --filter ./apps/web dev          # web — port 4321
pnpm --filter ./apps/backend dev      # backend worker
pnpm --filter ./packages/ui storybook # Storybook

# Tests
pnpm --filter ./apps/<pkg> test       # package-scoped (fast feedback)
pnpm test                             # all unit tests
pnpm test:e2e                         # E2E (Playwright, requires devcontainer)

# Quality
pnpm lint
pnpm typecheck
pnpm build-storybook                  # verify stories — pass/fail only

# Build (build shared packages before dependents)
pnpm --filter ./packages/ui build
pnpm --filter ./apps/web... build     # includes dependencies recursively
```

---

## Package Manager — pnpm Only

**Never use npm, yarn, or bun.**

```bash
pnpm --filter ./apps/web add <dep>    # add to specific package
pnpm add -w <dep>                     # add to workspace root
pnpm --filter ./apps/web <script>     # run script in package
pnpm -r run <script>                  # run script across all packages
```

---

## Package & Container Registry — GitHub Only

**Never publish packages to npmjs.com or push containers to Docker Hub.** We exclusively use GitHub registries.

- **Package registry:** GitHub Packages (`npm.pkg.github.com`)
- **Container registry:** GitHub Container Registry (`ghcr.io`)
- **Org scope:** `@productioncity` — all packages are prefixed with the GitHub org name
- **Package naming:** `@productioncity/<repo>-<package>` (e.g., `@productioncity/holding-ui`, `@productioncity/holding-design-tokens`)

The `@productioncity` scope must be routed to GitHub Packages. This is configured in CI via `NODE_AUTH_TOKEN` / `GITHUB_TOKEN` and locally via user-level `.npmrc` (not committed to the repo):

```bash
# Developer-local or CI .npmrc — scope routing
@productioncity:registry=https://npm.pkg.github.com
```

**Authentication safety:**
- CI uses `GITHUB_TOKEN` (automatic) or a fine-grained PAT with `write:packages` scope only
- Never commit `_authToken`, PAT values, or registry credentials to the repo
- Local auth belongs in `~/.npmrc` (user-level), never in the repo `.npmrc`
- All publishing goes through GitHub Actions CI — never publish manually

**Never:**
- Publish to npmjs.com
- Push containers to Docker Hub
- Commit registry auth tokens to the repository
- Publish manually — CI only

---

## Database — Prisma Only

**Never use raw D1 API, raw Wrangler bindings, or raw SQL.**

- Prisma Client must be instantiated **per-request** inside the handler — never at module scope
- Schema: `prisma/schema.prisma`
- Migrations are atomic, idempotent, and run by CI only — **never manually**
- Seeds: idempotent (upserts only), run by CI in non-production only
- D1 is temporary — migrating to PostgreSQL (TimescaleDB/PostGIS/PGVector); Prisma-only access is the migration path

### Generating a migration

```bash
pnpm exec prisma migrate diff --help  # verify flags for installed version first

# Prisma 7.5 removed --from-local-d1. Point prisma.config.ts at the intended
# local datasource first, then use the config-backed flags for the installed CLI.
pnpm exec prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --script \
  --output ./prisma/migrations/<timestamp>_<description>.sql
```

### Rolling back

D1 has no rollback. Use **forward-only compensating migrations** through CI.

---

## Devcontainer Health Check

Before starting work each session:

```bash
pnpm exec prisma generate                                           # regenerate Prisma Client
wrangler d1 migrations list DB --local --config apps/backend/wrangler.toml  # confirm no pending
pnpm test                                                           # confirm passing
pnpm build-storybook                                               # confirm stories clean
```

**`prisma generate` is mandatory.** Any code importing `@prisma/client` (backend, web, workers, seeds) will fail with `No such module "@prisma/client"` if the Prisma Client hasn't been generated in the current worktree. This is a per-worktree operation — each git worktree needs its own `prisma generate` run.

---

## E2E Tests — Local Only (Pre-PR Gate)

E2E tests do **not** run in GitHub Actions CI. The vinext dev server requires Cloudflare Workers D1 bindings that are unavailable on bare GitHub Actions runners. E2E will be added to CI at a later time.

**Before raising any PR, you MUST run the full E2E suite locally and confirm all tests pass:**

```bash
pnpm test:e2e                           # REQUIRED — full E2E suite (Playwright)
```

E2E requires the dev server running (`pnpm --filter ./apps/web dev`) or Playwright's `webServer` auto-start (configured in `playwright.config.ts`).

**Never raise a PR without passing E2E.** If E2E cannot run (e.g., missing infrastructure), document why in the PR description and flag it for review.

---

## TDD (Non-negotiable)

Write failing tests before implementation. Run frequently. Commit only when tests pass.
Coverage must be meaningful — edge cases and error conditions required.

---

## Issue and Troubleshooting Protocol

When you encounter **any** issue (build failure, test failure, unexpected behavior, CI failure,
deprecation warning — anything):

1. **Document immediately** in a GitHub issue — no exceptions, no deferring
2. **Research immediately** — codebase + online, update the issue
3. **Fix now** unless current work is a genuine blocker for all other work
4. Follow `TROUBLESHOOTING.md` exactly

**Forbidden:** "I'll come back to this", `// TODO: fix later`, commenting out failing tests,
disabling CI checks, merging with failures.

---

## i18n Routing Architecture

Production City supports 10 locales: en, zh, hi, es, ar, fr, bn, pt, ru, ja.

### Locale Resolution Order

1. **URL prefix** `/{locale}/path` — authoritative, always used if present
2. **localStorage** `pc-locale` — returning user preference (client-side)
3. **Accept-Language header** — browser/OS language (server-side suggestion only)
4. **Fallback** — `"en"` (default)

English lives at `/` with no prefix. All other locales use `/{locale}/` prefix.

### Worker-Rewrite Architecture

The Cloudflare Worker (`apps/web/worker/index.ts`) handles locale routing:

1. Parse `/{locale}/` prefix from URL
2. Strip prefix, set `X-Locale` header, forward to vinext
3. Set `Content-Language` response header
4. Invalid locale → 302 redirect to English path
5. First visit: set `pc-locale-suggestion` cookie from Accept-Language

The vinext app reads `X-Locale` to render `<html lang>` and `dir` server-side.

### Key Files

- `packages/ui/src/lib/i18n-constants.ts` — `SUPPORTED_LOCALES`, `LOCALE_META` (shared)
- `packages/ui/src/lib/i18n-format.ts` — `Intl.*` formatting utilities
- `apps/web/worker/locale-middleware.ts` — locale routing, cookie validation
- `apps/web/app/components/LocaleHead.ts` — hreflang, canonical URL generation
- `apps/web/app/i18n/pluralization.ts` — ICU plural syntax support
- `apps/web/scripts/generate-sitemap.ts` — build-time XML sitemap with locale variants

### Pluralization Syntax

Uses ICU message format: `{count, plural, =0 {none} one {# item} other {# items}}`

Plural forms per locale: Arabic (6), Russian (3), French/Spanish/Portuguese (2), English (2).

---

## Dashboard Architecture — Registry-Driven Feature Gating

The dashboard uses a **registry-driven scaffold** with 502 features, 26 sections, and 10 user roles. Features are defined in `docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json` and compiled to a route manifest at `apps/backend/src/_generated/route-manifest.ts`.

### Key Concepts

- **Dashboard roles** are detected from `dashboard:{role}` permission markers (not DB role names)
- **Permission resolution** supports wildcards (`hr:*`) and self-scope modifiers (`:self`, `:own`)
- **Anti-enumeration**: unauthorized features return 404 (not 403); GET /notify returns `{subscribed: false}`
- **Fail-closed**: RegistryProvider clears visible features on error

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/registry/visible` | GET | Filtered feature IDs per user role |
| `/v1/features/:featureId/notify` | POST | Subscribe to feature notification |
| `/v1/features/:featureId/notify` | DELETE | Unsubscribe |
| `/v1/features/:featureId/notify` | GET | Check subscription status |

### Frontend Integration

- `apps/web/app/lib/registry-context.tsx` — `RegistryProvider` + `useRegistry` hook
- `apps/web/app/lib/api-client.ts` — `getRegistryVisible()`, `subscribeToFeature()`, etc.
- Build-time manifest intersection prevents stale features from appearing

### Seed Data (dev/test)

10 test users seeded at `{role}@dashboard.test` (one per dashboard role). See `prisma/seed-logic.ts` step 7.

Full API documentation: `docs/api/dashboard-registry.md`

---

## CI/CD — GitHub Actions Only

No Cloudflare Git integration. All deploys go through GitHub Actions on merge to `main`.

CI sequence: install → generate → lint → typecheck → unit tests → migrate → seed → build → E2E → deploy

---

## Autonomous Runs

- **ralph-loop**: keeps a session alive autonomously (`/ralph-loop "<prompt>" --completion-promise "DONE" --max-iterations 50`)
- **Agent teams**: parallel work across issues (requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `.env`)

See `CODING-RUNBOOK.md` for full workflow.

---

## Review Tools

- **Codex MCP**: security review + blind-spot pass on all PRs
- **Approval**: `GITHUB_TOKEN=$GITHUB_TOKEN_TROY gh pr review --approve <pr-number>`

---

## Type Safety

- No `any` without a comment + tracking issue
- `unknown` only at trust boundaries, narrowed immediately
- All public interfaces require documentation (JSDoc/TSDoc)
