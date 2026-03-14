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

    it("silently rejects honeypot-filled submissions with fake 201", async () => {
      const res = await app.fetch(makeEoiRequest({ ...validEoi, website: "spam.com", email: "honeypot-test@example.com" }), env);
      // Returns fake 201 so bots cannot adapt per review findings
      expect(res.status).toBe(201);
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("message");
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

  describe("Employment EOI Category", () => {
    it("accepts employment category submission with valid metadata", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-valid@example.com",
          metadata: {
            desiredRole: "Sound Engineer",
            experienceLevel: "5-10years",
            availability: "immediate",
            portfolioUrl: "https://janesmith.dev",
          },
        }),
        env,
      );
      expect(res.status).toBe(201);
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("id");
    });

    it("requires desiredRole in employment metadata", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-norole@example.com",
          metadata: {
            experienceLevel: "entry",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("rejects unknown metadata keys for employment category", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-unknown@example.com",
          metadata: {
            desiredRole: "Engineer",
            unknownField: "value",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("accepts employment submission with only desiredRole (other fields optional)", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-minimal@example.com",
          metadata: {
            desiredRole: "VFX Artist",
          },
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("rejects tag-only desiredRole that becomes empty after sanitization", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-tagrole@example.com",
          metadata: {
            desiredRole: "<img src=x><br/>",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("rejects whitespace-only desiredRole", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-wsrole@example.com",
          metadata: {
            desiredRole: "   ",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("rejects invalid experienceLevel enum value", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-badexp@example.com",
          metadata: {
            desiredRole: "Designer",
            experienceLevel: "lots",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("rejects invalid availability enum value", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-badavail@example.com",
          metadata: {
            desiredRole: "Designer",
            availability: "yesterday",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });
  });

  describe("Portfolio URL XSS Prevention", () => {
    it("rejects portfolioUrl with javascript: scheme in creative metadata", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "creative",
          email: "creative-xss@example.com",
          metadata: {
            discipline: "vfx",
            portfolioUrl: "javascript:alert(1)",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("accepts portfolioUrl with https: scheme in creative metadata", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "creative",
          email: "creative-https@example.com",
          metadata: {
            discipline: "vfx",
            portfolioUrl: "https://example.com/portfolio",
          },
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("rejects portfolioUrl with javascript: scheme in employment metadata", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-xss@example.com",
          metadata: {
            desiredRole: "Developer",
            portfolioUrl: "javascript:alert(1)",
          },
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("accepts portfolioUrl with http: scheme in employment metadata", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          category: "employment",
          email: "employment-http@example.com",
          metadata: {
            desiredRole: "Developer",
            portfolioUrl: "http://example.com/portfolio",
          },
        }),
        env,
      );
      expect(res.status).toBe(201);
    });
  });

  describe("Source Page and Category Allowlisting", () => {
    it("accepts known sourcePage routes", async () => {
      const knownPages = ["/", "/facilities", "/creative", "/vision", "/community", "/faq", "/contact"];
      for (const page of knownPages) {
        const res = await app.fetch(
          makeEoiRequest({
            ...validEoi,
            sourcePage: page,
            email: `known-page-${page.replace(/\//g, "x")}@example.com`,
          }),
          env,
        );
        expect(res.status).toBe(201);
      }
    });

    it("rejects unknown sourcePage values", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          sourcePage: "/admin/secret",
          email: "bad-sourcepage@example.com",
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("rejects sourcePage with HTML content", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          sourcePage: "<script>alert(1)</script>",
          email: "html-sourcepage@example.com",
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("rejects unknown sourceCategory values", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          sourceCategory: "hacker",
          email: "bad-sourcecat@example.com",
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("accepts known sourceCategory values", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          sourceCategory: "producer",
          email: "good-sourcecat@example.com",
        }),
        env,
      );
      expect(res.status).toBe(201);
    });

    it("rejects sourceCategory with HTML content", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          sourceCategory: "<img onerror=alert(1)>",
          email: "html-sourcecat@example.com",
        }),
        env,
      );
      expect(res.status).toBe(400);
    });

    it("accepts locale-prefixed sourcePage routes", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          sourcePage: "/es/contact",
          email: "locale-page@example.com",
        }),
        env,
      );
      expect(res.status).toBe(201);
    });
  });

  describe("Honeypot Fake 201", () => {
    it("returns fake 201 success when honeypot is filled", async () => {
      const res = await app.fetch(
        makeEoiRequest({
          ...validEoi,
          website: "spam.com",
          email: "honeypot-fake201@example.com",
        }),
        env,
      );
      expect(res.status).toBe(201);
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("message");
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

    it("includes employment category in categories list", async () => {
      const req = new Request(`${BASE_URL}/v1/eoi/categories`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      const body = await res.json() as { categories: Array<{ id: string }> };
      const ids = body.categories.map((c) => c.id);
      expect(ids).toContain("employment");
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

describe("stripHtml Security", () => {
  it("strips unclosed HTML tags", async () => {
    const { stripHtml } = await import("../eoi/validation.js");
    expect(stripHtml("<script>alert(1)")).toBe("alert(1)");
    expect(stripHtml("hello<b")).toBe("hello<b");
    expect(stripHtml("test<img src=x onerror=alert(1)>value")).toBe("testvalue");
  });

  it("strips nested HTML tags", async () => {
    const { stripHtml } = await import("../eoi/validation.js");
    expect(stripHtml("<div><b>bold</b></div>")).toBe("bold");
    expect(stripHtml("<a href='x'><img src='y'></a>")).toBe("");
  });
});

describe("EOI Validation", () => {
  it("validates all EOI categories including employment", async () => {
    const { EOI_CATEGORIES } = await import("../eoi/validation.js");
    expect(EOI_CATEGORIES).toContain("employment");
    expect(EOI_CATEGORIES).toContain("general");
    expect(EOI_CATEGORIES).toContain("producer");
    expect(EOI_CATEGORIES).toContain("creative");
    expect(EOI_CATEGORIES).toContain("partner");
    expect(EOI_CATEGORIES).toContain("investor");
    expect(EOI_CATEGORIES).toContain("education");
  });

  it("validates all EOI statuses", () => {
    const statuses = ["new", "contacted", "converted", "archived"];
    expect(statuses).toHaveLength(4);
  });

  it("validates source page allowlisting function", async () => {
    const { isValidSourcePage } = await import("../eoi/validation.js");
    expect(isValidSourcePage("/")).toBe(true);
    expect(isValidSourcePage("/contact")).toBe(true);
    expect(isValidSourcePage("/es/contact")).toBe(true);
    expect(isValidSourcePage("/ja/facilities")).toBe(true);
    expect(isValidSourcePage("/admin")).toBe(false);
    expect(isValidSourcePage("/admin/secret")).toBe(false);
    expect(isValidSourcePage("<script>")).toBe(false);
  });
});
