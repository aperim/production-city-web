/**
 * Tests for the Postmark email sending client.
 * Covers empty API token handling and error responses.
 */
import { describe, it, expect } from "vitest";
import { sendEmail } from "../postmark.js";
import type { PostmarkSendRequest } from "../postmark.js";

const VALID_REQUEST: PostmarkSendRequest = {
  From: "test@example.com",
  To: "recipient@example.com",
  Subject: "Test",
  HtmlBody: "<p>Test</p>",
  TextBody: "Test",
  MessageStream: "outbound",
};

describe("sendEmail", () => {
  it("returns an error result (not a crash) when API token is empty", async () => {
    const result = await sendEmail("", VALID_REQUEST);

    // Postmark rejects empty tokens with a 401 or error response — should not throw
    expect(result.ok).toBe(false);
    expect(result).toHaveProperty("error");
    if (!result.ok) {
      expect(result.error).toHaveProperty("ErrorCode");
      expect(result.error).toHaveProperty("Message");
    }
  });

  it("returns an error result for an invalid API token", async () => {
    const result = await sendEmail("invalid-token-that-will-be-rejected", VALID_REQUEST);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toHaveProperty("ErrorCode");
      expect(result.error).toHaveProperty("Message");
    }
  });
});
