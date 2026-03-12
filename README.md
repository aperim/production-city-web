# holding

Production City™ — holding page and monorepo foundation.

## Local Development

### Prerequisites

- Node.js 25 (current release)
- pnpm (current release)
- Devcontainer (recommended) — see `.devcontainer/`

### Getting started

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Start the web app (http://localhost:4321)
pnpm --filter ./apps/web dev

# Start the Storybook component library (http://localhost:6006)
pnpm --filter ./packages/ui storybook

# Start the backend API worker
pnpm --filter ./apps/backend dev

# Run all unit tests
pnpm test

# Run E2E tests (Playwright — requires dev server or CI)
pnpm test:e2e

# Lint and typecheck
pnpm lint
pnpm typecheck
```
