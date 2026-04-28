import type { PrismaClient } from "@prisma/client";
import { buildGelfMessage, toGelfJson, Level } from "@productioncity/holding-logging";

export interface HubspotSyncEnv {
  HUBSPOT_ACCESS_TOKEN: string;
  [key: string]: unknown;
}

export interface HubspotContactSyncPayload {
  eoiId: string;
  name: string;
  email: string;
  company?: string | null;
  category: string;
  message?: string | null;
  sourcePage?: string | null;
  locale: string;
  marketingOptIn: boolean;
  consentVersion: string;
}

export interface HubSpotFormSubmitPayload {
  eoiId: string;
  hutk?: string;
  ipAddress?: string;
}

export interface HubSpotFormEnv {
  DB: D1Database;
  HUBSPOT_PORTAL_ID?: string;
  HUBSPOT_FORM_GUID?: string;
  [key: string]: unknown;
}

interface HubSpotField {
  objectTypeId: string;
  name: string;
  value: string;
}

interface HubSpotSubmission {
  fields: HubSpotField[];
  context: {
    hutk?: string;
    ipAddress?: string;
    pageUri?: string;
    pageName?: string;
  };
}

const HUBSPOT_API_BASE = "https://api.hubapi.com";

/** Split a full name into firstname + lastname. Last word = lastname; single word = firstname only. */
export function splitName(name: string): { firstname: string; lastname: string | undefined } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstname: parts[0] ?? name, lastname: undefined };
  }
  const lastname = parts[parts.length - 1] ?? "";
  const firstname = parts.slice(0, -1).join(" ");
  return { firstname, lastname };
}

function buildContactProperties(payload: HubspotContactSyncPayload): Record<string, string> {
  const { firstname, lastname } = splitName(payload.name);
  const props: Record<string, string> = {
    email: payload.email,
    firstname,
    pc_interest_category: payload.category,
    pc_locale: payload.locale,
    hs_marketable_status: payload.marketingOptIn ? "true" : "false",
  };
  if (lastname !== undefined) props.lastname = lastname;
  if (payload.company) props.company = payload.company;
  if (payload.message) props.pc_eoi_message = payload.message;
  if (payload.sourcePage) props.pc_source_page = payload.sourcePage;
  return props;
}

async function findContactByEmail(accessToken: string, email: string): Promise<string> {
  const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
      properties: ["email"],
      limit: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot search failed: ${res.status} ${text}`);
  }
  const data = await res.json() as { results: Array<{ id: string }> };
  if (data.results.length === 0) {
    throw new Error(`HubSpot contact not found after 409 for email: ${email}`);
  }
  return data.results[0]!.id;
}

async function updateContact(
  accessToken: string,
  contactId: string,
  properties: Record<string, string>,
): Promise<void> {
  const res = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot update contact failed: ${res.status} ${text}`);
  }
}

/** Create or update a HubSpot contact. Returns the contact ID. */
async function upsertContact(
  accessToken: string,
  payload: HubspotContactSyncPayload,
): Promise<string> {
  const properties = buildContactProperties(payload);

  const createRes = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });

  if (createRes.ok) {
    const data = await createRes.json() as { id: string };
    return data.id;
  }

  if (createRes.status === 409) {
    const contactId = await findContactByEmail(accessToken, payload.email);
    await updateContact(accessToken, contactId, properties);
    return contactId;
  }

  const text = await createRes.text();
  throw new Error(`HubSpot create contact failed: ${createRes.status} ${text}`);
}

async function recordGdprConsent(
  accessToken: string,
  contactId: string,
  consentVersion: string,
): Promise<void> {
  const res = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}/gdpr-consent`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consent: "GRANTED",
        legalBasis: "LEGITIMATE_INTEREST_PQL",
        legalBasisExplanation: `Explicit consent (v${consentVersion}) via Production City EOI form`,
      }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot GDPR consent failed: ${res.status} ${text}`);
  }
}

export async function processHubspotContactSync(
  env: HubspotSyncEnv,
  payload: HubspotContactSyncPayload,
): Promise<{ processed: boolean; reason?: string }> {
  if (!env.HUBSPOT_ACCESS_TOKEN) {
    console.warn(
      toGelfJson(
        buildGelfMessage("holding-workers", {
          short_message: "hubspot.sync.skipped",
          level: Level.WARNING,
          service: "holding-workers",
          extra: { eoi_id: payload.eoiId, reason: "missing_access_token" },
        }),
      ),
    );
    return { processed: false, reason: "missing_access_token" };
  }

  const contactId = await upsertContact(env.HUBSPOT_ACCESS_TOKEN, payload);

  try {
    await recordGdprConsent(env.HUBSPOT_ACCESS_TOKEN, contactId, payload.consentVersion);
  } catch (err) {
    console.error(
      toGelfJson(
        buildGelfMessage("holding-workers", {
          short_message: "hubspot.gdpr.error",
          level: Level.ERROR,
          service: "holding-workers",
          full_message: String(err),
          error_type: err instanceof Error ? err.constructor.name : "Error",
          extra: { eoi_id: payload.eoiId, contact_id: contactId },
        }),
      ),
    );
  }

  console.log(
    toGelfJson(
      buildGelfMessage("holding-workers", {
        short_message: "hubspot.sync.complete",
        level: Level.INFO,
        service: "holding-workers",
        extra: { eoi_id: payload.eoiId, contact_id: contactId },
      }),
    ),
  );

  return { processed: true };
}

/**
 * Process a hubspot_form_submit queue job.
 *
 * Fetches EOI data from DB and submits to the HubSpot Forms API.
 * Throws on API error so the queue consumer retries.
 */
export async function processHubSpotFormSubmit(
  prisma: PrismaClient,
  env: HubSpotFormEnv,
  payload: HubSpotFormSubmitPayload,
): Promise<{ submitted: boolean; reason?: string }> {
  const portalId = env.HUBSPOT_PORTAL_ID;
  const formGuid = env.HUBSPOT_FORM_GUID;

  if (!portalId || !formGuid) {
    return { submitted: false, reason: "not_configured" };
  }

  const eoi = await prisma.expressionOfInterest.findUnique({
    where: { id: payload.eoiId },
    select: {
      id: true,
      name: true,
      email: true,
      category: true,
      message: true,
      sourcePage: true,
      utmSource: true,
    },
  });

  if (!eoi) {
    return { submitted: false, reason: "eoi_not_found" };
  }

  const { firstname, lastname } = splitName(eoi.name);
  const fields: HubSpotField[] = [
    { objectTypeId: "0-1", name: "email", value: eoi.email },
    { objectTypeId: "0-1", name: "firstname", value: firstname },
  ];

  if (lastname) {
    fields.push({ objectTypeId: "0-1", name: "lastname", value: lastname });
  }

  fields.push({ objectTypeId: "0-1", name: "eoi_category", value: eoi.category });

  if (eoi.message) {
    fields.push({ objectTypeId: "0-1", name: "message", value: eoi.message });
  }

  if (eoi.utmSource) {
    fields.push({ objectTypeId: "0-1", name: "hs_analytics_source", value: eoi.utmSource });
  }

  const submission: HubSpotSubmission = {
    fields,
    context: {
      ...(payload.hutk ? { hutk: payload.hutk } : {}),
      ...(payload.ipAddress ? { ipAddress: payload.ipAddress } : {}),
      ...(eoi.sourcePage ? { pageUri: eoi.sourcePage, pageName: "Production City" } : {}),
    },
  };

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error(
      toGelfJson(
        buildGelfMessage("holding-workers", {
          short_message: "hubspot.form.submit.error",
          level: Level.ERROR,
          service: "holding-workers",
          extra: {
            eoi_id: eoi.id,
            status: response.status,
            error: errorBody.slice(0, 200),
          },
        }),
      ),
    );
    throw new Error(`HubSpot API error: ${response.status}`);
  }

  console.log(
    toGelfJson(
      buildGelfMessage("holding-workers", {
        short_message: "hubspot.form.submit.ok",
        level: Level.INFO,
        service: "holding-workers",
        extra: { eoi_id: eoi.id },
      }),
    ),
  );

  return { submitted: true };
}
