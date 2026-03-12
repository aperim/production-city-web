import type { QueueMessage } from "./types.js";

/**
 * Validates that an unknown value conforms to the QueueMessage shape.
 * Returns { success: true, data } on valid input, { success: false } otherwise.
 */
export function validateQueueMessage(
  value: unknown,
): { success: true; data: QueueMessage } | { success: false } {
  if (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as Record<string, unknown>).type === "string" &&
    "version" in value &&
    typeof (value as Record<string, unknown>).version === "string" &&
    "idempotencyKey" in value &&
    typeof (value as Record<string, unknown>).idempotencyKey === "string" &&
    "correlationId" in value &&
    typeof (value as Record<string, unknown>).correlationId === "string" &&
    "payload" in value
  ) {
    return { success: true, data: value as QueueMessage };
  }
  return { success: false };
}
