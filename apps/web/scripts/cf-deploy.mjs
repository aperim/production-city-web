#!/usr/bin/env node
/**
 * cf-deploy.mjs — Build and deploy apps/web to Cloudflare Workers.
 *
 * Usage:
 *   node scripts/cf-deploy.mjs staging
 *   node scripts/cf-deploy.mjs production
 *
 * vinext build generates dist/server/wrangler.json from the top-level
 * wrangler.jsonc config only — it does not apply env.* overrides.
 * This script builds, patches the generated file with the correct worker name,
 * D1 database_id, and routes for the target environment, then deploys.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ENV_CONFIG = {
  staging: {
    name: 'holding-web-staging',
    d1DatabaseId: '527c2f52-144b-422f-aa16-46e5b86cdd9f',
    routes: [
      { pattern: 'staging.production.city/*', zone_name: 'production.city' },
    ],
    vars: {
      HUBSPOT_PORTAL_ID: '443097706',
    },
  },
  production: {
    name: 'holding-web-production',
    d1DatabaseId: '2b77f155-690e-4368-800d-ee52e7796d81',
    routes: [
      { pattern: 'production.city/*', zone_name: 'production.city' },
      { pattern: 'www.production.city/*', zone_name: 'production.city' },
    ],
    vars: {
      HUBSPOT_PORTAL_ID: '443097706',
    },
  },
};

const env = process.argv[2];
if (!Object.hasOwn(ENV_CONFIG, env ?? '')) {
  console.error('Usage: node scripts/cf-deploy.mjs <staging|production>');
  process.exit(1);
}

const { name, d1DatabaseId, routes, vars: envVars = {} } = ENV_CONFIG[env];
const appDir = resolve(__dirname, '..');
const wranglerJsonPath = resolve(appDir, 'dist', 'server', 'wrangler.json');

/** Run a command, inheriting stdio. Exits on failure. */
function run(cmd, args) {
  const result = spawnSync(cmd, args, { cwd: appDir, stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// Step 1: Build
console.log(`[cf-deploy] Building for ${env}…`);
run('pnpm', ['exec', 'vinext', 'build']);

// Step 2: Patch dist/server/wrangler.json — vinext only copies top-level config
console.log(`[cf-deploy] Patching ${wranglerJsonPath}…`);
const config = JSON.parse(readFileSync(wranglerJsonPath, 'utf-8'));
config.name = name;
if (Array.isArray(config.d1_databases)) {
  const db = config.d1_databases.find((d) => d.binding === 'DB');
  if (db) {
    db.database_id = d1DatabaseId;
  }
}
if (routes.length > 0) {
  config.routes = routes;
} else {
  delete config.routes;
}
if (Object.keys(envVars).length > 0) {
  config.vars = { ...config.vars, ...envVars };
}
writeFileSync(wranglerJsonPath, JSON.stringify(config, null, 2) + '\n');
const varsStr = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join(', ');
console.log(`[cf-deploy] Patched: name=${name}, d1_databases[DB].database_id=${d1DatabaseId}, routes=${routes.length}${varsStr ? `, vars: ${varsStr}` : ''}`);

// Step 3: Deploy using the patched config (no --env flag — config is already environment-specific)
console.log(`[cf-deploy] Deploying ${name}…`);
run('pnpm', ['exec', 'wrangler', 'deploy', '--config', 'dist/server/wrangler.json']);
