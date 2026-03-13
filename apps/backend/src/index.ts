import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { createPrismaClient } from "./lib/prisma.js";
import { mountRoutes } from "./routes.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { validateEnv } from "./middleware/env-validation.js";

/** Environment bindings provided by the Cloudflare Worker runtime. */
type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  POSTMARK_API_TOKEN: string;
};

export const app = new OpenAPIHono<{ Bindings: Bindings }>();

// Request ID middleware: generates X-Request-ID for every request
app.use("*", requestIdMiddleware());

// Environment validation: runs on every request, throws if required bindings are missing
app.use("*", async (c, next) => {
  validateEnv(c.env);
  await next();
});

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

/** Shared schemas */
const StatusOkSchema = z.object({
  status: z.literal("ok"),
});

const ReadyOkSchema = z.object({
  status: z.literal("ok"),
  db: z.literal("ok"),
});

const ErrorResponseSchema = z.object({
  status: z.literal("error"),
  db: z.literal("unavailable"),
});

/** Route definitions */
const liveRoute = createRoute({
  method: "get",
  path: "/live",
  summary: "Liveness probe",
  description: "Returns 200 if the service is running. No database dependency.",
  responses: {
    200: {
      content: { "application/json": { schema: StatusOkSchema } },
      description: "Service is alive",
    },
  },
});

const readyRoute = createRoute({
  method: "get",
  path: "/ready",
  summary: "Readiness probe",
  description:
    "Returns 200 if the service is ready and database is reachable.",
  responses: {
    200: {
      content: { "application/json": { schema: ReadyOkSchema } },
      description: "Service is ready",
    },
    503: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Service not ready",
    },
  },
});

/** Route handlers */
app.openapi(liveRoute, (c) => {
  return c.json({ status: "ok" as const }, 200);
});

app.openapi(readyRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ status: "ok" as const, db: "ok" as const }, 200);
  } catch (err) {
    console.error(
      JSON.stringify({ event: "readiness.check.failed", error: String(err) }),
    );
    return c.json({ status: "error", db: "unavailable" }, 503);
  } finally {
    // Guard disconnect errors so they don't mask the health check result
    await prisma.$disconnect().catch((disconnectErr: unknown) => {
      console.error(
        JSON.stringify({
          event: "readiness.disconnect.failed",
          error: String(disconnectErr),
        }),
      );
    });
  }
});

/**
 * OpenAPI spec + docs — versioned at /v1/ (Issue #98).
 * Health probes (/live, /ready) remain at root as infrastructure endpoints.
 */
app.doc31("/v1/openapi.json", {
  openapi: "3.1.0",
  info: { title: "Production City API", version: "1.0.0" },
});

app.get("/v1/docs", swaggerUI({ url: "/v1/openapi.json" }));

// Mount auth and admin API routes
mountRoutes(app as unknown as OpenAPIHono<{ Bindings: Record<string, unknown> }>);

// Global error handler: catch env validation and other uncaught errors
app.onError((err, c) => {
  console.error(
    JSON.stringify({
      event: "unhandled.error",
      error: String(err),
      requestId: c.res.headers.get("X-Request-ID") ?? undefined,
    }),
  );
  return c.json(
    { error: "internal_error", message: "An internal error occurred." },
    500,
  );
});

export default app;
