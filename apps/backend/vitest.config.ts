import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    testTimeout: 30_000,
    include: ["src/**/*.test.ts"],
    fileParallelism: false,
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: {
          configPath: "./wrangler.toml",
        },
      },
    },
  },
});
