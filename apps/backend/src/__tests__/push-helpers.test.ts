/**
 * Tests for server-push helpers (signedBroadcast, pushDeliveryStatus, pushAdminNotification).
 */

import { describe, it, expect, vi } from "vitest";
import { signedBroadcast, pushDeliveryStatus, pushAdminNotification } from "../durable-objects/push-helpers.js";

function createMockEnv() {
  return {
    HMAC_SECRET: "test-secret-key",
    WEBSOCKET_SERVER: {
      idFromName: vi.fn((name: string) => ({ name })),
      get: vi.fn(),
    } as unknown as DurableObjectNamespace,
  };
}

function createMockDoStub(responseBody: unknown = { sent: 1 }, status = 200): DurableObjectStub {
  return {
    fetch: vi.fn(async () => new Response(JSON.stringify(responseBody), { status })),
  } as unknown as DurableObjectStub;
}

describe("signedBroadcast", () => {
  it("sends HMAC-signed request to DO", async () => {
    const env = createMockEnv();
    const stub = createMockDoStub();

    const result = await signedBroadcast(env, stub, {
      channel: "admin:notifications",
      message: { test: true },
    });

    expect(result.sent).toBe(1);
    expect(stub.fetch).toHaveBeenCalledOnce();

    const fetchCall = (stub.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const request = fetchCall[0] as Request;
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe("/broadcast");
    expect(request.headers.get("X-Internal-Timestamp")).toBeTruthy();
    expect(request.headers.get("X-Internal-Signature")).toBeTruthy();
    expect(request.headers.get("Content-Type")).toBe("application/json");
  });

  it("throws on non-ok response", async () => {
    const env = createMockEnv();
    const stub = createMockDoStub({ error: "forbidden" }, 403);

    await expect(
      signedBroadcast(env, stub, { channel: "admin:notifications", message: {} }),
    ).rejects.toThrow("Broadcast failed: 403");
  });
});

describe("pushDeliveryStatus", () => {
  it("routes to delivery-specific DO instance", async () => {
    const env = createMockEnv();
    const stub = createMockDoStub();
    (env.WEBSOCKET_SERVER.get as ReturnType<typeof vi.fn>).mockReturnValue(stub);

    await pushDeliveryStatus(env, "ml-123", "delivered");

    expect(env.WEBSOCKET_SERVER.idFromName).toHaveBeenCalledWith("delivery:ml-123");
    expect(env.WEBSOCKET_SERVER.get).toHaveBeenCalled();

    const fetchCall = (stub.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const request = fetchCall[0] as Request;
    const body = JSON.parse(await request.text());
    expect(body.channel).toBe("delivery:ml-123");
    expect(body.message.type).toBe("delivery_status");
    expect(body.message.payload.magicLinkId).toBe("ml-123");
    expect(body.message.payload.status).toBe("delivered");
  });
});

describe("pushAdminNotification", () => {
  it("routes to admin-hub DO instance", async () => {
    const env = createMockEnv();
    const stub = createMockDoStub();
    (env.WEBSOCKET_SERVER.get as ReturnType<typeof vi.fn>).mockReturnValue(stub);

    await pushAdminNotification(env, "admin:eoi", {
      kind: "new_eoi",
      resourceId: "eoi-456",
      category: "producer",
    });

    expect(env.WEBSOCKET_SERVER.idFromName).toHaveBeenCalledWith("admin-hub");

    const fetchCall = (stub.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const request = fetchCall[0] as Request;
    const body = JSON.parse(await request.text());
    expect(body.channel).toBe("admin:eoi");
    expect(body.message.type).toBe("notification");
    expect(body.message.channel).toBe("admin:eoi");
  });
});
