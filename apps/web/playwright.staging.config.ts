/**
 * Playwright config for staging environment validation.
 *
 * Run with:
 *   BASE_URL=https://staging.production.city \
 *   BACKEND_URL=https://api.staging.production.city \
 *   pnpm exec playwright test --config apps/web/playwright.staging.config.ts
 *
 * No webServer block — staging is external. Tests run against the live
 * staging deployment and do NOT use test-only endpoints (/v1/test/*).
 */

import { defineConfig, devices } from "@playwright/test";

const BASE_URL =
  process.env.BASE_URL ?? "https://staging.production.city";

export default defineConfig({
  testDir: "./e2e",
  testMatch: [
    "**/staging-smoke.spec.ts",
    "**/staging-env-isolation.spec.ts",
    "**/csp-violations.spec.ts",
  ],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "staging-smoke",
      grep: /@staging-smoke/,
      use: { ...devices["Desktop Chrome"] },
      timeout: 30_000,
    },
    {
      name: "staging-full",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
