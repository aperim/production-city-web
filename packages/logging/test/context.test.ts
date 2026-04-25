import { describe, it, expect } from "vitest";
import { extractRequestContext, detectEnvironment } from "../src/context.js";

describe("extractRequestContext", () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request("https://example.com", { headers });
  }

  it("extracts cf-ray and x-request-id", () => {
    const req = makeRequest({
      "cf-ray": "abc123-LHR",
      "x-request-id": "req-999",
    });
    const ctx = extractRequestContext(req);
    expect(ctx.cfRay).toBe("abc123-LHR");
    expect(ctx.requestId).toBe("req-999");
  });

  it("falls back requestId to cfRay when x-request-id absent", () => {
    const req = makeRequest({ "cf-ray": "ray456-SYD" });
    const ctx = extractRequestContext(req);
    expect(ctx.cfRay).toBe("ray456-SYD");
    expect(ctx.requestId).toBe("ray456-SYD");
  });

  it("returns null for missing headers", () => {
    const req = makeRequest({});
    const ctx = extractRequestContext(req);
    expect(ctx.cfRay).toBeNull();
    expect(ctx.requestId).toBeNull();
  });
});

describe("detectEnvironment", () => {
  it("returns 'production' for ENVIRONMENT=production", () => {
    expect(detectEnvironment({ ENVIRONMENT: "production" })).toBe("production");
  });

  it("returns 'staging' for ENVIRONMENT=staging", () => {
    expect(detectEnvironment({ ENVIRONMENT: "staging" })).toBe("staging");
  });

  it("returns 'preview' for ENVIRONMENT=preview", () => {
    expect(detectEnvironment({ ENVIRONMENT: "preview" })).toBe("preview");
  });

  it("returns 'dev' for unknown value", () => {
    expect(detectEnvironment({ ENVIRONMENT: "local" })).toBe("dev");
  });

  it("returns 'dev' for undefined env object", () => {
    expect(detectEnvironment(undefined)).toBe("dev");
  });

  it("accepts a plain string", () => {
    expect(detectEnvironment("production")).toBe("production");
    expect(detectEnvironment("staging")).toBe("staging");
  });

  it("is case-insensitive", () => {
    expect(detectEnvironment({ ENVIRONMENT: "PRODUCTION" })).toBe("production");
  });
});
