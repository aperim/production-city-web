import type { QueueMessage } from "./types.js";
import { validateQueueMessage } from "./validate.js";
import { runAllCleanups } from "./cleanup.js";

export type Env = {
  DB: D1Database;
  [key: string]: unknown;
};

/**
 * Cloudflare Queue consumer handler.
 *
 * Processes messages from the holding-jobs queue.
 * IMPORTANT: Never log message.body — only log metadata for observability.
 */
export default {
  /**
   * Cron Trigger handler: runs scheduled cleanup of expired records.
   * Schedule: 0 3 * * * (daily at 03:00 UTC)
   */
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    const startTime = Date.now();
    console.log(JSON.stringify({ event: "cleanup.start", timestamp: new Date().toISOString() }));

    try {
      const [{ PrismaClient }, { PrismaD1 }] = await Promise.all([
        import("@prisma/client"),
        import("@prisma/adapter-d1"),
      ]);
      const adapter = new PrismaD1(env.DB);
      const prisma = new PrismaClient({ adapter });

      try {
        const results = await runAllCleanups(prisma);

        for (const result of results) {
          console.log(
            JSON.stringify({
              event: "cleanup.model",
              model: result.model,
              checked: result.checked,
              deleted: result.deleted,
              durationMs: result.durationMs,
            }),
          );
        }

        console.log(
          JSON.stringify({
            event: "cleanup.complete",
            totalDurationMs: Date.now() - startTime,
          }),
        );
      } finally {
        await prisma.$disconnect().catch((err: unknown) => {
          console.error(JSON.stringify({ event: "cleanup.disconnect.error", error: String(err) }));
        });
      }
    } catch (err) {
      console.error(
        JSON.stringify({ event: "cleanup.error", error: String(err), durationMs: Date.now() - startTime }),
      );
    }
  },

  async queue(
    batch: MessageBatch<QueueMessage>,
    _env: Env,
  ): Promise<void> {
    for (const message of batch.messages) {
      try {
        const validation = validateQueueMessage(message.body);

        if (!validation.success) {
          console.error(
            JSON.stringify({
              event: "queue.message.invalid",
              id: message.id,
              attempt: message.attempts,
              error: "Invalid message shape",
            }),
          );
          message.ack();
          continue;
        }

        // Use the validated/parsed data — not the raw untrusted body
        console.log(
          JSON.stringify({
            event: "queue.message",
            id: message.id,
            type: validation.data.type,
            attempt: message.attempts,
          }),
        );

        // TODO: dispatch to domain handlers based on validation.data.type
        message.ack();
      } catch (err) {
        // message.body is untrusted; only log envelope metadata, never payload
        const rawType =
          typeof message.body === "object" &&
          message.body !== null &&
          "type" in message.body &&
          typeof (message.body as Record<string, unknown>).type === "string"
            ? (message.body as Record<string, unknown>).type
            : undefined;
        console.error(
          JSON.stringify({
            event: "queue.message.error",
            id: message.id,
            type: rawType,
            attempt: message.attempts,
            error: String(err),
          }),
        );
        message.retry();
      }
    }
  },
};
