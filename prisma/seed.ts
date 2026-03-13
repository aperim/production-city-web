import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { seedDatabase } from "./seed-logic.js";

// NOTE: seed.ts runs in a Node.js context (not CF Workers).
// Use the better-sqlite3 adapter with DATABASE_URL for local seeding.
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./local.db",
});
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("Seed: starting (idempotent)");
  await seedDatabase(prisma);
  console.log("Seed: complete");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
