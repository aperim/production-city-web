import { Hono } from "hono";
import { cors } from "hono/cors";
import { createPrismaClient } from "./lib/prisma.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: (_origin, c) => {
      const allowed = c.env.ALLOWED_ORIGIN;
      if (!allowed) return "";
      return allowed;
    },
  }),
);

/** Liveness probe — no DB dependency */
app.get("/live", (c) => {
  return c.json({ status: "ok" });
});

/** Readiness probe — verifies DB connectivity via Prisma */
app.get("/ready", async (c) => {
  const prisma = createPrismaClient(c.env.DB);
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ status: "ok", db: "ok" });
  } catch (err) {
    console.error(
      JSON.stringify({ event: "readiness.check.failed", error: String(err) }),
    );
    return c.json({ status: "error", db: "unavailable" }, 503);
  } finally {
    await prisma.$disconnect();
  }
});

/** OpenAPI spec redirect */
app.get("/docs", (c) => {
  return c.json({
    openapi: "3.1.0",
    info: { title: "Production City API", version: "0.1.0" },
    paths: {
      "/live": {
        get: {
          summary: "Liveness probe",
          responses: {
            "200": {
              description: "Service is alive",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { status: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
      "/ready": {
        get: {
          summary: "Readiness probe",
          responses: {
            "200": {
              description: "Service is ready",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      db: { type: "string" },
                    },
                  },
                },
              },
            },
            "503": {
              description: "Service not ready",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "string" },
            error: { type: "string" },
          },
          required: ["status"],
        },
      },
    },
  });
});

export default app;
