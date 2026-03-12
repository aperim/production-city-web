# Agentic Coding Rules

These principles are **non-negotiable**. They apply to all contributors — human and automated.

---

## Production City Rules

These rules are specific to this repository and override general preferences where they conflict.

### Storybook-First with Atomic Design

- Every UI component MUST be defined and reviewed in `packages/ui` Storybook **before** it is implemented in any app
- No exceptions: if it renders on screen, it starts in Storybook
- `packages/ui` follows **Atomic Design** methodology — components are organised as:
  - `atoms/` — smallest building blocks (Button, Input, Badge, Icon)
  - `molecules/` — groups of atoms (SearchBar, FormField, Card)
  - `organisms/` — complex UI sections (Header, DataTable, Sidebar)
  - `templates/` — page-level layouts (no real data)
  - `pages/` — template instances with real/representative data
- Every component must have Storybook stories covering all meaningful states (default, loading, error, empty, disabled, etc.) before use in any app

### Version Discipline

- **Always check the current published version** of a package before adding it as a dependency
- Agent training data is typically 2+ years old — assume all version information in memory is stale
- Use `pnpm view <package> dist-tags.latest` or check the official package registry directly
- For non-package tooling (wrangler, prisma CLI, etc.) check the official documentation
- Record the version you verified in the PR description or issue comment

### Frontend Knowledge Gate

- Before ANY frontend work, review **both**:
  - `docs/knowledge/frontend-2026.md` — breaking changes in React 19, Tailwind v4, shadcn/ui, Vite 7
  - `docs/knowledge/Uncodixify.md` — UI anti-patterns and design decisions to avoid
- These documents contain knowledge that is NOT in agent training data
- Non-compliance will produce incorrect, stale, or low-quality frontend code

### pnpm Only

- This is a pnpm monorepo — **never use npm, yarn, or bun**
- Run scripts in a specific package: `pnpm --filter ./apps/web <script>`
- Run scripts across all packages: `pnpm -r run <script>` or use a root workspace script
- Add a dependency to a specific package: `pnpm --filter ./apps/web add <dep>`
- Add a dependency to the workspace root: `pnpm add -w <dep>`
- Install all dependencies (CI and initial setup): `pnpm install --frozen-lockfile`

### Database Access

- **Always use Prisma Client.** Never use raw D1 API, raw Wrangler bindings, or raw SQL for data access
- This is mandatory — the project will migrate from Cloudflare D1 to self-hosted PostgreSQL (TimescaleDB/PostGIS/PGVector). Any raw D1/Wrangler data access creates migration debt that cannot be easily resolved
- Prisma schema lives in `prisma/` at the monorepo root
- **CI runs migrations automatically. Manual migrations are NEVER permitted** — "manual" means a human typing commands by hand; automated tooling (post-start.sh, CI scripts) is required and allowed
- **CI runs seeds automatically. Manual seeds are NEVER permitted** against production
- All migrations and seeds MUST be atomic and idempotent

---

## Issue-Driven Development

- Every change requires a corresponding GitHub issue
- Create the issue before starting work if one doesn't exist
- Issues must include **acceptance criteria** (how to know it's done)
- Update the issue with progress, decisions, and blockers as work proceeds — not after completion
- This makes work resumable by any contributor at any point

## Test-Driven Development

- Write failing tests **before** implementation code
- Tests must cover expected usage, edge cases, and error conditions
- "Minimal TDD to satisfy TDD" is not acceptable — coverage must be meaningful
- Run tests frequently during development, not just at completion
- Commit only when tests pass

### Test commands for development

| Command | When to use |
|---------|-------------|
| `pnpm --filter ./apps/<pkg> test` | During active development on a specific package |
| `pnpm test` | All unit tests (Vitest) across the workspace |
| `pnpm test:e2e` | Full E2E tests (Playwright) — requires devcontainer running |
| `pnpm build-storybook` | Verify all Storybook stories build cleanly |

Prefer package-scoped tests (`--filter`) during iterative development for fast feedback. Always run `pnpm test` before pushing.

## Test Against Real Services

- If the dev environment provides services (databases, queues, caches), **integration tests must exercise them**
- Do not replace real-service integration coverage with mocks for local infrastructure
- Unit tests may mock infrastructure for speed/determinism, but merge requires real-service verification
- Migrations, queries, and integrations must be verified against actual services before committing

## Type Safety

- Avoid permissive types (`any`, overly broad unions) as a shortcut
- `unknown` is allowed at trust boundaries only if it is validated/narrowed immediately (schema/guards)
- Create explicit interfaces and types for all data structures
- Types are documentation — they should clarify intent and constraints
- `any` requires a comment with justification and a tracking issue

## Self-Documenting Code

- Use language-standard documentation (JSDoc, TSDoc)
- Document the **why**, not just the what
- Public interfaces require documentation — no exceptions
- If code needs a comment to explain what it does, consider refactoring first

## Separation of Concerns

- Each module, class, or function has one responsibility
- Business logic stays separate from infrastructure
- Keep I/O at the edges

## Idempotency and Atomicity

- **All operations must be safe to retry and produce the same outcome on repeated runs**
- This applies to: database migrations, seeds, resource creation, state changes, queue worker handlers, Cloudflare Worker deploys, and CI steps
- Use upserts, existence checks, and deterministic identifiers
- If an operation cannot be made idempotent, document why and add compensating safeguards

## Error Handling

- No silent failures
- Catch errors explicitly and either handle them or propagate with added context
- Log meaningful information — include what operation failed and relevant identifiers — **without logging secrets/PII**
- Fail fast and visibly
- When you encounter ANY issue (build error, test failure, unexpected behavior), follow `TROUBLESHOOTING.md` immediately — no deferring, no "I'll come back to this"

## Configuration

- No hardcoded secrets, URLs, ports, or environment-specific values
- All configuration comes from environment variables or config files
- Defaults should be safe and explicit

## Preserve Existing Conventions

- Match the patterns, style, and structure already present in the codebase
- Consistency with the project trumps personal preference
- Check for existing utilities, helpers, and abstractions before creating new ones

## Incremental Verification and Atomic Commits

- Verify each step works before moving to the next (tests, typecheck, lint, local run)
- Commit small, focused changes frequently (working states only)
- Each commit references its issue and is individually revertable
- Format: `[#issue] Brief description of change`
