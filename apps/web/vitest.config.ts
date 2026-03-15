import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.ts", "app/**/*.test.tsx", "worker/**/*.test.ts", "scripts/**/*.test.ts"],
  },
  resolve: {
    conditions: ["import", "module", "browser", "default"],
  },
});
