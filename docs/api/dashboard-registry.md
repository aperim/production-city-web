# Dashboard Registry & Feature Notification — API Documentation

**Initiative:** #356 — Dashboard Scaffold
**Issues:** #344 (Registry Visible), #345 (Feature Notifications)
**Last Updated:** 2026-03-15

---

## Overview

The dashboard registry API provides two endpoint groups:

1. **Registry Visible** — returns the set of feature IDs visible to the authenticated user based on their dashboard role and permissions.
2. **Feature Notifications ("Notify Me")** — allows users to subscribe/unsubscribe for notifications when a feature becomes available.

All endpoints require cookie-based authentication (`__Secure-session`). The backend resolves the user's dashboard role from `dashboard:{role}` permission markers in their role-permission grants.

---

## Authentication

All endpoints require a valid session cookie. Unauthenticated requests receive `401 Unauthorized`.

```
Cookie: __Secure-session=<token>
```

---

## Endpoints

### GET /v1/registry/visible

Returns the list of feature IDs the authenticated user can access, based on their dashboard role and permissions. The response is intersected with the build-time route manifest on the frontend.

**Response Headers:**
- `Cache-Control: private, max-age=300`
- `Vary: Cookie, Origin`

**200 OK:**
```json
{
  "registry_version": "sha256:abc123...",
  "phase": "company_formation",
  "visible_feature_ids": [
    "home.overview.admin",
    "administration.users.user_management",
    "..."
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `registry_version` | `string` | SHA-256 hash of the feature registry (`sha256:<hex>`) |
| `phase` | `string` | Current project phase (e.g. `company_formation`) |
| `visible_feature_ids` | `string[]` | Feature IDs the user can access |

**401 Unauthorized:**
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

**Dashboard Roles & Feature Counts (approximate):**

| Role | Feature Count | Description |
|------|--------------|-------------|
| admin | 502 (all) | Full platform access |
| executive | ~200 | HR, legal, finance, analytics, investor |
| staff | ~100 | HR (self), productions, facilities, workflow |
| client | ~60 | Productions (own), facilities, workflow review |
| vendor | ~30 | Vendor data, invoices |
| investor | ~40 | Investor data, data rooms |
| guest | ~20 | Events, education browsing |
| government | ~50 | Policy, data rooms, economic impact |
| partner | ~50 | Partnerships, data rooms, education |
| first_nations | ~40 | First Nations data, community |

---

### POST /v1/features/:featureId/notify

Subscribe to notifications for a feature. Idempotent — calling twice returns 201 both times.

**Path Parameters:**
- `featureId` — dot-notation feature ID (e.g. `home.overview.admin`)

**Request Headers:**
- `Cookie: __Secure-session=<token>` (required)
- `Origin: <origin>` (required for CSRF validation)

**201 Created:**
```json
{
  "id": "clxyz...",
  "featureId": "home.overview.admin",
  "createdAt": "2026-03-15T00:00:00.000Z"
}
```

**401 Unauthorized:**
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found** (feature does not exist OR user cannot access it):
```json
{
  "error": "not_found",
  "message": "Feature not found"
}
```

> **Anti-enumeration:** returns 404 (not 403) for features the user cannot access, preventing role-based feature discovery.

---

### DELETE /v1/features/:featureId/notify

Unsubscribe from feature notifications. Returns 204 even if not currently subscribed.

**Path Parameters:**
- `featureId` — dot-notation feature ID

**Request Headers:**
- `Cookie: __Secure-session=<token>` (required)
- `Origin: <origin>` (required for CSRF validation)

**204 No Content** — success (no body)

**401 Unauthorized:**
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found** (feature does not exist OR user cannot access it):
```json
{
  "error": "not_found",
  "message": "Feature not found"
}
```

---

### GET /v1/features/:featureId/notify

Check subscription status for a feature. For anti-enumeration, returns `{subscribed: false}` for both unsubscribed and unauthorized features (no 404).

**Path Parameters:**
- `featureId` — dot-notation feature ID

**Request Headers:**
- `Cookie: __Secure-session=<token>` (required)

**200 OK:**
```json
{
  "subscribed": true,
  "subscribedAt": "2026-03-15T00:00:00.000Z"
}
```

Or when not subscribed / feature not accessible:
```json
{
  "subscribed": false,
  "subscribedAt": null
}
```

---

## Permission Resolution

Dashboard role detection is decoupled from database role names. The system checks for `dashboard:{role}` permission markers:

1. User's roles are loaded from DB with their permission grants
2. Permissions are flattened to `resource:action` pairs
3. `resolveDashboardRole()` checks for `*` (admin) or `dashboard:{role}` markers
4. `ROLE_PERMISSIONS` map provides base permission grants per dashboard role
5. `computeVisibleFeatures()` filters route manifest entries by role inclusion + permission matching

**Wildcard matching:** `hr:*` matches `hr:read`, `hr:admin`, etc.
**Self-scope:** `productions:read:own` matches `productions:read` (`:own`/`:self` are data-scope modifiers stripped during matching).

---

## Database Schema

### FeatureNotification

```sql
CREATE TABLE feature_notifications (
  id         TEXT PRIMARY KEY DEFAULT (cuid()),
  userId     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  featureId  TEXT NOT NULL,
  createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
  notifiedAt DATETIME,
  UNIQUE(userId, featureId)
);
```

**Indexes:**
- `(featureId, notifiedAt)` — batch notification queries
- `(userId, createdAt)` — user subscription listing

---

## Seed Data (dev/test only)

10 dashboard test users are seeded, one per role:

| Email | Role |
|-------|------|
| `admin@dashboard.test` | admin |
| `executive@dashboard.test` | executive |
| `staff@dashboard.test` | staff |
| `client@dashboard.test` | client |
| `vendor@dashboard.test` | vendor |
| `investor@dashboard.test` | investor |
| `guest@dashboard.test` | guest |
| `government@dashboard.test` | government |
| `partner@dashboard.test` | partner |
| `first_nations@dashboard.test` | first_nations |

4 sample feature notifications are also seeded for testing the notification UI.
