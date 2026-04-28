#!/usr/bin/env bash
# HubSpot Portal Configuration — Production City
#
# Idempotent setup script for the Production City HubSpot portal (ID: 443097706).
# Creates all custom contact properties, contact lists, and mirrored form definition.
#
# Prerequisites:
#   HUBSPOT_TOKEN must be set to a Private App token with scopes:
#     crm.objects.contacts.read, crm.objects.contacts.write,
#     crm.schemas.contacts.read, crm.schemas.contacts.write,
#     crm.lists.read, crm.lists.write,
#     forms, automation
#
# Usage:
#   HUBSPOT_TOKEN=pat-ap1-xxxx bash scripts/hubspot-portal-setup.sh
#
# Idempotency: properties are created with PUT (upsert). If a property already
# exists with the same internal name, it will be updated to match the spec.
# Lists are created only if no list with the given name already exists.

set -euo pipefail

PORTAL_ID=443097706
API_BASE="https://api.hubapi.com"

if [[ -z "${HUBSPOT_TOKEN:-}" ]]; then
  echo "ERROR: HUBSPOT_TOKEN is not set." >&2
  echo "Set it to a Private App token with contacts + lists + forms + automation scopes." >&2
  exit 1
fi

H_AUTH="Authorization: Bearer $HUBSPOT_TOKEN"

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $command_name" >&2
    exit 1
  fi
}

fail_api_status() {
  local context="$1"
  local status="$2"
  local body="${3:-}"
  echo "ERROR: $context failed with HTTP status $status." >&2
  if [[ -n "$body" ]]; then
    echo "Response: $body" >&2
  fi
  exit 1
}

require_command curl
require_command jq

echo "=== Production City HubSpot Portal Setup ==="
echo "Portal: $PORTAL_ID"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Helper: create or update a contact property
# ─────────────────────────────────────────────────────────────────────────────
upsert_property() {
  local name="$1"
  local payload="$2"
  local result
  local patch_result
  local patch_status
  echo "  → property: $name"
  result=$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
    "$API_BASE/crm/v3/properties/contacts" \
    -H "$H_AUTH" -H "Content-Type: application/json" \
    -d "$payload")
  if [[ "$result" == "409" ]]; then
    # Already exists — PATCH to update
    patch_result=$(curl -sS -w "\n%{http_code}" -X PATCH \
      "$API_BASE/crm/v3/properties/contacts/$name" \
      -H "$H_AUTH" -H "Content-Type: application/json" \
      -d "$payload")
    patch_status=$(echo "$patch_result" | tail -1)
    if [[ "$patch_status" != "200" ]]; then
      fail_api_status "Updating property $name" "$patch_status" "$(echo "$patch_result" | sed '$d')"
    fi
    echo "    updated (409→PATCH)"
  elif [[ "$result" == "201" || "$result" == "200" ]]; then
    echo "    created ($result)"
  else
    fail_api_status "Creating property $name" "$result"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. Custom contact properties
# ─────────────────────────────────────────────────────────────────────────────
echo "── Step 1: Custom contact properties ──"

# pc_interest_category
upsert_property "pc_interest_category" '{
  "name": "pc_interest_category",
  "label": "PC Interest Category",
  "description": "Production City EOI persona category",
  "groupName": "contactinformation",
  "type": "enumeration",
  "fieldType": "select",
  "options": [
    {"label": "General",    "value": "general",    "displayOrder": 1},
    {"label": "Producer",   "value": "producer",   "displayOrder": 2},
    {"label": "Creative",   "value": "creative",   "displayOrder": 3},
    {"label": "Partner",    "value": "partner",    "displayOrder": 4},
    {"label": "Investor",   "value": "investor",   "displayOrder": 5},
    {"label": "Education",  "value": "education",  "displayOrder": 6},
    {"label": "Employment", "value": "employment", "displayOrder": 7}
  ]
}'

# pc_eoi_message
upsert_property "pc_eoi_message" '{
  "name": "pc_eoi_message",
  "label": "PC EOI Message",
  "description": "Free-text message submitted with EOI",
  "groupName": "contactinformation",
  "type": "string",
  "fieldType": "textarea"
}'

# pc_source_page
upsert_property "pc_source_page" '{
  "name": "pc_source_page",
  "label": "PC Source Page",
  "description": "URL path of the page where EOI was submitted (e.g. /contact, /facilities)",
  "groupName": "contactinformation",
  "type": "string",
  "fieldType": "text"
}'

# pc_locale
upsert_property "pc_locale" '{
  "name": "pc_locale",
  "label": "PC Locale",
  "description": "Locale of the visitor at time of EOI submission",
  "groupName": "contactinformation",
  "type": "enumeration",
  "fieldType": "select",
  "options": [
    {"label": "English",    "value": "en", "displayOrder": 1},
    {"label": "Chinese",    "value": "zh", "displayOrder": 2},
    {"label": "Hindi",      "value": "hi", "displayOrder": 3},
    {"label": "Spanish",    "value": "es", "displayOrder": 4},
    {"label": "Arabic",     "value": "ar", "displayOrder": 5},
    {"label": "French",     "value": "fr", "displayOrder": 6},
    {"label": "Bengali",    "value": "bn", "displayOrder": 7},
    {"label": "Portuguese", "value": "pt", "displayOrder": 8},
    {"label": "Russian",    "value": "ru", "displayOrder": 9},
    {"label": "Japanese",   "value": "ja", "displayOrder": 10}
  ]
}'

# pc_consent_version
upsert_property "pc_consent_version" '{
  "name": "pc_consent_version",
  "label": "PC Consent Version",
  "description": "Privacy policy/consent version accepted at time of submission (e.g. 2026-03-01)",
  "groupName": "contactinformation",
  "type": "string",
  "fieldType": "text"
}'

# pc_marketing_opt_in
upsert_property "pc_marketing_opt_in" '{
  "name": "pc_marketing_opt_in",
  "label": "PC Marketing Opt-In",
  "description": "Whether the contact explicitly opted into marketing communications at EOI submission",
  "groupName": "contactinformation",
  "type": "bool",
  "fieldType": "booleancheckbox"
}'

# pc_utm_source
upsert_property "pc_utm_source" '{
  "name": "pc_utm_source",
  "label": "PC UTM Source",
  "description": "UTM source from the EOI submission referrer",
  "groupName": "contactinformation",
  "type": "string",
  "fieldType": "text"
}'

# pc_utm_medium
upsert_property "pc_utm_medium" '{
  "name": "pc_utm_medium",
  "label": "PC UTM Medium",
  "description": "UTM medium from the EOI submission referrer",
  "groupName": "contactinformation",
  "type": "string",
  "fieldType": "text"
}'

# pc_utm_campaign
upsert_property "pc_utm_campaign" '{
  "name": "pc_utm_campaign",
  "label": "PC UTM Campaign",
  "description": "UTM campaign from the EOI submission referrer",
  "groupName": "contactinformation",
  "type": "string",
  "fieldType": "text"
}'

# pc_metadata_json
upsert_property "pc_metadata_json" '{
  "name": "pc_metadata_json",
  "label": "PC Category Metadata (JSON)",
  "description": "Category-specific metadata as canonical JSON (producer, creative, partner, etc.)",
  "groupName": "contactinformation",
  "type": "string",
  "fieldType": "textarea"
}'

echo ""
echo "── Step 2: Contact lists (one per persona category) ──"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Contact lists — one active list per persona
# ─────────────────────────────────────────────────────────────────────────────
create_list_if_missing() {
  local list_name="$1"
  local filter_value="$2"
  local existing
  local result
  local http_code
  local body
  local list_id
  echo "  → list: $list_name"

  # Check if list already exists by name
  existing=$(curl -sS "$API_BASE/contacts/v1/lists/all/contacts/all?count=250" \
    -H "$H_AUTH" | jq -r --arg name "$list_name" '.lists // [] | .[] | select(.name == $name) | .listId' | head -1)
  if [[ -n "$existing" ]]; then
    echo "    already exists (listId: $existing)"
    return 0
  fi

  # Use v3 lists API for creation (ILS lists)
  result=$(curl -sS -w "\n%{http_code}" -X POST \
    "$API_BASE/crm/v3/lists" \
    -H "$H_AUTH" -H "Content-Type: application/json" \
    -d '{
      "name": "'"$list_name"'",
      "objectTypeId": "0-1",
      "processingType": "DYNAMIC",
      "filterBranch": {
        "filterBranchType": "AND",
        "filterBranchOperator": "AND",
        "filters": [{
          "filterType": "PROPERTY",
          "property": "pc_interest_category",
          "operation": {
            "operationType": "ENUMERATION",
            "operator": "IS_ANY_OF",
            "values": ["'"$filter_value"'"]
          }
        }]
      }
    }')
  http_code=$(echo "$result" | tail -1)
  body=$(echo "$result" | sed '$d')
  if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
    list_id=$(echo "$body" | jq -r '.listId // .id' 2>/dev/null || echo "unknown")
    echo "    created (listId: $list_id)"
  elif [[ "$http_code" == "409" ]]; then
    echo "    already exists (skipped)"
  else
    fail_api_status "Creating list $list_name" "$http_code" "$body"
  fi
}

create_list_if_missing "PC — General Enquiries"    "general"
create_list_if_missing "PC — Producers"            "producer"
create_list_if_missing "PC — Creatives"            "creative"
create_list_if_missing "PC — Partners"             "partner"
create_list_if_missing "PC — Investors"            "investor"
create_list_if_missing "PC — Education"            "education"
create_list_if_missing "PC — Employment"           "employment"

echo ""
echo "── Step 3: Mirrored HubSpot form definition ──"

# ─────────────────────────────────────────────────────────────────────────────
# 3. Create a HubSpot form definition that mirrors the EOI fields
#    (for tracking + fallback; not embedded in the site)
# ─────────────────────────────────────────────────────────────────────────────
echo "  → form: Production City EOI"

find_existing_form_id() {
  curl -sS "$API_BASE/marketing/v3/forms?limit=100" \
    -H "$H_AUTH" |
    jq -r '.results // [] | .[] | select(.name == "Production City — Expression of Interest") | .id' |
    head -1
}

existing_form_id=$(find_existing_form_id)
if [[ -n "$existing_form_id" ]]; then
  echo "    already exists (formId: $existing_form_id)"
else
  form_result=$(curl -sS -w "\n%{http_code}" -X POST \
    "$API_BASE/marketing/v3/forms" \
    -H "$H_AUTH" -H "Content-Type: application/json" \
    -d '{
    "name": "Production City — Expression of Interest",
    "formType": "hubspot",
    "configuration": {
      "createNewContactForNewEmail": true,
      "lifecycleStages": [{"objectTypeId": "0-1", "value": "lead"}],
      "shouldNotifyContacts": false,
      "recaptchaEnabled": false,
      "archiveContactsForSuppressedLists": false
    },
    "displayOptions": {"renderRawHtml": false, "cssClass": "", "style": {"labelTextColor": "#33475b"}},
    "legalConsentOptions": {
      "type": "implicit",
      "communicationsCheckboxes": [],
      "privacyPolicyText": "By submitting this form, you consent to us using your information as described in our Privacy Policy (consentVersion: 2026-03-01).",
      "isLegitimateInterest": false
    },
    "fieldGroups": [
      {"groupType": "default_group", "richTextType": "text", "fields": [
        {"objectTypeId": "0-1", "name": "firstname", "required": false},
        {"objectTypeId": "0-1", "name": "lastname", "required": false},
        {"objectTypeId": "0-1", "name": "email", "required": true},
        {"objectTypeId": "0-1", "name": "pc_interest_category", "required": true},
        {"objectTypeId": "0-1", "name": "pc_eoi_message", "required": false},
        {"objectTypeId": "0-1", "name": "pc_source_page", "required": false},
        {"objectTypeId": "0-1", "name": "pc_locale", "required": false},
        {"objectTypeId": "0-1", "name": "pc_consent_version", "required": true},
        {"objectTypeId": "0-1", "name": "pc_marketing_opt_in", "required": false}
      ]}
    ]
  }')
  form_code=$(echo "$form_result" | tail -1)
  form_body=$(echo "$form_result" | sed '$d')
  if [[ "$form_code" == "200" || "$form_code" == "201" ]]; then
    form_id=$(echo "$form_body" | jq -r '.id' 2>/dev/null || echo "unknown")
    echo "    created (formId: $form_id)"
    echo "    ⚠️  Record formId in 1Password and share with CTO for backend sync."
  else
    fail_api_status "Creating form Production City EOI" "$form_code" "$form_body"
  fi
fi

echo ""
echo "── Step 4: GDPR / Consent setup ──"
echo "  ⚠️  GDPR configuration requires manual steps in HubSpot portal:"
echo "     1. Settings → Privacy & Consent → Data privacy"
echo "     2. Enable GDPR functionality"
echo "     3. Set consent type: Legitimate interest for marketing"
echo "     4. Consent version to reference: 2026-03-01"
echo "     5. Data retention policy: 24 months for inactive contacts"
echo ""

echo "── Step 5: Lifecycle stage guidance ──"
echo "  HubSpot default lifecycle stages map as follows:"
echo "    New EOI submission   → Lifecycle: Lead (default for new contacts)"
echo "    Status: contacted    → Lifecycle: Marketing Qualified Lead (MQL)"
echo "    Status: converted    → Lifecycle: Sales Qualified Lead (SQL)"
echo "  Update lifecycle stage via PATCH contact when EOI status changes in backend."
echo ""

echo "═══════════════════════════════════════"
echo "Setup complete. Review manual steps above."
echo ""
echo "Next steps:"
echo "  1. Share this token name with CTO (Jordan): HUBSPOT_PRIVATE_APP_TOKEN"
echo "     Scopes needed: crm.objects.contacts.read+write, crm.schemas.contacts.read+write,"
echo "     crm.lists.read+write, forms, automation"
echo "  2. CTO to add HUBSPOT_PRIVATE_APP_TOKEN to Worker secrets (wrangler secret put)"
echo "  3. CTO to implement contact sync in EOI handler (PRO-417)"
echo "  4. Run GDPR manual steps in portal (Step 4 above)"
echo "═══════════════════════════════════════"
