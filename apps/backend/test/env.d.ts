declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ALLOWED_ORIGIN: string;
  }

  interface Exports {
    default: Fetcher;
  }
}

declare module "cloudflare:workers" {
  interface ProvidedEnv {
    DB: D1Database;
    ALLOWED_ORIGIN: string;
  }
}
