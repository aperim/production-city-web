# UX Analysis — Dashboard Scaffold

> Issue #357 | Epic #347 | Phase 3 Integration
> Date: 2026-03-16

## Overview

This document validates the UX decisions in the dashboard scaffold against best practices. The scaffold introduces 502 features across 10 roles via a registry-driven navigation system.

---

## 1. Information Architecture

### Navigation Model: Hub-and-Spoke with Persistent Sidebar

The dashboard uses a **persistent sidebar** (hub) with **content pages** (spokes).

**Why this model:**
- 502 features across 26 sections require hierarchical organization
- Users need constant orientation — where am I? what else is available?
- Phase-based and role-based filtering reduces cognitive overload
- Sidebar = primary wayfinding; CommandBar (Cmd+K) = power-user shortcut

### Navigation Depth Verification

Analysis of generated routes (`_generated/routes.ts`):

| Depth | Path pattern | Count | UX concern |
|-------|-------------|-------|------------|
| 1 click | `/dashboard` (home) | 10 role dashboards | None |
| 2 clicks | Group → section | 26 sections | None |
| 3 clicks | Section → subsection → feature | 466 features | Acceptable — breadcrumbs provide context |
| 4 clicks | Nested sub-features | ~20 | Mitigated by CommandBar direct access |

**Result: 95%+ of features reachable in 3 clicks or fewer.** CommandBar provides 1-keystroke access to any feature.

### Cognitive Load Management

| Strategy | Implementation | Component |
|----------|---------------|-----------|
| Progressive disclosure | Phase-based sidebar groups | `SidebarNav` with `GROUP_PHASE_VISIBILITY` |
| Role-scoped views | Each role sees only relevant sections | `visibleFeatureIds` filtering |
| Consistent layout | Identical shell on every page | `DashboardShell` template |
| Recognition over recall | Sidebar shows all available features | `SidebarNav` + `CommandBar` |
| Graceful placeholders | Coming Soon pages communicate roadmap | `ComingSoonPage` template |

---

## 2. Role-Based Dashboard Experience

Each of the 10 roles has a tailored landing page via `RoleDashboard`:

| Role | Welcome subtext | Typical KPI focus |
|------|----------------|-------------------|
| Admin | System overview and management tools | Users, approvals, invitations |
| Executive | Strategic metrics and company performance | Revenue, projects, utilization |
| Staff | Your workspace and daily tasks | My tasks, completed today |
| Client | Project updates and communications | Active projects, invoices |
| Investor | Portfolio performance and reports | Portfolio value, returns |
| Guest | Welcome to Production City | Empty state — dashboard being set up |
| Vendor | Orders, invoices, and deliveries | Orders, invoices, delivery time |
| Government | Compliance, reporting, and policy | Compliance score, reports |
| Partner | Partnership metrics and collaboration | Joint projects, shared revenue |
| First Nations | Cultural programs and community initiatives | Active programs, community reach |

Role resolution follows a priority order (admin > executive > government > ... > guest), resolved by `resolveDashboardRole()`.

---

## 3. Accessibility Compliance

### WCAG 2.1 AA Coverage

| Criterion | Status | Implementation |
|-----------|--------|---------------|
| 1.3.1 Info & Relationships | Pass | `<nav>` landmarks, list semantics, `aria-current`, breadcrumb `<nav>` |
| 1.3.2 Meaningful Sequence | Pass | Skip nav → header → sidebar → content DOM order |
| 2.1.1 Keyboard | Pass | Full keyboard nav (Tab, Arrows, Enter, Esc), focus trap in CommandBar |
| 2.4.1 Bypass Blocks | Pass | "Skip to main content" link (DashboardShell) |
| 2.4.3 Focus Order | Pass | Focus management on route change |
| 2.4.5 Multiple Ways | Pass | Sidebar + CommandBar + breadcrumbs + direct URL |
| 2.4.7 Focus Visible | Pass | `focus-visible:outline-2 focus-visible:outline-offset-2` on all interactive elements |
| 2.4.8 Location | Pass | Breadcrumbs + sidebar active state |
| 4.1.2 Name, Role, Value | Pass | ARIA treeview/disclosure pattern, dialog for CommandBar |

### Touch Target Compliance

All interactive sidebar items use `min-h-[44px]` (WCAG AA minimum).

### Fitts's Law

- Sidebar items: full-width (easy horizontal targeting)
- CommandBar trigger: fixed position header (always reachable)
- Quick action buttons: large, well-spaced targets
- Mobile: full-screen sidebar overlay = full-width tap targets

---

## 4. Error State UX

| Error scenario | User sees | Recovery path |
|---------------|-----------|---------------|
| Session expires | Modal overlay with "Session Expired" | Sign-in link preserves return URL |
| Concurrent session | Same overlay, "signed in elsewhere" | Sign-in redirect |
| Feature not found | 404 (identical to unauthorized — prevents enumeration) | Back button, sidebar, home |
| Registry API fails | Skeleton loaders, fallback static sidebar | Content appears progressively |
| Slow network | Skeleton loaders for KPI cards, activity feed | Progressive content appearance |
| Notify Me fails | Inline error below button | Retry on click |

### Session Lifecycle

The `useSessionMonitor` hook handles:
- 401 responses trigger `pc:session-expired` event
- `SessionExpiredOverlay` renders with `role="alertdialog"` and `aria-modal="true"`
- Return URL preserved in login link

### Registry Revalidation

The `useRegistryRevalidation` hook handles:
- Tab focus revalidation after 5-minute stale threshold
- Registry version change triggers page refresh (with 30-second loop protection)
- Phase 2 will replace with WebSocket push updates

---

## 5. Route Migration

Legacy dashboard paths redirect via 301 to registry-driven paths:

| Legacy path | New registry path | Status |
|-------------|------------------|--------|
| `/dashboard/users` | `/dashboard/admin/users/manage` | 301 redirect |
| `/dashboard/invitations` | `/dashboard/admin/users/manage` | 301 redirect |
| `/dashboard/approvals` | `/dashboard/admin/users/manage` | 301 redirect |
| `/dashboard/audit-log` | `/dashboard/admin/audit/logs` | 301 redirect |
| `/dashboard/announcements` | `/dashboard/comms/internal/announcements` | 301 redirect |

Pages without registry equivalents (`/dashboard/profile`, `/dashboard/eoi`, `/dashboard/categories`, `/dashboard/tags`, `/dashboard/subscriptions-admin`) retain their current paths until the registry incorporates them.

---

## 6. Performance Considerations

- **Route manifest**: 502 routes loaded once at build time (generated TypeScript, tree-shaken)
- **Sidebar filtering**: O(n) filter on mount, memoized via `useMemo`
- **Feature index**: Map-based O(1) lookups for CommandBar search
- **Registry API**: 5-minute cache, revalidated on tab focus only
- **Skeleton loaders**: Prevent layout shift during data loading

---

## 7. Findings and Recommendations

### Addressed in this PR

1. **Focus visible states**: All interactive elements have `focus-visible:outline` classes
2. **Navigation depth**: 95%+ features in ≤3 clicks, CommandBar for 1-keystroke access
3. **Session handling**: 401 detection, expiry overlay, tab-focus revalidation
4. **Route migration**: 301 redirects for legacy paths
5. **Role dashboards**: All 10 roles have tailored landing pages

### Deferred to Phase 2+

1. **Real-time registry updates**: WebSocket/SSE push for feature activation (currently 5-min cache)
2. **Offline support**: Service worker for dashboard shell caching
3. **Analytics**: Track navigation patterns to validate IA decisions
4. **Personalization**: User-configurable dashboard widgets and KPI cards
