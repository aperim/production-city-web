import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

/**
 * Creates a per-request PrismaClient instance bound to the given D1 database.
 *
 * IMPORTANT: Never instantiate PrismaClient at module scope in Cloudflare Workers.
 * The D1 binding is only available inside the request handler.
 */
export function createPrismaClient(d1: D1Database): PrismaClient {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter });
}
