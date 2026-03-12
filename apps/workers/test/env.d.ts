/**
 * Type declarations for cloudflare:test module.
 *
 * The workers package does not currently use env bindings in its
 * queue handler, so ProvidedEnv is intentionally minimal.
 */
declare module "cloudflare:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required by @cloudflare/vitest-pool-workers; no bindings needed yet
  interface ProvidedEnv {}
}
