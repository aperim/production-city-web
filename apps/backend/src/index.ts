import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { buildGelfMessage, toGelfJson, Level } from "@productioncity/holding-logging";
import { createPrismaClient } from "./lib/prisma.js";
import { mountRoutes } from "./routes.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { validateEnv } from "./middleware/env-validation.js";
import { t } from "./i18n/index.js";

/** Environment bindings provided by the Cloudflare Worker runtime. */
type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  POSTMARK_API_TOKEN: string;
  WEBSOCKET_SERVER: DurableObjectNamespace;
  HUBSPOT_QUEUE?: Queue;
};

export const app = new OpenAPIHono<{ Bindings: Bindings }>();

// Request ID middleware: generates X-Request-ID for every request
app.use("*", requestIdMiddleware());

// Request lifecycle logging: logs method, path, duration, status for every request
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const requestId = c.res.headers.get("X-Request-ID") ?? undefined;
  console.log(
    toGelfJson(
      buildGelfMessage("holding-backend", {
        short_message: `${c.req.method} ${c.req.path}`,
        level: Level.INFO,
        service: "holding-backend",
        request_id: requestId,
        duration_ms: Date.now() - start,
        status_code: c.res.status,
      }),
    ),
  );
});

// Environment validation: runs on every request, throws if required bindings are missing
app.use("*", async (c, next) => {
  validateEnv(c.env);
  await next();
});

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowed = c.env.ALLOWED_ORIGIN;
      if (!allowed || origin !== allowed) return "";
      return allowed;
    },
    credentials: true,
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
    const d1Start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const d1QueryMs = Date.now() - d1Start;
    console.log(
      toGelfJson(
        buildGelfMessage("holding-backend", {
          short_message: "readiness.check.passed",
          level: Level.DEBUG,
          service: "holding-backend",
          extra: { d1_query_ms: d1QueryMs },
        }),
      ),
    );
    return c.json({ status: "ok" as const, db: "ok" as const }, 200);
  } catch (err) {
    console.error(
      toGelfJson(
        buildGelfMessage("holding-backend", {
          short_message: "readiness.check.failed",
          level: Level.ERROR,
          service: "holding-backend",
          full_message: String(err),
          error_type: err instanceof Error ? err.constructor.name : "Error",
        }),
      ),
    );
    return c.json({ status: "error", db: "unavailable" }, 503);
  } finally {
    // Guard disconnect errors so they don't mask the health check result
    await prisma.$disconnect().catch((disconnectErr: unknown) => {
      console.error(
        toGelfJson(
          buildGelfMessage("holding-backend", {
            short_message: "readiness.disconnect.failed",
            level: Level.ERROR,
            service: "holding-backend",
            full_message: String(disconnectErr),
          }),
        ),
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
  const requestId = c.res.headers.get("X-Request-ID") ?? undefined;
  console.error(
    toGelfJson(
      buildGelfMessage("holding-backend", {
        short_message: "unhandled.error",
        level: Level.ERROR,
        service: "holding-backend",
        full_message: String(err),
        error_type: err instanceof Error ? err.constructor.name : "Error",
        request_id: requestId || undefined,
      }),
    ),
  );
  return c.json(
    { error: "internal_error", message: t("errors.internalError") },
    500,
  );
});

// Export Durable Object class for Cloudflare runtime discovery
export { WebSocketHibernationServer } from "./durable-objects/websocket-server.js";

export default app;
