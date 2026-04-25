import type { QueueMessage } from "./types.js";
import { buildGelfMessage, toGelfJson, Level } from "@productioncity/holding-logging";
import { validateQueueMessage } from "./validate.js";
import { runAllCleanups } from "./cleanup.js";
import { processDeliveryJob } from "./delivery-handler.js";
import type { AnnouncementDeliveryPayload, DeliveryEnv } from "./delivery-handler.js";

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
    console.log(
      toGelfJson(
        buildGelfMessage("holding-workers", {
          short_message: "cron.cleanup.start",
          level: Level.INFO,
          service: "holding-workers",
        }),
      ),
    );

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
            toGelfJson(
              buildGelfMessage("holding-workers", {
                short_message: "cron.cleanup.model",
                level: Level.INFO,
                service: "holding-workers",
                extra: {
                  model: result.model,
                  checked: result.checked,
                  deleted: result.deleted,
                  duration_ms: result.durationMs,
                },
              }),
            ),
          );
        }

        console.log(
          toGelfJson(
            buildGelfMessage("holding-workers", {
              short_message: "cron.cleanup.complete",
              level: Level.INFO,
              service: "holding-workers",
              extra: { duration_ms: Date.now() - startTime },
            }),
          ),
        );
      } finally {
        await prisma.$disconnect().catch((err: unknown) => {
          console.error(
            toGelfJson(
              buildGelfMessage("holding-workers", {
                short_message: "cron.cleanup.disconnect.error",
                level: Level.ERROR,
                service: "holding-workers",
                full_message: String(err),
              }),
            ),
          );
        });
      }
    } catch (err) {
      console.error(
        toGelfJson(
          buildGelfMessage("holding-workers", {
            short_message: "cron.cleanup.error",
            level: Level.ERROR,
            service: "holding-workers",
            full_message: String(err),
            error_type: err instanceof Error ? err.constructor.name : "Error",
            extra: { duration_ms: Date.now() - startTime },
          }),
        ),
      );
    }
  },

  async queue(
    batch: MessageBatch<QueueMessage>,
    _env: Env,
  ): Promise<void> {
    const batchRetries = batch.messages.reduce((sum, m) => sum + m.attempts, 0);
    // Batch-level metrics log — wrapped so logging failures cannot abort processing
    try {
      console.log(
        toGelfJson(
          buildGelfMessage("holding-workers", {
            short_message: "queue.batch.start",
            level: Level.INFO,
            service: "holding-workers",
            extra: {
              queue_batch_size: batch.messages.length,
              queue_retries: batchRetries,
            },
          }),
        ),
      );
    } catch { /* ignore logging failures */ }

    for (const message of batch.messages) {
      try {
        const validation = validateQueueMessage(message.body);

        if (!validation.success) {
          console.error(
            toGelfJson(
              buildGelfMessage("holding-workers", {
                short_message: "queue.message.invalid",
                level: Level.ERROR,
                service: "holding-workers",
                extra: { message_id: message.id, queue_retries: message.attempts },
              }),
            ),
          );
          message.ack();
          continue;
        }

        // Use the validated/parsed data — not the raw untrusted body
        console.log(
          toGelfJson(
            buildGelfMessage("holding-workers", {
              short_message: "queue.message.processing",
              level: Level.INFO,
              service: "holding-workers",
              extra: {
                message_id: message.id,
                message_type: validation.data.type,
                queue_retries: message.attempts,
              },
            }),
          ),
        );

        // Dispatch to domain handlers based on type
        if (validation.data.type === "announcement_delivery") {
          const deliveryEnv = _env as DeliveryEnv;
          const [{ PrismaClient: PC }, { PrismaD1: PD }] = await Promise.all([
            import("@prisma/client"),
            import("@prisma/adapter-d1"),
          ]);
          const adapter = new PD(deliveryEnv.DB);
          const prisma = new PC({ adapter });
          try {
            await processDeliveryJob(
              prisma,
              deliveryEnv,
              validation.data.payload as AnnouncementDeliveryPayload,
            );
          } finally {
            await prisma.$disconnect().catch(() => {});
          }
        }
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

        // Detect DLQ-bound messages: attempts at max_retries means next stop is dead letter queue
        const isDlqBound = message.attempts >= 3;
        if (isDlqBound) {
          console.error(
            toGelfJson(
              buildGelfMessage("holding-workers", {
                short_message: "queue.message.dlq",
                level: Level.ERROR,
                service: "holding-workers",
                full_message: String(err),
                error_type: err instanceof Error ? err.constructor.name : "Error",
                extra: {
                  message_id: message.id,
                  message_type: String(rawType ?? ""),
                  queue_retries: message.attempts,
                },
              }),
            ),
          );
        } else {
          console.error(
            toGelfJson(
              buildGelfMessage("holding-workers", {
                short_message: "queue.message.error",
                level: Level.ERROR,
                service: "holding-workers",
                full_message: String(err),
                error_type: err instanceof Error ? err.constructor.name : "Error",
                extra: {
                  message_id: message.id,
                  message_type: String(rawType ?? ""),
                  queue_retries: message.attempts,
                },
              }),
            ),
          );
        }
        message.retry();
      }
    }
  },
};
