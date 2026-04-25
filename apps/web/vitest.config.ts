import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    include: ["app/**/*.test.ts", "app/**/*.test.tsx", "worker/**/*.test.ts", "scripts/**/*.test.ts"],
  },
  resolve: {
    conditions: ["import", "module", "browser", "default"],
  },
});
