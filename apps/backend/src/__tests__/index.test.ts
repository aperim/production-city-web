import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";

describe("Backend API", () => {
  it("GET /live returns 200 with { status: 'ok' }", async () => {
    const req = new Request("http://localhost/live");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  it("GET /ready returns 200 with db: ok when DB is accessible", async () => {
    const req = new Request("http://localhost/ready");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe("ok");
    expect(body.db).toBe("ok");
  });

  it("unknown route returns 404", async () => {
    const req = new Request("http://localhost/nonexistent");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(404);
  });

  // Issue #98: OpenAPI spec and docs moved to /v1/ prefix
  it("GET /v1/openapi.json returns valid OpenAPI 3.1.0 spec", async () => {
    const req = new Request("http://localhost/v1/openapi.json");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty("openapi", "3.1.0");
    expect(body).toHaveProperty("paths");
    expect(body).toHaveProperty("info");

    const info = body.info as Record<string, unknown>;
    expect(info.title).toBe("Production City API");
  });

  it("GET /v1/docs returns HTML with Swagger UI pointing to /v1/openapi.json", async () => {
    const req = new Request("http://localhost/v1/docs");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("swagger-ui");
    expect(html).toContain("/v1/openapi.json");
  });

  it("GET /openapi.json (old path) returns 404 after versioning", async () => {
    const req = new Request("http://localhost/openapi.json");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(404);
  });

  it("GET /docs (old path) returns 404 after versioning", async () => {
    const req = new Request("http://localhost/docs");
    const res = await app.fetch(req, env);

    expect(res.status).toBe(404);
  });
});
