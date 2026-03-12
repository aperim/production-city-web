import { describe, it, expect, vi } from "vitest";
import { app } from "../index.js";

/**
 * Creates a minimal mock D1Database for testing.
 * The readiness endpoint runs SELECT 1 via Prisma's $queryRaw.
 */
function createMockEnv(dbQueryResult: unknown = [{ "1": 1 }]) {
  return {
    DB: {
      prepare: vi.fn(() => ({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: dbQueryResult }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ success: true }),
        raw: vi.fn().mockResolvedValue(dbQueryResult),
      })),
      exec: vi.fn().mockResolvedValue({ count: 0, duration: 0 }),
      batch: vi.fn().mockResolvedValue([]),
      dump: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    } as unknown as D1Database,
    ALLOWED_ORIGIN: "http://localhost:4321",
  };
}

describe("Backend API", () => {
  it("GET /live returns 200 with { status: 'ok' }", async () => {
    const env = createMockEnv();
    const req = new Request("http://localhost/live");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  it("GET /ready returns 200 with db: ok when DB is accessible", async () => {
    const env = createMockEnv();
    const req = new Request("http://localhost/ready");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("ok");
    expect(body.db).toBe("ok");
  });

  it("unknown route returns 404", async () => {
    const env = createMockEnv();
    const req = new Request("http://localhost/nonexistent");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(404);
  });

  it("GET /openapi.json returns valid OpenAPI 3.1.0 spec", async () => {
    const env = createMockEnv();
    const req = new Request("http://localhost/openapi.json");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("openapi", "3.1.0");
    expect(body).toHaveProperty("paths");
    expect(body).toHaveProperty("info");

    const info = body.info as Record<string, unknown>;
    expect(info.title).toBe("Production City API");
  });

  it("GET /docs returns HTML with Swagger UI", async () => {
    const env = createMockEnv();
    const req = new Request("http://localhost/docs");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("swagger-ui");
    expect(html).toContain("/openapi.json");
  });
});
