# EOI Employment Category — API Documentation

**Epic:** #211 — Site Design Refactor
**Issue:** #223 — Documentation, OpenAPI Updates & Technical Debt
**Last Updated:** 2026-03-14

---

## Overview

The `employment` category was added to the Expression of Interest (EOI) system in PR-0 (#226). It allows prospective employees to register interest with role-specific metadata.

## Endpoint

```
POST /v1/eoi
```

## Employment-Specific Request

```json
{
  "category": "employment",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Interested in joining the VFX team",
  "metadata": {
    "desiredRole": "VFX Supervisor",
    "experienceLevel": "5-10years",
    "availability": "1-3months",
    "portfolioUrl": "https://example.com/portfolio"
  },
  "sourcePage": "/contact",
  "locale": "en",
  "consentVersion": "2026-03-01",
  "privacyAccepted": true,
  "marketingOptIn": false
}
```

## Employment Metadata Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `desiredRole` | `string` | Yes | The role the applicant is interested in. Min 1 char, max 200 chars. HTML entities are escaped on input. |
| `experienceLevel` | `enum` | No | One of: `entry`, `1-3years`, `3-5years`, `5-10years`, `10plus` |
| `availability` | `enum` | No | One of: `immediate`, `1-3months`, `3-6months`, `6plus-months`, `flexible` |
| `portfolioUrl` | `string (url)` | No | Must be HTTP or HTTPS. Max 500 chars. |

## Validation Rules

1. `desiredRole` is required within the metadata object. After HTML entity escaping and trimming, it must be at least 1 character.
2. The `metadata` object itself is optional. If omitted, the EOI is created without category-specific metadata (the `desiredRole` requirement only applies when metadata is provided).
3. `portfolioUrl` must use HTTP or HTTPS protocol (no `javascript:`, `data:`, or other schemes).
4. All string metadata fields enforce `.strict()` — extra properties are rejected.

## Response

### Success (201)

```json
{
  "id": "cuid-string",
  "message": "Your expression of interest has been submitted."
}
```

### Validation Error (400)

```json
{
  "error": "validation_error",
  "message": "Invalid input",
  "details": {
    "metadata": ["desiredRole must not be empty after sanitization"]
  }
}
```

### Rate Limited (429)

Per-IP: 10 submissions/hour. Per-email: 3 submissions/24 hours.

```json
{
  "error": "rate_limited",
  "message": "Too many requests. Please try again later."
}
```

## Categories Endpoint

```
GET /v1/eoi/categories
```

Returns all available EOI categories including `employment` with their field schemas. The response includes field names, types (`text`, `select`, `url`), required status, and enum options for select fields.

## All EOI Categories

| Category | Description | Key Metadata Fields |
|----------|-------------|-------------------|
| `general` | General interest | None |
| `producer` | Film/TV/stage producers | company, productionType, timeline |
| `creative` | Creative professionals | discipline, portfolioUrl |
| `partner` | Technology/service partners | partnershipArea, organisation |
| `investor` | Investment interest | organisation, role |
| `education` | Educational institutions | institution, programArea |
| `employment` | Job seekers | desiredRole, experienceLevel, availability, portfolioUrl |

## Security

- The `name`, `message`, and `desiredRole` fields are sanitized via HTML entity escaping (`escapeHtml`) before storage. Other metadata fields (enums, URLs) are validated by schema constraints.
- The honeypot field (`website`) triggers a fake 201 response to deceive bots.
- Rate limiting is applied per-IP and per-email address.
- Confirmation emails are sent inline (awaited) but wrapped in a try/catch; email failures do not affect submission success or the returned response.

## Related Files

- Validation schemas: `apps/backend/src/eoi/validation.ts`
- Public handlers: `apps/backend/src/eoi/handlers.ts`
- Admin handlers: `apps/backend/src/admin/eoi.ts`
- Tests: `apps/backend/src/__tests__/eoi-endpoints.test.ts`
- OpenAPI spec: auto-generated at `/v1/openapi.json`
