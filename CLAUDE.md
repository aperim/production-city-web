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

Before ANY frontend work, read **both**:

- `docs/knowledge/frontend-2026.md` — React 19, Tailwind v4, shadcn/ui, Vite 7 breaking changes
- `docs/knowledge/Uncodixify.md` — UI anti-patterns to avoid

Non-compliance produces incorrect, stale, or low-quality frontend code.

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
└── docs/knowledge/   # frontend-2026.md, Uncodixify.md
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
wrangler d1 migrations apply <D1_BINDING_NAME> --local --dry-run  # confirm no pending
pnpm test                                                           # confirm passing
pnpm build-storybook                                               # confirm stories clean
```

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
