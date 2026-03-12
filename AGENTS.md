# Production City — AI Agent Context

Production City is the initial landing page, marketing pages, and business systems for Production City™.
The entire stack runs **wholly within Cloudflare** (Workers, D1, Queues, Pages).

This file applies to all AI coding agents (Claude Code, Codex, etc.).
Claude Code users: also see `CLAUDE.md` for Claude-specific tooling.

---

## Hard Rules — No Exceptions

### 1. Worktree-only file changes

**NEVER modify files in the repository working directory directly.**
Every file change must be inside a git worktree created under `/tmp`:

```bash
git worktree add /tmp/<branch-name> -b <branch-name>
```

Do all work inside `/tmp/<branch-name>`.

### 2. No direct commits to `main`

Unless the user explicitly instructs otherwise:
1. Confirm or create a GitHub issue with acceptance criteria
2. Create a branch: `issue/<number>-<short-slug>`
3. Work in a worktree, commit, push, open a PR

### 3. Commit format

```
[#<issue>] Brief description of change
```

### 4. pnpm only

**Never use npm, yarn, or bun.** This is a pnpm monorepo.

### 5. Prisma only for data access

**Never use raw D1 API, raw Wrangler bindings, or raw SQL.**
All data access goes through Prisma Client, instantiated per-request inside the handler.

### 6. No manual migrations or seeds

CI runs migrations and seeds automatically. Never run them manually against production or staging.

### 7. GitHub-only for packages and containers

**Never publish to npmjs.com, Docker Hub, or any other registry.**

- Package registry: GitHub Packages (`npm.pkg.github.com`)
- Container registry: GitHub Container Registry (`ghcr.io`)
- Org scope: `@productioncity`
- Package naming: `@productioncity/<repo>-<package>` (e.g., `@productioncity/holding-ui`)

---

## Cloudflare Access

All infrastructure is Cloudflare. Credentials are in **1Password vault `Production City™`**,
item **`Cloudflare API - Production City`** (Global API Key).

---

## Training Data Is Stale — March 2026

**Agent training data is typically from 2024. It is currently March 2026.**

Assume all version information and framework API knowledge may be stale.

### Frontend knowledge gate (mandatory)

Before ANY frontend work, read **both**:

- `docs/knowledge/frontend-2026.md` — React 19, Tailwind v4, shadcn/ui, Vite 7 breaking changes
- `docs/knowledge/Uncodixify.md` — UI anti-patterns to avoid

### Version verification

Always check current versions before adding dependencies:

```bash
pnpm view <package> dist-tags.latest
```

Record the verified version in the PR description or issue comment.

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
pnpm --filter ./apps/backend dev      # backend worker (wrangler)
pnpm --filter ./packages/ui storybook # Storybook

# Tests
pnpm --filter ./apps/<pkg> test       # package-scoped (fast feedback during dev)
pnpm test                             # all unit tests (Vitest)
pnpm test:e2e                         # E2E (Playwright, requires devcontainer)

# Quality
pnpm lint
pnpm typecheck
pnpm build-storybook                  # verify all stories build — pass/fail

# Builds (shared packages must build before dependents)
pnpm --filter ./packages/ui build
pnpm --filter ./apps/web... build     # ... suffix includes deps recursively
```

---

## Storybook-First (Atomic Design)

For any UI component:

1. Read `docs/knowledge/frontend-2026.md` and `docs/knowledge/Uncodixify.md`
2. Identify Atomic Design level: atom → molecule → organism → template → page
3. Define component in `packages/ui/<level>/`
4. Write Storybook stories for all meaningful states (default, loading, error, empty, disabled)
5. Confirm `pnpm build-storybook` passes
6. Only then implement in the target app

---

## Database (Prisma + Cloudflare D1)

- Schema: `prisma/schema.prisma` (monorepo root)
- Current backend: Cloudflare D1 (SQLite) via `@prisma/adapter-d1`
- Planned: PostgreSQL (TimescaleDB/PostGIS/PGVector) — Prisma-only access enables this migration
- Prisma Client: **per-request instantiation inside the handler** — never at module scope

### Generating a migration

```bash
pnpm exec prisma migrate diff --help  # verify flags against installed version first

# Prisma 7.5 removed --from-local-d1. Point prisma.config.ts at the intended
# local datasource first, then use the config-backed flags for the installed CLI.
pnpm exec prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --script \
  --output ./prisma/migrations/<timestamp>_<description>.sql
```

Commit the `.sql` file with the schema change.

### No rollbacks — compensating migrations only

D1 does not support transactional DDL rollback. Generate a new forward migration that reverses the change.

---

## Session Start Checklist

Before writing any code:

```bash
wrangler d1 migrations list <D1_BINDING_NAME> --local --config apps/backend/wrangler.toml  # no pending migrations
pnpm exec prisma generate                                                           # generate client artifacts in the worktree
pnpm test                                                                           # unit tests passing
pnpm build-storybook                                                                # stories clean
```

---

## TDD (Mandatory)

Write failing tests before implementation code. Tests must cover expected usage, edge cases, and error conditions.
"Minimal TDD" is not acceptable. Run tests frequently. Commit only when passing.

---

## Issue-Driven Development (Mandatory)

- Every change requires a GitHub issue with acceptance criteria before work starts
- Update the issue with progress, decisions, and blockers as you work (not at the end)
- This makes work resumable after context loss

---

## Troubleshooting Protocol (Mandatory)

When you encounter ANY issue — build error, test failure, unexpected behavior, deprecation warning:

1. **Document immediately** — create or update a GitHub issue. No exceptions.
2. **Research immediately** — codebase + online docs. Update the issue with findings.
3. **Fix now** (default) — defer only if current work is a genuine blocker for all other work.
4. Follow `TROUBLESHOOTING.md` exactly.

**Never:**
- Say "I'll come back to this"
- Add `// TODO: fix this later`
- Comment out failing tests
- Disable CI checks
- Merge with failing tests or CI failures

---

## CI/CD — GitHub Actions Only

No Cloudflare Git integration. All deploys go through GitHub Actions on merge to `main`.

**CI sequence:** install → prisma generate → lint → typecheck → unit tests → migrate → seed → build → E2E → deploy

Migrations run before E2E tests and before deploys. If any step fails, the pipeline stops.

---

## Type Safety

- No `any` without a comment + tracking issue
- `unknown` only at trust boundaries, narrowed immediately
- Explicit interfaces and types for all data structures
- Public interfaces require documentation (JSDoc/TSDoc)

---

## Error Handling

- No silent failures
- Catch and handle or propagate with context
- Log what failed + relevant identifiers — never secrets or PII
- Fail fast and visibly
