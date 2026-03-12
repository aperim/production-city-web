# CI Secrets

Secrets required by GitHub Actions CI/CD pipeline.

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account for Workers/D1 deployment |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for wrangler deploys |
| `CF_D1_DATABASE_ID` | Cloudflare D1 database identifier |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude integrations |
| `GITHUB_TOKEN` | Default GitHub token (auto-provided in Actions) |
| `GITHUB_TOKEN_TROY` | Alternate GitHub token for PR approvals |

## Notes

- `GITHUB_TOKEN_TROY` is used exclusively for automated PR approvals to avoid the "cannot approve your own PR" restriction
- All secrets are stored in the GitHub repository settings under Settings > Secrets and variables > Actions
- Cloudflare credentials can be found in 1Password vault `Production City`, item `Cloudflare API - Production City`
