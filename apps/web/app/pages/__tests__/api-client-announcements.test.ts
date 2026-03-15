/**
 * Tests for announcement and subscription API client functions.
 * @see Issue #292
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Announcement API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("listAnnouncements calls GET /v1/announcements", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        announcements: [],
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { listAnnouncements } = await import("../../lib/api-client.js");
    const result = await listAnnouncements();

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/announcements",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.ok).toBe(true);
  });

  it("listAnnouncements passes category filter", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        announcements: [],
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { listAnnouncements } = await import("../../lib/api-client.js");
    await listAnnouncements({ category: "news", page: 2 });

    const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain("category=news");
    expect(calledUrl).toContain("page=2");
  });

  it("getAnnouncement calls GET /v1/announcements/:slug", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: "1",
        title: "Test",
        slug: "test-slug",
        summary: "Summary",
        contentBlocks: [],
        visibility: "public",
        categories: [],
        tags: [],
        author: { id: "1", name: "Author" },
        publishedAt: "2026-03-15T00:00:00Z",
        lastEditedAt: null,
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { getAnnouncement } = await import("../../lib/api-client.js");
    const result = await getAnnouncement("test-slug");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/announcements/test-slug",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.ok).toBe(true);
  });

  it("getAnnouncement returns 404 for non-existent slug", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({
        error: "ANNOUNCEMENT_NOT_FOUND",
        message: "Announcement not found",
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { getAnnouncement } = await import("../../lib/api-client.js");
    const result = await getAnnouncement("non-existent");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });

  it("listCategories calls GET /v1/categories", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        categories: [{ id: "1", name: "News", slug: "news" }],
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { listCategories } = await import("../../lib/api-client.js");
    const result = await listCategories();

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/categories",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.ok).toBe(true);
  });
});

describe("Subscription API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("listMySubscriptions calls GET /v1/me/subscriptions", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscriptions: [] }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { listMySubscriptions } = await import("../../lib/api-client.js");
    const result = await listMySubscriptions();

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/me/subscriptions",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.ok).toBe(true);
  });

  it("createSubscription sends categoryId and channels", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ subscriptions: [], message: "Created" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { createSubscription } = await import("../../lib/api-client.js");
    await createSubscription("cat-1", ["email", "sms"]);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/me/subscriptions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ categoryId: "cat-1", channels: ["email", "sms"] }),
      }),
    );
  });

  it("deleteSubscription calls DELETE /v1/me/subscriptions/:id", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Deleted" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { deleteSubscription } = await import("../../lib/api-client.js");
    await deleteSubscription("sub-1");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/me/subscriptions/sub-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("resendSubscriptionConfirmation calls POST", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Resent" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { resendSubscriptionConfirmation } = await import("../../lib/api-client.js");
    await resendSubscriptionConfirmation("sub-1");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/v1/me/subscriptions/sub-1/resend",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("encodes special characters in subscription ID", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "Deleted" }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { deleteSubscription } = await import("../../lib/api-client.js");
    await deleteSubscription("id/with/slashes");

    const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain("id%2Fwith%2Fslashes");
  });
});
