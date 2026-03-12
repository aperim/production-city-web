# CI Secrets and Security Configuration

Secrets required by GitHub Actions CI/CD pipeline and repository security settings.

---

## Required GitHub Actions Secrets

All secrets are configured in **Settings > Secrets and variables > Actions**.

| Secret | Purpose | Where to find |
|--------|---------|---------------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier | Cloudflare dashboard right sidebar |
| `CLOUDFLARE_API_TOKEN` | **Scoped** Cloudflare API token (see below) | Create at dash.cloudflare.com/profile/api-tokens |
| `CF_D1_DATABASE_ID_STAGING` | D1 database ID for staging environment | `wrangler d1 list` or Cloudflare dashboard |
| `CF_D1_DATABASE_ID_PRODUCTION` | D1 database ID for production environment | `wrangler d1 list` or Cloudflare dashboard |
| `GITHUB_TOKEN` | Default GitHub token (auto-provided) | Auto-injected by GitHub Actions |
| `GITHUB_TOKEN_TROY` | Alternate GitHub PAT for PR approvals | 1Password vault `Production City` |

### Cloudflare API Token — Scoped Only

**NEVER use the Global API Key in CI.** Create a scoped API token with minimum required permissions:

1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Custom Token** template
4. Required permissions:
   - **Account > Workers Scripts > Edit** — deploy Workers
   - **Account > D1 > Edit** — run migrations
   - **Account > Workers Queues > Edit** — manage Queues
5. Restrict to the Production City account only
6. Set a reasonable TTL (rotate regularly)

### GITHUB_TOKEN_TROY

Used exclusively for automated PR approvals to avoid the "cannot approve your own PR" restriction. This should be a **fine-grained PAT** from an alternate account with only **Pull requests: Read and Write** permission on this repository. Avoid classic PATs with broad `repo` scope.

---

## GitHub Environments

The deploy workflow uses GitHub Environments for deployment gating:

| Environment | Purpose | Protection rules |
|-------------|---------|-----------------|
| `staging` | Pre-production validation | None (auto-deploy) |
| `production` | Live deployment | **Required reviewers** (manual approval gate) |

Configure environments in **Settings > Environments**.

---

## Repository Security Settings

These are UI-only settings configured in **Settings > Code security and analysis**.

### Secret Scanning

1. Navigate to **Settings > Code security and analysis**
2. Enable **Secret scanning** — detects committed secrets (API keys, tokens, passwords)
3. Enable **Push protection** — blocks pushes containing detected secrets before they reach the remote

### Dependabot

Dependabot is configured via `.github/dependabot.yml` (committed in this repository):
- Weekly npm dependency updates (grouped by ecosystem: Cloudflare, Prisma, React)
- Weekly GitHub Actions dependency updates
- PRs labeled `dependencies` and `type: infrastructure`

Ensure Dependabot is enabled in **Settings > Code security and analysis > Dependabot**.

### CodeQL Static Analysis

CodeQL is configured via `.github/workflows/codeql.yml`:
- Runs on push to `main`, PRs targeting `main`, and weekly schedule (Monday 4am UTC)
- Analyzes JavaScript/TypeScript with `security-and-quality` query suite
- Results visible in **Security > Code scanning alerts**

---

## CI Pipeline Architecture

### `ci.yml` — Quality checks (every push and PR)

```
install → audit → prisma generate → lint → typecheck → test → OpenAPI validate
```

### `deploy.yml` — Deploy pipeline (merge to main only)

```
install → prisma generate → migrate (staging) → seed (staging) → build → E2E
  → deploy staging (web, backend, workers)
    → migrate (production) → deploy production (web, backend, workers)
```

### Design decisions

- **Runner**: `ubuntu-24.04` (pinned, never `ubuntu-latest`)
- **Node version**: read from `.nvmrc` (never hardcoded)
- **pnpm version**: pinned to major version 10
- **Build-once pattern**: artifacts built once, uploaded, then downloaded for deploy jobs
- **Seed guard**: `NODE_ENV` check prevents seeding in production context
- **Concurrency**: deploy pipeline never cancels in-progress deploys (`cancel-in-progress: false`)
- **Production gate**: requires manual approval via GitHub Environment protection rules

---

## Infrastructure Prerequisites

### Cloudflare Queues

Queues must be created manually before the workers can deploy:

```bash
wrangler queues create holding-jobs-staging
wrangler queues create holding-jobs-production
```

### D1 Databases

D1 databases must exist before migrations can run:

```bash
wrangler d1 create holding-db-staging
wrangler d1 create holding-db-production
```

Record the returned database IDs as GitHub Actions secrets (`CF_D1_DATABASE_ID_STAGING`, `CF_D1_DATABASE_ID_PRODUCTION`).

---

## Credential Source

All Cloudflare credentials are stored in **1Password vault `Production City`**, item **`Cloudflare API - Production City`**.
