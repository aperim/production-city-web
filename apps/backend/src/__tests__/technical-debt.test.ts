/**
 * Tests for issue #125 technical debt:
 * - i18n completeness
 * - Environment validation
 * - Consistent error response format
 * - X-Request-ID on every response
 * - Rate limit middleware
 * - OpenAPI schema validity
 */

import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:workers";
import { app } from "../index.js";
import { t } from "../i18n/index.js";
import type { TranslationKey } from "../i18n/index.js";
import { validateEnv } from "../middleware/env-validation.js";
import { rateLimitMiddleware, clearRateLimitStore } from "../middleware/rate-limit.js";
import { OpenAPIHono } from "@hono/zod-openapi";
import en from "../i18n/en.json";

/** Helper: flatten a nested JSON object into dot-notation keys */
function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n", () => {
  it("all expected auth keys exist in en.json", () => {
    const keys = flattenKeys(en);
    const requiredAuthKeys = [
      "auth.login.rateLimited",
      "auth.login.checkEmail",
      "auth.login.invalidToken",
      "auth.login.invalidCode",
      "auth.login.loggedOut",
      "auth.login.required",
      "auth.login.invalidSession",
      "auth.login.accountInactive",
    ];
    for (const key of requiredAuthKeys) {
      expect(keys, `Missing key: ${key}`).toContain(key);
    }
  });

  it("all expected admin keys exist in en.json", () => {
    const keys = flattenKeys(en);
    const requiredAdminKeys = [
      "admin.users.notFound",
      "admin.invitations.notFound",
      "admin.approvals.notFound",
      "admin.approvals.approved",
      "admin.approvals.rejected",
    ];
    for (const key of requiredAdminKeys) {
      expect(keys, `Missing key: ${key}`).toContain(key);
    }
  });

  it("all expected error keys exist in en.json", () => {
    const keys = flattenKeys(en);
    const requiredErrorKeys = [
      "errors.rateLimited",
      "errors.notFound",
      "errors.invalidInput",
      "errors.conflict",
      "errors.unauthorized",
      "errors.forbidden",
      "errors.serviceUnavailable",
    ];
    for (const key of requiredErrorKeys) {
      expect(keys, `Missing key: ${key}`).toContain(key);
    }
  });

  it("t() resolves known keys correctly", () => {
    expect(t("auth.login.rateLimited" as TranslationKey)).toBe("Too many requests. Try again later.");
    expect(t("admin.users.notFound" as TranslationKey)).toBe("User not found.");
  });

  it("t() interpolates params", () => {
    const result = t("admin.users.invalidSortBy" as TranslationKey, {
      allowed: "createdAt, email",
    });
    expect(result).toBe("Invalid sortBy. Allowed: createdAt, email");
  });

  it("t() returns key for unknown keys", () => {
    const result = t("nonexistent.key" as TranslationKey);
    expect(result).toBe("nonexistent.key");
  });

  it("all leaf values in en.json are non-empty strings", () => {
    const keys = flattenKeys(en);
    for (const key of keys) {
      const value = t(key as TranslationKey);
      expect(value, `Key "${key}" has empty value`).toBeTruthy();
      expect(typeof value).toBe("string");
    }
  });
});

describe("Environment validation", () => {
  it("passes with valid env bindings", () => {
    expect(() =>
      validateEnv({
        DB: {},
        ALLOWED_ORIGIN: "http://localhost:4321",
        HMAC_SECRET: "test-secret",
        WEBSOCKET_SERVER: {},
      }),
    ).not.toThrow();
  });

  it("throws if DB binding is missing", () => {
    expect(() =>
      validateEnv({
        ALLOWED_ORIGIN: "http://localhost:4321",
        HMAC_SECRET: "test-secret",
        WEBSOCKET_SERVER: {},
      }),
    ).toThrow("Missing required D1 database binding: DB");
  });

  it("throws if ALLOWED_ORIGIN is missing", () => {
    expect(() =>
      validateEnv({
        DB: {},
        HMAC_SECRET: "test-secret",
        WEBSOCKET_SERVER: {},
      }),
    ).toThrow("ALLOWED_ORIGIN");
  });

  it("throws if HMAC_SECRET is missing", () => {
    expect(() =>
      validateEnv({
        DB: {},
        ALLOWED_ORIGIN: "http://localhost:4321",
        WEBSOCKET_SERVER: {},
      }),
    ).toThrow("HMAC_SECRET");
  });

  it("allows optional POSTMARK_API_TOKEN", () => {
    expect(() =>
      validateEnv({
        DB: {},
        ALLOWED_ORIGIN: "http://localhost:4321",
        HMAC_SECRET: "test-secret",
        WEBSOCKET_SERVER: {},
      }),
    ).not.toThrow();
  });

  it("throws if WEBSOCKET_SERVER binding is missing", () => {
    expect(() =>
      validateEnv({
        DB: {},
        ALLOWED_ORIGIN: "http://localhost:4321",
        HMAC_SECRET: "test-secret",
      }),
    ).toThrow("Missing required Durable Object binding: WEBSOCKET_SERVER");
  });
});

describe("X-Request-ID", () => {
  it("every response has X-Request-ID header", async () => {
    const req = new Request("http://localhost/live");
    const res = await app.fetch(req, env);
    const requestId = res.headers.get("X-Request-ID");
    expect(requestId).toBeTruthy();
    // Should be a valid UUID
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("each request gets a unique X-Request-ID", async () => {
    const req1 = new Request("http://localhost/live");
    const res1 = await app.fetch(req1, env);
    const id1 = res1.headers.get("X-Request-ID");

    const req2 = new Request("http://localhost/live");
    const res2 = await app.fetch(req2, env);
    const id2 = res2.headers.get("X-Request-ID");

    expect(id1).not.toBe(id2);
  });

  it("404 responses also have X-Request-ID", async () => {
    const req = new Request("http://localhost/nonexistent");
    const res = await app.fetch(req, env);
    expect(res.headers.get("X-Request-ID")).toBeTruthy();
  });
});

describe("Rate limit middleware", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("allows requests under the limit", async () => {
    const testApp = new OpenAPIHono();
    testApp.use(
      "*",
      rateLimitMiddleware({
        keyFn: (c) => c.req.header("X-Forwarded-For") || "unknown",
        limit: 3,
        windowSeconds: 60,
      }),
    );
    testApp.get("/test", (c) => c.json({ ok: true }));

    const req = new Request("http://localhost/test", {
      headers: { "X-Forwarded-For": "1.2.3.4" },
    });

    const res1 = await testApp.fetch(req);
    expect(res1.status).toBe(200);

    const res2 = await testApp.fetch(req);
    expect(res2.status).toBe(200);

    const res3 = await testApp.fetch(req);
    expect(res3.status).toBe(200);
  });

  it("returns 429 when limit is exceeded", async () => {
    const testApp = new OpenAPIHono();
    testApp.use(
      "*",
      rateLimitMiddleware({
        keyFn: (c) => c.req.header("X-Forwarded-For") || "unknown",
        limit: 2,
        windowSeconds: 60,
      }),
    );
    testApp.get("/test", (c) => c.json({ ok: true }));

    const req = new Request("http://localhost/test", {
      headers: { "X-Forwarded-For": "1.2.3.4" },
    });

    await testApp.fetch(req); // 1
    await testApp.fetch(req); // 2
    const res3 = await testApp.fetch(req); // 3 — over limit
    expect(res3.status).toBe(429);

    const body = (await res3.json()) as { error: string; message: string };
    expect(body.error).toBe("rate_limited");
    expect(body.message).toBe("Too many requests. Try again later.");
  });

  it("includes Retry-After header on 429", async () => {
    const testApp = new OpenAPIHono();
    testApp.use(
      "*",
      rateLimitMiddleware({
        keyFn: () => "test-key",
        limit: 1,
        windowSeconds: 60,
      }),
    );
    testApp.get("/test", (c) => c.json({ ok: true }));

    const req = new Request("http://localhost/test");
    await testApp.fetch(req); // 1
    const res2 = await testApp.fetch(req); // 2 — over limit
    expect(res2.status).toBe(429);

    const retryAfter = res2.headers.get("Retry-After");
    expect(retryAfter).toBeTruthy();
    expect(parseInt(retryAfter!, 10)).toBeGreaterThan(0);
    expect(parseInt(retryAfter!, 10)).toBeLessThanOrEqual(60);
  });

  it("different keys have independent limits", async () => {
    const testApp = new OpenAPIHono();
    testApp.use(
      "*",
      rateLimitMiddleware({
        keyFn: (c) => c.req.header("X-Forwarded-For") || "unknown",
        limit: 1,
        windowSeconds: 60,
      }),
    );
    testApp.get("/test", (c) => c.json({ ok: true }));

    const req1 = new Request("http://localhost/test", {
      headers: { "X-Forwarded-For": "1.1.1.1" },
    });
    const req2 = new Request("http://localhost/test", {
      headers: { "X-Forwarded-For": "2.2.2.2" },
    });

    const res1 = await testApp.fetch(req1);
    expect(res1.status).toBe(200);

    const res2 = await testApp.fetch(req2);
    expect(res2.status).toBe(200);

    // First IP is now over limit
    const res3 = await testApp.fetch(req1);
    expect(res3.status).toBe(429);

    // Second IP still has quota (but will now be limited)
    const res4 = await testApp.fetch(req2);
    expect(res4.status).toBe(429);
  });
});

describe("OpenAPI schema validity", () => {
  it("generates a valid OpenAPI 3.1.0 document", () => {
    const spec = app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Production City API", version: "1.0.0" },
    });

    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info.title).toBe("Production City API");
    expect(spec.paths).toBeDefined();
  });

  it("all documented paths have at least one response schema", () => {
    const spec = app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Production City API", version: "1.0.0" },
    });

    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
      for (const [method, operation] of Object.entries(methods ?? {})) {
        if (typeof operation !== "object" || operation === null) continue;
        const op = operation as { responses?: Record<string, unknown> };
        expect(
          op.responses,
          `${method.toUpperCase()} ${path} has no responses defined`,
        ).toBeDefined();
        expect(
          Object.keys(op.responses ?? {}).length,
          `${method.toUpperCase()} ${path} has empty responses`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("error responses use consistent schema shape", () => {
    const spec = app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Production City API", version: "1.0.0" },
    });

    const errorCodes = ["400", "401", "403", "404", "409"];
    let errorResponseCount = 0;

    for (const [, methods] of Object.entries(spec.paths ?? {})) {
      for (const [, operation] of Object.entries(methods ?? {})) {
        if (typeof operation !== "object" || operation === null) continue;
        const op = operation as {
          responses?: Record<string, { content?: Record<string, { schema?: Record<string, unknown> }> }>;
        };
        if (!op.responses) continue;

        for (const code of errorCodes) {
          const response = op.responses[code];
          if (!response?.content?.["application/json"]?.schema) continue;

          const schema = response.content["application/json"].schema;
          // Check that error responses have 'error' and 'message' properties
          const properties = schema.properties as Record<string, unknown> | undefined;
          if (properties) {
            expect(
              properties,
              `Error response ${code} should have 'error' property`,
            ).toHaveProperty("error");
            expect(
              properties,
              `Error response ${code} should have 'message' property`,
            ).toHaveProperty("message");
            errorResponseCount++;
          }
        }
      }
    }

    // Ensure we actually checked some error responses
    expect(errorResponseCount).toBeGreaterThan(0);
  });
});
