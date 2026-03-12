import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { createPrismaClient } from "./lib/prisma.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
};

export const app = new OpenAPIHono<{ Bindings: Bindings }>();

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
  const prisma = createPrismaClient(c.env.DB);
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ status: "ok" as const, db: "ok" as const }, 200);
  } catch (err) {
    console.error(
      JSON.stringify({ event: "readiness.check.failed", error: String(err) }),
    );
    return c.json({ status: "error", db: "unavailable" }, 503);
  } finally {
    await prisma.$disconnect();
  }
});

/** OpenAPI spec + docs */
app.doc31("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "Production City API", version: "0.1.0" },
});

app.get("/docs", (c) => {
  const html = `<!DOCTYPE html>
<html><head><title>Production City API Docs</title>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head><body><div id="swagger-ui"></div>
<script>SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui' })</script>
</body></html>`;
  return c.html(html);
});

export default app;
