/**
 * Shared structured error response helper.
 * All error responses use the format: { error: string, message: string, details?: Record<string, string> }
 */

import type { Context } from "hono";

export interface ErrorResponseBody {
  error: string;
  message: string;
  details?: Record<string, string>;
}

type ErrorStatusCode = 400 | 401 | 403 | 404 | 409 | 429 | 500 | 503;

/**
 * Returns a structured JSON error response.
 */
export function errorResponse(
  c: Context,
  status: ErrorStatusCode,
  error: string,
  message: string,
  details?: Record<string, string>,
) {
  const body: ErrorResponseBody = { error, message };
  if (details) body.details = details;
  return c.json(body, status);
}
