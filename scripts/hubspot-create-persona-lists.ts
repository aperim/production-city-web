#!/usr/bin/env node
/**
 * HubSpot persona list creation — Production City.
 *
 * Creates 7 dynamic contact lists segmented by pc_interest_category.
 * Idempotent: lists that already exist are skipped.
 *
 * Prerequisites: the Private App must have crm.lists.read and crm.lists.write scopes.
 * Token has been confirmed with these scopes by Troy Kelly (2026-04-29).
 *
 * Usage:
 *   HUBSPOT_ACCESS_TOKEN=pat-ap1-xxxx \
 *     node --experimental-transform-types --experimental-detect-module \
 *          scripts/hubspot-create-persona-lists.ts
 *
 * @see PRO-442
 */

const HUBSPOT_API = "https://api.hubapi.com";
const PORTAL_ID = "443097706";

interface ListDefinition {
  name: string;
  filterValue: string;
}

const PERSONA_LISTS: ListDefinition[] = [
  { name: "PC — General Enquiries", filterValue: "general" },
  { name: "PC — Producers",         filterValue: "producer" },
  { name: "PC — Creatives",         filterValue: "creative" },
  { name: "PC — Partners",          filterValue: "partner" },
  { name: "PC — Investors",         filterValue: "investor" },
  { name: "PC — Education",         filterValue: "education" },
  { name: "PC — Employment",        filterValue: "employment" },
];

interface HubSpotList {
  listId: string;
  name: string;
}

interface V1ListSearchResponse {
  lists: Array<{ name: string; listId: number }>;
  "has-more"?: boolean;
  offset?: number;
}

interface CreatedList {
  listId?: string;
  id?: string;
}

async function fetchExistingLists(accessToken: string): Promise<Map<string, string>> {
  const nameToId = new Map<string, string>();

  const url = `${HUBSPOT_API}/contacts/v1/lists`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch existing lists: ${response.status} ${body}`);
  }
  const data = (await response.json()) as V1ListSearchResponse;
  const lists = data.lists ?? [];
  for (const list of lists) {
    nameToId.set(list.name, String(list.listId));
  }

  return nameToId;
}

async function createList(
  definition: ListDefinition,
  accessToken: string,
): Promise<string> {
  const payload = {
    name: definition.name,
    objectTypeId: "0-1",
    processingType: "DYNAMIC",
    filterBranch: {
      filterBranchType: "OR",
      filterBranchOperator: "OR",
      filterBranches: [
        {
          filterBranchType: "AND",
          filterBranchOperator: "AND",
          filters: [
            {
              filterType: "PROPERTY",
              property: "pc_interest_category",
              operation: {
                operationType: "ENUMERATION",
                operator: "IS_ANY_OF",
                values: [definition.filterValue],
              },
            },
          ],
        },
      ],
    },
  };

  const response = await fetch(`${HUBSPOT_API}/crm/v3/lists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 409) {
    return "already-exists";
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create list "${definition.name}": ${response.status} ${body}`);
  }

  const created = (await response.json()) as CreatedList;
  return created.listId ?? created.id ?? "unknown";
}

async function main(): Promise<void> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("ERROR: HUBSPOT_ACCESS_TOKEN is not set.");
    console.error("Set it to a Private App token with crm.lists.read and crm.lists.write scopes.");
    process.exit(1);
  }

  console.log(`Production City — HubSpot Persona List Creation`);
  console.log(`Portal: ${PORTAL_ID}`);
  console.log(`Lists to create: ${PERSONA_LISTS.length}`);
  console.log("");

  console.log("Fetching existing lists...");
  const existing = await fetchExistingLists(accessToken);
  console.log(`Found ${existing.size} existing lists.\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const definition of PERSONA_LISTS) {
    const existingId = existing.get(definition.name);
    if (existingId) {
      console.log(`  ✓ ${definition.name} — already exists (listId: ${existingId})`);
      skipped++;
      continue;
    }

    try {
      const listId = await createList(definition, accessToken);
      if (listId === "already-exists") {
        console.log(`  ✓ ${definition.name} — already exists (409)`);
        skipped++;
      } else {
        console.log(`  + ${definition.name} — created (listId: ${listId})`);
        created++;
      }
    } catch (err) {
      console.error(`  ✗ ${definition.name} — FAILED: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log("");
  console.log(`Done. Created: ${created}, Skipped: ${skipped}, Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

await main();
