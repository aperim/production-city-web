#!/usr/bin/env node

import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

import { resolveClaudeAuth } from "./claude-auth.ts";

function isMain(): boolean {
  return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
}

export async function main(argv: string[]): Promise<number> {
  const realClaudeBin = process.env.PRODUCTION_CITY_REAL_CLAUDE_BIN?.trim();
  if (!realClaudeBin) {
    console.error("Production City Claude wrapper is missing PRODUCTION_CITY_REAL_CLAUDE_BIN.");
    return 70;
  }

  const auth = resolveClaudeAuth(process.env);
  if (!auth.ok) {
    console.error(auth.message);
    return 78;
  }

  const child = spawn(realClaudeBin, argv, {
    env: auth.env,
    stdio: "inherit",
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      if (!child.killed) {
        child.kill(signal);
      }
    });
  }

  return await new Promise<number>((resolve) => {
    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      resolve(code ?? 1);
    });

    child.on("error", (error) => {
      console.error(`Failed to launch Claude Code: ${error.message}`);
      resolve(1);
    });
  });
}

if (isMain()) {
  const exitCode = await main(process.argv.slice(2));
  process.exit(exitCode);
}
