import { z } from "zod";
import { QueueMessageSchema } from "./types.js";
import type { QueueMessage } from "./types.js";

/** Typed result from validateQueueMessage. */
export type ValidateResult =
  | { success: true; data: QueueMessage }
  | { success: false; error: z.ZodError };

/**
 * Validates that an unknown value conforms to the QueueMessage shape using Zod.
 *
 * Returns a typed result: `{ success: true, data }` on valid input,
 * `{ success: false, error: ZodError }` with structured error details otherwise.
 */
export function validateQueueMessage(value: unknown): ValidateResult {
  return QueueMessageSchema.safeParse(value);
}
