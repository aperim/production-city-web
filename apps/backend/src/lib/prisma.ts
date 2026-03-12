import type { PrismaClient } from "@prisma/client";

/**
 * Creates a per-request PrismaClient instance bound to the given D1 database.
 *
 * IMPORTANT: Never instantiate PrismaClient at module scope in Cloudflare Workers.
 * The D1 binding is only available inside the request handler.
 */
export async function createPrismaClient(d1: D1Database): Promise<PrismaClient> {
  const [{ PrismaClient }, { PrismaD1 }] = await Promise.all([
    import("@prisma/client"),
    import("@prisma/adapter-d1"),
  ]);
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
}
