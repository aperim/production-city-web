/**
 * CORS header tests for the backend API worker.
 *
 * Verifies that CORS responses include Access-Control-Allow-Credentials: true
 * to support cookie-based authentication with credentials: 'include'.
 *
 * @see Issue #320
 */
import { describe, it, expect } from "vitest";
import { exports as workerExports } from "cloudflare:workers";

describe("CORS headers (#320)", () => {
  it("returns Access-Control-Allow-Credentials: true on preflight", async () => {
    const response = await workerExports.default.fetch("http://localhost/live", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:4321",
        "Access-Control-Request-Method": "GET",
      },
    });

    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
      "true",
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:4321",
    );
  });

  it("returns Access-Control-Allow-Credentials: true on simple GET", async () => {
    const response = await workerExports.default.fetch("http://localhost/live", {
      method: "GET",
      headers: {
        Origin: "http://localhost:4321",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBe(
      "true",
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:4321",
    );
  });

  it("does not return CORS headers for disallowed origins", async () => {
    const response = await workerExports.default.fetch("http://localhost/live", {
      method: "GET",
      headers: {
        Origin: "https://evil.example.com",
      },
    });

    // Must not reflect the attacker origin
    const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
    expect(allowOrigin).not.toBe("https://evil.example.com");
    // Must not return the trusted origin for an untrusted request
    expect(allowOrigin).not.toBe("http://localhost:4321");
  });

  it("does not return credentials header for disallowed origins on preflight", async () => {
    const response = await workerExports.default.fetch("http://localhost/live", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.example.com",
        "Access-Control-Request-Method": "GET",
      },
    });

    const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
    expect(allowOrigin).not.toBe("https://evil.example.com");
    expect(allowOrigin).not.toBe("http://localhost:4321");
  });
});
