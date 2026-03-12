const DIRECT_API_KEY_PREFIXES = ["sk-ant-", "sk-"];

export type ClaudeAuthResolution =
  | {
      ok: true;
      credentialSource:
        | "ANTHROPIC_API_KEY"
        | "CLAUDE_CODE_API_KEY"
        | "CLAUDE_CODE_AUTH_TOKEN"
        | "PERSISTED_LOGIN";
      env: NodeJS.ProcessEnv;
    }
  | {
      ok: false;
      message: string;
    };

function isDirectAnthropicApiKey(value: string): boolean {
  return DIRECT_API_KEY_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function redactEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const nextEnv = { ...env };
  delete nextEnv.ANTHROPIC_API_KEY;
  delete nextEnv.ANTHROPIC_AUTH_TOKEN;
  delete nextEnv.ANTHROPIC_BASE_URL;
  delete nextEnv.ANTHROPIC_CUSTOM_HEADERS;
  delete nextEnv.CLAUDE_CODE_API_KEY;
  delete nextEnv.CLAUDE_CODE_AUTH_TOKEN;
  return nextEnv;
}

export function resolveClaudeAuth(env: NodeJS.ProcessEnv): ClaudeAuthResolution {
  const claudeCodeAuthToken = env.CLAUDE_CODE_AUTH_TOKEN?.trim();
  const claudeCodeApiKey = env.CLAUDE_CODE_API_KEY?.trim();
  const inheritedApiKey = env.ANTHROPIC_API_KEY?.trim();
  const baseEnv = redactEnv(env);

  if (claudeCodeAuthToken) {
    const nextEnv = { ...baseEnv };
    nextEnv.ANTHROPIC_AUTH_TOKEN = claudeCodeAuthToken;
    return {
      ok: true,
      credentialSource: "CLAUDE_CODE_AUTH_TOKEN",
      env: nextEnv,
    };
  }

  if (claudeCodeApiKey) {
    const nextEnv = { ...baseEnv };
    nextEnv.ANTHROPIC_API_KEY = claudeCodeApiKey;
    return {
      ok: true,
      credentialSource: "CLAUDE_CODE_API_KEY",
      env: nextEnv,
    };
  }

  if (inheritedApiKey) {
    if (!isDirectAnthropicApiKey(inheritedApiKey)) {
      return {
        ok: true,
        credentialSource: "PERSISTED_LOGIN",
        env: baseEnv,
      };
    }

    const nextEnv = { ...baseEnv };
    nextEnv.ANTHROPIC_API_KEY = inheritedApiKey;
    return {
      ok: true,
      credentialSource: "ANTHROPIC_API_KEY",
      env: nextEnv,
    };
  }

  return {
    ok: true,
    credentialSource: "PERSISTED_LOGIN",
    env: baseEnv,
  };
}
