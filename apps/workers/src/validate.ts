import { QueueMessageSchema } from "./types.js";
import type { QueueMessage } from "./types.js";

/**
 * Validates that an unknown value conforms to the QueueMessage shape using Zod.
 * Returns { success: true, data } on valid input, { success: false } otherwise.
 */
export function validateQueueMessage(
  value: unknown,
): { success: true; data: QueueMessage } | { success: false } {
  const result = QueueMessageSchema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data as QueueMessage };
  }
  return { success: false };
}
