# Dashboard UX Redesign — Design Specification

**Date:** 2026-03-16
**Initiative:** #356 Dashboard Scaffold (Phase 2: UX Redesign)
**Status:** Draft — pending Codex review + user approval

---

## Problem Statement

The current dashboard ships a flat sidebar with 502 items in collapsible dropdown groups, each pointing at generic "Coming Soon" placeholder pages. It is a data dump, not a user interface. Users cannot intuitively find functionality, the navigation doesn't match any role's mental model, and the Coming Soon pages communicate nothing about what the features will do.

This redesign replaces the mechanical UI layer while preserving the solid infrastructure underneath: the feature registry, code generation pipeline, permission model, API endpoints, and type system.

## Design Principles

1. **Hub-and-spoke with contextual workspaces.** Each major domain (Productions, Finance, Campus) is a workspace — a place to do work, not a list of links. Users navigate to workspaces, not through feature trees.

2. **Role-adaptive navigation.** The sidebar shows only workspaces relevant to the user's role. An investor sees 5 items. An admin sees 12. Same workspace names across roles — different subsets, not different ontologies.

3. **Progressive disclosure.** Home shows all workspaces as cards. Each workspace has tabs. Each tab has a canvas. Coming Soon features appear inline within workspaces. Users drill down, never sideways into dead-end pages.

4. **Action-oriented home.** Home answers "what needs my attention?" and "where was I?" — not "here are some empty KPI cards." It routes users into workspaces fast.

5. **Every workspace tab discoverable from Home.** Workspace cards on Home expand to show tab names (active + not-yet-active) within that workspace. Individual features are discoverable within each workspace tab. No workspace area requires search or guessing to find.

6. **AI assistant as contextual copilot.** Right-side panel provides navigation help and Q&A, aware of the current workspace and user role. Read-only in Phase 1, with full task execution designed for Phase 2+.

7. **Consistent workspace grammar.** Every workspace has the same structural bones: header, tabs, scope bar, canvas, planned section. The canvas type varies by domain. Users learn the pattern once.

8. **No corners cut.** Every canvas type is production quality. Every Coming Soon scaffold communicates real intent. The AI panel ships working. Object search ships working.

---

## Information Architecture

### Canonical Workspaces

11 workspaces plus Home (which uses `HomeDashboard`, not `WorkspaceShell`), each representing a domain. Every workspace has a default canvas type suited to its domain.

| # | Workspace ID | Label | Icon | Description | Default Canvas |
|---|-------------|-------|------|-------------|---------------|
| 1 | `home` | Home | `home` | Action queue, recents, workspace discovery | — (see note) |
| 2 | `productions` | Productions | `film` | Film, TV, broadcast production lifecycle | board |
| 3 | `facilities` | Facilities | `building` | Sound stages, LED volumes, control rooms, booking | calendar |
| 4 | `finance` | Finance | `banknote` | Invoices, budgets, cash flow, distributions | table |
| 5 | `people` | People | `users` | HR, talent/crew, payroll, leave, org chart | table |
| 6 | `campus` | Campus | `landmark` | Site development, construction, master planning | timeline |
| 7 | `events` | Events | `calendar` | Public events, ticketing, tours | calendar |
| 8 | `education` | Education | `graduation-cap` | Training, courses, workshops, certifications | catalog |
| 9 | `analytics` | Analytics | `chart-bar` | Operational metrics, economic impact, reports | charts |
| 10 | `investor-relations` | Investor Relations | `briefcase` | Data room, portfolio, distributions, reports | documents |
| 11 | `partnerships` | Partnerships | `handshake` | Technology partners, education partners, First Nations, government programs | table |
| 12 | `administration` | Administration | `settings` | Users, roles, permissions, audit, SSO, system config | table |

> **Note:** Home is listed for completeness but is NOT a workspace. It uses the `HomeDashboard` template, not `WorkspaceShell`. It has no tabs, no canvas, and no ScopeBar. All other 11 entries use the standard workspace grammar.

### Role-to-Workspace Visibility Matrix

Each role sees a subset of workspaces. Same names everywhere — no per-role renaming.

| Workspace | admin | executive | staff | client | investor | guest | vendor | government | partner | first_nations |
|-----------|:-----:|:---------:|:-----:|:------:|:--------:|:-----:|:------:|:----------:|:-------:|:-------------:|
| Home | x | x | x | x | x | x | x | x | x | x |
| Productions | x | x | x | x | | | | | | |
| Facilities | x | x | x | x | | | x | | | |
| Finance | x | x | | x | x | | x | | | |
| People | x | x | x | | | | | | | |
| Campus | x | x | | | | | | x | x | |
| Events | x | | x | | | x | | | | |
| Education | x | | x | | | x | | | x | x |
| Analytics | x | x | | | | | | x | | |
| Investor Relations | x | x | | | x | | | | | |
| Partnerships | x | | | | | | | x | x | x |
| Administration | x | | | | | | | | | |

### Sidebar Structure

Every user's sidebar follows the same structure, populated per role:

```
┌─────────────────────────┐
│ [Logo] Production City  │
├─────────────────────────┤
│ Home                    │  ← Always first
│ Inbox               [3] │  ← Badge: actionable items count
├─────────────────────────┤
│ RECENTLY VIEWED         │  ← Section header
│   Shooting — Productions│  ← Auto-populated, last 5 workspace/tab recents
│   Invoices — Finance    │
│   Calendar — Facilities │
├─────────────────────────┤
│ WORKSPACES              │  ← Section header
│   Productions           │  ← Role-specific subset
│   Facilities            │     from matrix above
│   Finance               │
│   People                │
│   ...                   │
├─────────────────────────┤
│ Profile                 │  ← Always last
│ Help (opens AI panel)   │
└─────────────────────────┘
```

**Invariant items across all roles:** Home, Inbox, Recents, Profile, Help. This ensures orientation survives cross-role documentation, support conversations, and screenshots.

**Maximum sidebar items:** Admin (most) = Home + Inbox + Recents(5) + 11 workspaces + Profile + Help = ~21 visible items. Most roles: 12-15 items. Current system: 502.

---

## Home Dashboard

Home is a launchpad and a map. It answers four questions:
1. What needs my attention right now?
2. Where was I working?
3. What can this system do for me? (discoverability)
4. What's new?

### Home Sections

#### 1. Needs Your Attention

Actionable items requiring the user's response. Each links directly into the relevant workspace.

- Pending approvals (invoices, leave requests, access requests)
- Conflicts (booking conflicts, scheduling overlaps)
- Overdue items (incomplete crew sheets, unsigned documents)
- Mentions (tagged in a production, document, or comment)

**Source:** `GET /v1/inbox` filtered to `actionable: true`.
**Display:** List of items, each with: priority icon, summary text, source workspace tag, click to navigate.
**Empty state:** "You're all caught up" with a subtle checkmark.

#### 2. Pick Up Where You Left Off

Last 5 workspace/tab locations the user navigated to, across all workspaces.

Recents are **workspace/tab recents with display labels**, not object recents. They never store object names (like "Project Aurora") — only workspace/tab paths. This is a security constraint: paths are structural, not data.

**Source:** Client-side `localStorage` recents (immediate, no API latency). Each entry is:
```json
{
  "path": "/dashboard/productions/shooting",
  "label": "Shooting — Productions",
  "timestamp": "ISO 8601"
}
```
The `label` is derived from `workspace-config.ts` at write time (not from API data). When a user navigates to a workspace tab, the recents entry label is `{tab label} — {workspace label}` (e.g., "Shooting — Productions", "Invoices — Finance").

**Display:** Compact list: label (tab — workspace), relative timestamp.
**Empty state (first visit):** "Start exploring your workspaces below."

**Recents security:**
- localStorage recents are revalidated against current permissions on every page load. Revalidation checks: is this workspace AND this specific tab still visible in the user's `/v1/workspaces/visible` response? If the workspace is missing or the tab is not in the workspace's visible tabs, the entry is silently removed.
- On role change: client-side recents are cleared entirely (role change = new context, stale recents may reference revoked workspaces).
- Recents store workspace/tab paths only (e.g., `/dashboard/finance/invoices`), never object identifiers, names, or metadata. This prevents leaking titles or metadata of revoked items.

#### 3. Your Workspaces

A card for every workspace visible to the user. This is the primary discoverability surface — users can browse the full scope of the system from Home.

**Each workspace card shows:**

| Element | Description |
|---------|-------------|
| Workspace icon + name | Consistent with sidebar |
| Summary stats | 0-2 live numbers from `workspaceStats[id].stats[]` array (e.g., "3 active productions", "2 stages available"). Empty array = no stats shown. |
| Feature counts | "N active · N upcoming" (upcoming = `coming_soon` + `planned` combined) |
| Primary action button | Role-specific quick action (e.g., "Book a Stage" on Facilities) |
| Expand chevron | Reveals tab list within workspace (see expanded card below) |

**Expanded card shows:**

Tab names within the workspace (typically 5-8 items), each with:
- Tab name
- Status indicator: `●` active (at least one active feature in the tab), `◌` not yet active (all features in the tab are `coming_soon` or `planned`)
- Click to navigate to the tab within the workspace

Individual features are discoverable within each workspace tab, not from Home. This keeps the expanded card scannable (5-8 tab names) rather than overwhelming (40+ feature names across all workspaces).

**Layout:** Responsive card grid — 3 columns on desktop, 2 on tablet, 1 on mobile.
**No pagination:** All workspace cards visible at once (max 12 for admin).

#### 4. What's New

Recently activated features (status changed from `coming_soon` or `planned` to `active`).

**Source:** Features where `activatedAt` is within the last 30 days. The `activatedAt` field is an optional ISO 8601 date string on the feature schema, set manually in the registry JSON when a feature launches (it is a build-time value, not a runtime event). When `activatedAt` is `null` and `status` is `"active"`, the feature is active but does not appear in What's New.

**Codegen validation:** If `status` is `"active"` and `activatedAt` is `null`, emit a warning (not an error, for backward compatibility with features that were active before this field existed).

**Display:** Simple list: feature name, workspace tag, "now live" indicator.
**Empty state:** Section hidden if nothing new in the last 30 days.

### Per-Role Quick Actions (on Workspace Cards)

Each workspace card on Home shows ONE primary action button — the **first** quick action for that role/workspace pair in the table below. If a role has multiple quick actions for the same workspace, the additional actions appear in the workspace header's ScopeBar as secondary action buttons (visible when the user navigates into the workspace). If a role has no quick action defined for a workspace, the card shows no action button — it navigates to the workspace on click.

| Role | Workspace | Quick Action |
|------|-----------|-------------|
| admin | Administration | New User |
| admin | Administration | View Audit Log |
| executive | Analytics | Company Overview |
| executive | Finance | Financial Summary |
| staff | Facilities | Book Facility |
| staff | People | Request Leave |
| client | Productions | My Productions |
| client | Facilities | Book Stage |
| client | Finance | View Invoices |
| investor | Investor Relations | Portfolio Summary |
| investor | Investor Relations | Data Room |
| guest | Events | Browse Events |
| guest | Education | View Courses |
| vendor | Finance | Submit Invoice |
| vendor | Facilities | Active Orders |
| government | Analytics | Economic Impact |
| government | Partnerships | Incentive Programs |
| partner | Partnerships | Joint Projects |
| partner | Education | Shared Programs |
| first_nations | Partnerships | Heritage Assessments |
| first_nations | Education | Cultural Calendar |

---

## Workspace Anatomy

Every workspace follows a consistent grammar. Users learn the pattern once and apply it across all 11 workspaces (Home uses its own template).

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ WorkspaceHeader: icon, name, description                     │
├──────────┬───────────┬────────────┬───────────┬──────────────┤
│ Tab 1    │ Tab 2     │ Tab 3      │ Tab 4 ◌   │ Tab 5 ◌     │
│ (active) │ (active)  │ (active)   │ (coming)  │ (coming)    │
├──────────────────────────────────────────────────────────────┤
│ ScopeBar: filters, date range, saved views, primary action   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Primary Canvas                                              │
│                                                              │
│  The main working surface. Type varies by workspace:         │
│  board, calendar, table, timeline, catalog, documents,       │
│  charts. Each is a reusable organism.                        │
│                                                              │
│  Clicking an item in the canvas opens DetailPanel            │
│  (right-side slide-over) for view/edit without leaving.      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Planned in this area (collapsed by default)                   │
│                                                              │
│ "N planned features" link — click to expand.                 │
│ Expanded: horizontal scroll of planned/coming-soon cards.    │
│ Each card: name, description, target date, notify button.    │
│ Collapse state persisted per workspace to localStorage.      │
│ Hidden entirely if zero coming_soon + planned features.      │
└──────────────────────────────────────────────────────────────┘
```

### Tab Composition Model

Each workspace tab has a well-defined relationship to features in the registry:

1. **One primary feature per tab.** The primary feature determines the tab's canvas type and drives the tab's main data surface. The first `featureId` in the tab's `featureIds` array is the primary feature.

2. **Secondary features are additive.** Additional features mapped to the same tab appear as secondary actions (buttons in the ScopeBar), sub-views (toggled sections within the canvas), or detail panel content. They do not change the tab's canvas type.

3. **Tab visibility rule:** A tab is visible if the user has permission for the **primary** feature. Secondary features within a tab that the user lacks permission for are hidden (buttons don't render, sub-views don't appear), but the tab itself remains visible as long as the primary feature is permitted.

4. **Empty tab rule:** If a tab has NO permitted features (including the primary), the tab is hidden entirely (anti-enumeration — the tab never renders, no 403).

5. **Feature counts shown on workspace cards and Home ONLY count features the user can see** — not total features in the workspace.

6. **PlannedSection includes features with status `coming_soon` OR `planned`.** Both statuses represent not-yet-active features. The difference: `coming_soon` has a target date, `planned` does not. `FeatureStatusDot` shows `◌` for both, with a target date tooltip only for `coming_soon`. The section label text uses the count of both: "N planned features". The section is hidden when the workspace has zero features with either status visible to the user. PlannedSection cards only show features the user has the permission category for — an investor does not see planned HR features even in a shared workspace.

7. **Workspace card expanded view** only shows tabs the user can see, with their visible feature counts.

### Workspace Tab States

Each tab represents a sub-feature area derived from the registry.

| State | Visual | Behavior |
|-------|--------|----------|
| **Active** | Normal text, no indicator | Renders the appropriate canvas with real data |
| **Coming Soon** | Greyed text with `◌` indicator + target date | Renders ComingSoonScaffold within the workspace frame (with target date in banner) |
| **Planned** | Greyed text with `◌` indicator, no date | Renders ComingSoonScaffold within the workspace frame (banner says "Planned" instead of a date) |
| **Hidden** | Not rendered | Feature exists but user lacks permission (anti-enumeration: 404 not 403) |

**`planned` vs `coming_soon`:** Both are not-yet-active states. The only difference is `coming_soon` has a target date, `planned` does not. Both render the same `ComingSoonScaffold` template — the banner text differs. Both are visible as greyed tabs if the user has permission for the primary feature. The `/v1/workspaces/visible` endpoint returns both statuses in tab data.

### Coming Soon Scaffold (within workspace)

When a user clicks a Coming Soon tab, they stay in the workspace. The canvas area shows:

1. **Coming Soon banner** at top: target date, "Notify me when this launches" button with subscribe state machine (idle → submitting → subscribed → error).

2. **Feature description** from registry: what this feature will do, written in plain language.

3. **Wireframe preview**: A contextual layout mockup showing the intended interface. Auto-selected from 8 wireframe templates based on the feature's canvas type:
   - `board-wireframe` — for workflow, pipeline, kanban features
   - `calendar-wireframe` — for scheduling, booking, event features
   - `table-wireframe` — for directory, ledger, list features
   - `timeline-wireframe` — for Gantt, project phase, milestone features
   - `catalog-wireframe` — for course, event, partner catalog features
   - `document-wireframe` — for data room, report, file features
   - `charts-wireframe` — for metrics, analytics, reporting features
   - `form-wireframe` — for submission, application, request features

   Each wireframe template shows labelled zones (not generic grey boxes) indicating what will appear where. Example for `calendar-wireframe`: "Monthly calendar view with resource lanes | Booking form panel | Conflict indicators."

4. **Related active features**: Links to active features in the same workspace that the user can use now.

### Workspace Definitions (11 workspaces — Home is defined in Home Dashboard section above)

#### Productions
- **Tabs:** Overview, Pre-Production, Shooting, Post-Production, Deliverables, Workflow
- **Default canvas:** board (kanban by production status: Development → Pre-Prod → Shooting → Post → Delivery)
- **Detail panel:** Production detail with timeline, crew, budget summary, documents
- **Scope bar filters:** Status, date range, production type (film/TV/commercial/broadcast)

#### Facilities
- **Tabs:** Calendar, Sound Stages, LED Volumes, Control Rooms, Broadcast Theatre, Equipment
- **Default canvas:** calendar (resource booking calendar with stage lanes)
- **Detail panel:** Booking detail with stage specs, availability, pricing, conflict check
- **Scope bar filters:** Facility type, date range, availability

#### Finance
- **Tabs:** Overview, Invoices, Budgets, Cash Flow, Distributions, Vendor Payments
- **Default canvas:** table (financial ledger with sortable columns)
- **Detail panel:** Invoice/transaction detail with approval workflow, attachments
- **Scope bar filters:** Status, date range, amount range, entity

#### People
- **Tabs:** Directory, Leave Management, Payroll, Recruitment, Org Chart
- **Default canvas:** table (staff directory with departments, roles)
- **Detail panel:** Person detail with role history, leave balance, assigned productions
- **Scope bar filters:** Department, role, status

#### Campus
- **Tabs:** Master Plan, Site Acquisition, Design & Construction, Approvals, Heritage
- **Default canvas:** timeline (Gantt with project phases, milestones, dependencies)
- **Detail panel:** Project phase detail with documents, status updates, responsible parties
- **Scope bar filters:** Campus location, phase status, date range

#### Events
- **Tabs:** Calendar, Ticketing, Tours, Venue Management
- **Default canvas:** calendar (event calendar with venue lanes)
- **Detail panel:** Event detail with ticket sales, capacity, logistics
- **Scope bar filters:** Event type, date range, venue, status

#### Education
- **Tabs:** Courses, Workshops, Certifications, Enrolments, Partners
- **Default canvas:** catalog (card grid with search and category filters)
- **Detail panel:** Course detail with syllabus, schedule, capacity, enrolment CTA
- **Scope bar filters:** Category, level, date range, availability

#### Analytics
- **Tabs:** Operational Metrics, Financial Analytics, Production Analytics, Facility Utilization, Economic Impact
- **Default canvas:** charts (configurable chart grid with companion data table)
- **Detail panel:** Metric detail with drill-down, export, date range comparison
- **Scope bar filters:** Date range, comparison period, metric category

#### Investor Relations
- **Tabs:** Portfolio Overview, Data Room, Financial Reports, Distributions, Updates
- **Default canvas:** documents (folders with access controls and version history)
- **Detail panel:** Document detail with preview, download, access log
- **Scope bar filters:** Document type, date range, access level

#### Partnerships
- **Tabs:** Overview, Technology Partners, Education Partners, First Nations, Government Programs, EOI
- **Default canvas:** table (partner directory with relationship status)
- **Detail panel:** Partner detail with agreement, joint projects, contacts
- **Scope bar filters:** Partner type, status, program

#### Administration
- **Tabs:** Users, Roles & Permissions, Audit Log, SSO Configuration, System Health, Feature Registry
- **Default canvas:** table (user management with role assignments)
- **Detail panel:** User detail with permissions, session history, role assignments
- **Scope bar filters:** Role, status, last active, department

### Canonical Workspace and Tab Slugs

Every workspace ID and tab ID used in URLs, `workspace-config.ts`, `role-config.ts`, and API responses. This is the single source of truth for valid workspace/tab combinations.

| Workspace ID | Tab ID | Tab Label |
|-------------|--------|-----------|
| `productions` | `overview` | Overview |
| `productions` | `pre-production` | Pre-Production |
| `productions` | `shooting` | Shooting |
| `productions` | `post-production` | Post-Production |
| `productions` | `deliverables` | Deliverables |
| `productions` | `workflow` | Workflow |
| `facilities` | `calendar` | Calendar |
| `facilities` | `sound-stages` | Sound Stages |
| `facilities` | `led-volumes` | LED Volumes |
| `facilities` | `control-rooms` | Control Rooms |
| `facilities` | `broadcast-theatre` | Broadcast Theatre |
| `facilities` | `equipment` | Equipment |
| `finance` | `overview` | Overview |
| `finance` | `invoices` | Invoices |
| `finance` | `budgets` | Budgets |
| `finance` | `cash-flow` | Cash Flow |
| `finance` | `distributions` | Distributions |
| `finance` | `vendor-payments` | Vendor Payments |
| `people` | `directory` | Directory |
| `people` | `leave` | Leave Management |
| `people` | `payroll` | Payroll |
| `people` | `recruitment` | Recruitment |
| `people` | `org-chart` | Org Chart |
| `campus` | `master-plan` | Master Plan |
| `campus` | `site-acquisition` | Site Acquisition |
| `campus` | `design-construction` | Design & Construction |
| `campus` | `approvals` | Approvals |
| `campus` | `heritage` | Heritage |
| `events` | `calendar` | Calendar |
| `events` | `ticketing` | Ticketing |
| `events` | `tours` | Tours |
| `events` | `venue-management` | Venue Management |
| `education` | `courses` | Courses |
| `education` | `workshops` | Workshops |
| `education` | `certifications` | Certifications |
| `education` | `enrolments` | Enrolments |
| `education` | `partners` | Partners |
| `analytics` | `operational` | Operational Metrics |
| `analytics` | `financial` | Financial Analytics |
| `analytics` | `production` | Production Analytics |
| `analytics` | `utilization` | Facility Utilization |
| `analytics` | `economic-impact` | Economic Impact |
| `investor-relations` | `portfolio` | Portfolio Overview |
| `investor-relations` | `data-room` | Data Room |
| `investor-relations` | `reports` | Financial Reports |
| `investor-relations` | `distributions` | Distributions |
| `investor-relations` | `updates` | Updates |
| `partnerships` | `overview` | Overview |
| `partnerships` | `technology` | Technology Partners |
| `partnerships` | `education` | Education Partners |
| `partnerships` | `first-nations` | First Nations |
| `partnerships` | `government` | Government Programs |
| `partnerships` | `eoi` | EOI |
| `administration` | `users` | Users |
| `administration` | `roles` | Roles & Permissions |
| `administration` | `audit` | Audit Log |
| `administration` | `sso` | SSO Configuration |
| `administration` | `health` | System Health |
| `administration` | `registry` | Feature Registry |

All `roleConfig` quick actions, routing examples, and API responses MUST use tab IDs from this table. For example: `"tab": "audit"` maps to `administration.audit`, `"tab": "portfolio"` maps to `investor-relations.portfolio`.

---

## Navigation System

### Sidebar Behavior

| Breakpoint | Behavior |
|-----------|----------|
| Desktop ≥1024px | Persistent left sidebar, 240px. Collapsible to 56px icon rail. State persisted to localStorage. |
| Tablet 768–1023px | Starts as icon rail. Tap to expand as overlay (doesn't push content). Auto-closes on workspace selection. |
| Mobile <768px | Hidden behind hamburger menu. Opens as full-screen overlay. Recents section promoted to top (most useful for mobile "get back to what I was doing"). |

### CommandBar (⌘K)

Extended from feature search to **object search**.

**Result hierarchy:**
1. Recent items (client-side, instant)
2. Object results (people, productions, facilities — from `GET /v1/search`; Phase 2 adds invoices, events, courses, documents)
3. Feature results (navigation items — from existing feature index)

**Results displayed grouped by workspace in the UI.** The API returns a flat `results[]` array; each result has a `workspace` field. The CommandBar frontend groups results by this field for display. Objects appear above features.

**Phase 1 object search scope:** Users, Productions, Facilities (the entities with existing data models).
**Phase 2+:** Invoices, Events, Courses, Documents (as those workspaces go live with data).

**Search security requirements:**
- **Minimum query length:** 2 characters. Queries shorter than 2 characters return empty results (prevents single-character enumeration).
- **Rate limiting:** 30 requests/minute/user. Exceeding returns 429.
- **Anti-enumeration:** Results are permission-filtered server-side, never client-side. The `/v1/search` endpoint applies the same role-scoping as `/v1/workspaces/visible`.
- **Audit:** Search queries are logged (user ID, query hash, result count, timestamp). Query text is hashed, not stored in plain text.
- **Result masking:** If a user's permissions change, stale cached results are invalidated on next API call (`Vary: Cookie` ensures CDN/browser cache is role-scoped).
- **Sensitive field exclusion:** Search indexes exclude email addresses, phone numbers, and financial amounts. Only names, titles, and identifiers are indexed.

### AI Assistant Panel

**Placement:** Right-side collapsible panel, 360px wide.
**Toggle:** Header button + keyboard shortcut (`⌘J`).
**Mobile:** Full-screen overlay (same as sidebar).

**Context system:**
- `useAIContext` hook reads: current workspace ID, current tab ID, user role, visible workspace list. The hook provides this context for TWO purposes: (1) the UI context indicator in the panel header ("You're in Productions > Shooting"), and (2) the API request body which only sends `workspace` and `tab` (the backend derives role and visible workspaces from the authenticated session — see trust boundary note in API contract)
- Context updates on every navigation event
- Context is passed to backend with every chat message

**Phase 1 capabilities (read-only, registry metadata and config only — no live operational data):**
- Navigation: "Take me to invoices" → navigates to Finance workspace, Invoices tab
- Explain Coming Soon: "What will Shoot Scheduling do?" → answers from registry metadata
- Describe capabilities: "What can I do in the Facilities workspace?" → answers from workspace config and feature descriptions
- Workspace discovery: "Which workspaces do I have access to?" → answers from role config

> **Phase 2** will add tool use for live data queries (facility availability, production status, inbox items, etc.).

**Response format:**
- Plain text answers with structured data where appropriate (lists, key-value pairs)
- Citations: "Based on [Productions workspace]" with clickable links
- Navigation suggestions: "Open in Facilities →" button

**Backend:**
- `POST /v1/ai/chat` endpoint in backend worker
- Calls Claude API with system prompt containing: workspace context, registry metadata, user role
- Rate limiting: 20 messages per minute per user
- Cost control: context window limited to current workspace metadata (not full registry)
- Conversation persists per session via Durable Objects (Cloudflare Workers do not support in-memory state across requests), clears on logout
- No tool use in Phase 1 — pure Q&A from context

**Panel anatomy:**
- Header: "AI Assistant" + workspace context indicator + close/pin buttons
- Chat area: message bubbles with citations
- Input: text field with send button, placeholder "Ask anything about [current workspace]..."
- Empty state: 3-4 suggested questions based on current workspace

### AI Security Requirements

- **Data boundary:** The AI system prompt includes ONLY workspace metadata from the registry (feature names, descriptions, statuses) and the user's role. NO user PII, financial data, HR data, or document contents are sent to the Claude API in Phase 1.
- **Prompt injection mitigation:** Defense-in-depth, not string matching.
  - **Structural separation:** User messages are placed in a dedicated `user` role message, never interpolated into the system prompt. The system prompt is static per-request (workspace metadata + role context) and cannot be influenced by user input.
  - **Input limits:** User messages truncated to 500 characters. No XML/HTML tags forwarded (stripped before sending).
  - **Output constraints:** System prompt instructs the model to only answer questions about Production City workspaces and features. Responses that attempt to reference external systems or execute actions are filtered.
  - **Response validation:** Backend validates response structure before returning to client. Responses containing URLs not matching `production.city` domains are stripped.
  - **No string-matching blocklists.** Pattern-based rejection (e.g., "ignore previous instructions") is brittle and trivially bypassed — we do not rely on it.
- **Audit trail:** Every AI chat interaction is logged (user ID, workspace context, message hash, timestamp). Message content is NOT logged — only metadata for usage tracking.
- **Per-workspace disable switch:** Administrators can disable the AI panel for specific workspaces (e.g., HR, Finance) via a workspace-level `aiEnabled: boolean` config field in the registry. When disabled, the AI panel toggle does not render in that workspace.
- **No data retention:** Conversation history is ephemeral. Durable Object TTL is session duration, maximum 24 hours. No conversation data is persisted to D1 or any durable store.
- **Rate limiting:** 20 messages/minute/user, 200 messages/day/user. Exceeding the limit returns 429 with a Retry-After header.
- **Cost cap:** Maximum context window of 4,000 tokens per request (registry metadata only). Requests exceeding this are rejected before reaching the Claude API.

### Inbox

A first-class workspace page, not a dropdown or notification center.

**Item types:**
- **Approvals** — pending items requiring user action (invoices, leave, access requests)
- **Mentions** — user tagged in a production, document, or comment
- **Updates** — status changes on followed items (subscribed features going live, production milestones)
- **System** — session warnings, maintenance notices, security alerts

**Each item shows:** Priority indicator, summary, source workspace tag, timestamp, click to navigate to item in its workspace.

**Actions:** Mark read, dismiss, mark all read.
**Filters:** By type, by workspace, by date range.
**Badge:** Sidebar badge shows count of unread actionable items only (not informational updates).

**Backend:**

`GET /v1/inbox`
- **Pagination:** Cursor-based (`cursor` query param, returns `nextCursor` in response). Page size: 25 (default), max 100 via `limit` param.
- **Query params:** `type` (approval|mention|update|system), `workspace` (workspace ID), `read` (boolean), `actionable` (boolean — filters to items requiring user action), `dateFrom` (ISO 8601), `dateTo` (ISO 8601), `dismissed` (boolean, default false — include soft-deleted items), `cursor`, `limit`.
- **Sort:** Newest first (by `createdAt` desc). Not configurable in Phase 1.
- **Response schema:**
```json
{
  "items": [
    {
      "id": "string (ULID)",
      "type": "approval | mention | update | system",
      "summary": "string (plain text, max 200 chars)",
      "workspace": "string (workspace ID) | null",
      "sourceUrl": "string (deep link into workspace/tab)",
      "priority": "urgent | action | info",
      "read": false,
      "dismissed": false,
      "actionable": true,
      "createdAt": "ISO 8601",
      "readAt": "ISO 8601 | null"
    }
  ],
  "nextCursor": "string | null",
  "totalUnread": 3,
  "totalActionable": 2
}
```
- **Error responses:** 401 (unauthenticated), 429 (rate limited: 60 req/min/user).

`PATCH /v1/inbox/:id`
- **Body:** `{ "read": true }` and/or `{ "dismissed": true }` (soft-delete).
- **Response:** Updated item object. 404 if item not found or not owned by user.

`POST /v1/inbox/mark-all-read`
- **Body:** Optional filter context `{ "type": "approval", "workspace": "finance" }`. Empty body marks all unread items.
- **Response:** `{ "updated": 5 }`.

---

## Routing

### URL Structure

Flat, two-level routing. Replaces the current four-level structure.

```
/dashboard                          → Redirects to /dashboard/home
/dashboard/home                     → Home dashboard
/dashboard/inbox                    → Inbox
/dashboard/{workspace}              → Redirects to first visible tab (by tab order in workspace config). 404 if user has zero visible tabs.
/dashboard/{workspace}/{tab}        → Workspace, specific tab
/dashboard/profile                  → User profile
```

**Help** does not have a route. Clicking Help in the sidebar opens the AI panel with a "How can I help?" prompt and suggested questions contextual to the current workspace. No `/dashboard/help` route exists.

**Workspace root fallback:** When `/dashboard/{workspace}` is accessed and the user has visible tabs in that workspace, the router navigates to the first visible tab (by tab order in `workspace-config.ts`). If the user has zero visible tabs in the workspace, the router returns 404 (the workspace should not appear in their sidebar if they have no visible tabs — this is a defensive guard against direct URL entry or stale bookmarks).

**Examples:**
```
/dashboard/productions              → Productions workspace, Overview tab
/dashboard/productions/shooting     → Productions workspace, Shooting tab
/dashboard/facilities/calendar      → Facilities workspace, Calendar tab
/dashboard/finance/invoices         → Finance workspace, Invoices tab
/dashboard/investor-relations/data-room → IR workspace, Data Room tab
```

### Migration Redirects

All existing paths (from the previous implementation) get 301 redirects:

```
/dashboard/company/hr/*             → /dashboard/people/*
/dashboard/admin/*                  → /dashboard/administration/*
/dashboard/comms/*                  → /dashboard/inbox
/dashboard/partnerships/sovereign/* → /dashboard/partnerships/*
```

The full redirect map will be defined in the implementation plan based on the existing route manifest.

### Permission Enforcement

- Workspace not in user's role map → 404 (not 403, anti-enumeration preserved)
- Tab not visible to user → 404
- Unpermitted secondary feature within a visible tab → feature's UI elements (buttons, sub-views) are hidden; the tab and canvas remain. This is consistent with Tab Composition Model rule #3.
- If a tab's primary feature status is `coming_soon` or `planned` and the user has permission → tab renders `ComingSoonScaffold`
- If a tab's primary feature status is `coming_soon` or `planned` and the user lacks permission → tab is hidden (404)
- Tab status is always derived from the PRIMARY feature's status. If the primary feature is active, the tab is active regardless of secondary feature statuses. If the primary feature is `coming_soon` or `planned`, the tab shows that status.

### Permission Model Migration

The existing per-feature `routes.ts` and `FeatureGate` continue to work for permission checking at the feature level. The workspace routing layer adds a higher-level mapping on top:

1. **`workspace-config.ts`** maps workspace/tab URLs to feature IDs. It is the lookup table for "which features does this tab contain?"
2. **`routes.ts` becomes a lookup table, not a routing table.** It is used for permission resolution (does this user have access to feature X?), not for URL generation. URLs are now driven by workspace/tab paths.
3. **Navigation resolution for `/dashboard/{workspace}/{tab}`:**
   - Step 1: Check workspace visibility from the user's role config (`roleConfig[role].workspaceOrder` includes this workspace ID)
   - Step 2: Check tab visibility (user has permission for the tab's primary feature, per the Tab Composition Model)
   - Step 3: Render the canvas with only the features the user has permission for (secondary features without permission are omitted)
4. **Server-side mirror:** The backend `/v1/workspaces/visible` endpoint performs the same three-step resolution, returning only visible workspaces with their visible tabs and feature counts.

---

## Technical Architecture

### Registry Extension

The feature registry JSON (`docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json`) gains two new top-level objects:

#### `workspaces` array

```jsonc
{
  "workspaces": [
    {
      "id": "productions",
      "label": "Productions",
      "icon": "film",
      "description": "Film, TV, and broadcast production lifecycle",
      "defaultCanvas": "board",
      "tabs": [
        {
          "id": "overview",
          "label": "Overview",
          "featureIds": [
            "production_ops.productions.active",
            "production_ops.productions.archive"
          ],
          "canvas": "board"
        },
        {
          "id": "shooting",
          "label": "Shooting",
          "featureIds": [
            "production_ops.productions.shoot_scheduling",
            "production_ops.productions.call_sheets"
          ],
          "canvas": "calendar",
          "wireframeType": "calendar"
        }
      ],
      "roles": ["admin", "executive", "staff", "client"]
    }
  ]
}
```

#### `roleConfig` object

```jsonc
{
  "roleConfig": {
    "admin": {
      "workspaceOrder": ["productions", "facilities", "finance", "people", "campus", "events", "education", "analytics", "investor-relations", "partnerships", "administration"],
      "quickActions": [
        { "label": "New User", "workspace": "administration", "tab": "users", "icon": "user-plus" },
        { "label": "Audit Log", "workspace": "administration", "tab": "audit", "icon": "scroll" }
      ]
    },
    "investor": {
      "workspaceOrder": ["investor-relations", "finance"],
      "quickActions": [
        { "label": "Portfolio Summary", "workspace": "investor-relations", "tab": "portfolio", "icon": "briefcase" },
        { "label": "Data Room", "workspace": "investor-relations", "tab": "data-room", "icon": "folder" }
      ]
    }
  }
}
```

The existing `features` array gains one new optional field per feature:

```jsonc
{
  "id": "production_ops.productions.active",
  "status": "active",
  "activatedAt": "2026-03-01"  // ISO 8601 date, set when status changes to "active". null for legacy features.
  // ... other existing fields unchanged
}
```

Each workspace object gains an optional `aiEnabled` field:

```jsonc
{
  "id": "finance",
  "aiEnabled": false  // Disables the AI assistant panel for this workspace. Defaults to true if omitted.
  // ... other fields
}
```

The workspace layer maps features into workspaces — it's additive, not a replacement.

### Codegen Changes

`generate-dashboard-routes.ts` outputs two additional files:

| Output File | Path | Contents |
|------------|------|----------|
| `workspace-config.ts` | `apps/web/app/dashboard/_generated/` | Typed workspace definitions, tab structures, canvas types, role visibility |
| `role-config.ts` | `apps/web/app/dashboard/_generated/` | Per-role workspace order, quick actions, home stats configuration |

Existing outputs remain:
- `routes.ts` — still powers FeatureGate and permission checks
- `sidebar-config.ts` — deprecated, replaced by workspace-config.ts (kept for backward compat during migration)
- `feature-index.ts` — still powers CommandBar feature search
- `route-manifest.ts` (backend) — still powers `/v1/registry/visible`

**New validation rules:**
- Every feature in the `features` array must be mapped to exactly one workspace tab
- Every role in `roleConfig` must have at least one workspace
- All `featureIds` in workspace tabs must reference valid features
- No orphan features (features not in any workspace tab)
- Workspace IDs must be valid URL path segments
- Tab IDs must be unique within their workspace
- If a feature has `status: "active"` and `activatedAt` is `null`, emit a warning (backward compat — not a build error)

### New API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/workspaces/visible` | GET | Workspace configs visible to current user. Includes tab statuses, feature counts, summary stats. `Vary: Cookie`. Cache: 5 minutes. |
| `/v1/home/summary` | GET | Attention items (count + top 5), workspace summary stats, recently activated features. Per-role. |
| `/v1/inbox` | GET | Paginated inbox items. Filters: `type`, `workspace`, `read`, `actionable`, `dateFrom`, `dateTo`. Items with `dismissed: true` excluded by default. |
| `/v1/inbox/:id` | PATCH | Mark item read (`{ read: true }`) or dismissed (`{ dismissed: true }`). |
| `/v1/inbox/mark-all-read` | POST | Bulk mark-read for all unread items matching current filter context. Returns `{ updated: number }`. |
| `/v1/ai/chat` | POST | AI assistant. Receives `{ message, context: { workspace, tab }, sessionId }`. Role derived from session server-side. Returns `{ response, citations, sessionId }`. Rate limited: 20/min/user. |
| `/v1/search` | GET | Object search. Query param: `q`. Returns flat `results[]` array with `workspace` field (frontend groups for display). Role-scoped. Phase 1: users, productions, facilities. |

Existing endpoints stay:
- `/v1/registry/visible` — still needed for FeatureGate permission checks
- `/v1/features/:featureId/notify` — still powers Coming Soon notify buttons

#### `GET /v1/workspaces/visible` — Response Contract

Returns workspace configurations visible to the authenticated user, filtered by role and permissions.

**Headers:** `Vary: Cookie`, `Cache-Control: private, max-age=300`

**Response (200):**
```json
{
  "workspaces": [
    {
      "id": "productions",
      "label": "Productions",
      "icon": "film",
      "description": "Film, TV, broadcast production lifecycle",
      "defaultCanvas": "board",
      "tabs": [
        {
          "id": "overview",
          "label": "Overview",
          "status": "active",
          "canvas": "board",
          "featureCount": 3,
          "targetQuarter": null
        },
        {
          "id": "shooting",
          "label": "Shooting",
          "status": "coming_soon",
          "canvas": "calendar",
          "featureCount": 2,
          "targetQuarter": "Q3 2026"
        }
      ],
      "activeFeatureCount": 8,
      "upcomingFeatureCount": 3,
      "upcomingFeatures": [
        {
          "featureId": "production_ops.productions.shoot_scheduling",
          "label": "Shoot Scheduling",
          "description": "Plan and manage shooting schedules across all productions.",
          "status": "coming_soon",
          "targetQuarter": "Q3 2026",
          "tab": "shooting"
        }
      ]
    }
  ],
  "phase": "company_formation",
  "registryVersion": "sha256-abc123"
}
```

**Error responses:** 401 (unauthenticated). Response is filtered by user role — workspaces, tabs, and feature counts only include items the user has permission to see.

**Field notes:**
- `upcomingFeatureCount`: combined count of `coming_soon` + `planned` features visible to the user.
- Tab `status`: one of `"active"`, `"coming_soon"`, `"planned"`.
- Tab `targetQuarter`: ISO quarter string (e.g., "Q3 2026") for `coming_soon` tabs, `null` for `active` and `planned`. Used by `TabItem` tooltip and `ComingSoonBanner`.
- `upcomingFeatures[]`: array of not-yet-active features in this workspace, used by `PlannedSection` (inside the workspace) and `ComingSoonScaffold`. NOT used by `WorkspaceCard` expanded view (which shows tab names only, from the `tabs[]` array). Each entry includes `featureId`, `label`, `description`, `status`, `targetQuarter`, and `tab` (which tab this feature belongs to).

#### `GET /v1/home/summary` — Response Contract

Returns the home dashboard summary for the authenticated user: attention items, workspace stats, and recently activated features.

**Response (200):**
```json
{
  "attention": {
    "total": 3,
    "items": [
      {
        "id": "string",
        "type": "approval | conflict | overdue | mention",
        "summary": "string",
        "workspace": "finance",
        "sourceUrl": "/dashboard/finance/invoices",
        "priority": "urgent | action | info",
        "createdAt": "ISO 8601"
      }
    ]
  },
  "workspaceStats": {
    "productions": { "stats": [{ "label": "Active Productions", "value": "3" }, { "label": "In Post", "value": "1" }] },
    "facilities": { "stats": [{ "label": "Stages Available", "value": "2" }] }
  },
  "whatsNew": [
    {
      "featureId": "string",
      "label": "Crew Directory",
      "workspace": "people",
      "activatedAt": "ISO 8601"
    }
  ]
}
```

**Error responses:** 401 (unauthenticated). Per-role filtered. Target response time: <100ms.

#### `GET /v1/search` — Response Contract

Object search across users, productions, and facilities (Phase 1). Results are permission-filtered server-side.

**Query params:** `q` (string, minimum 2 characters — queries shorter than 2 characters return empty results).

**Response (200):**
```json
{
  "results": [
    {
      "type": "user | production | facility",
      "id": "string",
      "title": "Sound Stage 3",
      "subtitle": "Available Tue-Thu",
      "workspace": "facilities",
      "url": "/dashboard/facilities/sound-stages"
    }
  ],
  "query": "stage 3",
  "total": 2
}
```

**Error responses:** 401 (unauthenticated), 429 (rate limited: 30 requests/minute/user, returns `Retry-After` header). Results are permission-filtered server-side — the endpoint applies the same role-scoping as `/v1/workspaces/visible`. Target response time: <100ms.

#### `POST /v1/ai/chat` — Request/Response Contract

AI assistant chat endpoint. Calls Claude API with workspace context from the registry and the user's role.

**Trust boundary:** The `role` is NEVER accepted from the client. The backend derives the user's role from the authenticated session (same as all other endpoints). The client sends only `workspace` and `tab` as context hints; the backend validates these against the user's visible workspaces before including them in the AI context. If the workspace/tab is not in the user's visible set, the backend ignores the hint and uses "general" context.

**Request:**
```json
{
  "message": "What can I do in Productions?",
  "context": {
    "workspace": "productions",
    "tab": "overview"
  },
  "sessionId": "string (Durable Object ID)"
}
```

**Response (200):**
```json
{
  "response": "In the Productions workspace, you can...",
  "citations": [
    { "label": "Productions Overview", "url": "/dashboard/productions" }
  ],
  "sessionId": "string"
}
```

**Error responses:** 401 (unauthenticated), 429 (rate limited: 20 messages/minute/user, 200 messages/day/user — returns `Retry-After` header), 503 (Claude API unavailable).

### Component Architecture

#### Atoms (packages/ui/src/atoms/)

| Component | Purpose |
|-----------|---------|
| `WorkspaceIcon` | SVG icon per workspace. 12 icons matching workspace definitions. |
| `FeatureStatusDot` | Inline status indicator: `●` active (green), `◌` not yet active (grey) for both `coming_soon` and `planned`. Tooltip: shows target date for `coming_soon`, "Planned" for `planned`. Replaces `FeatureStatusBadge`. |
| `AttentionDot` | Priority indicator for inbox items: red (urgent), amber (action needed), blue (informational). |
| `TabItem` | Single workspace tab. States: active, selected, coming-soon (greyed with `◌` + date), planned (greyed with `◌`, no date), hidden. |
| `BadgeCount` | Numeric badge for inbox count on sidebar. |

#### Molecules (packages/ui/src/molecules/)

| Component | Purpose |
|-----------|---------|
| `WorkspaceCard` | Home card: icon, name, summary stats, feature count, expand chevron, primary action button. Expanded: tab names with status indicators (`●` active / `◌` not-yet-active (`coming_soon`/`planned`)). |
| `ScopeBar` | Workspace scope bar: filter dropdowns, date range picker, saved views, primary action button. Adapts filter options via config prop. |
| `ComingSoonBanner` | In-workspace banner. Banner text: "Coming [date]" for `coming_soon` status, "Planned" for `planned` status. Both include Notify Me button with subscribe state machine (idle/submitting/subscribed/error). |
| `PlannedFeatureCard` | Card for Planned Section: feature name, description (2 lines truncated), target date, status dot, notify button. |
| `RecentItem` | Compact row for Recents: item name, workspace tag, relative timestamp. |
| `AttentionItem` | Inbox/Home row: priority dot, summary, workspace tag, timestamp, click to navigate. |
| `WireframePreview` | SVG-based wireframe layout mockup. 8 variants: board, calendar, table, timeline, catalog, document, charts, form. Shows labelled zones. |

#### Organisms (packages/ui/src/organisms/)

| Component | Purpose |
|-----------|---------|
| `WorkspaceSidebar` | Role-adaptive sidebar: logo, Home, Inbox (badge), Recents (5 items), workspace list (from role config), Profile, Help. Collapse to icon rail. Responsive breakpoints. |
| `WorkspaceTabs` | Tab bar: active + coming soon + planned tabs from workspace config. Horizontal scroll on overflow. Selected state. |
| `CommandBar` | Extended: recent items + object search results (grouped by workspace) + feature search results. Max 50 rendered items, virtualized. |
| `AIPanel` | Right-side panel: context indicator, chat message list, input field, suggested questions, citations with workspace links. Collapsible, pinnable. |
| `InboxFeed` | Inbox item list with filters (type, workspace, date), mark read, dismiss, empty state. |
| `CanvasTable` | Sortable, filterable data table. Column resize, inline editing, row selection, bulk actions, pagination. Built on shadcn/ui Table + @tanstack/react-table. |
| `CanvasBoard` | Kanban board. Draggable cards, configurable swim lanes, card detail expansion. Built on @dnd-kit. |
| `CanvasCalendar` | Month/week/day views. Event creation, resource lanes, booking, conflict detection. Built on a proven calendar library. |
| `CanvasTimeline` | Gantt-style timeline. Task bars, dependencies, milestones, zoom levels, scroll sync. |
| `CanvasCatalog` | Responsive card grid. Search, category filters, detail expansion, enrollment/booking CTAs. |
| `CanvasDocuments` | Document list. Folders, drag-to-upload zone, version history, access control indicators, preview. |
| `CanvasCharts` | Configurable chart grid. Line, bar, pie, area charts. Companion data table. Built on recharts or equivalent. |
| `DetailPanel` | Right-side slide-over. View/edit a selected item without leaving the workspace. Used within any canvas. Close via X, Escape, or click outside. |
| `PlannedSection` | **Collapsed by default** with a subtle "N planned features" link. Clicking expands to a horizontal scrollable row of PlannedFeatureCards (max 6 visible, "+N more" for overflow). Includes features with status `coming_soon` OR `planned`. Collapse state persisted per workspace to localStorage. Hidden entirely when workspace has zero `coming_soon` + `planned` features visible to the user. |

#### Templates (packages/ui/src/templates/)

| Component | Purpose |
|-----------|---------|
| `WorkspaceShell` | Workspace frame: WorkspaceHeader + WorkspaceTabs + ScopeBar + canvas slot + PlannedSection. Reusable across all 11 workspaces (Home uses HomeDashboard instead). |
| `HomeDashboard` | Home: Attention + Recents + WorkspaceCards grid + What's New. All sections role-contextual. |
| `ComingSoonScaffold` | In-workspace scaffold: ComingSoonBanner + description + WireframePreview + related active features. Renders in the canvas slot. |
| `InboxPage` | Full inbox page: InboxFeed + filters + bulk actions. |

### What Gets Replaced vs Extended vs Removed

| Current Component | Action | Reason |
|-------------------|--------|--------|
| `SidebarNav` | **Remove** → replaced by `WorkspaceSidebar` | Completely different structure (workspaces, not feature tree) |
| `SidebarItem` | **Remove** | No longer needed (sidebar items are workspace-level) |
| `SidebarGroup` | **Remove** | No longer needed (no expandable groups) |
| `RoleDashboard` | **Remove** → replaced by `HomeDashboard` | Fundamentally different design (launchpad, not KPI cards) |
| `ComingSoonPage` | **Remove** → replaced by `ComingSoonScaffold` | Lives inside workspace, not standalone page |
| `FeatureStatusBadge` | **Remove** → replaced by `FeatureStatusDot` | Simpler inline indicator |
| `ComingSoonCard` | **Remove** → replaced by `PlannedFeatureCard` | Contextual within workspace |
| `DashboardBreadcrumb` | **Simplify** | Only 2 levels now (Workspace → Tab) |
| `DashboardShell` | **Extend** | Add right panel slot for AI assistant, swap sidebar component |
| `FeatureGate` | **Extend** | Still needed for permission checks, routes to workspace tabs |
| `CommandBar` | **Extend** | Add object search results alongside feature search |
| `RegistryProvider` | **Extend** | Add workspace visibility alongside feature visibility |

---

## Implementation Scope

35 issues across 8 phases. Every issue is concrete, testable, and follows the project's standards: TDD, Storybook-first, Codex review, no deferral.

### Phase 1: Foundation (blocks everything)

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 1 | Registry workspace schema extension | Add `workspaces` array and `roleConfig` to registry JSON. Define all 11 workspaces (Home excluded — uses HomeDashboard). Map all 502 features to workspace tabs. Define per-role quick actions. | All 502 features mapped to exactly one tab. All 10 roles have workspace configs. Schema validates. |
| 2 | Codegen: workspace-config.ts + role-config.ts | Extend codegen to output workspace config and role config TypeScript modules. Add validation rules (orphan features, valid workspace IDs, unique tab IDs). | Build succeeds. Generated types are correct. Validation catches intentional errors in tests. |
| 3 | Routing migration | Change URL structure to `/dashboard/{workspace}/{tab}`. 301 redirects from all old paths. Update FeatureGate for workspace routing. | All old URLs redirect correctly. New URLs resolve. Permission checks work. No 404s for valid workspace/tab combos. |
| 4 | `GET /v1/workspaces/visible` endpoint | Returns workspace configs filtered by user role + permissions. Includes tab statuses, feature counts. Vary:Cookie, cache headers. | Role-scoped responses correct for all 10 roles. Cache headers present. <50ms response. |

### Phase 2: Shell & Navigation

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 5 | `WorkspaceSidebar` organism | Role-adaptive sidebar: Home, Inbox (badge), Recents (5 items), workspace list, Profile, Help. Collapse to icon rail. Responsive. | Stories for all 10 roles. Collapse state persists. Responsive at all 3 breakpoints. ARIA landmarks. 44px touch targets. |
| 6 | `WorkspaceTabs` organism | Tab bar with active + coming soon + planned states. Horizontal scroll on overflow. | Stories: all active, mixed active/coming/planned, all coming, all planned. Overflow scroll works. ARIA tablist. |
| 7 | `ScopeBar` molecule | Filters, date range, saved views, primary action. Adapts per workspace config. | Stories for 3+ workspace configurations. Filter state management. Responsive. |
| 8 | `WorkspaceShell` template | Header + tabs + scope bar + canvas slot + planned section. | Stories with each canvas type slotted. Responsive layout. Scroll behavior correct. |
| 9 | `DashboardShell` redesign | Swap sidebar, add AI panel slot, update breakpoints. | All responsive breakpoints work. AI panel slot renders. Sidebar swap complete. |
| 10 | `AIPanel` organism | Right-side collapsible panel. Chat UI, context indicator, citations, suggested questions. | Stories: empty, with messages, with citations, mobile overlay. Collapse/pin toggle. ⌘J shortcut. |

### Phase 3: Home & Inbox

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 11 | `WorkspaceCard` molecule | Home card with stats, feature list expand, primary action. | Stories: with stats, without stats, expanded, loading. All 11 workspace variants (Home uses HomeDashboard, not WorkspaceCard). Click navigates. |
| 12 | `HomeDashboard` template | Attention + Recents + Workspace Cards + What's New. | Stories for 3+ roles showing different workspace subsets. Empty states for each section. Responsive grid. |
| 13 | `GET /v1/home/summary` endpoint | Aggregation: attention items, workspace stats, recently activated features. | Role-scoped. Correct counts. <100ms. Tests for all 10 roles. |
| 14 | `InboxPage` template + `InboxFeed` organism | Full inbox with filters, mark read, dismiss. | Stories: with items, empty, filtered. Mark read works. Badge count updates. Pagination. |
| 15 | `GET /v1/inbox` + `PATCH /v1/inbox/:id` | Paginated inbox API with filters and mark-read. | Pagination works. Filters work. Mark-read persists. Role-scoped. Rate limited. |

### Phase 4: Canvas Types

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 16 | `CanvasTable` organism | Data table: sort, filter, column resize, inline edit, row select, bulk actions, pagination. | Stories: empty, loading, with data, with selection, with inline edit. Keyboard nav. ARIA grid. Minimum column types: text, number, date, status, actions. Pagination: 25/50/100 per page. Export to CSV. |
| 17 | `CanvasBoard` organism | Kanban: draggable cards, swim lanes, card expansion. | Stories: empty, with cards, drag in progress, multiple lanes. Touch drag support. ARIA. Lane configuration: configurable grouping field. Card content: title, subtitle, assignee, status. Optional WIP limits per lane. |
| 18 | `CanvasCalendar` organism | Month/week/day views, event creation, resource lanes, conflict detection. | Stories: month, week, day, with events, with conflicts. Navigation between views. ARIA. Animated view transitions. Event overlap handling (stacked). Timezone display in header. Horizontal resource lanes. |
| 19 | `CanvasTimeline` organism | Gantt: task bars, dependencies, milestones, zoom. | Stories: empty, with tasks, with dependencies, zoomed. Horizontal scroll sync. Zoom levels: day/week/month/quarter. Dependency arrows: start-to-start, finish-to-start. Milestone markers (diamond). |
| 20 | `CanvasCatalog` organism | Card grid: search, category filters, detail expansion, CTAs. | Stories: empty, with cards, filtered, with search results. Responsive grid. Card content: image/icon, title, subtitle, tags, CTA button. Grid breakpoints: 1 col (mobile), 2 col (tablet), 3 col (desktop), 4 col (wide). |
| 21 | `CanvasDocuments` organism | Document list: folders, upload zone, version history, access indicators. | Stories: empty, with files, with folders, upload state. Drag-to-upload. File type icons. Upload progress indicator. Folder creation. Sort by: name, date, size, type. |
| 22 | `CanvasCharts` organism | Chart grid: line, bar, pie, area. Companion data table. | Stories: each chart type, combined grid, responsive. Tooltip interactions. Chart interactions: hover tooltip, click drill-down. Legend toggle (show/hide series). Responsive breakpoints (1-col stack on mobile, 2-col grid on desktop). |
| 23 | `DetailPanel` organism | Right-side slide-over for item view/edit. | Stories: open, closed, with form, with readonly. Close via X, Escape, outside click. Focus trap. Width: 480px. Animation: slide from right, 200ms ease-out. Independent scroll (panel scrolls independently of canvas). |

### Phase 5: Coming Soon System

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 24 | `ComingSoonScaffold` template | In-workspace scaffold: banner, description, wireframe preview, related features. | Stories for each wireframe type (8 variants). Notify button state machine. Renders within WorkspaceShell. |
| 25 | `PlannedSection` organism | Collapsed by default with "N planned features" link. Expands to horizontal scroll of planned cards. Includes `coming_soon` + `planned` features. Max 6 visible, "+N more" for overflow. Collapse state persisted per workspace. Hidden when zero `coming_soon` + `planned` features visible to user. | Stories: collapsed default, expanded <6 items, expanded >6 with overflow, zero items (hidden). Scroll behavior. localStorage persistence. |
| 26 | `PlannedFeatureCard` molecule | Card: name, description, target date, status dot, notify. | Stories: planned, coming_soon, with date, without date. Notify click. |
| 27 | `WireframePreview` molecule | SVG wireframe layouts. 8 variants: board, calendar, table, timeline, catalog, document, charts, form. | Stories for each variant. Labelled zones readable. Responsive scaling. |

### Phase 6: AI Assistant

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 28 | `useAIContext` hook | Reads current workspace ID, current tab ID, user role, and visible workspace list (not individual features). Updates on every navigation event. Provides structured context object for the AI backend request. | Tests: context updates on route change, correct workspace/tab/role values, visible workspace list matches `/v1/workspaces/visible` response. |
| 29 | `POST /v1/ai/chat` endpoint | Claude API integration. System prompt with workspace context. Rate limiting (20/min). Cost controls. | Correct responses for navigation queries. Rate limit enforced. Context passed correctly. Error handling. |
| 30 | AI panel integration | Wire AIPanel to backend. Context updates on nav. Citations link to workspaces. Session persistence. | End-to-end: ask question → get response → click citation → navigate. Session persists across workspace changes. |

### Phase 7: CommandBar Extension + Integration

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 31 | `GET /v1/search` endpoint | Object search: users, productions, facilities. Fuzzy matching, role-scoped. Returns flat array; each result has `workspace` field. Frontend groups for display. | Search returns correct results. Role scoping works. <100ms. Flat response shape matches contract. |
| 32 | CommandBar object search | Extend CommandBar: recents → objects → features. Frontend groups flat API results by `workspace` field for display. | Stories: with object results, mixed results, no results. Object results above feature results. Grouping by workspace in UI. |
| 33 | Workspace integration wiring | Wire all 11 workspaces: routing, canvas selection, tab navigation, Coming Soon scaffolds, planned sections. Full end-to-end. | Every workspace accessible. Every tab renders correct canvas or scaffold. Planned sections populated from registry. |

### Phase 8: E2E, Cleanup & Documentation

| # | Title | Description | Acceptance Criteria |
|---|-------|-------------|-------------------|
| 34 | E2E test suite | Workspace-oriented tests: role sidebar, workspace navigation, tab states, canvas rendering, Coming Soon scaffolds, AI panel, Inbox, CommandBar, responsive, permission boundaries. | All scenarios pass at 375px and 1440px viewports. Suite < 3 minutes. |
| 35 | Remove replaced components + update docs | Remove old sidebar/role dashboard/coming soon components. Update CLAUDE.md, design spec, API docs. Clean all imports. | No dead code. No broken imports. CLAUDE.md reflects workspace architecture. |

---

## Omnibus PR Strategy

Per initiative #356 conventions, work ships in omnibus PRs grouped by phase:

| PR | Phase | Issues |
|----|-------|--------|
| PR 1 | Foundation | #1–#4 |
| PR 2 | Shell & Navigation | #5–#10 |
| PR 3 | Home & Inbox | #11–#15 |
| PR 4 | Canvas Types (part 1: Table, Board, Calendar) | #16–#18 |
| PR 5 | Canvas Types (part 2: Timeline, Catalog, Documents, Charts, DetailPanel) | #19–#23 |
| PR 6 | Coming Soon System | #24–#27 |
| PR 7 | AI Assistant | #28–#30 |
| PR 8 | CommandBar + Integration | #31–#33 |
| PR 9 | E2E + Cleanup | #34–#35 |

Canvas types split into two PRs to keep review scope manageable while maintaining the dependency chain.

---

## Quality Gates

Every PR must pass all of these. No exceptions. No "we'll fix it in the next PR."

- [ ] `pnpm exec prisma generate`
- [ ] `pnpm generate:dashboard` (including new workspace codegen)
- [ ] `pnpm test` (all unit tests pass)
- [ ] `pnpm lint` (zero warnings)
- [ ] `pnpm typecheck` (zero errors)
- [ ] `pnpm build-storybook` (all stories build, no errors)
- [ ] `pnpm test:e2e` (all E2E scenarios pass — local only)
- [ ] Codex MCP security review (sandbox: danger-full-access)
- [ ] Codex MCP blind-spot review
- [ ] All review findings addressed before merge

---

## What This Design Does NOT Include (Explicit Scope Boundaries)

These are intentionally excluded from this spec and will be separate initiatives:

1. **Multi-role per user** — Phase 1 is single role per user
2. **WebSocket/SSE real-time updates** — Phase 1 uses visibilitychange revalidation (already built)
3. **AI task execution** — Phase 1 AI is read-only Q&A + navigation
4. **Offline support** — not needed (Cloudflare edge caching is sufficient)
5. **Per-campus phase scoping** — Phase 1 uses union phase resolution (already built)
6. **Dashboard i18n** — English only for internal/stakeholder dashboard
7. **Custom dashboard layouts** — No drag-and-drop widget customization in Phase 1
8. **In-app notifications** — Phase 1 is email-only via Postmark for feature launch notifications
