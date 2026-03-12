import { describe, expect, it } from "vitest";

import { resolveClaudeAuth } from "./claude-auth.ts";

describe("resolveClaudeAuth", () => {
  it("accepts a direct Anthropic API key from ANTHROPIC_API_KEY", () => {
    const result = resolveClaudeAuth({
      ANTHROPIC_API_KEY: "sk-ant-api03-valid",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected Claude auth resolution to succeed");
    }

    expect(result.credentialSource).toBe("ANTHROPIC_API_KEY");
    expect(result.env.ANTHROPIC_API_KEY).toBe("sk-ant-api03-valid");
    expect(result.env.ANTHROPIC_AUTH_TOKEN).toBeUndefined();
  });

  it("prefers CLAUDE_CODE_API_KEY over an inherited non-direct ANTHROPIC_API_KEY", () => {
    const result = resolveClaudeAuth({
      ANTHROPIC_API_KEY: "btr-invalid-broker-token",
      ANTHROPIC_BASE_URL: "https://ccflare.internal.sy3.aperim.net",
      ANTHROPIC_CUSTOM_HEADERS: '{"x-test":"1"}',
      CLAUDE_CODE_API_KEY: "sk-ant-api03-from-wrapper",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected Claude auth resolution to succeed");
    }

    expect(result.credentialSource).toBe("CLAUDE_CODE_API_KEY");
    expect(result.env.ANTHROPIC_API_KEY).toBe("sk-ant-api03-from-wrapper");
    expect(result.env.ANTHROPIC_BASE_URL).toBeUndefined();
    expect(result.env.ANTHROPIC_CUSTOM_HEADERS).toBeUndefined();
    expect(result.env.CLAUDE_CODE_API_KEY).toBeUndefined();
  });

  it("prefers CLAUDE_CODE_AUTH_TOKEN when present", () => {
    const result = resolveClaudeAuth({
      ANTHROPIC_API_KEY: "sk-ant-api03-ignored",
      ANTHROPIC_BASE_URL: "https://ccflare.internal.sy3.aperim.net",
      CLAUDE_CODE_AUTH_TOKEN: "tok-claude-code-auth",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected Claude auth resolution to succeed");
    }

    expect(result.credentialSource).toBe("CLAUDE_CODE_AUTH_TOKEN");
    expect(result.env.ANTHROPIC_AUTH_TOKEN).toBe("tok-claude-code-auth");
    expect(result.env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(result.env.ANTHROPIC_BASE_URL).toBeUndefined();
  });

  it("falls back to persisted login when the inherited app key is not Claude-compatible", () => {
    const result = resolveClaudeAuth({
      ANTHROPIC_API_KEY: "btr-invalid-broker-token",
      ANTHROPIC_BASE_URL: "https://ccflare.internal.sy3.aperim.net",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected Claude auth resolution to preserve persisted login");
    }

    expect(result.credentialSource).toBe("PERSISTED_LOGIN");
    expect(result.env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(result.env.ANTHROPIC_BASE_URL).toBeUndefined();
  });

  it("rejects empty Claude credential configuration", () => {
    const result = resolveClaudeAuth({
      ANTHROPIC_BASE_URL: "https://ccflare.internal.sy3.aperim.net",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected Claude auth resolution to preserve persisted login");
    }

    expect(result.credentialSource).toBe("PERSISTED_LOGIN");
    expect(result.env.ANTHROPIC_BASE_URL).toBeUndefined();
  });
});
