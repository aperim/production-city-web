# Design: Dashboard Scaffold — Shell, Routing, Permissions & Feature Registry

**Date:** 2026-03-15
**Approach:** Registry-driven scaffold with role-based shell and progressive feature activation
**Companion:** `2026-03-15-dashboard-feature-registry.json` (501 features, 26 sections, 124 subsections)

---

## Context

Production City needs a dashboard that spans the entire company lifecycle — from formation through campus development, operations, and global expansion. The feature registry catalogues 501 discrete features across 26 sections. Most will not have implementation for months or years, but the **navigation structure, permissions model, and URL space must exist from day 1** so that:

1. Every stakeholder role sees a coherent, scoped view immediately
2. "Coming Soon" placeholders communicate the roadmap visually
3. New features activate by flipping a status flag — no routing or nav changes needed
4. The sidebar, breadcrumbs, and permission gates are generated from the registry — not hand-coded

### Design Principles

- **Registry as truth** — sidebar, routes, breadcrumbs, permissions, and "coming soon" pages are all derived from the JSON registry. No hand-maintained route tables.
- **Role-scoped by default** — users only see sections/features their role grants. No "forbidden" pages — if you can't see it, it doesn't exist in your nav.
- **Progressive disclosure** — the sidebar shows sections relevant to the current lifecycle phase. A pre-operations company doesn't need 200 production features cluttering the nav.
- **Scaffold is the product** — even before features are built, the dashboard communicates scope, ambition, and roadmap. The scaffold IS the MVP for investor, government, and partner portals.

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│                                                             │
│  production.city/dashboard/**                               │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ DashboardShell                                      │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌────────────────────────────────┐   │    │
│  │  │ Sidebar  │  │ Content Area                   │   │    │
│  │  │          │  │                                │   │    │
│  │  │ Generated│  │  Route → FeatureGate →         │   │    │
│  │  │ from     │  │    ActivePage | ComingSoonPage │   │    │
│  │  │ registry │  │                                │   │    │
│  │  │ + role   │  │  Breadcrumbs (from registry)   │   │    │
│  │  │ + phase  │  │                                │   │    │
│  │  └──────────┘  └────────────────────────────────┘   │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────────┐   │    │
│  │  │ CommandBar (⌘K) — search all 501 features    │   │    │
│  │  └──────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
       │
       ▼ (API calls)
┌──────────────────────┐
│ api.production.city   │
│                       │
│ /v1/auth/session      │ ← session + role + permissions
│ /v1/registry/visible  │ ← filtered registry for current user
│ /v1/features/:id      │ ← feature data (when active)
└──────────────────────┘
```

### Registry Loading Strategy

The feature registry JSON is **not bundled into the frontend**. Instead:

1. **Build time:** A script extracts the registry into a route manifest (`dashboard-routes.ts`) containing only the fields needed for routing: `id`, `path`, `status`, `roles`, `permissions`, `dependencies`. This is ~15 KB gzipped for 501 features.
2. **Runtime (server):** The Worker reads the user's session, resolves their role and permissions, and injects a `visible_features` array into the page's server data. This is the filtered set of feature IDs the user can see.
3. **Runtime (client):** The sidebar and command bar render from the intersection of the route manifest and visible_features. No feature metadata leaks to unauthorized users.

### API: /v1/registry/visible

**Endpoint:** `GET /v1/registry/visible`
**Auth:** Required (session cookie)
**Response:**

```json
{
  "registry_version": "sha256:abc123...",
  "phase": "company_formation",
  "visible_feature_ids": [
    "home.overview.executive",
    "company_ops.hr.directory",
    "..."
  ]
}
```

- `registry_version` — SHA-256 hash of the registry JSON at build time, embedded in both the frontend bundle and the backend. If the frontend's version differs from the backend's response, the frontend triggers a hard refresh to pick up the new build.
- `phase` — the current company lifecycle phase (see "Phase Source of Truth" section below). Used by the sidebar for group visibility filtering.
- `visible_feature_ids` — flat array of feature IDs the authenticated user's role and permissions grant access to. The frontend intersects this with its build-time route manifest to render the sidebar and resolve FeatureGate checks.

**Caching:** Cached per-user for 5 minutes (`Cache-Control: private, max-age=300`). Invalidated when user role/permissions change or when features are activated.

**Error handling:** 401 → redirect to sign-in. 500 → dashboard renders with no sidebar (graceful degradation).

### URL Structure

```
/dashboard                              → role-specific home (redirects or renders)
/dashboard/company/hr/directory         → company_ops.hr.directory
/dashboard/company/legal/contracts      → company_ops.legal.contracts
/dashboard/campus/design/master-plan    → campus_dev.design.master_plan
/dashboard/productions/active/board     → productions.active_productions.board
/dashboard/facilities/sound-stages/calendar → facilities.sound_stages.calendar
/dashboard/admin/users/management       → administration.users.management
```

Pattern: `/dashboard/{section-path}/{subsection}/{feature-slug}`

**Path slugification rules:**
- Lowercase ASCII only
- Words separated by hyphens (`-`)
- Underscores in feature IDs map to hyphens in paths (`first_nations` → `first-nations`)
- No special characters, no URL encoding needed
- Maximum path depth: 4 segments after `/dashboard/`

The registry `path` field is the canonical URL. Routes are generated from registry paths — no manual route definitions.

---

## Component Architecture

### Shell Components (packages/ui)

All dashboard shell components live in `packages/ui` following Atomic Design:

| Component | Level | Purpose |
|-----------|-------|---------|
| `SidebarItem` | atom | Single nav item (icon, label, badge, active state) |
| `SidebarGroup` | molecule | Collapsible group of sidebar items with header |
| `SidebarNav` | organism | Full sidebar with groups, search, collapse toggle |
| `DashboardBreadcrumb` | molecule | Registry-derived breadcrumb trail |
| `CommandBarTrigger` | atom | ⌘K button that opens command palette |
| `CommandBar` | organism | Searchable command palette over all features |
| `FeatureStatusBadge` | atom | Status indicator (active, coming soon, planned) |
| `ComingSoonCard` | molecule | Feature placeholder with description + status |
| `ComingSoonPage` | template | Full "coming soon" page layout |
| `DashboardShell` | template | Top-level layout (sidebar + header + content area) |
| `RoleDashboard` | template | Role-specific home dashboard layout |

### App Components (apps/web)

| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | vinext layout wrapping `DashboardShell`, provides auth + registry context |
| `FeatureGate` | Route-level guard: checks role, permissions, feature status → renders page or ComingSoonPage |
| `RegistryProvider` | React context providing filtered registry data to all dashboard children |
| `DashboardRoutes` | Generated route config from registry (build-time script output) |

### Data Flow

```
Session (cookie) → AuthProvider → user.role, user.permissions
                                       │
Registry (build-time manifest)  ────────┼──→ RegistryProvider
                                       │         │
                                       ▼         ▼
                                  SidebarNav   FeatureGate
                                  CommandBar   Breadcrumbs
```

---

## Sidebar Design

### Groups

The sidebar uses the `sidebar_groups` array from the registry metadata:

| Group | Sections | Visible When |
|-------|----------|--------------|
| Your Workspace | Dashboard | Always |
| Company | Company Ops, Gov & Policy, First Nations, Community, Partnerships, Data Rooms | Always (scoped by role) |
| Campus Development | Campus Dev | site_acquisition phase onwards |
| Production | Productions, Facilities, Broadcast, Virtual Production, Audio & Music, Workflow | pre_operations phase onwards |
| People | Talent & Crew, Education | pre_operations phase onwards |
| Business | Events & Tickets, Finance, Inventory, Vendors | company_formation onwards |
| Operations | Campus Ops, Global Network, Communications | operations phase onwards |
| Insights | Analytics, Investor Relations | company_formation onwards |
| System | Administration | Always (admin only) |

### Phase-Based Visibility

Each campus (and the company as a whole) has a lifecycle phase. The sidebar filters groups based on `max(company_phase, any_campus_phase)`. This means:

- A company in `company_formation` with no campuses sees: Workspace, Company, Business, Insights, System
- Once a campus enters `site_acquisition`, Campus Development appears
- Once any campus reaches `pre_operations`, Production and People groups appear
- `operations` unlocks Operations group

Within each group, individual features show/hide based on their own `phase` field and the user's role. The sidebar never shows empty groups.

### Phase Source of Truth

**Phase 1 (scaffold):** The company phase is a configuration value set in the backend environment (`COMPANY_PHASE=company_formation`). The `/v1/registry/visible` endpoint returns this value. All users see the same phase-based sidebar filtering.

**Phase 2+ (dynamic):** When multiple campuses exist, each campus has a `phase` column in the `Campus` table. The API resolves the effective phase as `max(company_phase, ...campus_phases)` using lifecycle ordering:

```
company_formation < site_acquisition < planning_approvals < design_construct < pre_operations < operations < expansion
```

The union rule means: if any campus reaches `operations`, all users see the Operations sidebar group. Per-campus scoped views (where a user only sees phases for campuses they're assigned to) are a future consideration.

### Collapse Behavior

- **Desktop (≥1024px):** Sidebar is persistent, collapsible to icon-only rail (64px). State persisted to localStorage.
- **Tablet (768–1023px):** Sidebar is overlay, triggered by hamburger. Auto-closes on navigation.
- **Mobile (<768px):** Full-screen overlay sidebar with back gesture to close.

### Active State & Expansion

- Current route highlights the matching sidebar item and auto-expands its parent group/section
- Groups remember their expanded/collapsed state per-user (localStorage)
- Deep links auto-expand the full hierarchy to the target feature

---

## Permissions Model

### Role → Permission Mapping

Permissions are additive. Each role grants a base set of permissions. Custom permissions can be added per-user.

```typescript
type Role = 'admin' | 'executive' | 'staff' | 'client' | 'vendor' |
            'investor' | 'guest' | 'government' | 'partner' | 'first_nations';

// Base permission grants (simplified — full map in implementation)
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin:        ['*'],  // all permissions
  executive:    ['dashboard:executive', 'hr:read', 'legal:read', 'company_finance:*',
                 'productions:read', 'facilities:read', 'analytics:*', 'investor:*'],
  staff:        ['dashboard:staff', 'hr:read:self', 'productions:read', 'facilities:book',
                 'workflow:read', 'talent:read:self'],
  client:       ['dashboard:client', 'productions:read:own', 'facilities:book',
                 'workflow:review', 'finance:invoices:own'],
  vendor:       ['dashboard:vendor', 'vendors:read:self', 'finance:invoices:own'],
  investor:     ['dashboard:investor', 'investor:read', 'data_rooms:investor'],
  guest:        ['dashboard:guest', 'events:browse', 'education:browse'],
  government:   ['dashboard:government', 'gov_policy:read', 'data_rooms:government',
                 'analytics:economic_impact'],
  partner:      ['dashboard:partner', 'partnerships:read:own', 'data_rooms:partner',
                 'education:collaborate'],
  first_nations: ['dashboard:first_nations', 'first_nations:*', 'community:read'],
};
```

### Permission Resolution

```typescript
function canAccessFeature(user: User, feature: RegistryFeature): boolean {
  // Admin bypasses all checks
  if (user.role === 'admin') return true;

  // Check role inclusion
  if (!feature.roles.includes(user.role)) return false;

  // Check all required permissions
  return feature.permissions.every(perm =>
    user.permissions.some(userPerm => matchPermission(userPerm, perm))
  );
}

// Wildcard matching: 'hr:*' matches 'hr:read', 'hr:admin', etc.
// Self-scoping: 'hr:read:self' matches 'hr:read' but data is filtered to own records
function matchPermission(granted: string, required: string): boolean {
  const grantedParts = granted.split(':');
  const requiredParts = required.split(':');

  for (let i = 0; i < requiredParts.length; i++) {
    if (grantedParts[i] === '*') return true;
    if (grantedParts[i] !== requiredParts[i]) return false;
  }
  return true;
}
```

**`:self` scoping is enforced at the API layer, not the frontend.** The frontend permission check treats `hr:read:self` as granting `hr:read` for feature visibility — the sidebar shows the feature and FeatureGate allows access. However, the backend API filters returned data to only the user's own records when the granted permission ends in `:self`. This is a critical backend contract: the frontend determines *visibility*, the API determines *data scope*.

### FeatureGate Component

Every dashboard route wraps its content in `FeatureGate`:

```tsx
<FeatureGate featureId="company_ops.hr.directory">
  <TeamDirectoryPage />
</FeatureGate>
```

`FeatureGate` checks:
1. **Authentication** — user is logged in
2. **Role** — user's role is in the feature's `roles` array
3. **Permissions** — user has all required permissions
4. **Feature status** — if `planned` or `coming_soon`, render `ComingSoonPage` instead
5. **Dependencies** — if any dependency feature is not `active`, show dependency notice

If role/permission check fails, the route doesn't render (user should never reach it because sidebar hides it). As a safety net, show a 404 — never a 403 (don't leak feature existence).

---

## "Coming Soon" System

### Status Lifecycle

```
planned → coming_soon → active → deprecated
```

- **planned**: Feature is in the registry but not yet scheduled. Visible in sidebar if user has role. Shows `ComingSoonPage` with description only.
- **coming_soon**: Feature is scheduled with a target quarter. Shows `ComingSoonPage` with description + target date + "Notify me" button.
- **active**: Feature is implemented. Shows the actual page.
- **deprecated**: Feature is being phased out. Shows the page with a deprecation banner + migration link.

### ComingSoonPage Component

```
┌──────────────────────────────────────────────────────────┐
│ [Breadcrumb: Dashboard > Company > HR > Team Directory]  │
│                                                          │
│              ┌────────────────────┐                       │
│              │    🏗️ Icon/Illust  │                       │
│              └────────────────────┘                       │
│                                                          │
│         Team Directory                                   │
│         ──────────────                                   │
│         Employee directory with profiles, contact        │
│         details, department, role, reporting line         │
│                                                          │
│         ┌─────────────────────────────────┐              │
│         │ Target: Q3 2026                 │              │
│         │ Priority: P2 — Second Wave      │              │
│         │ Phase: Company Formation         │              │
│         └─────────────────────────────────┘              │
│                                                          │
│         [ Notify me when this launches ]                 │
│                                                          │
│         ── Related Features ──                           │
│         • Organisation Chart (Coming Q4 2026)            │
│         • Recruitment Pipeline (Coming Q3 2026)          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The `ComingSoonPage` reads all its content from the registry entry — no custom "coming soon" pages need to be authored for each of the 501 features.

### "Notify Me" System

- Stores `(user_id, feature_id)` in D1 via the backend API
- When a feature status changes to `active`, a Queue worker sends notification emails via Postmark
- Notification preferences are per-feature, not global

---

## Command Bar (⌘K)

### Functionality

- Opens with `⌘K` (Mac) / `Ctrl+K` (Windows/Linux)
- Searches across all visible features (name, description, section label)
- Fuzzy matching with relevance scoring
- Shows feature status badge inline (active / coming soon / planned)
- Keyboard navigation (↑↓ to select, Enter to navigate, Esc to close)
- Recent features section (last 5 visited, stored in localStorage)

### Implementation

Built on `cmdk` (Command Menu for React) — already a shadcn/ui dependency pattern. The search index is built client-side from the route manifest + visible_features intersection.

### Accessibility

- Dialog: `role="dialog"`, `aria-modal="true"`, `aria-label="Command palette"`
- Input: `role="combobox"`, `aria-expanded`, `aria-controls` pointing to results list
- Results: `role="listbox"`, each result `role="option"` with `aria-selected`
- Active result tracked via `aria-activedescendant` on the input
- Focus trap: Tab cycles within the dialog. Escape closes.
- Screen reader: announce result count changes via `aria-live="polite"` region
- The `cmdk` library provides most of these out of the box — verify and supplement as needed

---

## Dashboard i18n

### Worker Interaction

The i18n Worker middleware (see i18n design spec) strips locale prefixes before vinext sees the request. A request for `/zh/dashboard/company/hr/directory` becomes `/dashboard/company/hr/directory` with `X-Locale: zh` header. The dashboard route resolver only handles unprefixed paths — no changes needed.

### Registry Content Translation Strategy

**Phase 1: English-only.** Feature labels and descriptions in the registry are English. The ComingSoonPage renders these directly. This is acceptable because:
- The dashboard is an internal/stakeholder tool, not a public-facing page
- All 501 feature descriptions are operational text, not marketing copy
- Translating 501 labels + descriptions across 9 non-English locales (9,018 strings) is a significant effort better deferred

**Phase 2: Translation keys.** When i18n is extended to the dashboard:
- Feature `id` becomes the translation key base: `feature.company_ops.hr.directory.label`, `feature.company_ops.hr.directory.description`
- English registry text serves as the fallback
- A build script extracts all labels/descriptions into a locale JSON file for translators
- The ComingSoonPage and sidebar use `useTranslation()` with the feature ID as namespace

The `<html lang>` and `dir` attributes are already set correctly by the Worker — the dashboard inherits this.

---

## Build-Time Registry Processing

### Script: `generate-dashboard-routes.ts`

Runs at build time (`apps/web/scripts/generate-dashboard-routes.ts`):

```
Input:  docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json
Output: apps/web/app/dashboard/_generated/routes.ts
        apps/web/app/dashboard/_generated/sidebar-config.ts
        apps/web/app/dashboard/_generated/feature-index.ts
```

**routes.ts** — flat array of route definitions:
```typescript
export const DASHBOARD_ROUTES: DashboardRoute[] = [
  {
    id: 'home.overview.executive',
    path: '/dashboard',
    roles: ['admin', 'executive'],
    permissions: ['dashboard:executive'],
    status: 'planned',
    phase: 'company_formation',
    priority: 'p1',
    dependencies: [],
  },
  // ... 500 more
];
```

**sidebar-config.ts** — hierarchical sidebar structure:
```typescript
export const SIDEBAR_CONFIG: SidebarGroup[] = [
  {
    id: 'workspace',
    label: 'Your Workspace',
    sections: [{
      id: 'home',
      label: 'Dashboard',
      icon: 'home',
      path: '/dashboard',
      subsections: [/* ... */],
    }],
  },
  // ... 8 more groups
];
```

**feature-index.ts** — search index for CommandBar:
```typescript
export const FEATURE_INDEX: FeatureSearchEntry[] = [
  {
    id: 'company_ops.hr.directory',
    label: 'Team Directory',
    description: 'Employee directory with profiles...',
    path: '/dashboard/company/hr/directory',
    section: 'Company Operations',
    subsection: 'Human Resources',
    keywords: ['employee', 'staff', 'people', 'contact'],
  },
  // ... 500 more
];
```

### Validation

The build script also validates:
- All `path` values are unique
- All `id` values are unique
- All `dependencies` reference valid feature IDs
- All `roles` values are valid role names
- All sidebar_group section references exist
- No orphan features (every feature reachable from sidebar)

Build fails if validation fails.

---

## Phase 1: Scaffold (P0 — Sprint 1-2)

### Deliverables

1. **Build-time registry script** — `generate-dashboard-routes.ts`
   - Reads registry JSON, outputs typed route/sidebar/index modules
   - Validation suite (unique paths, valid deps, valid roles)
   - Runs as part of `pnpm --filter ./apps/web build`

2. **DashboardShell** (packages/ui → template)
   - Sidebar + header + content area layout
   - Responsive: persistent sidebar → overlay → full-screen
   - Collapsible to icon rail
   - Storybook stories: expanded, collapsed, mobile, tablet

3. **SidebarNav** (packages/ui → organism)
   - Generated from sidebar-config.ts
   - Role-filtered (receives `visibleFeatures` prop)
   - Phase-filtered (receives `currentPhase` prop)
   - Storybook: all roles, all phases, collapsed, expanded, with active item

4. **FeatureGate** (apps/web)
   - Route wrapper: role check → permission check → status check → render or ComingSoonPage
   - Never shows 403 — returns 404 for unauthorized features

5. **ComingSoonPage** (packages/ui → template)
   - Reads from registry entry: label, description, status, target_quarter, priority, phase
   - "Notify me" button (wired to backend in Phase 2)
   - Related features section (features in same subsection)
   - Storybook: planned state, coming_soon state, with/without target date

6. **CommandBar** (packages/ui → organism)
   - ⌘K trigger
   - Fuzzy search over feature-index.ts
   - Status badges inline
   - Recent features (localStorage)
   - Storybook: empty, with results, with recent items

7. **Dashboard route catch-all** (apps/web)
   - Single dynamic route: `/dashboard/[...path]`
   - Looks up path in generated routes
   - Resolves to FeatureGate → active page component OR ComingSoonPage
   - Unknown paths → 404

8. **Role-specific home dashboards** (apps/web)
   - `/dashboard` renders different content based on user role
   - Phase 1: simple cards showing key metrics placeholders + quick actions
   - 10 role variants (admin, executive, staff, client, vendor, investor, guest, government, partner, first_nations)

### Auth Integration

The dashboard requires authentication. The existing session cookie (`__Secure-session` with `Domain=production.city`) provides the session. The backend API (`api.production.city`) resolves session → user → role → permissions. The web app calls `/v1/auth/session` on dashboard load to hydrate the auth context.

Unauthenticated users hitting `/dashboard/**` get redirected to `/sign-in?redirect=/dashboard/...`.

### vinext Routing Compatibility

The catch-all route pattern (`/dashboard/[...path]`) requires verification against vinext 0.0.x. If vinext does not support catch-all segments:

**Fallback strategy:** A build-time Vite plugin generates individual route files from the registry. For each feature with status `active`, the plugin writes a thin page file at the matching path (e.g., `app/dashboard/company/hr/directory/page.tsx`) that imports the real component. For `planned`/`coming_soon` features, it writes a page that renders `ComingSoonPage` with the feature ID. This achieves the same result as a catch-all but uses vinext's proven file-based routing.

### Migration from Current Dashboard

The existing dashboard at `apps/web/app/dashboard/` has hand-coded routes:

| Existing Route | Registry Feature | Action |
|---|---|---|
| `/dashboard` (layout.tsx) | Shell layout | Replace with `DashboardShell` |
| `/dashboard/users` | `administration.users.management` | Migrate to registry route |
| `/dashboard/invitations` | `administration.users.invitations` | Add to registry, migrate |
| `/dashboard/approvals` | `administration.users.approvals` | Add to registry, migrate |
| `/dashboard/audit-log` | `administration.audit.logs` | Migrate to registry route |
| `/dashboard/announcements` | `communications.internal.announcements` | Migrate to registry route |
| `/dashboard/categories` | `communications.internal.categories` | Add to registry, migrate |
| `/dashboard/tags` | `communications.internal.tags` | Add to registry, migrate |
| `/dashboard/subscriptions-admin` | `communications.notifications.subscriptions` | Add to registry, migrate |
| `/dashboard/eoi` | `partnerships.sovereign_funds.eoi` | Migrate to registry route |
| `/dashboard/profile` | `home.profile` | Add to registry |

Existing routes coexist during migration. File-based routes take precedence over the catch-all. As each page is migrated to the registry-driven pattern, the old file is deleted.

### Database Schema

**Existing tables (no changes needed):**
- `User` — has `id`, `email`, `role` (single role enum), `permissions` (JSON array of custom permission strings)
- `Session` — session management for `__Secure-session` cookie

**New table: FeatureNotification**

```prisma
model FeatureNotification {
  id        String   @id @default(cuid())
  userId    String
  featureId String
  createdAt DateTime @default(now())
  notifiedAt DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, featureId])
  @@index([featureId])
  @@map("feature_notifications")
}
```

- Created when user clicks "Notify me" on a ComingSoonPage
- `notifiedAt` is set when the notification email is sent (feature goes active)
- Queue worker queries `WHERE featureId = ? AND notifiedAt IS NULL` to find subscribers
- `@@unique` prevents duplicate subscriptions

---

## Phase 2: Core Features (P1 — Sprint 3-6)

### Activation Pattern

When a feature moves from `planned`/`coming_soon` to `active`:

1. Update `status` in the registry JSON
2. Create the page component in `apps/web/app/dashboard/...`
3. Register it in the route resolver (convention-based: file path matches registry path)
4. Build script regenerates routes — the feature automatically appears as active
5. Queue worker sends "now available" emails to notify-me subscribers

### P1 Feature Groups (206 features)

Priority order based on company lifecycle:

1. **Administration** (21 features, p1) — user management, roles, permissions, audit logs, SSO
2. **Company Finance** (cash flow, accounts, reporting) — critical for company_formation
3. **Investor Data Room** — fundraising support
4. **Executive Dashboard** — company-wide KPIs
5. **Campus Development: Site Search** — site_acquisition phase
6. **Facilities: Sound Stage Booking** — first revenue-generating feature
7. **Productions: Production Board** — core production management
8. **Talent & Crew: Crew Database** — operational backbone

### Convention-Based Page Resolution

```
Registry path: /dashboard/company/hr/directory
File path:     apps/web/app/dashboard/company/hr/directory/page.tsx

Registry path: /dashboard/facilities/sound-stages/calendar
File path:     apps/web/app/dashboard/facilities/sound-stages/calendar/page.tsx
```

If the file doesn't exist, FeatureGate falls back to ComingSoonPage regardless of registry status. This means a feature can be marked `active` in the registry but if the page component hasn't been created yet, users still see a graceful fallback rather than a crash.

---

## Phase 3: Extended Features (P2 — Sprint 7-12)

229 features across all sections. Prioritized by:
1. Revenue-generating features (client-facing bookings, events, ticketing)
2. Operational efficiency (workflow, inventory, vendor management)
3. Stakeholder engagement (government portal, partner portal, community)
4. Analytics and reporting

---

## Phase 4: Future Features (P3 — Sprint 13+)

66 features including:
- Global network management (expansion phase)
- Advanced analytics and BI
- Cross-campus resource sharing
- Sustainability reporting and certification tracking

---

## Testing Strategy

### Unit Tests

- Registry validation script: comprehensive tests for all validation rules
- Permission resolution: all role/permission combinations
- Phase visibility: all phase transitions
- Sidebar filtering: all role × phase combinations

### Component Tests (Storybook + Vitest)

- Every shell component has Storybook stories covering all states
- Visual regression via Storybook (Chromatic or similar)
- Interaction tests for sidebar expand/collapse, command bar search

### E2E Tests (Playwright)

- Auth flow → dashboard redirect
- Role-based sidebar filtering (test with 3+ roles)
- ComingSoonPage rendering for planned features
- CommandBar search and navigation
- Deep link to specific feature
- Mobile sidebar behavior
- Permission boundary: ensure unauthorized features return 404

### Registry Integrity Tests

- Run as part of CI: validate registry JSON schema
- Ensure all `active` features have corresponding page components
- Ensure no orphan page components (pages without registry entries)
- Cross-reference sidebar_groups with section IDs

---

## Migration & Rollout

### Existing Pages

The current site has marketing pages at `/`, `/about`, `/facilities`, etc. The dashboard lives entirely under `/dashboard/**` — no conflicts with existing routes.

### Feature Flags

No feature flags needed for the scaffold itself. The registry `status` field IS the feature flag system. Changing a status from `planned` to `active` is equivalent to flipping a feature flag, but with the benefit of being in a structured, validated, version-controlled JSON file rather than a runtime flag service.

### Rollout Plan

1. **Week 1-2:** Scaffold ships. All 501 features visible as ComingSoonPages. Auth-gated.
2. **Week 3-4:** Administration features go active. Internal team begins using dashboard.
3. **Week 5-6:** Investor data room goes active. First external stakeholder access.
4. **Week 7-8:** Executive dashboard, company finance. Board-level visibility.
5. **Week 9+:** Feature activation follows priority order from registry.

---

## Resolved Decisions

1. **Multi-campus phase resolution** — **Union (most permissive).** Sidebar shows the union of all campus phases. If any campus is in `operations`, the Operations sidebar group is visible even if other campuses are still in `site_acquisition`.
2. **Custom dashboards** — **Deferred.** Fixed role-based layouts for now. Custom widget dashboards are a P2+ concern.
3. **Notification channels** — **Email only (Postmark).** Other channels (in-app, push, Slack) deferred to a later phase.
4. **Registry versioning** — **Git history is sufficient.** No separate version tracking needed — the registry is version-controlled alongside the codebase.
5. **Offline support** — **No.** No service worker or offline mode. Cloudflare edge caching is sufficient.
6. **Multi-role users** — **Single role per user for Phase 1.** Each user has exactly one role. Users who span roles (e.g., a staff member who is also a First Nations advisory board member) must use the role with broader access or have custom permissions added. Multi-role support (role as an array, sidebar shows union of all role grants) is deferred to Phase 2+.

---

## Appendix: Feature Count Summary

| Sidebar Group | Sections | Subsections | Features |
|---------------|----------|-------------|----------|
| Your Workspace | 1 | 1 | 10 |
| Company | 6 | 32 | 126 |
| Campus Development | 1 | 6 | 27 |
| Production | 6 | 28 | 112 |
| People | 2 | 9 | 37 |
| Business | 4 | 19 | 76 |
| Operations | 3 | 14 | 52 |
| Insights | 2 | 10 | 40 |
| System | 1 | 5 | 21 |
| **Total** | **26** | **124** | **501** |

### Priority Distribution

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 0 | Scaffold infrastructure (this design doc) |
| P1 | 206 | First wave — core operations |
| P2 | 229 | Second wave — extended features |
| P3 | 66 | Future — expansion phase |

### Phase Distribution

| Phase | Features | When |
|-------|----------|------|
| company_formation | 96 | Day 1 |
| site_acquisition | 42 | Campus search begins |
| planning_approvals | 7 | DA/zoning phase |
| design_construct | 25 | Architecture + build |
| pre_operations | 62 | Fit-out + commissioning |
| operations | 249 | Campus is live |
| expansion | 20 | Subsequent campuses |
