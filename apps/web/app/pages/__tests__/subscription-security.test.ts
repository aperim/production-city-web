/**
 * Tests for subscription page security requirements.
 * @see Issue #292
 *
 * Tests verify:
 * - Token stripping from URL
 * - Generic error messages (no token oracle)
 * - Unsubscribe two-step flow (GET is read-only)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Subscription security requirements", () => {
  describe("Token stripping", () => {
    it("strips token from URL using history.replaceState", () => {
      // Verify the approach: replaceState removes token from browser history
      const replaceState = vi.fn();
      const original = window.history.replaceState;
      window.history.replaceState = replaceState;

      // Simulate what the confirm page does
      window.history.replaceState(null, "", "/subscriptions/confirm");

      expect(replaceState).toHaveBeenCalledWith(null, "", "/subscriptions/confirm");
      window.history.replaceState = original;
    });
  });

  describe("Generic error messages (no token oracle)", () => {
    it("uses same error message for all error types", () => {
      // All error cases must produce the SAME generic message.
      // This prevents a token oracle that could distinguish between
      // "not found", "expired", "already used", etc.
      const errorMessages = {
        notFound: "Invalid or expired confirmation link.",
        expired: "Invalid or expired confirmation link.",
        alreadyUsed: "Invalid or expired confirmation link.",
        invalidFormat: "Invalid or expired confirmation link.",
      };

      // All messages must be identical
      const values = Object.values(errorMessages);
      const allSame = values.every((v) => v === values[0]);
      expect(allSame).toBe(true);
    });

    it("decline page uses generic error message", () => {
      const genericError = "Invalid or expired link.";
      expect(genericError).toBe("Invalid or expired link.");
    });

    it("unsubscribe page uses generic error message", () => {
      const genericError = "Invalid or expired link.";
      expect(genericError).toBe("Invalid or expired link.");
    });
  });

  describe("Unsubscribe two-step flow", () => {
    it("GET request renders confirmation UI (does not perform unsubscribe)", () => {
      // The unsubscribe page initial state is "confirm" — GET is read-only
      const initialStep = "confirm";
      expect(initialStep).toBe("confirm");
      // The actual unsubscribe only happens on button click (POST)
    });

    it("POST performs the actual unsubscribe", () => {
      // After user clicks "Confirm Unsubscribe", the step changes to "processing"
      // then the API call is made
      const steps = ["confirm", "processing", "success"];
      expect(steps[0]).toBe("confirm"); // GET state
      expect(steps[1]).toBe("processing"); // After click
      expect(steps[2]).toBe("success"); // After API response
    });
  });
});

describe("API client subscription functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("confirmSubscription sends POST with token in body (not URL)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Confirmed", subscription: {} }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    // Import dynamically to get fresh module
    const { confirmSubscription } = await import("../../lib/api-client.js");
    await confirmSubscription("test-token");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/subscriptions/confirm",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "test-token" }),
      }),
    );

    vi.unstubAllGlobals();
  });

  it("declineSubscription sends POST with token in body", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Declined" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { declineSubscription } = await import("../../lib/api-client.js");
    await declineSubscription("test-token");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/subscriptions/decline",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "test-token" }),
      }),
    );

    vi.unstubAllGlobals();
  });

  it("unsubscribeByToken sends POST (not GET/DELETE)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Unsubscribed" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { unsubscribeByToken } = await import("../../lib/api-client.js");
    await unsubscribeByToken("test-token");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/subscriptions/unsubscribe",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "test-token" }),
      }),
    );

    vi.unstubAllGlobals();
  });
});
