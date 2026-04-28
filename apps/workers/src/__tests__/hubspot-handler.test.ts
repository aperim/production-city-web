import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { splitName, processHubspotContactSync } from "../hubspot-handler.js";
import type { HubspotContactSyncPayload, HubspotSyncEnv } from "../hubspot-handler.js";

// ---------------------------------------------------------------------------
// splitName
// ---------------------------------------------------------------------------

describe("splitName", () => {
  it("splits a two-part name", () => {
    expect(splitName("Jane Doe")).toEqual({ firstname: "Jane", lastname: "Doe" });
  });

  it("splits a multi-word name — last word is lastname", () => {
    expect(splitName("Mary Jane Watson")).toEqual({ firstname: "Mary Jane", lastname: "Watson" });
  });

  it("single word — no lastname", () => {
    expect(splitName("Prince")).toEqual({ firstname: "Prince", lastname: undefined });
  });

  it("trims leading/trailing whitespace", () => {
    expect(splitName("  Anna Smith  ")).toEqual({ firstname: "Anna", lastname: "Smith" });
  });

  it("collapses internal whitespace", () => {
    expect(splitName("Jo  Li")).toEqual({ firstname: "Jo", lastname: "Li" });
  });
});

// ---------------------------------------------------------------------------
// processHubspotContactSync
// ---------------------------------------------------------------------------

function makePayload(overrides: Partial<HubspotContactSyncPayload> = {}): HubspotContactSyncPayload {
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

function makeEnv(token = "tok-secret"): HubspotSyncEnv {
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
    const result = await processHubspotContactSync({ HUBSPOT_ACCESS_TOKEN: "" }, makePayload());
    expect(result).toEqual({ processed: false, reason: "missing_access_token" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates contact on 201 and records GDPR consent", async () => {
    const mockFetch = vi.fn()
      // POST /contacts → 201 created
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "hs-42" }),
      })
      // POST /gdpr-consent → 200
      .mockResolvedValueOnce({ ok: true, status: 200 });

    vi.stubGlobal("fetch", mockFetch);

    const result = await processHubspotContactSync(makeEnv(), makePayload({ marketingOptIn: true }));

    expect(result).toEqual({ processed: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // First call: create contact
    const [createUrl, createInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(createUrl).toContain("/crm/v3/objects/contacts");
    expect(createInit.method).toBe("POST");
    const createBody = JSON.parse(createInit.body as string);
    expect(createBody.properties.email).toBe("alice@example.com");
    expect(createBody.properties.firstname).toBe("Alice");
    expect(createBody.properties.lastname).toBe("Nguyen");
    expect(createBody.properties.hs_marketable_status).toBe("true");

    // Second call: GDPR consent
    const [gdprUrl] = mockFetch.mock.calls[1] as [string, RequestInit];
    expect(gdprUrl).toContain("/hs-42/gdpr-consent");
  });

  it("on 409, searches for existing contact then updates", async () => {
    const mockFetch = vi.fn()
      // POST /contacts → 409 conflict
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => "CONTACT_EXISTS",
      })
      // POST /contacts/search → found
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ results: [{ id: "hs-99" }] }),
      })
      // PATCH /contacts/hs-99 → 200
      .mockResolvedValueOnce({ ok: true, status: 200 })
      // POST /gdpr-consent → 200
      .mockResolvedValueOnce({ ok: true, status: 200 });

    vi.stubGlobal("fetch", mockFetch);

    const result = await processHubspotContactSync(makeEnv(), makePayload());

    expect(result).toEqual({ processed: true });

    const [, searchInit] = mockFetch.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(searchInit.body as string).filterGroups[0].filters[0].value).toBe("alice@example.com");

    const [patchUrl, patchInit] = mockFetch.mock.calls[2] as [string, RequestInit];
    expect(patchUrl).toContain("/hs-99");
    expect(patchInit.method).toBe("PATCH");
  });

  it("throws (triggering retry) on unexpected API error", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(
      processHubspotContactSync(makeEnv(), makePayload()),
    ).rejects.toThrow("HubSpot create contact failed: 500");
  });

  it("logs GDPR consent error but still returns processed:true", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: "hs-7" }) })
      .mockResolvedValueOnce({ ok: false, status: 403, text: async () => "Forbidden" });

    vi.stubGlobal("fetch", mockFetch);

    const result = await processHubspotContactSync(makeEnv(), makePayload());

    expect(result).toEqual({ processed: true });
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  it("omits lastname when name is single word", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: "hs-1" }) })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    await processHubspotContactSync(makeEnv(), makePayload({ name: "Cher" }));

    const [, createInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(createInit.body as string);
    expect(body.properties.firstname).toBe("Cher");
    expect("lastname" in body.properties).toBe(false);
  });

  it("maps optional fields when present", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: "hs-3" }) })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    vi.stubGlobal("fetch", mockFetch);

    await processHubspotContactSync(
      makeEnv(),
      makePayload({
        company: "Acme",
        message: "Hello",
        sourcePage: "/contact",
      }),
    );

    const [, createInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    const { properties } = JSON.parse(createInit.body as string);
    expect(properties.company).toBe("Acme");
    expect(properties.pc_eoi_message).toBe("Hello");
    expect(properties.pc_source_page).toBe("/contact");
  });
});
