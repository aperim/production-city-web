import { describe, it, expect, vi, beforeEach } from "vitest";
import type { QueueMessage } from "../types.js";

function createMessage(
  body: QueueMessage | unknown,
  overrides: { id?: string; attempts?: number } = {},
): { id: string; body: unknown; attempts: number; ack: () => void; retry: () => void } {
  return {
    id: overrides.id ?? "msg-1",
    body,
    attempts: overrides.attempts ?? 1,
    ack: vi.fn(),
    retry: vi.fn(),
  };
}

function createBatch(
  messages: ReturnType<typeof createMessage>[],
): { messages: typeof messages; queue: string } {
  return {
    messages,
    queue: "holding-jobs",
  };
}

describe("Queue Worker Handler", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let handler: { queue: (batch: any, env: any) => Promise<void> };

  beforeEach(async () => {
    vi.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler = (await import("../index.js")).default as any;
  });

  it("processes a batch of 1, calls ack()", async () => {
    const msg = createMessage({
      type: "test.event",
      version: "1.0.0",
      idempotencyKey: "key-1",
      correlationId: "corr-1",
      payload: { data: "test" },
    });
    const batch = createBatch([msg]);

    await handler.queue(batch, {});

    expect(msg.ack).toHaveBeenCalledOnce();
    expect(msg.retry).not.toHaveBeenCalled();
  });

  it("calls retry() when processing throws", async () => {
    // We need to test that an error during processing triggers retry.
    // Since our handler just acks, we test by providing a message that
    // causes validateQueueMessage to succeed but we mock the console.log
    // to throw an error.
    const msg = createMessage({
      type: "test.event",
      version: "1.0.0",
      idempotencyKey: "key-1",
      correlationId: "corr-1",
      payload: { data: "test" },
    });
    const batch = createBatch([msg]);

    const originalLog = console.log;
    console.log = vi.fn(() => {
      throw new Error("simulated failure");
    });

    await handler.queue(batch, {});

    console.log = originalLog;

    expect(msg.retry).toHaveBeenCalledOnce();
    expect(msg.ack).not.toHaveBeenCalled();
  });

  it("handles empty batch gracefully (no crash)", async () => {
    const batch = createBatch([]);
    await expect(handler.queue(batch, {})).resolves.toBeUndefined();
  });

  it("never logs message.body", async () => {
    const logSpy = vi.spyOn(console, "log");
    const errorSpy = vi.spyOn(console, "error");

    const sensitiveBody = {
      type: "test.event",
      version: "1.0.0",
      idempotencyKey: "key-1",
      correlationId: "corr-1",
      payload: { secret: "super-secret-data" },
    };
    const msg = createMessage(sensitiveBody);
    const batch = createBatch([msg]);

    await handler.queue(batch, {});

    // Check that no log call contains the full body or the payload
    const allLogCalls = [
      ...logSpy.mock.calls.map((c) => c.join(" ")),
      ...errorSpy.mock.calls.map((c) => c.join(" ")),
    ];

    for (const logOutput of allLogCalls) {
      expect(logOutput).not.toContain("super-secret-data");
      expect(logOutput).not.toContain('"payload"');
    }

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("acks invalid messages instead of retrying", async () => {
    const msg = createMessage({ invalid: "not-a-queue-message" });
    const batch = createBatch([msg]);

    await handler.queue(batch, {});

    expect(msg.ack).toHaveBeenCalledOnce();
    expect(msg.retry).not.toHaveBeenCalled();
  });
});
