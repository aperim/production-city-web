#!/usr/bin/env node
/**
 * CI validation: every inline <script> in the built HTML must be covered by
 * the production CSP script-src — either via an explicit 'sha256-...' hash or
 * 'unsafe-inline'.
 *
 * JSON-LD scripts (type="application/ld+json") and external scripts (src="…")
 * are excluded — they are not executable inline code.
 *
 * Usage:
 *   node --experimental-transform-types --experimental-detect-module \
 *        scripts/validate-csp-hashes.ts [dist-dir]
 *
 * Optional argument: path to the built HTML directory.
 * Defaults to apps/web/dist (relative to repo root).
 *
 * Exits 0 on pass, 1 on any uncovered inline script.
 *
 * @see PRO-402
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const REPO_ROOT = resolve(new URL(".", import.meta.url).pathname, "..");
const DIST_DIR = process.argv[2]
  ? resolve(process.argv[2])
  : join(REPO_ROOT, "apps/web/dist");

// Candidate worker source files — checked in order; first containing buildCsp wins.
const WORKER_CANDIDATE_PATHS = [
  join(REPO_ROOT, "apps/web/worker/csp.ts"),  // extracted module (PRO-403+)
  join(REPO_ROOT, "apps/web/worker/index.ts"), // inline definition (pre-PRO-403)
];

// ── HTML walking ──────────────────────────────────────────────────────────────

async function* walkHtml(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) yield full;
  }
}

// ── Inline script extraction ──────────────────────────────────────────────────

function extractInlineScripts(html: string): string[] {
  const results: string[] = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] ?? "";
    const body = m[2] ?? "";
    if (/\bsrc\s*=/i.test(attrs)) continue;                                // external
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue; // JSON-LD
    if (!body.trim()) continue;
    results.push(body);
  }
  return results;
}

// ── Hash computation ──────────────────────────────────────────────────────────

function sha256Hash(content: string): string {
  return `'sha256-${createHash("sha256").update(content).digest("base64")}'`;
}

// ── CSP extraction from worker source ────────────────────────────────────────

async function extractFromBuildCspModule(): Promise<{ src: string; sourceFile: string } | null> {
  const cspModulePath = join(REPO_ROOT, "apps/web/worker/csp.ts");
  try {
    const mod = await import(pathToFileURL(cspModulePath).href);
    if (typeof mod.buildCsp !== "function") return null;
    const prodCsp = mod.buildCsp("production.city") as string;
    const scriptSrcMatch = prodCsp.match(/script-src\s+([^;]+)/);
    if (!scriptSrcMatch) return null;
    return { src: scriptSrcMatch[1]!.trim(), sourceFile: cspModulePath };
  } catch {
    return null;
  }
}

/**
 * Extracts the production script-src value from buildCsp() in the worker.
 *
 * Strategy: find all template literal returns inside buildCsp; the production
 * one is the branch that does NOT contain "ws://localhost:*" (the dev guard).
 *
 * Checks WORKER_CANDIDATE_PATHS in order — handles both the pre-PRO-403 layout
 * (buildCsp in index.ts) and the extracted module (csp.ts).
 */
async function extractProductionScriptSrc(): Promise<{ src: string; sourceFile: string } | null> {
  const moduleResult = await extractFromBuildCspModule();
  if (moduleResult) return moduleResult;

  for (const candidate of WORKER_CANDIDATE_PATHS) {
    let content: string;
    try {
      content = await readFile(candidate, "utf-8");
    } catch {
      continue; // file doesn't exist, try next candidate
    }

    if (!content.includes("function buildCsp(")) continue; // not the right file

    const fnStart = content.indexOf("function buildCsp(");
    const fnSlice = content.slice(fnStart);

    const returnRe = /\breturn\s+`([^`]*)`/g;
    let m: RegExpExecArray | null;
    let prodCsp: string | null = null;

    while ((m = returnRe.exec(fnSlice)) !== null) {
      const literal = m[1]!;
      if (!literal.includes("ws://localhost:*")) {
        prodCsp = literal;
        // Don't break — take the last non-dev return if there are multiple
      }
    }

    if (!prodCsp) continue;

    const scriptSrcMatch = prodCsp.match(/script-src\s+([^;]+)/);
    if (!scriptSrcMatch) continue;

    return { src: scriptSrcMatch[1]!.trim(), sourceFile: candidate };
  }

  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // 1. Extract production script-src from worker source
  const cspResult = await extractProductionScriptSrc();
  if (cspResult === null) {
    console.error("ERROR: Could not extract production script-src from worker source.");
    console.error(`Searched: ${WORKER_CANDIDATE_PATHS.map((p) => relative(REPO_ROOT, p)).join(", ")}`);
    console.error("Expected a buildCsp() function with a non-dev return template literal.");
    process.exit(1);
  }

  const { src: scriptSrc, sourceFile } = cspResult;
  console.log(`Production script-src (from ${relative(REPO_ROOT, sourceFile)}): ${scriptSrc}`);

  const allowsUnsafeInline = scriptSrc.includes("'unsafe-inline'");
  const allowedHashes = new Set(
    scriptSrc.split(/\s+/).filter((t) => t.startsWith("'sha256-")),
  );

  // 2. Walk built HTML files
  let fileCount = 0;
  let scriptCount = 0;
  const uncovered: { file: string; hash: string; preview: string }[] = [];

  try {
    for await (const htmlFile of walkHtml(DIST_DIR)) {
      fileCount++;
      const html = await readFile(htmlFile, "utf-8");
      const inlineScripts = extractInlineScripts(html);
      const rel = relative(REPO_ROOT, htmlFile);

      for (const content of inlineScripts) {
        scriptCount++;
        const hash = sha256Hash(content);
        const preview = content.trim().slice(0, 80).replace(/\n/g, "↵");

        if (allowsUnsafeInline) {
          // CSP currently allows all inline scripts; report what hash would be needed
          console.log(`  INFO [${rel}]: inline script found — hash would be: ${hash}`);
        } else if (!allowedHashes.has(hash)) {
          uncovered.push({ file: rel, hash, preview });
        }
      }
    }
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      console.error(`\nERROR: Build output directory not found: ${DIST_DIR}`);
      console.error("Run the web app build before this script.");
      console.error("  pnpm --filter ./apps/web... build");
      process.exit(1);
    }
    throw err;
  }

  if (fileCount === 0) {
    console.warn(`\nWARN: No HTML files found in ${DIST_DIR}`);
    console.warn("The build may not generate static HTML (fully SSR). Skipping validation.");
    process.exit(0);
  }

  console.log(`\nScanned ${fileCount} HTML file(s), found ${scriptCount} inline executable script(s).`);

  if (allowsUnsafeInline) {
    console.log(
      "\nINFO: Production CSP uses 'unsafe-inline' — no hash enforcement is active.\n" +
        "Once 'unsafe-inline' is removed, each hash listed above must appear in buildCsp().\n" +
        "See PRO-400.",
    );
    process.exit(0);
  }

  if (uncovered.length === 0) {
    console.log("\nPASS: All inline scripts are covered by the production CSP.");
    process.exit(0);
  }

  console.error(`\nFAIL: ${uncovered.length} inline script(s) not covered by production CSP script-src:\n`);
  for (const { file, hash, preview } of uncovered) {
    console.error(`  File:    ${file}`);
    console.error(`  Hash:    ${hash}`);
    console.error(`  Preview: ${preview}`);
    console.error("");
  }
  console.error(
    "To fix: add the missing hash(es) to the non-dev return in buildCsp()\n" +
      `  in ${WORKER_CANDIDATE_PATHS.map((p) => relative(REPO_ROOT, p)).join(" or ")}`,
  );
  process.exit(1);
}

main().catch((err: unknown) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
