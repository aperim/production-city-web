import type { QueueMessage } from "./types.js";
import { validateQueueMessage } from "./validate.js";

export type Env = Record<string, unknown>;

/**
 * Cloudflare Queue consumer handler.
 *
 * Processes messages from the holding-jobs queue.
 * IMPORTANT: Never log message.body — only log metadata for observability.
 */
export default {
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
