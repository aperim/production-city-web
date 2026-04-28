import type { PrismaClient } from "@prisma/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  splitName,
  processHubspotContactSync,
  processHubSpotFormSubmit,
} from "../hubspot-handler.js";
import type {
  HubspotContactSyncPayload,
  HubspotSyncEnv,
  HubSpotFormEnv,
} from "../hubspot-handler.js";

describe("splitName", () => {
  it("splits a two-part name", () => {
    expect(splitName("Jane Doe")).toEqual({ firstname: "Jane", lastname: "Doe" });
  });

  it("splits a multi-word name with the last word as lastname", () => {
    expect(splitName("Mary Jane Watson")).toEqual({ firstname: "Mary Jane", lastname: "Watson" });
  });

  it("handles a single word without lastname", () => {
    expect(splitName("Prince")).toEqual({ firstname: "Prince", lastname: undefined });
  });

  it("trims and collapses whitespace", () => {
    expect(splitName("  Jo  Li  ")).toEqual({ firstname: "Jo", lastname: "Li" });
  });
});

function makeContactPayload(
  overrides: Partial<HubspotContactSyncPayload> = {},
): HubspotContactSyncPayload {
  return {
    eoiId: "eoi-1",
    name: "Alice Nguyen",
    email: "alice@example.com",
    category: "producer",
    locale: "en",
    marketingOptIn: false,
    consentVersion: "1.0",
    ...overrides,
  };
}

function makeContactEnv(token = "tok-secret"): HubspotSyncEnv {
  return { HUBSPOT_ACCESS_TOKEN: token };
}

describe("processHubspotContactSync", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns missing_access_token and does not call fetch when token empty", async () => {
    const result = await processHubspotContactSync(
      { HUBSPOT_ACCESS_TOKEN: "" },
      makeContactPayload(),
    );
    expect(result).toEqual({ processed: false, reason: "missing_access_token" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates contact on 201 and records GDPR consent", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: "hs-42" }) })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    const result = await processHubspotContactSync(
      makeContactEnv(),
      makeContactPayload({ marketingOptIn: true }),
    );

    expect(result).toEqual({ processed: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const [createUrl, createInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(createUrl).toContain("/crm/v3/objects/contacts");
    expect(createInit.method).toBe("POST");
    const createBody = JSON.parse(createInit.body as string);
    expect(createBody.properties.email).toBe("alice@example.com");
    expect(createBody.properties.firstname).toBe("Alice");
    expect(createBody.properties.lastname).toBe("Nguyen");
    expect(createBody.properties.hs_marketable_status).toBe("true");

    const [gdprUrl] = mockFetch.mock.calls[1] as [string, RequestInit];
    expect(gdprUrl).toContain("/hs-42/gdpr-consent");
  });

  it("on 409, searches for existing contact then updates", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 409, text: async () => "CONTACT_EXISTS" })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [{ id: "hs-99" }] }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    const result = await processHubspotContactSync(makeContactEnv(), makeContactPayload());

    expect(result).toEqual({ processed: true });
    const [, searchInit] = mockFetch.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(searchInit.body as string).filterGroups[0].filters[0].value)
      .toBe("alice@example.com");

    const [patchUrl, patchInit] = mockFetch.mock.calls[2] as [string, RequestInit];
    expect(patchUrl).toContain("/hs-99");
    expect(patchInit.method).toBe("PATCH");
  });

  it("throws on unexpected contact API error", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      processHubspotContactSync(makeContactEnv(), makeContactPayload()),
    ).rejects.toThrow("HubSpot create contact failed: 500");
  });

  it("logs GDPR consent error but still returns processed:true", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: "hs-7" }) })
      .mockResolvedValueOnce({ ok: false, status: 403, text: async () => "Forbidden" });
    vi.stubGlobal("fetch", mockFetch);

    const result = await processHubspotContactSync(makeContactEnv(), makeContactPayload());

    expect(result).toEqual({ processed: true });
    expect(errorSpy).toHaveBeenCalledOnce();
  });
});

function makeFormEnv(overrides: Partial<HubSpotFormEnv> = {}): HubSpotFormEnv {
  return {
    DB: {} as D1Database,
    HUBSPOT_PORTAL_ID: "12345",
    HUBSPOT_FORM_GUID: "test-form-guid",
    ...overrides,
  };
}

const baseEoi = {
  id: "eoi-1",
  name: "Jane Smith",
  email: "jane@example.com",
  category: "creative",
  message: "Hello",
  sourcePage: "https://production.city/contact",
  utmSource: "linkedin",
};

function makePrisma(eoi: Record<string, unknown> | null = baseEoi) {
  return {
    expressionOfInterest: {
      findUnique: vi.fn().mockResolvedValue(eoi),
    },
  } as unknown as PrismaClient;
}

describe("processHubSpotFormSubmit", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("no-ops when portal ID is missing", async () => {
    const prisma = makePrisma();
    const result = await processHubSpotFormSubmit(
      prisma,
      makeFormEnv({ HUBSPOT_PORTAL_ID: "" }),
      { eoiId: "eoi-1" },
    );

    expect(result).toEqual({ submitted: false, reason: "not_configured" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("no-ops when EOI is not found", async () => {
    const prisma = makePrisma(null);
    const result = await processHubSpotFormSubmit(prisma, makeFormEnv(), { eoiId: "missing" });

    expect(result).toEqual({ submitted: false, reason: "eoi_not_found" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits fields and attribution context to the HubSpot Forms API", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    const result = await processHubSpotFormSubmit(
      makePrisma(),
      makeFormEnv(),
      { eoiId: "eoi-1", hutk: "hubspot-cookie", ipAddress: "203.0.113.9" },
    );

    expect(result).toEqual({ submitted: true });
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "https://api.hsforms.com/submissions/v3/integration/submit/12345/test-form-guid",
    );
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    const body = JSON.parse(init.body as string);
    expect(body.fields).toEqual(expect.arrayContaining([
      { objectTypeId: "0-1", name: "email", value: "jane@example.com" },
      { objectTypeId: "0-1", name: "firstname", value: "Jane" },
      { objectTypeId: "0-1", name: "lastname", value: "Smith" },
      { objectTypeId: "0-1", name: "eoi_category", value: "creative" },
      { objectTypeId: "0-1", name: "message", value: "Hello" },
      { objectTypeId: "0-1", name: "hs_analytics_source", value: "linkedin" },
    ]));
    expect(body.context).toEqual({
      hutk: "hubspot-cookie",
      ipAddress: "203.0.113.9",
      pageUri: "https://production.city/contact",
      pageName: "Production City",
    });
  });

  it("omits lastname for single-word names", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    await processHubSpotFormSubmit(
      makePrisma({ ...baseEoi, name: "Cher" }),
      makeFormEnv(),
      { eoiId: "eoi-1" },
    );

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.fields).toContainEqual({ objectTypeId: "0-1", name: "firstname", value: "Cher" });
    expect(body.fields.some((field: { name: string }) => field.name === "lastname")).toBe(false);
  });

  it("throws on HubSpot API failure so the queue can retry", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => "unavailable",
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      processHubSpotFormSubmit(makePrisma(), makeFormEnv(), { eoiId: "eoi-1" }),
    ).rejects.toThrow("HubSpot API error: 503");
    expect(errorSpy).toHaveBeenCalledOnce();
  });
});
