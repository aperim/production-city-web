/**
 * Tests for the Announcement Delivery Pipeline (#289).
 *
 * Covers:
 * - Email rendering (content blocks, markdown sanitization, XSS rejection)
 * - SMS rendering (truncation, URL inclusion)
 * - Delivery enqueue (subscriber dedup, suppression, private role filtering)
 * - Twilio status callback (status transitions, replay protection)
 * - Postmark webhook for announcements (delivery, bounce, open, click)
 * - Unsubscribe endpoint
 * - Queue message schema (IDs only, no PII)
 */

import { env } from "cloudflare:test";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createPrismaClient } from "../lib/prisma.js";
import { app } from "../index.js";
import { setupTestDatabase } from "./test-helpers.js";

const BASE = "http://localhost";

beforeAll(async () => {
  await setupTestDatabase();
});

// ---- Email Rendering Tests ----

import {
  renderAnnouncementHtml,
  renderAnnouncementText,
  markdownToEmailHtml,
  stripCRLF,
} from "../email/templates/announcement.js";

describe("Email Rendering — Announcement", () => {
  const baseParams = {
    title: "Test Announcement",
    summary: "A test summary.",
    contentBlocks: [],
    categories: ["Development"],
    announcementUrl: "https://production.city/announcements/test",
    unsubscribeUrl: "https://production.city/unsubscribe?token=abc",
    mediaUrls: {},
  };

  it("renders HTML with title, categories, and footer", () => {
    const html = renderAnnouncementHtml(baseParams);
    expect(html).toContain("Test Announcement");
    expect(html).toContain("Development");
    expect(html).toContain("Unsubscribe");
    expect(html).toContain("Production City");
  });

  it("renders header content blocks", () => {
    const html = renderAnnouncementHtml({
      ...baseParams,
      contentBlocks: [{ type: "header", level: 1, text: "Main Header" }],
    });
    expect(html).toContain("<h1");
    expect(html).toContain("Main Header");
  });

  it("renders text content blocks with markdown", () => {
    const html = renderAnnouncementHtml({
      ...baseParams,
      contentBlocks: [{ type: "text", content: "**Bold** and *italic*" }],
    });
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders image content blocks", () => {
    const html = renderAnnouncementHtml({
      ...baseParams,
      contentBlocks: [{ type: "image", mediaAssetId: "asset-1", alt: "Screenshot" }],
      mediaUrls: { "asset-1": "https://cdn.example.com/img.png" },
    });
    expect(html).toContain("https://cdn.example.com/img.png");
    expect(html).toContain('alt="Screenshot"');
  });

  it("renders spacer content blocks", () => {
    const html = renderAnnouncementHtml({
      ...baseParams,
      contentBlocks: [{ type: "spacer", size: "lg" }],
    });
    expect(html).toContain("height:48px");
  });

  it("renders image_text_left layout", () => {
    const html = renderAnnouncementHtml({
      ...baseParams,
      contentBlocks: [{
        type: "image_text_left",
        mediaAssetId: "asset-1",
        alt: "Photo",
        text: "Description",
      }],
      mediaUrls: { "asset-1": "https://cdn.example.com/photo.png" },
    });
    expect(html).toContain("width:40%");
    expect(html).toContain("width:60%");
  });

  it("renders plain text version", () => {
    const text = renderAnnouncementText(baseParams);
    expect(text).toContain("Test Announcement");
    expect(text).toContain("A test summary.");
    expect(text).toContain("Unsubscribe:");
  });

  it("escapes HTML in title", () => {
    const html = renderAnnouncementHtml({
      ...baseParams,
      title: "<script>alert('xss')</script>",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("Markdown Sanitization", () => {
  it("converts bold and italic", () => {
    expect(markdownToEmailHtml("**bold**")).toContain("<strong>bold</strong>");
    expect(markdownToEmailHtml("*italic*")).toContain("<em>italic</em>");
  });

  it("converts links with https: only", () => {
    const html = markdownToEmailHtml("[Click](https://example.com)");
    expect(html).toContain('href="https://example.com"');
  });

  it("rejects javascript: URIs in links", () => {
    const html = markdownToEmailHtml("[Click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("Click");
  });

  it("rejects http: URIs (non-https)", () => {
    const html = markdownToEmailHtml("[Click](http://example.com)");
    expect(html).not.toContain("href=");
    expect(html).toContain("Click");
  });

  it("strips raw HTML tags", () => {
    const html = markdownToEmailHtml("<script>alert(1)</script> Hello");
    expect(html).not.toContain("<script>");
    expect(html).toContain("Hello");
  });

  it("strips on* event handlers in raw HTML", () => {
    const html = markdownToEmailHtml('<img onerror="alert(1)" src="x">');
    expect(html).not.toContain("onerror");
  });

  it("handles lists", () => {
    const html = markdownToEmailHtml("- Item 1\n- Item 2");
    expect(html).toContain("<li>");
    expect(html).toContain("Item 1");
  });
});

describe("CRLF Stripping", () => {
  it("strips CR and LF characters", () => {
    expect(stripCRLF("Line1\r\nLine2")).toBe("Line1Line2");
    expect(stripCRLF("No\rnewlines\nhere")).toBe("Nonewlineshere");
  });
});

// ---- SMS Rendering Tests ----

import { renderAnnouncementSms } from "../lib/sms-renderer.js";

describe("SMS Rendering", () => {
  it("renders within 320-char limit", () => {
    const sms = renderAnnouncementSms({
      title: "Test Announcement",
      summary: "A brief summary of what happened.",
      announcementUrl: "https://production.city/announcements/test",
    });
    expect(sms.length).toBeLessThanOrEqual(320);
    expect(sms).toContain("Test Announcement");
    expect(sms).toContain("Reply STOP to unsubscribe.");
  });

  it("truncates long titles", () => {
    const sms = renderAnnouncementSms({
      title: "A".repeat(100),
      summary: "Short summary.",
      announcementUrl: "https://production.city/announcements/test",
    });
    expect(sms.length).toBeLessThanOrEqual(320);
    // Title should be truncated to ~60 chars
    const firstLine = sms.split("\n")[0]!;
    expect(firstLine.length).toBeLessThanOrEqual(60);
  });

  it("truncates long summaries", () => {
    const sms = renderAnnouncementSms({
      title: "Title",
      summary: "B".repeat(200),
      announcementUrl: "https://production.city/announcements/test",
    });
    expect(sms.length).toBeLessThanOrEqual(320);
  });

  it("includes the announcement URL", () => {
    const sms = renderAnnouncementSms({
      title: "Title",
      summary: "Summary",
      announcementUrl: "https://production.city/announcements/test-slug",
    });
    expect(sms).toContain("Read more: https://production.city/announcements/test-slug");
  });
});

// ---- Delivery Enqueue Tests ----

import { enqueueDeliveries } from "../lib/delivery-service.js";

describe("Delivery Enqueue", () => {
  let prisma: ReturnType<typeof createPrismaClient> extends Promise<infer T> ? T : never;

  beforeEach(async () => {
    prisma = await createPrismaClient(env.DB);
  });

  it("enqueues deliveries for confirmed subscribers", async () => {
    // Setup: user + category + confirmed subscription
    const user = await prisma.user.create({
      data: { email: "sub@example.com", name: "Subscriber", status: "active" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "Enqueue Test Cat", slug: "enqueue-test-cat" },
    });
    await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "email",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // Create announcement
    const ann = await prisma.announcement.create({
      data: {
        title: "Enqueue Test",
        slug: "enqueue-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    await prisma.announcementCategoryLink.create({
      data: { announcementId: ann.id, categoryId: category.id },
    });

    const sent: unknown[] = [];
    const mockQueue = { send: async (msg: unknown) => { sent.push(msg); } };

    const result = await enqueueDeliveries(
      prisma,
      mockQueue,
      ann.id,
      [category.id],
      "public",
      [],
    );

    expect(result.totalSubscribers).toBe(1);
    expect(result.deliveryCount).toBe(1);
    expect(result.suppressedCount).toBe(0);
    expect(sent).toHaveLength(1);
    // Queue message should contain only IDs, no PII
    const msg = sent[0] as Record<string, unknown>;
    expect(msg).toHaveProperty("type", "announcement_delivery");
    const payload = (msg as { payload: Record<string, unknown> }).payload;
    expect(payload).not.toHaveProperty("email");
    expect(payload).not.toHaveProperty("phone");
    expect(payload).toHaveProperty("deliveryId");
    expect(payload).toHaveProperty("userId");
  });

  it("deduplicates by (userId, channel)", async () => {
    const user = await prisma.user.create({
      data: { email: "dedup@example.com", name: "Dedup User", status: "active" },
    });
    const cat1 = await prisma.announcementCategory.create({
      data: { name: "Dedup Cat 1", slug: "dedup-cat-1" },
    });
    const cat2 = await prisma.announcementCategory.create({
      data: { name: "Dedup Cat 2", slug: "dedup-cat-2" },
    });

    // Subscribe to both categories via email
    for (const cat of [cat1, cat2]) {
      await prisma.categorySubscription.create({
        data: {
          userId: user.id,
          categoryId: cat.id,
          channel: "email",
          status: "confirmed",
          confirmedAt: new Date(),
          subscribedById: user.id,
          expiresAt: new Date(Date.now() + 86400000),
        },
      });
    }

    const ann = await prisma.announcement.create({
      data: {
        title: "Dedup Test",
        slug: "dedup-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });

    const sent: unknown[] = [];
    const mockQueue = { send: async (msg: unknown) => { sent.push(msg); } };

    const result = await enqueueDeliveries(
      prisma,
      mockQueue,
      ann.id,
      [cat1.id, cat2.id],
      "public",
      [],
    );

    // Should only get ONE delivery even though subscribed to 2 categories
    expect(result.deliveryCount).toBe(1);
    expect(sent).toHaveLength(1);
  });

  it("excludes suppressed email addresses", async () => {
    const user = await prisma.user.create({
      data: { email: "suppressed@example.com", name: "Suppressed", status: "active" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "Suppress Cat", slug: "suppress-cat" },
    });
    await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "email",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    // Add to email suppression
    await prisma.emailSuppression.create({
      data: { email: "suppressed@example.com", reason: "hard_bounce" },
    });

    const ann = await prisma.announcement.create({
      data: {
        title: "Suppressed Test",
        slug: "suppressed-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });

    const sent: unknown[] = [];
    const mockQueue = { send: async (msg: unknown) => { sent.push(msg); } };

    const result = await enqueueDeliveries(
      prisma,
      mockQueue,
      ann.id,
      [category.id],
      "public",
      [],
    );

    expect(result.deliveryCount).toBe(0);
    expect(result.suppressedCount).toBe(1);
  });
});

// ---- Twilio Signature Helper ----

/**
 * Generate a valid Twilio HMAC-SHA1 signature for test requests.
 */
async function generateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  let dataString = url;
  for (const key of sortedKeys) {
    dataString += key + params[key];
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(dataString));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

const TWILIO_AUTH_TOKEN = "test-twilio-auth-token-do-not-use-in-production";

// ---- Twilio Status Callback Tests ----

describe("Twilio Status Callback", () => {
  let prisma: ReturnType<typeof createPrismaClient> extends Promise<infer T> ? T : never;

  beforeEach(async () => {
    prisma = await createPrismaClient(env.DB);
  });

  it("updates delivery status on delivered callback", async () => {
    // Setup
    const user = await prisma.user.create({
      data: { email: "twilio-cb@example.com", name: "Twilio CB", status: "active", phone: "+61400000001" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "Twilio CB Cat", slug: "twilio-cb-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "sms",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "CB Test",
        slug: "cb-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    const delivery = await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "sms",
        status: "sent",
        externalMessageId: "SM123456",
        sentAt: new Date(),
      },
    });

    // Call the status callback with valid Twilio signature
    const statusParams = { MessageSid: "SM123456", MessageStatus: "delivered" };
    const statusUrl = `${BASE}/v1/webhooks/twilio/status`;
    const sig = await generateTwilioSignature(TWILIO_AUTH_TOKEN, statusUrl, statusParams);

    const req = new Request(statusUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: BASE,
        "X-Twilio-Signature": sig,
      },
      body: new URLSearchParams(statusParams).toString(),
    });

    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    // Check delivery was updated
    const updated = await prisma.announcementDelivery.findUnique({ where: { id: delivery.id } });
    expect(updated?.status).toBe("delivered");
    expect(updated?.deliveredAt).not.toBeNull();
  });

  it("rejects duplicate events (replay protection)", async () => {
    const user = await prisma.user.create({
      data: { email: "replay@example.com", name: "Replay", status: "active", phone: "+61400000002" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "Replay Cat", slug: "replay-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "sms",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "Replay Test",
        slug: "replay-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    const delivery = await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "sms",
        status: "sent",
        externalMessageId: "SM789",
        sentAt: new Date(),
      },
    });

    // First callback — should succeed
    const replayParams = { MessageSid: "SM789", MessageStatus: "delivered" };
    const replayUrl = `${BASE}/v1/webhooks/twilio/status`;
    const replaySig = await generateTwilioSignature(TWILIO_AUTH_TOKEN, replayUrl, replayParams);

    const req1 = new Request(replayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: BASE,
        "X-Twilio-Signature": replaySig,
      },
      body: new URLSearchParams(replayParams).toString(),
    });
    await app.fetch(req1, env);

    // Second callback — same event, should be ignored
    const req2 = new Request(replayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: BASE,
        "X-Twilio-Signature": replaySig,
      },
      body: new URLSearchParams(replayParams).toString(),
    });
    const res2 = await app.fetch(req2, env);
    expect(res2.status).toBe(200);

    // Should still be delivered (not errored)
    const updated = await prisma.announcementDelivery.findUnique({ where: { id: delivery.id } });
    expect(updated?.status).toBe("delivered");
  });

  it("does not regress delivery status (monotonic)", async () => {
    const user = await prisma.user.create({
      data: { email: "mono@example.com", name: "Mono", status: "active", phone: "+61400000003" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "Mono Cat", slug: "mono-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "sms",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "Mono Test",
        slug: "mono-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    // Delivery already in 'delivered' state
    const delivery = await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "sms",
        status: "delivered",
        externalMessageId: "SM_MONO",
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    // Late 'sent' event should not regress status
    const monoParams = { MessageSid: "SM_MONO", MessageStatus: "sent" };
    const monoUrl = `${BASE}/v1/webhooks/twilio/status`;
    const monoSig = await generateTwilioSignature(TWILIO_AUTH_TOKEN, monoUrl, monoParams);

    const req = new Request(monoUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: BASE,
        "X-Twilio-Signature": monoSig,
      },
      body: new URLSearchParams(monoParams).toString(),
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    const updated = await prisma.announcementDelivery.findUnique({ where: { id: delivery.id } });
    expect(updated?.status).toBe("delivered"); // Should NOT regress to "sent"
  });

  it("rejects requests without X-Twilio-Signature header", async () => {
    const req = new Request(`${BASE}/v1/webhooks/twilio/status`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: BASE },
      body: new URLSearchParams({
        MessageSid: "SM_NOSIG",
        MessageStatus: "delivered",
      }).toString(),
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(403);
  });

  it("rejects requests with invalid Twilio signature", async () => {
    const req = new Request(`${BASE}/v1/webhooks/twilio/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: BASE,
        "X-Twilio-Signature": "invalid-signature-value",
      },
      body: new URLSearchParams({
        MessageSid: "SM_BADSIG",
        MessageStatus: "delivered",
      }).toString(),
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(403);
  });
});

// ---- Postmark Webhook for Announcements ----

import { processAnnouncementWebhookEvent } from "../email/webhook.js";

describe("Postmark Webhook — Announcement Delivery", () => {
  let prisma: ReturnType<typeof createPrismaClient> extends Promise<infer T> ? T : never;

  beforeEach(async () => {
    prisma = await createPrismaClient(env.DB);
  });

  it("marks delivery as delivered on Delivery event", async () => {
    const user = await prisma.user.create({
      data: { email: "pm-del@example.com", name: "PM Del", status: "active" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "PM Del Cat", slug: "pm-del-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "email",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "PM Del Test",
        slug: "pm-del-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    const delivery = await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "email",
        status: "sent",
        externalMessageId: "PM-MSG-001",
        sentAt: new Date(),
      },
    });

    const result = await processAnnouncementWebhookEvent(prisma, {
      RecordType: "Delivery",
      MessageID: "PM-MSG-001",
    });

    expect(result.processed).toBe(true);
    expect(result.newStatus).toBe("delivered");

    const updated = await prisma.announcementDelivery.findUnique({ where: { id: delivery.id } });
    expect(updated?.status).toBe("delivered");
    expect(updated?.deliveredAt).not.toBeNull();
  });

  it("marks delivery as failed on Bounce event with hard bounce", async () => {
    const user = await prisma.user.create({
      data: { email: "pm-bounce@example.com", name: "PM Bounce", status: "active" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "PM Bounce Cat", slug: "pm-bounce-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "email",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "PM Bounce Test",
        slug: "pm-bounce-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "email",
        status: "sent",
        externalMessageId: "PM-MSG-002",
        sentAt: new Date(),
      },
    });

    const result = await processAnnouncementWebhookEvent(prisma, {
      RecordType: "Bounce",
      MessageID: "PM-MSG-002",
      TypeCode: 1,
      Email: "pm-bounce@example.com",
      Description: "Hard bounce",
    });

    expect(result.processed).toBe(true);
    expect(result.newStatus).toBe("failed");

    // Should also add email to suppression list
    const suppression = await prisma.emailSuppression.findUnique({
      where: { email: "pm-bounce@example.com" },
    });
    expect(suppression).not.toBeNull();
    expect(suppression?.reason).toBe("hard_bounce");
  });

  it("records Open event (first open only)", async () => {
    const user = await prisma.user.create({
      data: { email: "pm-open@example.com", name: "PM Open", status: "active" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "PM Open Cat", slug: "pm-open-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "email",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "PM Open Test",
        slug: "pm-open-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    const delivery = await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "email",
        status: "delivered",
        externalMessageId: "PM-MSG-003",
        sentAt: new Date(),
        deliveredAt: new Date(),
      },
    });

    const result = await processAnnouncementWebhookEvent(prisma, {
      RecordType: "Open",
      MessageID: "PM-MSG-003",
    });

    expect(result.processed).toBe(true);

    const updated = await prisma.announcementDelivery.findUnique({ where: { id: delivery.id } });
    expect(updated?.openedAt).not.toBeNull();
  });

  it("rejects duplicate Postmark events", async () => {
    const user = await prisma.user.create({
      data: { email: "pm-dup@example.com", name: "PM Dup", status: "active" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "PM Dup Cat", slug: "pm-dup-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "email",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "PM Dup Test",
        slug: "pm-dup-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "email",
        status: "sent",
        externalMessageId: "PM-MSG-DUP",
        sentAt: new Date(),
      },
    });

    // First event
    const result1 = await processAnnouncementWebhookEvent(prisma, {
      RecordType: "Delivery",
      MessageID: "PM-MSG-DUP",
    });
    expect(result1.processed).toBe(true);

    // Duplicate event
    const result2 = await processAnnouncementWebhookEvent(prisma, {
      RecordType: "Delivery",
      MessageID: "PM-MSG-DUP",
    });
    // Should be rejected (either as duplicate_event or status_not_progressing)
    expect(result2.processed).toBe(false);
  });
});

// ---- Unsubscribe Endpoint Tests ----

import { hmacSha256Hex } from "../email/service.js";

describe("Unsubscribe Endpoint", () => {
  it("returns 404 for invalid token", async () => {
    const req = new Request(`${BASE}/v1/subscriptions/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE },
      body: JSON.stringify({ token: "invalid-token-that-does-not-exist" }),
    });

    const res = await app.fetch(req, env);
    expect(res.status).toBe(404);
  });

  it("unsubscribes via delivery-based HMAC token", async () => {
    const prisma = await createPrismaClient(env.DB);
    const user = await prisma.user.create({
      data: { email: "unsub-delivery@example.com", name: "Unsub Delivery", status: "active" },
    });
    const category = await prisma.announcementCategory.create({
      data: { name: "Unsub Del Cat", slug: "unsub-del-cat" },
    });
    const sub = await prisma.categorySubscription.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        channel: "email",
        status: "confirmed",
        confirmedAt: new Date(),
        subscribedById: user.id,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    const ann = await prisma.announcement.create({
      data: {
        title: "Unsub Del Test",
        slug: "unsub-del-test",
        summary: "Test",
        contentBlocks: "[]",
        authorId: user.id,
        status: "published",
        publishedAt: new Date(),
      },
    });
    const delivery = await prisma.announcementDelivery.create({
      data: {
        announcementId: ann.id,
        subscriptionId: sub.id,
        userId: user.id,
        channel: "email",
        status: "sent",
        externalMessageId: "PM-UNSUB-001",
        sentAt: new Date(),
      },
    });

    // Generate the same HMAC token the delivery handler would generate
    const hmac = await hmacSha256Hex(
      "dev-subscription-hmac-secret-do-not-use-in-production",
      `unsubscribe:${delivery.id}`,
    );
    const token = `${delivery.id}:${hmac}`;

    const req = new Request(`${BASE}/v1/subscriptions/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE },
      body: JSON.stringify({ token }),
    });

    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);

    // Subscription should be declined (not deleted, because delivery FK references it)
    const declinedSub = await prisma.categorySubscription.findUnique({ where: { id: sub.id } });
    expect(declinedSub).not.toBeNull();
    expect(declinedSub?.status).toBe("declined");
  });
});

// ---- Email Masking Tests ----

import { maskEmail } from "../lib/subscription-service.js";

describe("Email Masking", () => {
  it("masks email showing first 2 chars + domain", () => {
    expect(maskEmail("user@example.com")).toBe("us***@example.com");
  });

  it("handles short local parts", () => {
    expect(maskEmail("a@example.com")).toBe("a***@example.com");
  });

  it("handles missing @ sign", () => {
    expect(maskEmail("invalid")).toBe("***@***");
  });
});
