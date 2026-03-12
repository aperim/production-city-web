# Design: Update CODING.md, CODING-RUNBOOK.md, TROUBLESHOOTING.md for Production City

**Date:** 2026-03-12
**Approach:** C — Targeted updates + Production City sections

---

## Context

These three files were copied from another repository (openclaw-projects) and need to be adapted for Production City. The core protocols are sound and should be preserved. Changes are targeted: fix wrong references, update commands, add Production City-specific rules as a dedicated section.

---

## Monorepo Structure

```
production-city/
├── apps/
│   ├── web/          # vinext site (Next.js API surface on Vite + CF Workers)
│   ├── backend/      # Cloudflare Worker (API/business logic)
│   └── workers/      # Queue subscriber workers (CF Queues)
├── packages/
│   └── ui/           # Storybook component library (shadcn/ui base)
├── prisma/           # Shared schema, migrations, seeds (single source of truth)
├── docs/
│   └── knowledge/    # frontend-2026.md and future knowledge docs
├── .github/
│   └── workflows/    # GitHub Actions CI/CD (only deployment path)
├── package.json      # pnpm workspace root
└── pnpm-workspace.yaml
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | vinext (Next.js API on Vite + Cloudflare Workers) |
| Frontend | React 19, Tailwind CSS v4, shadcn/ui |
| Components | Storybook (packages/ui) |
| Build | Vite 7.x |
| ORM | Prisma (ONLY — never raw D1/Wrangler APIs or raw SQL) |
| Database (now) | Cloudflare D1 (SQLite, via @prisma/adapter-d1) |
| Database (planned) | Self-hosted PostgreSQL (TimescaleDB, PostGIS, PGVector) |
| Testing | Vitest (unit), Playwright (E2E) |
| Package manager | pnpm (monorepo, ONLY — never npm/yarn/bun) |
| CI/CD | GitHub Actions → Cloudflare via Wrangler (no Cloudflare CI integration) |

---

## Changes: TROUBLESHOOTING.md

**Scope: minimal.**

1. Title line: `openclaw-projects` → `Production City`
2. Step 1 "An issue is ANY of the following" — add:
   - Prisma migration failures (local or CI)
   - Wrangler deploy failures
   - D1 binding or adapter errors
3. All protocol steps (1–8), forbidden behaviours, and success criteria: **unchanged**

---

## Changes: CODING.md

**Preserve all existing rules. Add a Production City section at the top.**

### New section: Production City Rules (added before all existing sections)

#### Storybook-First with Atomic Design
- Every UI component MUST be defined and reviewed in `packages/ui` Storybook before it is implemented in any app
- No exceptions: if it renders on screen, it starts in Storybook
- `packages/ui` follows **Atomic Design** methodology — components are organised as:
  - `atoms/` — smallest building blocks (Button, Input, Badge, Icon)
  - `molecules/` — groups of atoms (SearchBar, FormField, Card)
  - `organisms/` — complex UI sections (Header, DataTable, Sidebar)
  - `templates/` — page-level layouts (no real data)
  - `pages/` — template instances with real/representative data
- Every component must have Storybook stories covering all meaningful states before use in any app

#### Version Discipline
- Always check the current published version of a package before adding it
- Agent training data is typically 2+ years old — assume version information in memory is stale
- Use `pnpm info <package> version` or check the package registry directly

#### Frontend Knowledge Gate
- Before ANY frontend work, review **both**:
  - `docs/knowledge/frontend-2026.md` — breaking changes in React 19, Tailwind v4, shadcn/ui, Vite 7
  - `docs/knowledge/Uncodixify.md` — UI anti-patterns and design decisions to avoid
- These documents contain knowledge that is NOT in agent training data

#### pnpm Only
- This is a pnpm monorepo — never use npm, yarn, or bun
- Workspace commands: `pnpm --filter <package-name> <command>`
- Root scripts run across all packages: `pnpm <script>`
- Install packages: `pnpm add <pkg>` (never `npm install`)

#### Database Access
- **Always use Prisma Client.** Never use raw D1 API, raw Wrangler bindings, or raw SQL for data access.
- This is mandatory — the project will migrate from D1 to self-hosted PostgreSQL (TimescaleDB/PostGIS/PGVector). Any raw D1/Wrangler data access creates migration debt.
- Prisma schema lives in `prisma/` at the monorepo root
- Migrations are generated with `prisma migrate diff --script`, applied via `wrangler d1 migrations apply`
- **CI runs migrations automatically. Manual migrations are NEVER permitted.**
- **CI runs seeds automatically. Manual seeds are NEVER permitted.**
- All migrations and seeds MUST be atomic and idempotent

### Updated test command table

| Command | When to use |
|---------|-------------|
| `pnpm --filter <pkg> test` | During active development on a specific package |
| `pnpm test` | All unit tests (Vitest) across the workspace |
| `pnpm test:e2e` | Full E2E tests (Playwright) — requires local devcontainer |
| `pnpm storybook` | Verify components before implementing in apps |

### Existing idempotency section
Expand the existing rule to explicitly call out: migrations, seeds, queue worker handlers, and Cloudflare Worker deploys must all be safe to retry and produce the same outcome on repeated runs.

---

## Changes: CODING-RUNBOOK.md

**Preserve existing structure. Update commands, add Production City-specific workflow steps.**

### Non-negotiables block (top of file)
- Add: "Never use npm, yarn, or bun — pnpm only"
- Add: "Never run migrations or seeds manually — CI does this"
- Add: "Never write raw D1/Wrangler API or raw SQL for data access — Prisma only"

### Devcontainer setup (updated)
`post-create.sh` MUST automate everything. No manual steps after container creation:

```
pnpm install
pnpm --filter prisma generate       # or root-level prisma generate
wrangler d1 migrations apply DB --local  # apply all pending migrations locally
pnpm db:seed                        # run seeds (idempotent)
```

Local testing must be fully operational after `post-create.sh` completes — unit tests, E2E tests, and Storybook must all work without additional setup.

### Standard workflow: updated steps

**Step 0 — Intake:** unchanged

**Step 1 — Prepare workspace:** unchanged (branch from main)

**Step 2 — Devcontainer:** Confirm `post-create.sh` completed successfully. Verify:
- `wrangler d1 migrations apply DB --local` shows no pending migrations
- Unit tests pass: `pnpm test`
- Storybook builds: `pnpm storybook`

**New Step 2a — Storybook-first (for frontend work):**
- Identify the correct Atomic Design level: atom, molecule, organism, template, or page
- Define the component in the appropriate `packages/ui/<level>/` directory
- Write Storybook stories covering all meaningful states (default, hover, error, loading, empty, etc.)
- Review and approve component in Storybook
- Only then implement in the target app

**Step 3 — Implement:** unchanged (TDD per CODING.md), plus:
- Dev commands: `pnpm --filter apps/web dev` (vinext), `pnpm --filter apps/backend dev` (wrangler)
- Check frontend-2026.md before frontend work
- Use `pnpm --filter` for package-scoped commands

**Steps 4–9:** unchanged

### CI/CD workflow (new section)
Deployment path: **GitHub Actions only.** No Cloudflare Git integration.

CI sequence on merge to main:
1. `pnpm install`
2. `pnpm test` (all unit tests)
3. `pnpm test:e2e` (Playwright)
4. `prisma migrate diff --script` (verify no unapplied schema changes)
5. `wrangler d1 migrations apply DB` (apply migrations — atomic, idempotent)
6. `pnpm db:seed` (run seeds — idempotent, staging only)
7. `wrangler deploy` (deploy workers)
8. `wrangler deploy apps/web` (deploy web)

Migrations always run before code deploys. If migration fails, deploy does not proceed.

### Database workflow (new section)

**Migrations:**
```bash
# Generate migration SQL from schema diff
pnpm prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema.prisma \
  --script \
  --output prisma/migrations/<timestamp>_<name>.sql

# Apply locally
wrangler d1 migrations apply DB --local

# CI applies to production automatically — never run this manually against production
```

**Seeds:**
- Seeds live in `prisma/seed.ts`
- Must be idempotent (upserts, existence checks — never plain inserts)
- CI runs seeds; never run manually against production

**Future PostgreSQL migration:**
- When migrating to self-hosted PostgreSQL, only `prisma/schema.prisma` provider and the Prisma adapter change
- No application code should need to change — this is only possible if Prisma Client is used exclusively everywhere

---

## Success Criteria

The docs update is complete when:
- [ ] `TROUBLESHOOTING.md` title references Production City, not openclaw-projects
- [ ] `CODING.md` has Production City section with all 5 rules (Storybook-first, version discipline, frontend knowledge gate, pnpm-only, database access)
- [ ] `CODING.md` test command table reflects Vitest + Playwright
- [ ] `CODING-RUNBOOK.md` non-negotiables include pnpm-only, no manual migrations/seeds, no raw D1/Wrangler
- [ ] `CODING-RUNBOOK.md` devcontainer section describes fully automated `post-create.sh`
- [ ] `CODING-RUNBOOK.md` includes Storybook-first workflow step
- [ ] `CODING-RUNBOOK.md` CI/CD section describes GitHub Actions sequence with migrations before deploy
- [ ] `CODING-RUNBOOK.md` database section covers migration generation, local apply, and future PostgreSQL note
- [ ] No references to `openclaw-projects` remain in any of the three files
- [ ] All existing protocols (troubleshooting steps 1–8, TDD rules, atomic commits, etc.) are preserved unchanged
