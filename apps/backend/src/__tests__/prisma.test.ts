import { describe, it, expect } from "vitest";

describe("Prisma factory", () => {
  it("exports createPrismaClient function", async () => {
    const mod = await import("../lib/prisma.js");
    expect(typeof mod.createPrismaClient).toBe("function");
  });

  it("index.ts does not export a PrismaClient instance at module scope", async () => {
    const mod = await import("../index.js");
    // The default export should be a Hono app, not a PrismaClient
    expect(mod.default).toBeDefined();
    expect(mod.default.constructor.name).not.toBe("PrismaClient");
    // Ensure no other export is a PrismaClient instance
    for (const [key, value] of Object.entries(mod)) {
      if (key === "default") continue;
      if (value && typeof value === "object" && "constructor" in value) {
        expect((value as { constructor: { name: string } }).constructor.name).not.toBe(
          "PrismaClient",
        );
      }
    }
  });
});
