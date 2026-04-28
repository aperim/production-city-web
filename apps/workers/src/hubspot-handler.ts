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
    // Contact already exists — find by email and update
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

/**
 * Process a hubspot_contact_sync queue job.
 *
 * Upserts the EOI submitter as a HubSpot contact, then records GDPR consent.
 * Missing access token is acked without retry (config issue, not transient).
 */
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

  // GDPR consent is non-critical: log failure but don't retry the whole sync
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
