/**
 * Postmark HTTP API client for Cloudflare Workers.
 * Uses fetch() — no SDK required.
 */

export interface PostmarkSendRequest {
  From: string;
  To: string;
  Subject: string;
  HtmlBody: string;
  TextBody: string;
  MessageStream?: string;
  Tag?: string;
}

export interface PostmarkSendResponse {
  To: string;
  SubmittedAt: string;
  MessageID: string;
  ErrorCode: number;
  Message: string;
}

export interface PostmarkError {
  ErrorCode: number;
  Message: string;
}

export type PostmarkResult =
  | { ok: true; data: PostmarkSendResponse }
  | { ok: false; error: PostmarkError };

const POSTMARK_API_URL = "https://api.postmarkapp.com/email";

/**
 * Sends a single email via Postmark's HTTP API.
 * Uses the Worker's global fetch — works in CF Workers, miniflare, and tests.
 */
export async function sendEmail(
  apiToken: string,
  request: PostmarkSendRequest,
): Promise<PostmarkResult> {
  const response = await fetch(POSTMARK_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiToken,
    },
    body: JSON.stringify(request),
  });

  const body = (await response.json()) as PostmarkSendResponse & PostmarkError;

  if (!response.ok || body.ErrorCode !== 0) {
    return {
      ok: false,
      error: { ErrorCode: body.ErrorCode, Message: body.Message },
    };
  }

  return { ok: true, data: body };
}
