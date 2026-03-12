import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "pnpm exec vinext dev --port 4321",
    port: 4321,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
