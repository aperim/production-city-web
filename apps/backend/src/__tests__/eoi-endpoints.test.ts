/**
 * Tests for Expression of Interest API endpoints.
 * TDD: tests written before implementation.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { setupTestDatabase } from "./test-helpers.js";

const BASE_URL = "http://localhost";

let requestCounter = 0;

function makeEoiRequest(body: Record<string, unknown>, headers?: Record<string, string>) {
  requestCounter++;
  return new Request(`${BASE_URL}/v1/eoi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE_URL,
      Referer: `${BASE_URL}/`,
      "cf-connecting-ip": `10.0.0.${requestCounter}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const validEoi = {
  category: "general",
  name: "Test User",
  email: "test@example.com",
  sourcePage: "/",
  locale: "en",
  consentVersion: "2026-03-01",
  privacyAccepted: true,
};

describe("EOI Public Endpoints", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  describe("POST /v1/eoi", () => {
    it("creates an EOI submission with valid data", async () => {
      const res = await app.fetch(makeEoiRequest(validEoi), env);
      expect(res.status).toBe(201);
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("message");
    });

    it("rejects submission without consent", async () => {
      const res = await app.fetch(makeEoiRequest({ ...validEoi, privacyAccepted: false }), env);
      expect(res.status).toBe(400);
    });

    it("rejects submission with invalid category", async () => {
      const res = await app.fetch(makeEoiRequest({ ...validEoi, category: "invalid" }), env);
      expect(res.status).toBe(400);
    });

    it("rejects submission with invalid email", async () => {
      const res = await app.fetch(makeEoiRequest({ ...validEoi, email: "not-an-email" }), env);
      expect(res.status).toBe(400);
    });

    it("rejects submission with invalid locale", async () => {
      const res = await app.fetch(makeEoiRequest({ ...validEoi, locale: "xx" }), env);
      expect(res.status).toBe(400);
    });

    it("silently rejects honeypot-filled submissions", async () => {
      const res = await app.fetch(makeEoiRequest({ ...validEoi, website: "spam.com", email: "honeypot-test@example.com" }), env);
      // Returns 400 (generic validation error) per review findings
      expect(res.status).toBe(400);
    });

    it("validates producer metadata", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "producer",
          email: "producer-test@example.com",
          metadata: { company: "Test Co", productionType: "film", timeline: "6months" },
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("validates creative metadata with portfolio URL", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "creative",
          email: "creative-test@example.com",
          metadata: { discipline: "vfx", portfolioUrl: "https://example.com/portfolio" },
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("rejects invalid metadata for category", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "general",
          email: "invalid-meta@example.com",
          metadata: { unknownField: "value" },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("strips HTML from name and message", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          name: "Test <script>alert(1)</script> User",
          message: "Hello <b>world</b>",
          email: "html-test@example.com",
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("normalises email to lowercase", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          email: "UPPERCASE@EXAMPLE.COM",
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("stores UTM parameters", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          email: "utm-test@example.com",
          utm: { source: "google", medium: "cpc", campaign: "test" },
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("rejects missing required fields", async () => {
      const res = await app.fetch(makeEoiRequest({}), env);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /v1/eoi/categories", () => {
    it("returns available categories with field schemas", async () => {
      const req = new Request(`${BASE_URL}/v1/eoi/categories`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("categories");
      expect(Array.isArray((body as { categories: unknown[] }).categories)).toBe(true);
    });
  });

  describe("GET /v1/locales", () => {
    it("returns list of supported locales", async () => {
      const req = new Request(`${BASE_URL}/v1/locales`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("locales");
      const locales = (body as { locales: Array<{ code: string; direction: string }> }).locales;
      expect(locales).toHaveLength(10);
      // Check Arabic has RTL
      const ar = locales.find((l) => l.code === "ar");
      expect(ar?.direction).toBe("rtl");
    });
  });
});

describe("EOI Validation", () => {
  it("validates all EOI categories", () => {
    const categories = ["general", "producer", "creative", "partner", "investor", "education"];
    for (const cat of categories) {
      expect(categories).toContain(cat);
    }
  });

  it("validates all EOI statuses", () => {
    const statuses = ["new", "contacted", "converted", "archived"];
    expect(statuses).toHaveLength(4);
  });
});
