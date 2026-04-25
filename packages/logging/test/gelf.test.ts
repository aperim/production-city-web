import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildGelfMessage, toGelfJson } from "../src/gelf.js";
import { Level } from "../src/levels.js";

describe("buildGelfMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-25T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets mandatory GELF 1.1 fields", () => {
    const msg = buildGelfMessage("holding-backend", {
      short_message: "Request handled",
    });
    expect(msg.version).toBe("1.1");
    expect(msg.host).toBe("holding-backend");
    expect(msg.short_message).toBe("Request handled");
    expect(msg.level).toBe(Level.INFO);
    expect(msg.timestamp).toBeCloseTo(1777111200, 0);
  });

  it("defaults level to INFO", () => {
    const msg = buildGelfMessage("worker", { short_message: "ok" });
    expect(msg.level).toBe(Level.INFO);
  });

  it("accepts explicit level", () => {
    const msg = buildGelfMessage("worker", {
      short_message: "oops",
      level: Level.ERROR,
    });
    expect(msg.level).toBe(Level.ERROR);
  });

  it("maps standard custom fields to underscore-prefixed keys", () => {
    const msg = buildGelfMessage("holding-backend", {
      short_message: "ok",
      service: "holding-backend",
      environment: "production",
      request_id: "abc-123",
      worker_name: "backend",
      duration_ms: 42,
      status_code: 200,
      error_type: "ValidationError",
      cf_ray: "ray123",
    });
    expect(msg._service).toBe("holding-backend");
    expect(msg._environment).toBe("production");
    expect(msg._request_id).toBe("abc-123");
    expect(msg._worker_name).toBe("backend");
    expect(msg._duration_ms).toBe(42);
    expect(msg._status_code).toBe(200);
    expect(msg._error_type).toBe("ValidationError");
    expect(msg._cf_ray).toBe("ray123");
  });

  it("prefixes extra fields with underscore when missing", () => {
    const msg = buildGelfMessage("worker", {
      short_message: "ok",
      extra: { queue_batch_size: 10, _already_prefixed: "yes" },
    });
    expect(msg._queue_batch_size).toBe(10);
    expect(msg._already_prefixed).toBe("yes");
  });

  it("omits undefined optional fields", () => {
    const msg = buildGelfMessage("worker", { short_message: "ok" });
    expect(msg._service).toBeUndefined();
    expect(msg._environment).toBeUndefined();
    expect(msg.full_message).toBeUndefined();
  });

  it("includes full_message when provided", () => {
    const msg = buildGelfMessage("worker", {
      short_message: "short",
      full_message: "A longer explanation",
    });
    expect(msg.full_message).toBe("A longer explanation");
  });
});

describe("toGelfJson", () => {
  it("returns valid JSON string", () => {
    const msg = buildGelfMessage("worker", { short_message: "test" });
    const json = toGelfJson(msg);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed["version"]).toBe("1.1");
    expect(parsed["short_message"]).toBe("test");
  });
});
