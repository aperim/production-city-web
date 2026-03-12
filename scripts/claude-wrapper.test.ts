import { beforeEach, describe, expect, it, vi } from "vitest";

import { main } from "./claude-wrapper.ts";

describe("claude wrapper", () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...envSnapshot };
  });

  it("executes the configured Claude binary", async () => {
    process.env.PRODUCTION_CITY_REAL_CLAUDE_BIN = "/bin/echo";
    delete process.env.ANTHROPIC_API_KEY;

    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitCode = await main(["TEST"]);

    expect(exitCode).toBe(0);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("falls back to persisted login when an incompatible app key is inherited", async () => {
    process.env.PRODUCTION_CITY_REAL_CLAUDE_BIN = "/bin/echo";
    process.env.ANTHROPIC_API_KEY = "btr-proxy-token";
    process.env.ANTHROPIC_BASE_URL = "https://proxy.example";

    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitCode = await main(["TEST"]);

    expect(exitCode).toBe(0);
    expect(logSpy).not.toHaveBeenCalled();
  });
});
