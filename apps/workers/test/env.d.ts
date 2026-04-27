/**
 * Type declarations for cloudflare:workers module.
 *
 * The workers package does not currently use env bindings in its
 * queue handler, so ProvidedEnv is intentionally minimal.
 */
declare namespace Cloudflare {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required by @cloudflare/vitest-pool-workers; no bindings needed yet
  interface Env {}
}

declare module "cloudflare:workers" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required by @cloudflare/vitest-pool-workers; no bindings needed yet
  interface ProvidedEnv {}
}
