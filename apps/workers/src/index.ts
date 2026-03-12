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

        console.log(
          JSON.stringify({
            event: "queue.message",
            id: message.id,
            type: message.body?.type,
            attempt: message.attempts,
          }),
        );

        // TODO: dispatch to domain handlers based on message.body.type
        message.ack();
      } catch (err) {
        console.error(
          JSON.stringify({
            event: "queue.message.error",
            id: message.id,
            type: message.body?.type,
            attempt: message.attempts,
            error: String(err),
          }),
        );
        message.retry();
      }
    }
  },
};
