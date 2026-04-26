import { describe, it, expect, vi, afterEach } from "vitest";
import { getApiBase, getWsHost } from "../env";

function mockHostname(hostname: string, host?: string) {
  vi.stubGlobal("window", {
    location: { hostname, host: host ?? hostname },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getApiBase", () => {
  it("returns https://api.production.city on production", () => {
    mockHostname("production.city");
    expect(getApiBase()).toBe("https://api.production.city");
  });

  it("returns https://api.staging.production.city on staging", () => {
    mockHostname("staging.production.city");
    expect(getApiBase()).toBe("https://api.staging.production.city");
  });

  it("returns empty string on localhost", () => {
    mockHostname("localhost", "localhost:4321");
    expect(getApiBase()).toBe("");
  });

  it("returns empty string on unknown preview domain", () => {
    mockHostname("preview.example.com");
    expect(getApiBase()).toBe("");
  });

  it("returns empty string when window is undefined (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(getApiBase()).toBe("");
  });
});

describe("getWsHost", () => {
  it("returns api.production.city on production", () => {
    mockHostname("production.city");
    expect(getWsHost()).toBe("api.production.city");
  });

  it("returns api.staging.production.city on staging", () => {
    mockHostname("staging.production.city");
    expect(getWsHost()).toBe("api.staging.production.city");
  });

  it("returns window.location.host on localhost", () => {
    mockHostname("localhost", "localhost:4321");
    expect(getWsHost()).toBe("localhost:4321");
  });

  it("returns window.location.host on unknown preview domain", () => {
    mockHostname("preview.example.com", "preview.example.com");
    expect(getWsHost()).toBe("preview.example.com");
  });

  it("returns empty string when window is undefined (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(getWsHost()).toBe("");
  });
});
