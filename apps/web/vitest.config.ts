import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.ts", "app/**/*.test.tsx"],
  },
  resolve: {
    conditions: ["import", "module", "browser", "default"],
  },
});
