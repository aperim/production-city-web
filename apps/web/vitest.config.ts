import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    testTimeout: 15000, // dashboard layout import is slow under full-suite concurrency
    include: ["app/**/*.test.ts", "app/**/*.test.tsx", "worker/**/*.test.ts", "scripts/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
    },
  },
  resolve: {
    conditions: ["development", "browser", "module", "import", "default"],
  },
});
