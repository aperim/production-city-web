#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const claudeBin = process.env.PRODUCTION_CITY_CLAUDE_BIN?.trim() || "claude";
const cwd = process.env.PRODUCTION_CITY_CLAUDE_CWD?.trim() || resolve(".");
const timeoutMs = Number(process.env.PRODUCTION_CITY_CLAUDE_HEALTHCHECK_TIMEOUT_MS || "15000");

const result = spawnSync(
  claudeBin,
  [
    "-p",
    "--permission-mode",
    "bypassPermissions",
    "--strict-mcp-config",
    "--disable-slash-commands",
    "Reply with exactly TEST",
  ],
  {
    cwd,
    encoding: "utf-8",
    timeout: timeoutMs,
  },
);

const stdout = result.stdout?.trim() || "";
const stderr = result.stderr?.trim() || "";

if (result.error) {
  const suffix =
    result.error.name === "TimeoutError"
      ? `Timed out after ${timeoutMs}ms.`
      : result.error.message;
  console.error(`Claude print healthcheck failed. ${suffix}`);
  if (stdout) {
    console.error(`stdout: ${stdout}`);
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  process.exit(1);
}

if (result.status !== 0 || stdout !== "TEST") {
  console.error("Claude print healthcheck failed.");
  console.error(`exit: ${result.status ?? "null"}`);
  if (stdout) {
    console.error(`stdout: ${stdout}`);
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  process.exit(result.status ?? 1);
}

console.log("Claude print healthcheck passed.");
