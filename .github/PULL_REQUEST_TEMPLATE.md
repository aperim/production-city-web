## Summary

<!-- Brief description of what this PR does and why. -->

## Changes

<!-- Bulleted list of specific changes. -->

## Security Header Checklist

> Complete this section if this PR modifies CSP, HSTS, COOP, COEP, Permissions-Policy, X-Frame-Options, Referrer-Policy, or any other security header.

- [ ] All inline scripts are covered by CSP hashes or nonces
- [ ] Security headers were tested against a live page (not just unit tests)
- [ ] No security headers were weakened without documented justification
- [ ] connect-src, script-src, and other source lists have not been broadened beyond what is required

## Test Plan

<!-- How was this change tested? Include commands run, environments tested, edge cases verified. -->

- [ ] Unit tests pass (`pnpm test`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Lint and typecheck pass (`pnpm lint && pnpm typecheck`)
