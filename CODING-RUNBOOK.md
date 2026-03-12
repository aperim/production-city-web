## Non‑negotiables

1. **Follow**: `CODING.md` (mandatory).
2. **Follow**: `TROUBLESHOOTING.md` for ALL issue handling (mandatory).
3. **Issue-driven**: every change maps to a GitHub issue with acceptance criteria.
4. **Branch-only work**: never commit directly to `main`.
5. **Local validation first**: CI is **not** the first line of defense.
6. **pnpm only**: never use npm, yarn, or bun — this is a pnpm monorepo.
7. **No manual migrations or seeds**: CI runs migrations and seeds automatically. Never run them manually against production or staging. Devcontainer automation via `post-start.sh` is not "manual" — it is required.
8. **Prisma only for data access**: never use raw D1 API, raw Wrangler bindings, or raw SQL. See `CODING.md` for the rationale.
9. **GitHub-only registries**: all packages publish to GitHub Packages (`npm.pkg.github.com`), all containers to GitHub Container Registry (`ghcr.io`). Never publish to npmjs.com or Docker Hub. Never commit registry auth tokens to the repo. Package scope: `@productioncity`, naming: `@productioncity/<repo>-<package>`.

---

## Monorepo structure

```
production-city/
├── apps/
│   ├── web/          # vinext site (Next.js API surface on Vite + Cloudflare Workers)
│   ├── backend/      # Cloudflare Worker (API/business logic)
│   └── workers/      # Queue subscriber workers (Cloudflare Queues)
├── packages/
│   └── ui/           # Storybook component library (Atomic Design, shadcn/ui base)
├── prisma/           # Shared Prisma schema, migrations, seeds
├── docs/
│   └── knowledge/    # frontend-2026.md, Uncodixify.md, and future knowledge docs
├── .github/
│   └── workflows/    # GitHub Actions CI/CD (only deployment path)
├── .devcontainer/    # Devcontainer configuration and setup scripts
├── package.json      # pnpm workspace root
└── pnpm-workspace.yaml
```

---

## Ralph (ralph-loop) for autonomous runs

Ralph is not "magic autonomy"; it's a deliberate **in-session loop** implemented via a Claude Code **Stop hook**.

- Starting Ralph creates `.claude/ralph-loop.local.md` (state + the prompt)
- When Claude tries to exit, the stop hook reads the transcript, checks for completion, and (if not complete) **blocks exit** and feeds the **same prompt** back in.

**Key commands:**

- Start:
  - `/ralph-loop "<prompt>" --completion-promise "DONE" --max-iterations 50`
- Cancel:
  - `/cancel-ralph`

**Required safety settings:**

- Always set `--max-iterations` (avoid infinite loops)
- Prefer setting `--completion-promise` and require that it only be emitted when _actually true_

**Monitoring/health checks:**

- Ralph state file:
  - `.claude/ralph-loop.local.md`
- Quick iteration check:
  - `grep '^iteration:' .claude/ralph-loop.local.md`

#### Completion promise format

To signal completion, output the **exact** promise text wrapped in XML tags:

```
<promise>TASK COMPLETE</promise>
```

**Critical rules:**

- Use `<promise>` tags exactly as shown (literal XML, not markdown)
- The enclosed text must match `--completion-promise` exactly
- Only output when the statement is **completely and unequivocally TRUE**
- Never lie to exit the loop - verify all criteria before outputting

#### Writing effective Ralph prompts

**Structure:**

1. **Context** - Issue number, background, constraints
2. **Acceptance criteria** - Explicit, checkable requirements
3. **Process** - Steps to follow (TDD, issue updates, commits)
4. **Completion signal** - When and how to output the promise

**Best practices:**

- Use phased approaches for complex work (Phase 1, Phase 2, etc.)
- Include self-correction loops: test → fix → verify → continue
- Reference `CODING.md` explicitly in the prompt
- Require issue updates at milestones (not just at end)
- Specify commit format: `[#issue] description`

**Example structure:**

```markdown
## Issue: #123 - Feature description

### Context

[Background and constraints]

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests passing

### Process

1. Follow CODING.md (TDD, real services, atomic commits)
2. Update issue #123 after each milestone
3. Commit with [#123] prefix

### Completion

Output <promise>ISSUE 123 COMPLETE</promise> when:

- All criteria checked and verified
- All tests passing locally
- Issue updated with final status
```

#### Agent Teams for parallel work

Agent teams complement ralph-loop by adding parallel coordination. Ralph-loop keeps a session alive; agent teams coordinate multiple sessions working simultaneously.

**When to use which:**

| Need | Tool |
|------|------|
| Keep working until done (single session) | Ralph-loop |
| Parallel work across independent issues | Agent teams |
| Long-running parallel work | Agent teams (lead optionally in ralph-loop) |
| Quick focused subtask within a session | Subagents (Task tool) |

**How to start an agent team:**

Tell Claude Code to create a team in natural language:

```
Create an agent team for this epic. Spawn 3 teammates:
- One for issue #101 (backend API)
- One for issue #102 (frontend components)
- One for issue #103 (test coverage)
Each teammate should work in their own worktree.
```

Claude creates the team with a shared task list, spawns teammates, and coordinates.

**Key differences from ralph-loop orchestration:**

- Teammates communicate directly (not fire-and-forget)
- Shared task list with dependency tracking
- Teammates self-claim next tasks after completing work
- Graceful shutdown protocol
- Works within the devcontainer (in-process mode)

**Prerequisites:**

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be set — this is configured via `.env` (see `.env.example`)

---

## Coding tools: Claude Code vs Codex

- **Claude Code**: use for **all coding/implementation work**.
- **Codex CLI**: use for **all review work** (PR review, security/blind spot pass, etc.) via the Codex MCP server.

When delegating to these tools, be explicit: they don't know our workflow by default. Always include the required process steps and point at `CODING.md`.

### Claude Code plugins / skills

Our standard Claude Code plugin list is:

- circleback@claude-plugins-official
- claude-code-setup@claude-plugins-official
- claude-md-management@claude-plugins-official
- code-review@claude-plugins-official
- code-simplifier@claude-plugins-official
- commit-commands@claude-plugins-official
- feature-dev@claude-plugins-official
- frontend-design@claude-plugins-official
- github@claude-plugins-official
- hookify@claude-plugins-official
- linear@claude-plugins-official
- playground@claude-plugins-official
- playwright@claude-plugins-official
- pr-review-toolkit@claude-plugins-official
- pyright-lsp@claude-plugins-official
- ralph-loop@claude-plugins-official
- security-guidance@claude-plugins-official
- sentry@claude-plugins-official
- stripe@claude-plugins-official
- superpowers@claude-plugins-official
- typescript-lsp@claude-plugins-official

Key plugins to be aware of:

- `ralph-loop` (required for longer autonomous runs)
- `code-review`, `security-guidance`, `pr-review-toolkit`
- `github`, `commit-commands`, `playwright`

---

## Devcontainer setup

The devcontainer is **fully automated**. After the container starts, no manual setup steps are required.

### What runs automatically

**`post-create.sh`** handles tooling installation (runs once on container creation):
- pnpm installation and configuration
- Project dependencies (`pnpm install --frozen-lockfile`)
- Playwright browsers and Chromium
- Claude Code CLI and plugins
- Codex CLI and MCP server configuration
- Signing keys, shell customisations, git config

**`post-start.sh`** handles project-specific setup (runs on each container start):
- `pnpm exec prisma generate` — regenerates Prisma Client from schema
- `wrangler d1 migrations apply <D1_BINDING_NAME> --local` — applies any pending migrations to the local D1 database
- `pnpm db:seed` — seeds local data (idempotent, safe to run repeatedly)

After `post-start.sh` completes, the following must work without any additional setup:
- `pnpm test` — all unit tests pass
- `pnpm test:e2e` — E2E tests pass against the local devcontainer
- `pnpm build-storybook` — all Storybook stories build cleanly
- `pnpm --filter ./apps/web dev` — web app starts on port 4321

### Verifying devcontainer health

Before starting work on a new session:

```bash
# Check no pending migrations
wrangler d1 migrations list <D1_BINDING_NAME> --local --config apps/backend/wrangler.toml

# Generate Prisma Client for the current worktree
pnpm exec prisma generate

# Verify unit tests pass
pnpm test

# Verify Storybook builds (not the dev server — build-storybook gives a pass/fail result)
pnpm build-storybook
```

---

## Standard workflow (default)

### 0) Intake

- Confirm the **issue** exists and has clear **acceptance criteria**.
- If missing, create/fix the issue before coding.
- Be very careful of formatting and escaping
- Follow best practices for issue layout and content

### 1) Prepare workspace

- Create a **new branch**:
  - `issue/<number>-<short-slug>`

### 2) Devcontainer

- Ensure devcontainer is healthy (see "Verifying devcontainer health" above).
- Confirm local D1 database has no pending migrations.
- Confirm unit tests pass before touching any code.

### 2a) Storybook-first (for any frontend work)

Before writing any component code:

1. Review `docs/knowledge/frontend-2026.md` and `docs/knowledge/Uncodixify.md`
2. Identify the correct Atomic Design level: atom, molecule, organism, template, or page
3. Define the component in the appropriate `packages/ui/<level>/` directory
4. Write Storybook stories covering all meaningful states (default, loading, error, empty, disabled, etc.)
5. Run `pnpm build-storybook` and confirm stories build cleanly
6. Only then implement in the target app

### 3) Implement with meaningful local testing

- Follow TDD per `CODING.md`.
- Run locally before PR:
  - Unit tests: `pnpm test` or `pnpm --filter ./apps/<pkg> test`
  - E2E tests: `pnpm test:e2e`
  - Lint: `pnpm lint`
  - Typecheck: `pnpm typecheck`
- Dev servers:
  - Web: `pnpm --filter ./apps/web dev` (vinext, port 4321)
  - Backend: `pnpm --filter ./apps/backend dev` (wrangler)
  - Workers: `pnpm --filter ./apps/workers dev` (wrangler)
  - Storybook: `pnpm --filter ./packages/ui storybook`

**Monorepo build ordering:** If a package depends on `packages/ui` or other shared packages, those must be built before running tests or the dev server. Build shared packages first:
```bash
pnpm --filter ./packages/ui build   # build shared packages first
pnpm --filter ./apps/web test       # then test dependent apps
```
For packages with complex dependency graphs, use `pnpm --filter ./apps/web... build` (the `...` suffix includes dependencies recursively).

### 4) Issue hygiene (as you go)

**NOT NEGOTIABLE**

- Post progress updates and decisions **AS YOU WORK**
- On completion: mark acceptance criteria as complete **only if actually done + tested**.
- Never "update dump" at the end of a long process or completion of work.

### 5) Ship

1. Commit (small, atomic, tested) using the format:
   - `[#issue] Brief description of change`
2. Push branch.
3. Open PR.

### 6) Review

- Perform a **self-review** minimum:
  - Codex MCP security review
  - "blind spot" review (what could we have missed?)
- Address **all** review items (self + others).
- Mark feedback threads as resolved only when truly resolved.

### 7) CI to green

- Fix any CI issues until **completely green**.

### 8) Approve + merge

- Unless explicitly marked "human approval only":
  - approve (if required) using the alternate GitHub token: `GITHUB_TOKEN=$GITHUB_TOKEN_TROY gh pr review --approve <pr-number>`
  - merge

### 9) Reset and continue

- Fetch, switch to `main`, pull.
- Continue with next issue, if any.

---

## CI/CD pipeline (GitHub Actions)

**Deployment path: GitHub Actions only.** No Cloudflare Git integration. All deploys go through CI.

### CI sequence on merge to `main`

```
1.  pnpm install --frozen-lockfile
2.  pnpm exec prisma generate
3.  pnpm lint
4.  pnpm typecheck
5.  pnpm test                              # unit tests (Vitest)
6.  wrangler d1 migrations apply <DB>      # apply pending migrations (atomic, idempotent)
7.  pnpm db:seed                           # seed non-production environments (idempotent)
8.  pnpm build                             # compile all packages
9.  pnpm test:e2e                          # E2E tests (Playwright, against built artefacts)
10. pnpm --filter ./apps/web deploy        # vinext deploy → Cloudflare Workers
11. pnpm --filter ./apps/backend deploy    # wrangler deploy → Cloudflare Workers
12. pnpm --filter ./apps/workers deploy    # wrangler deploy → Cloudflare Workers (queues)
```

**Critical ordering rules:**
- Migrations (step 6) run **before** E2E tests (step 9) — E2E must test against the current schema
- Migrations run **before** deploys (steps 10–12) — code and schema must be in sync
- If any step fails, the pipeline stops — no partial deploys

**Seeds policy:**
- Seeds run in non-production environments only
- Seeds must be idempotent (upserts and existence checks — never plain inserts)
- Never run seeds against production manually or via CI

---

## Database workflow

### Prisma + D1 overview

- Prisma schema: `prisma/schema.prisma` (monorepo root)
- Database now: Cloudflare D1 (SQLite), via `@prisma/adapter-d1`
- Database planned: self-hosted PostgreSQL (TimescaleDB/PostGIS/PGVector)
- **Always use Prisma Client** — never raw D1/Wrangler API or raw SQL
- Each app that uses the database must have a `wrangler.toml` that declares a `[[d1_databases]]` binding. The binding name in `wrangler.toml` is the authoritative name — all migration commands use it. The `migrations_dir` in `wrangler.toml` must match where migration SQL files are generated (default: `prisma/migrations/`)

### Generating migrations

After changing `prisma/schema.prisma`, generate a migration SQL file:

```bash
# Verify the exact flags for your installed Prisma version:
pnpm exec prisma migrate diff --help

# Prisma 7.5 removed --from-local-d1. Point prisma.config.ts at the intended
# local datasource first, then use the config-backed flags for the installed CLI.
pnpm exec prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --script \
  --output ./prisma/migrations/<timestamp>_<description>.sql
```

> **Note:** Prisma CLI flags around local D1 diffing have changed across releases. Always verify the exact flags with `pnpm exec prisma migrate diff --help` against the installed version before copying a command from docs.

The migration SQL file must be committed alongside the schema change.

### Applying migrations locally

```bash
# Apply pending migrations to local D1
# <D1_BINDING_NAME> comes from [[d1_databases]] binding in wrangler.toml
wrangler d1 migrations apply <D1_BINDING_NAME> --local

# Audit which migrations have been applied vs. pending:
wrangler d1 migrations list <D1_BINDING_NAME> --local
```

The migrations directory must match `migrations_dir` in `wrangler.toml`. Verify alignment before generating migrations on a new project.

### CI applies migrations — never do this manually in production

```bash
# CI runs this automatically before deploy:
wrangler d1 migrations apply <D1_BINDING_NAME>

# Never run this manually against production.

# Audit applied migrations in production (read-only):
wrangler d1 migrations list <D1_BINDING_NAME>
```

### Rolling back a bad migration

**D1 does not support transactional DDL rollback.** There is no `prisma migrate reset` or rollback command for production D1.

The correct pattern is **forward-only migrations with compensating migrations**:
1. Do not attempt to undo a migration by reverting the SQL
2. Generate a new migration that reverses the schema change (e.g., drop a column you just added)
3. Apply the compensating migration through the normal CI pipeline

Design migrations to be safe if they need to be compensated: avoid destructive changes (column drops, type changes) in the same migration as additive ones. Separate concerns across multiple migration files.

### Seeds

- Seeds live in `prisma/seed.ts` (actual path configured in `package.json` → `prisma.seed`)
- Must be idempotent: use upserts and existence checks, never plain inserts
- Run locally via `post-start.sh` (automated) and in CI for non-production environments
- Never run seeds against production

### Future PostgreSQL migration

When migrating to self-hosted PostgreSQL:
- Change the Prisma provider in `schema.prisma` and swap `@prisma/adapter-d1` for the PostgreSQL adapter
- **Application data access code** should not need to change, provided Prisma Client is used exclusively — this is the primary reason raw D1/Wrangler API access is prohibited
- The following **will** require review and likely changes:
  - All migration SQL files (D1/SQLite uses different type mappings, e.g., `TEXT` for datetimes; PostgreSQL uses `TIMESTAMPTZ`)
  - Prisma Client instantiation code in Workers (adapter and binding injection changes)
  - Seed scripts using `prisma.$executeRaw` with SQLite-specific syntax
  - Schema features unavailable in SQLite (ENUMs, foreign key constraints enforced at DB level, `ALTER TABLE` with type changes)
  - PostgreSQL extensions (TimescaleDB, PostGIS, PGVector) require schema-level configuration with no D1 equivalent
- D1 uses SQLite semantics throughout. Design schemas to be portable: avoid SQLite-specific workarounds, prefer Prisma model-level constraints over raw SQL constraints where possible
