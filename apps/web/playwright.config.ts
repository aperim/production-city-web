import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;
const BASE_URL = process.env.BASE_URL ?? "http://localhost:4321";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: CI ? 2 : 0,
  workers: 1,
  reporter: CI ? "github" : "list",

  use: {
    baseURL: BASE_URL,
    trace: CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: CI ? "on-first-retry" : "off",
  },

  projects: [
    {
      name: "smoke",
      grep: /@smoke/,
      use: { ...devices["Desktop Chrome"] },
      timeout: 30_000,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "pnpm run dev",
    port: 4321,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
