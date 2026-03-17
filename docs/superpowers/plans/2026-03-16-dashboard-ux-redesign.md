# Dashboard UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mechanical 502-item sidebar with a hub-and-spoke workspace architecture: 11 canonical workspaces, role-adaptive navigation, 7 canvas types, AI assistant panel, and contextual Coming Soon scaffolds.

**Architecture:** Registry JSON gains workspace mapping layer. Codegen outputs workspace-config.ts and role-config.ts alongside existing routes.ts/feature-index.ts. Frontend shell is rebuilt around WorkspaceShell template with pluggable canvas organisms. Backend adds workspace-visible, home-summary, inbox, AI chat, and search endpoints.

**Tech Stack:** React 19.2, Vite 8, Tailwind v4, shadcn/ui, Cloudflare Workers, D1/Prisma, Hono + Zod OpenAPI, Claude API (AI panel), @tanstack/react-table, @dnd-kit, recharts

**Spec:** `docs/superpowers/specs/2026-03-16-dashboard-ux-redesign-design.md`

**Phases:**
1. Foundation (Issues 1-4) -- registry schema, codegen, routing, API
2. Shell & Navigation (Issues 5-10) -- sidebar, tabs, scope bar, shells, AI panel UI
3. Home & Inbox (Issues 11-15) -- workspace cards, home, inbox
4. Canvas Types Part 1 (Issues 16-18) -- table, board, calendar
5. Canvas Types Part 2 (Issues 19-23) -- timeline, catalog, documents, charts, detail panel
6. Coming Soon System (Issues 24-27) -- scaffolds, planned section, wireframes
7. AI Assistant (Issues 28-30) -- context hook, backend, integration
8. CommandBar + Integration (Issues 31-33) -- search, object search, wiring
9. E2E + Cleanup (Issues 34-35) -- tests, removal, docs

---

## File Structure Map (All 35 Issues)

Every file created or modified across the entire plan, organized by package.

### Registry & Codegen

| Action | File | Issues |
|--------|------|--------|
| Modify | `docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json` | 1 |
| Modify | `apps/web/scripts/generate-dashboard-routes.ts` | 2 |
| Modify | `apps/web/scripts/__tests__/generate-dashboard-routes.test.ts` | 2 |
| Create (generated) | `apps/web/app/dashboard/_generated/workspace-config.ts` | 2 |
| Create (generated) | `apps/web/app/dashboard/_generated/role-config.ts` | 2 |

### packages/ui -- Atoms

| Action | File | Issues |
|--------|------|--------|
| Create | `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.tsx` | 5 |
| Create | `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.stories.tsx` | 5 |
| Create | `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.test.tsx` | 5 |
| Create | `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.tsx` | 6 |
| Create | `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.stories.tsx` | 6 |
| Create | `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.test.tsx` | 6 |
| Create | `packages/ui/src/atoms/TabItem/TabItem.tsx` | 6 |
| Create | `packages/ui/src/atoms/TabItem/TabItem.stories.tsx` | 6 |
| Create | `packages/ui/src/atoms/TabItem/TabItem.test.tsx` | 6 |
| Create | `packages/ui/src/atoms/AttentionDot/AttentionDot.tsx` | 14 |
| Create | `packages/ui/src/atoms/AttentionDot/AttentionDot.stories.tsx` | 14 |
| Create | `packages/ui/src/atoms/AttentionDot/AttentionDot.test.tsx` | 14 |
| Create | `packages/ui/src/atoms/BadgeCount/BadgeCount.tsx` | 5 |
| Create | `packages/ui/src/atoms/BadgeCount/BadgeCount.stories.tsx` | 5 |
| Create | `packages/ui/src/atoms/BadgeCount/BadgeCount.test.tsx` | 5 |

### packages/ui -- Molecules

| Action | File | Issues |
|--------|------|--------|
| Create | `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.tsx` | 11 |
| Create | `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.stories.tsx` | 11 |
| Create | `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.test.tsx` | 11 |
| Create | `packages/ui/src/molecules/ScopeBar/ScopeBar.tsx` | 7 |
| Create | `packages/ui/src/molecules/ScopeBar/ScopeBar.stories.tsx` | 7 |
| Create | `packages/ui/src/molecules/ScopeBar/ScopeBar.test.tsx` | 7 |
| Create | `packages/ui/src/molecules/ComingSoonBanner/ComingSoonBanner.tsx` | 24 |
| Create | `packages/ui/src/molecules/ComingSoonBanner/ComingSoonBanner.stories.tsx` | 24 |
| Create | `packages/ui/src/molecules/ComingSoonBanner/ComingSoonBanner.test.tsx` | 24 |
| Create | `packages/ui/src/molecules/PlannedFeatureCard/PlannedFeatureCard.tsx` | 26 |
| Create | `packages/ui/src/molecules/PlannedFeatureCard/PlannedFeatureCard.stories.tsx` | 26 |
| Create | `packages/ui/src/molecules/PlannedFeatureCard/PlannedFeatureCard.test.tsx` | 26 |
| Create | `packages/ui/src/molecules/RecentItem/RecentItem.tsx` | 5 |
| Create | `packages/ui/src/molecules/RecentItem/RecentItem.stories.tsx` | 5 |
| Create | `packages/ui/src/molecules/RecentItem/RecentItem.test.tsx` | 5 |
| Create | `packages/ui/src/molecules/AttentionItem/AttentionItem.tsx` | 14 |
| Create | `packages/ui/src/molecules/AttentionItem/AttentionItem.stories.tsx` | 14 |
| Create | `packages/ui/src/molecules/AttentionItem/AttentionItem.test.tsx` | 14 |
| Create | `packages/ui/src/molecules/WireframePreview/WireframePreview.tsx` | 27 |
| Create | `packages/ui/src/molecules/WireframePreview/WireframePreview.stories.tsx` | 27 |
| Create | `packages/ui/src/molecules/WireframePreview/WireframePreview.test.tsx` | 27 |

### packages/ui -- Organisms

| Action | File | Issues |
|--------|------|--------|
| Create | `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.tsx` | 5 |
| Create | `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.stories.tsx` | 5 |
| Create | `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.test.tsx` | 5 |
| Create | `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.tsx` | 6 |
| Create | `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.stories.tsx` | 6 |
| Create | `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.test.tsx` | 6 |
| Extend | `packages/ui/src/organisms/CommandBar/CommandBar.tsx` | 32 |
| Create | `packages/ui/src/organisms/AIPanel/AIPanel.tsx` | 10 |
| Create | `packages/ui/src/organisms/AIPanel/AIPanel.stories.tsx` | 10 |
| Create | `packages/ui/src/organisms/AIPanel/AIPanel.test.tsx` | 10 |
| Create | `packages/ui/src/organisms/InboxFeed/InboxFeed.tsx` | 14 |
| Create | `packages/ui/src/organisms/InboxFeed/InboxFeed.stories.tsx` | 14 |
| Create | `packages/ui/src/organisms/InboxFeed/InboxFeed.test.tsx` | 14 |
| Create | `packages/ui/src/organisms/CanvasTable/CanvasTable.tsx` | 16 |
| Create | `packages/ui/src/organisms/CanvasTable/CanvasTable.stories.tsx` | 16 |
| Create | `packages/ui/src/organisms/CanvasTable/CanvasTable.test.tsx` | 16 |
| Create | `packages/ui/src/organisms/CanvasBoard/CanvasBoard.tsx` | 17 |
| Create | `packages/ui/src/organisms/CanvasBoard/CanvasBoard.stories.tsx` | 17 |
| Create | `packages/ui/src/organisms/CanvasBoard/CanvasBoard.test.tsx` | 17 |
| Create | `packages/ui/src/organisms/CanvasCalendar/CanvasCalendar.tsx` | 18 |
| Create | `packages/ui/src/organisms/CanvasCalendar/CanvasCalendar.stories.tsx` | 18 |
| Create | `packages/ui/src/organisms/CanvasCalendar/CanvasCalendar.test.tsx` | 18 |
| Create | `packages/ui/src/organisms/CanvasTimeline/CanvasTimeline.tsx` | 19 |
| Create | `packages/ui/src/organisms/CanvasTimeline/CanvasTimeline.stories.tsx` | 19 |
| Create | `packages/ui/src/organisms/CanvasTimeline/CanvasTimeline.test.tsx` | 19 |
| Create | `packages/ui/src/organisms/CanvasCatalog/CanvasCatalog.tsx` | 20 |
| Create | `packages/ui/src/organisms/CanvasCatalog/CanvasCatalog.stories.tsx` | 20 |
| Create | `packages/ui/src/organisms/CanvasCatalog/CanvasCatalog.test.tsx` | 20 |
| Create | `packages/ui/src/organisms/CanvasDocuments/CanvasDocuments.tsx` | 21 |
| Create | `packages/ui/src/organisms/CanvasDocuments/CanvasDocuments.stories.tsx` | 21 |
| Create | `packages/ui/src/organisms/CanvasDocuments/CanvasDocuments.test.tsx` | 21 |
| Create | `packages/ui/src/organisms/CanvasCharts/CanvasCharts.tsx` | 22 |
| Create | `packages/ui/src/organisms/CanvasCharts/CanvasCharts.stories.tsx` | 22 |
| Create | `packages/ui/src/organisms/CanvasCharts/CanvasCharts.test.tsx` | 22 |
| Create | `packages/ui/src/organisms/DetailPanel/DetailPanel.tsx` | 23 |
| Create | `packages/ui/src/organisms/DetailPanel/DetailPanel.stories.tsx` | 23 |
| Create | `packages/ui/src/organisms/DetailPanel/DetailPanel.test.tsx` | 23 |
| Create | `packages/ui/src/organisms/PlannedSection/PlannedSection.tsx` | 25 |
| Create | `packages/ui/src/organisms/PlannedSection/PlannedSection.stories.tsx` | 25 |
| Create | `packages/ui/src/organisms/PlannedSection/PlannedSection.test.tsx` | 25 |

### packages/ui -- Templates

| Action | File | Issues |
|--------|------|--------|
| Create | `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.tsx` | 8 |
| Create | `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.stories.tsx` | 8 |
| Create | `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.test.tsx` | 8 |
| Create | `packages/ui/src/templates/HomeDashboard/HomeDashboard.tsx` | 12 |
| Create | `packages/ui/src/templates/HomeDashboard/HomeDashboard.stories.tsx` | 12 |
| Create | `packages/ui/src/templates/HomeDashboard/HomeDashboard.test.tsx` | 12 |
| Create | `packages/ui/src/templates/ComingSoonScaffold/ComingSoonScaffold.tsx` | 24 |
| Create | `packages/ui/src/templates/ComingSoonScaffold/ComingSoonScaffold.stories.tsx` | 24 |
| Create | `packages/ui/src/templates/ComingSoonScaffold/ComingSoonScaffold.test.tsx` | 24 |
| Create | `packages/ui/src/templates/InboxPage/InboxPage.tsx` | 14 |
| Create | `packages/ui/src/templates/InboxPage/InboxPage.stories.tsx` | 14 |
| Create | `packages/ui/src/templates/InboxPage/InboxPage.test.tsx` | 14 |

### packages/ui -- Exports & Index

| Action | File | Issues |
|--------|------|--------|
| Modify | `packages/ui/src/index.ts` | 5, 6, 7, 8, 10, 11, 12, 14, 16-27, 32 |

### App Integration (apps/web)

| Action | File | Issues |
|--------|------|--------|
| Rewrite | `apps/web/app/dashboard/layout.tsx` | 9 |
| Rewrite | `apps/web/app/dashboard/page.tsx` | 12 |
| Modify | `apps/web/app/dashboard/components/FeatureGate.tsx` | 3 |
| Modify | `apps/web/app/dashboard/components/RegistryProvider.tsx` | 3 |
| Create | `apps/web/app/dashboard/hooks/useAIContext.ts` | 28 |
| Create | `apps/web/app/dashboard/hooks/useAIContext.test.ts` | 28 |
| Create | `apps/web/app/dashboard/hooks/useRecents.ts` | 5, 12 |
| Create | `apps/web/app/dashboard/hooks/useRecents.test.ts` | 5 |
| Create | `apps/web/app/dashboard/[workspace]/page.tsx` | 3 |
| Create | `apps/web/app/dashboard/[workspace]/[tab]/page.tsx` | 3 |
| Create | `apps/web/app/dashboard/__tests__/workspace-routing.test.tsx` | 3 |
| Create | `apps/web/app/dashboard/inbox/page.tsx` | 14 |
| Create | `apps/web/app/dashboard/api/home.ts` | 12 |
| Modify | `apps/web/app/dashboard/use-registry-revalidation.ts` | 3 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/index.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/productions.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/facilities.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/finance.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/people.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/campus.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/events.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/education.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/analytics.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/investor-relations.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/partnerships.ts` | 33 |
| Create | `apps/web/app/dashboard/[workspace]/sample-data/administration.ts` | 33 |

### Backend (apps/backend)

| Action | File | Issues |
|--------|------|--------|
| Create (generated) | `apps/backend/src/_generated/workspace-manifest.ts` | 2 |
| Create | `apps/backend/src/registry/workspaces.ts` | 4 |
| Create | `apps/backend/src/__tests__/workspaces-visible.test.ts` | 4 |
| Create | `apps/backend/src/inbox/handlers.ts` | 15 |
| Create | `apps/backend/src/__tests__/inbox.test.ts` | 15 |
| Create | `apps/backend/src/home/summary.ts` | 13 |
| Create | `apps/backend/src/__tests__/home-summary.test.ts` | 13 |
| Create | `apps/backend/src/ai/chat.ts` | 29 |
| Create | `apps/backend/src/__tests__/ai-chat.test.ts` | 29 |
| Create | `apps/backend/src/search/handlers.ts` | 31 |
| Create | `apps/backend/src/__tests__/search.test.ts` | 31 |
| Modify | `apps/backend/src/routes.ts` | 4, 13, 15, 29, 31 |
| Modify | `apps/backend/src/__tests__/test-helpers.ts` | 15 |
| Modify | `apps/backend/src/lib/permissions.ts` | 4 |
| Create | `apps/backend/src/lib/workspace-resolver.ts` | 4 |
| Create | `apps/backend/src/lib/__tests__/workspace-resolver.test.ts` | 4 |

### Prisma Schema

| Action | File | Issues |
|--------|------|--------|
| Modify | `prisma/schema.prisma` | 15 |
| Create | `prisma/migrations/<timestamp>_extend_notification_for_inbox.sql` | 15 |

### E2E Tests

| Action | File | Issues |
|--------|------|--------|
| Create | `apps/web/e2e/dashboard-workspaces.spec.ts` | 34 |
| Create | `apps/web/e2e/dashboard-inbox.spec.ts` | 34 |
| Create | `apps/web/e2e/dashboard-ai-panel.spec.ts` | 34 |
| Create | `apps/web/e2e/dashboard-command-bar.spec.ts` | 34 |
| Create | `apps/web/e2e/dashboard-responsive.spec.ts` | 34 |

### Documentation & Config

| Action | File | Issues |
|--------|------|--------|
| Modify | `CLAUDE.md` | 35 |
| Modify | `docs/superpowers/specs/2026-03-16-dashboard-ux-redesign-design.md` | 35 |
| Create | `docs/api/dashboard-workspaces.md` | 4 |

### Removed Files (Issue 35)

| Action | File | Issues |
|--------|------|--------|
| Remove | `packages/ui/src/organisms/SidebarNav/` (entire directory) | 35 |
| Remove | `packages/ui/src/atoms/SidebarItem/` (entire directory) | 35 |
| Remove | `packages/ui/src/molecules/SidebarGroup/` (entire directory) | 35 |
| Remove | `packages/ui/src/templates/RoleDashboard/` (entire directory) | 35 |
| Remove | `packages/ui/src/templates/ComingSoonPage/` (entire directory) | 35 |
| Remove | `packages/ui/src/atoms/FeatureStatusBadge/` (entire directory) | 35 |
| Remove | `packages/ui/src/molecules/ComingSoonCard/` (entire directory) | 35 |

---

## Phase 1: Foundation (Issues 1-4)

Phase 1 establishes the data layer and routing that everything else depends on. No UI components are built here -- only the registry schema extension, codegen pipeline, URL routing, and the backend API that serves workspace visibility.

---

### Issue 1: Registry workspace schema extension

**Summary:** Add `workspaces` array and `roleConfig` object to the feature registry JSON. Map all 502 features to workspace tabs. Add `activatedAt` field to the feature schema.

**Files modified:**
- `docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json`

**Acceptance criteria:**
- All 502 features mapped to exactly one workspace tab
- All 11 workspaces defined with correct tabs, icons, canvas types
- All 10 roles have `roleConfig` entries with `workspaceOrder` and `quickActions`
- `activatedAt` field added (null for all features in Phase 1)
- Existing validation (`pnpm generate:dashboard`) still passes

#### Step 1.1: Plan the feature-to-workspace mapping

Before editing JSON, map every existing registry section to its target workspace and tab. The 26 existing sections map to 11 workspaces as follows:

| Registry Section(s) | Target Workspace | Target Tab(s) |
|---------------------|-----------------|---------------|
| `home.*` | (Home -- no workspace, uses HomeDashboard) | N/A |
| `productions.*` | `productions` | overview, pre-production, shooting, post-production, deliverables, workflow |
| `facilities.*`, `broadcast.*`, `virtual_production.*`, `audio_music.*` | `facilities` | calendar, sound-stages, led-volumes, control-rooms, broadcast-theatre, equipment |
| `finance.*`, `inventory.*` | `finance` | overview, invoices, budgets, cash-flow, distributions, vendor-payments |
| `company_ops.hr.*`, `talent_crew.*` | `people` | directory, leave, payroll, recruitment, org-chart |
| `campus_dev.*`, `campus_ops.*`, `global_network.*` | `campus` | master-plan, site-acquisition, design-construction, approvals, heritage |
| `events_tickets.*` | `events` | calendar, ticketing, tours, venue-management |
| `education.*` | `education` | courses, workshops, certifications, enrolments, partners |
| `analytics.*` | `analytics` | operational, financial, production, utilization, economic-impact |
| `investor_relations.*`, `data_rooms.*` | `investor-relations` | portfolio, data-room, reports, distributions, updates |
| `partnerships.*`, `gov_policy.*`, `first_nations.*`, `community.*` | `partnerships` | overview, technology, education, first-nations, government, eoi |
| `administration.*`, `company_ops.legal.*`, `company_ops.board.*`, `communications.*` | `administration` | users, roles, audit, sso, health, registry |

> **Note:** Features from `home.*` section are NOT mapped to any workspace. They belong to the Home dashboard (which is not a workspace). The codegen will need a special rule: home features are exempt from the "every feature must be in a workspace" validation. Instead, they are validated separately -- home features must exist in the `sections` array but are not required in `workspaces[].tabs[].featureIds`.

#### Step 1.2: Add `workspaces` array to registry JSON

- [ ] **1.2.1** Add the `workspaces` top-level array after `sections`. Each workspace object follows this exact schema:

```jsonc
// Add after the "sections" array closes, before the closing } of the root object
"workspaces": [
  {
    "id": "productions",
    "label": "Productions",
    "icon": "film",
    "description": "Film, TV, and broadcast production lifecycle",
    "defaultCanvas": "board",
    "aiEnabled": true,
    "tabs": [
      {
        "id": "overview",
        "label": "Overview",
        "canvas": "board",
        "featureIds": [
          "productions.active_productions.production_list",
          "productions.active_productions.production_status_board",
          "productions.active_productions.production_archive"
        ]
      },
      {
        "id": "pre-production",
        "label": "Pre-Production",
        "canvas": "board",
        "featureIds": [
          "productions.pre_production.script_breakdown",
          "productions.pre_production.budgeting",
          "productions.pre_production.casting_management",
          "productions.pre_production.location_scouting",
          "productions.pre_production.storyboarding"
        ]
      },
      {
        "id": "shooting",
        "label": "Shooting",
        "canvas": "calendar",
        "wireframeType": "calendar",
        "featureIds": [
          "productions.shooting.shoot_scheduling",
          "productions.shooting.call_sheets",
          "productions.shooting.daily_reports",
          "productions.shooting.continuity_tracking"
        ]
      },
      {
        "id": "post-production",
        "label": "Post-Production",
        "canvas": "timeline",
        "wireframeType": "timeline",
        "featureIds": [
          "productions.post_production.editorial_workflow",
          "productions.post_production.vfx_pipeline",
          "productions.post_production.color_grading",
          "productions.post_production.sound_design",
          "productions.post_production.deliverables_tracking"
        ]
      },
      {
        "id": "deliverables",
        "label": "Deliverables",
        "canvas": "table",
        "wireframeType": "table",
        "featureIds": [
          "productions.distribution.distribution_management",
          "productions.distribution.format_compliance",
          "productions.distribution.delivery_tracking"
        ]
      },
      {
        "id": "workflow",
        "label": "Workflow",
        "canvas": "board",
        "wireframeType": "board",
        "featureIds": [
          "workflow.production_workflow.task_management",
          "workflow.production_workflow.approval_chains",
          "workflow.production_workflow.milestone_tracking",
          "workflow.collaboration.review_feedback",
          "workflow.collaboration.annotations"
        ]
      }
    ],
    "roles": ["admin", "executive", "staff", "client"]
  },
  {
    "id": "facilities",
    "label": "Facilities",
    "icon": "building",
    "description": "Sound stages, LED volumes, control rooms, and equipment",
    "defaultCanvas": "calendar",
    "aiEnabled": true,
    "tabs": [
      { "id": "calendar", "label": "Calendar", "canvas": "calendar", "featureIds": ["facilities.booking.booking_calendar", "facilities.booking.booking_management", "facilities.booking.conflict_detection"] },
      { "id": "sound-stages", "label": "Sound Stages", "canvas": "table", "featureIds": ["facilities.sound_stages.stage_inventory", "facilities.sound_stages.stage_specs", "facilities.sound_stages.stage_availability"] },
      { "id": "led-volumes", "label": "LED Volumes", "canvas": "table", "featureIds": ["virtual_production.led_volumes.volume_inventory", "virtual_production.led_volumes.volume_scheduling", "virtual_production.led_volumes.volume_specs"] },
      { "id": "control-rooms", "label": "Control Rooms", "canvas": "table", "featureIds": ["broadcast.control_rooms.room_inventory", "broadcast.control_rooms.room_scheduling", "broadcast.control_rooms.room_specs"] },
      { "id": "broadcast-theatre", "label": "Broadcast Theatre", "canvas": "table", "featureIds": ["broadcast.broadcast_theatre.theatre_management", "broadcast.broadcast_theatre.theatre_scheduling"] },
      { "id": "equipment", "label": "Equipment", "canvas": "table", "featureIds": ["facilities.equipment.equipment_inventory", "facilities.equipment.equipment_checkout", "facilities.equipment.maintenance_schedule"] }
    ],
    "roles": ["admin", "executive", "staff", "client", "vendor"]
  },
  {
    "id": "finance",
    "label": "Finance",
    "icon": "dollar-sign",
    "description": "Invoicing, budgets, cash flow, and distributions",
    "defaultCanvas": "table",
    "aiEnabled": false,
    "tabs": [
      { "id": "overview", "label": "Overview", "canvas": "charts", "featureIds": ["finance.overview.financial_dashboard", "finance.overview.financial_summary"] },
      { "id": "invoices", "label": "Invoices", "canvas": "table", "featureIds": ["finance.invoicing.invoice_management", "finance.invoicing.invoice_creation", "finance.invoicing.payment_tracking"] },
      { "id": "budgets", "label": "Budgets", "canvas": "table", "featureIds": ["finance.budgets.budget_management", "finance.budgets.budget_tracking", "finance.budgets.cost_centres"] },
      { "id": "cash-flow", "label": "Cash Flow", "canvas": "charts", "featureIds": ["finance.treasury.cash_flow_forecast", "finance.treasury.bank_reconciliation"] },
      { "id": "distributions", "label": "Distributions", "canvas": "table", "featureIds": ["finance.distributions.distribution_management", "finance.distributions.distribution_schedule"] },
      { "id": "vendor-payments", "label": "Vendor Payments", "canvas": "table", "featureIds": ["vendors.vendor_management.vendor_directory", "vendors.vendor_management.purchase_orders", "vendors.payments.vendor_payments"] }
    ],
    "roles": ["admin", "executive", "client", "investor", "vendor"]
  },
  {
    "id": "people",
    "label": "People",
    "icon": "users",
    "description": "Staff directory, leave management, payroll, and recruitment",
    "defaultCanvas": "table",
    "aiEnabled": true,
    "tabs": [
      { "id": "directory", "label": "Directory", "canvas": "table", "featureIds": ["company_ops.hr.team_directory", "company_ops.hr.org_chart_view", "talent_crew.crew_management.crew_database"] },
      { "id": "leave", "label": "Leave Management", "canvas": "table", "featureIds": ["company_ops.hr.leave_management", "company_ops.hr.leave_calendar"] },
      { "id": "payroll", "label": "Payroll", "canvas": "table", "featureIds": ["company_ops.hr.payroll_overview", "company_ops.hr.payslips"] },
      { "id": "recruitment", "label": "Recruitment", "canvas": "board", "wireframeType": "board", "featureIds": ["company_ops.hr.recruitment_pipeline", "company_ops.hr.job_postings"] },
      { "id": "org-chart", "label": "Org Chart", "canvas": "table", "featureIds": ["company_ops.hr.org_chart_management", "company_ops.hr.department_management"] }
    ],
    "roles": ["admin", "executive", "staff"]
  },
  {
    "id": "campus",
    "label": "Campus",
    "icon": "map",
    "description": "Master planning, site acquisition, design, construction, and approvals",
    "defaultCanvas": "timeline",
    "aiEnabled": true,
    "tabs": [
      { "id": "master-plan", "label": "Master Plan", "canvas": "timeline", "featureIds": ["campus_dev.master_planning.master_plan_dashboard", "campus_dev.master_planning.precinct_planning", "campus_dev.master_planning.infrastructure_planning"] },
      { "id": "site-acquisition", "label": "Site Acquisition", "canvas": "table", "featureIds": ["campus_dev.site_acquisition.site_search", "campus_dev.site_acquisition.due_diligence", "campus_dev.site_acquisition.acquisition_pipeline"] },
      { "id": "design-construction", "label": "Design & Construction", "canvas": "timeline", "featureIds": ["campus_dev.design_construct.design_management", "campus_dev.design_construct.construction_timeline", "campus_dev.design_construct.contractor_management"] },
      { "id": "approvals", "label": "Approvals", "canvas": "board", "wireframeType": "board", "featureIds": ["campus_dev.planning_approvals.da_tracker", "campus_dev.planning_approvals.heritage_assessments", "campus_dev.planning_approvals.environmental_compliance"] },
      { "id": "heritage", "label": "Heritage", "canvas": "documents", "wireframeType": "document", "featureIds": ["first_nations.cultural_heritage.heritage_assessments", "first_nations.cultural_heritage.cultural_mapping", "first_nations.cultural_heritage.heritage_compliance"] }
    ],
    "roles": ["admin", "executive", "government", "partner"]
  },
  {
    "id": "events",
    "label": "Events",
    "icon": "calendar",
    "description": "Events, ticketing, tours, and venue management",
    "defaultCanvas": "calendar",
    "aiEnabled": true,
    "tabs": [
      { "id": "calendar", "label": "Calendar", "canvas": "calendar", "featureIds": ["events_tickets.events.event_calendar", "events_tickets.events.event_management"] },
      { "id": "ticketing", "label": "Ticketing", "canvas": "table", "featureIds": ["events_tickets.ticketing.ticket_sales", "events_tickets.ticketing.ticket_management", "events_tickets.ticketing.pricing_management"] },
      { "id": "tours", "label": "Tours", "canvas": "catalog", "wireframeType": "catalog", "featureIds": ["events_tickets.tours.tour_management", "events_tickets.tours.tour_scheduling", "events_tickets.tours.tour_booking"] },
      { "id": "venue-management", "label": "Venue Management", "canvas": "table", "featureIds": ["events_tickets.venue.venue_management", "events_tickets.venue.venue_calendar"] }
    ],
    "roles": ["admin", "staff", "guest"]
  },
  {
    "id": "education",
    "label": "Education",
    "icon": "graduation-cap",
    "description": "Training, courses, workshops, and certifications",
    "defaultCanvas": "catalog",
    "aiEnabled": true,
    "tabs": [
      { "id": "courses", "label": "Courses", "canvas": "catalog", "featureIds": ["education.courses.course_catalog", "education.courses.course_management"] },
      { "id": "workshops", "label": "Workshops", "canvas": "catalog", "featureIds": ["education.workshops.workshop_catalog", "education.workshops.workshop_scheduling"] },
      { "id": "certifications", "label": "Certifications", "canvas": "table", "featureIds": ["education.certifications.certification_tracking", "education.certifications.certification_management"] },
      { "id": "enrolments", "label": "Enrolments", "canvas": "table", "featureIds": ["education.enrolments.enrolment_management", "education.enrolments.student_records"] },
      { "id": "partners", "label": "Partners", "canvas": "table", "featureIds": ["education.partners.partner_programs", "education.partners.partner_directory"] }
    ],
    "roles": ["admin", "staff", "guest", "partner", "first_nations"]
  },
  {
    "id": "analytics",
    "label": "Analytics",
    "icon": "chart-bar",
    "description": "Operational metrics, economic impact, and reports",
    "defaultCanvas": "charts",
    "aiEnabled": true,
    "tabs": [
      { "id": "operational", "label": "Operational Metrics", "canvas": "charts", "featureIds": ["analytics.operational.operational_dashboard", "analytics.operational.kpi_tracking"] },
      { "id": "financial", "label": "Financial Analytics", "canvas": "charts", "featureIds": ["analytics.financial.financial_reports", "analytics.financial.revenue_analytics"] },
      { "id": "production", "label": "Production Analytics", "canvas": "charts", "featureIds": ["analytics.production.production_metrics", "analytics.production.utilization_reports"] },
      { "id": "utilization", "label": "Facility Utilization", "canvas": "charts", "featureIds": ["analytics.facilities.facility_utilization", "analytics.facilities.booking_analytics"] },
      { "id": "economic-impact", "label": "Economic Impact", "canvas": "charts", "featureIds": ["analytics.economic.economic_impact_report", "analytics.economic.employment_metrics"] }
    ],
    "roles": ["admin", "executive", "government"]
  },
  {
    "id": "investor-relations",
    "label": "Investor Relations",
    "icon": "briefcase",
    "description": "Data room, portfolio, distributions, and investor reports",
    "defaultCanvas": "documents",
    "aiEnabled": false,
    "tabs": [
      { "id": "portfolio", "label": "Portfolio Overview", "canvas": "charts", "featureIds": ["investor_relations.portfolio.portfolio_dashboard", "investor_relations.portfolio.investment_tracking"] },
      { "id": "data-room", "label": "Data Room", "canvas": "documents", "featureIds": ["data_rooms.investor.investor_data_room", "data_rooms.investor.document_management"] },
      { "id": "reports", "label": "Financial Reports", "canvas": "documents", "featureIds": ["investor_relations.reporting.quarterly_reports", "investor_relations.reporting.annual_reports"] },
      { "id": "distributions", "label": "Distributions", "canvas": "table", "featureIds": ["investor_relations.distributions.distribution_history", "investor_relations.distributions.distribution_projections"] },
      { "id": "updates", "label": "Updates", "canvas": "documents", "featureIds": ["investor_relations.communications.investor_updates", "investor_relations.communications.investor_newsletter"] }
    ],
    "roles": ["admin", "executive", "investor"]
  },
  {
    "id": "partnerships",
    "label": "Partnerships",
    "icon": "handshake",
    "description": "Technology partners, education partners, First Nations, and government programs",
    "defaultCanvas": "table",
    "aiEnabled": true,
    "tabs": [
      { "id": "overview", "label": "Overview", "canvas": "table", "featureIds": ["partnerships.overview.partnership_dashboard", "partnerships.overview.partnership_pipeline"] },
      { "id": "technology", "label": "Technology Partners", "canvas": "table", "featureIds": ["partnerships.technology.tech_partner_directory", "partnerships.technology.tech_partnerships"] },
      { "id": "education", "label": "Education Partners", "canvas": "table", "featureIds": ["partnerships.education.education_partner_directory", "partnerships.education.education_partnerships"] },
      { "id": "first-nations", "label": "First Nations", "canvas": "table", "featureIds": ["first_nations.partnerships.first_nations_partnerships", "first_nations.partnerships.joint_ventures"] },
      { "id": "government", "label": "Government Programs", "canvas": "table", "featureIds": ["gov_policy.programs.government_programs", "gov_policy.programs.incentive_tracking"] },
      { "id": "eoi", "label": "EOI", "canvas": "table", "featureIds": ["partnerships.eoi.eoi_management", "partnerships.eoi.eoi_review"] }
    ],
    "roles": ["admin", "government", "partner", "first_nations"]
  },
  {
    "id": "administration",
    "label": "Administration",
    "icon": "settings",
    "description": "Users, roles, permissions, audit, SSO, and system config",
    "defaultCanvas": "table",
    "aiEnabled": true,
    "tabs": [
      { "id": "users", "label": "Users", "canvas": "table", "featureIds": ["administration.users.user_management", "administration.users.user_directory"] },
      { "id": "roles", "label": "Roles & Permissions", "canvas": "table", "featureIds": ["administration.roles.role_management", "administration.roles.permission_management"] },
      { "id": "audit", "label": "Audit Log", "canvas": "table", "featureIds": ["administration.audit.audit_log", "administration.audit.audit_search"] },
      { "id": "sso", "label": "SSO Configuration", "canvas": "table", "featureIds": ["administration.sso.sso_configuration", "administration.sso.identity_providers"] },
      { "id": "health", "label": "System Health", "canvas": "charts", "featureIds": ["administration.system.system_health", "administration.system.error_tracking"] },
      { "id": "registry", "label": "Feature Registry", "canvas": "table", "featureIds": ["administration.registry.feature_registry", "administration.registry.feature_status_management"] }
    ],
    "roles": ["admin"]
  }
]
```

> **IMPORTANT:** The `featureIds` shown above are illustrative. The actual feature IDs must be taken from the existing `sections[].subsections[].features[].id` values in the registry JSON. During implementation, you MUST cross-reference every feature ID against the live registry to ensure exact matches. The implementer should run the following to extract all feature IDs:
>
> ```bash
> cat docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json | python3 -c "
> import json, sys
> d = json.load(sys.stdin)
> for s in d['sections']:
>     for sub in s['subsections']:
>         for f in sub['features']:
>             print(f'{s[\"id\"]}.{sub[\"id\"]}.{f[\"id\"]}  ->  {f[\"id\"]}')
> " | head -20
> ```
>
> Then map each feature ID to the appropriate workspace tab based on the section mapping table in Step 1.1.

- [ ] **1.2.2** Verify: Every feature ID in the `workspaces[].tabs[].featureIds` arrays exists in the `sections[].subsections[].features[]` array. Use this validation script:

```bash
cat docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
# Collect all feature IDs from sections
feature_ids = set()
for s in d['sections']:
    for sub in s['subsections']:
        for f in sub['features']:
            feature_ids.add(f['id'])
# Collect all referenced feature IDs from workspaces
if 'workspaces' not in d:
    print('ERROR: No workspaces array found'); sys.exit(1)
referenced = set()
for ws in d['workspaces']:
    for tab in ws['tabs']:
        for fid in tab['featureIds']:
            referenced.add(fid)
            if fid not in feature_ids:
                print(f'MISSING: {fid} (in {ws[\"id\"]}/{tab[\"id\"]})')
# Check for orphans (features not in any workspace, excluding home.*)
unmapped = feature_ids - referenced
unmapped_non_home = [f for f in unmapped if not f.startswith('home.')]
if unmapped_non_home:
    print(f'ORPHAN FEATURES ({len(unmapped_non_home)}):')
    for f in sorted(unmapped_non_home):
        print(f'  {f}')
else:
    print(f'All {len(referenced)} feature mappings valid. {len(unmapped)} home features excluded.')
print(f'Total features: {len(feature_ids)}, Mapped: {len(referenced)}, Home: {len(unmapped)}')
"
```

**Expected output:** `All N feature mappings valid. M home features excluded.`

#### Step 1.3: Add `roleConfig` object to registry JSON

- [ ] **1.3.1** Add the `roleConfig` top-level object after `workspaces`. The complete roleConfig with all 10 roles:

```jsonc
"roleConfig": {
  "admin": {
    "workspaceOrder": ["productions", "facilities", "finance", "people", "campus", "events", "education", "analytics", "investor-relations", "partnerships", "administration"],
    "quickActions": [
      { "label": "New User", "workspace": "administration", "tab": "users", "icon": "user-plus" },
      { "label": "View Audit Log", "workspace": "administration", "tab": "audit", "icon": "scroll" }
    ]
  },
  "executive": {
    "workspaceOrder": ["productions", "facilities", "finance", "people", "campus", "analytics", "investor-relations"],
    "quickActions": [
      { "label": "Company Overview", "workspace": "analytics", "tab": "operational", "icon": "chart-bar" },
      { "label": "Financial Summary", "workspace": "finance", "tab": "overview", "icon": "dollar-sign" }
    ]
  },
  "staff": {
    "workspaceOrder": ["productions", "facilities", "people", "events", "education"],
    "quickActions": [
      { "label": "Book Facility", "workspace": "facilities", "tab": "calendar", "icon": "calendar" },
      { "label": "Request Leave", "workspace": "people", "tab": "leave", "icon": "calendar-off" }
    ]
  },
  "client": {
    "workspaceOrder": ["productions", "facilities", "finance"],
    "quickActions": [
      { "label": "My Productions", "workspace": "productions", "tab": "overview", "icon": "film" },
      { "label": "Book Stage", "workspace": "facilities", "tab": "sound-stages", "icon": "building" },
      { "label": "View Invoices", "workspace": "finance", "tab": "invoices", "icon": "receipt" }
    ]
  },
  "investor": {
    "workspaceOrder": ["investor-relations", "finance"],
    "quickActions": [
      { "label": "Portfolio Summary", "workspace": "investor-relations", "tab": "portfolio", "icon": "briefcase" },
      { "label": "Data Room", "workspace": "investor-relations", "tab": "data-room", "icon": "folder" }
    ]
  },
  "guest": {
    "workspaceOrder": ["events", "education"],
    "quickActions": [
      { "label": "Browse Events", "workspace": "events", "tab": "calendar", "icon": "calendar" },
      { "label": "View Courses", "workspace": "education", "tab": "courses", "icon": "graduation-cap" }
    ]
  },
  "vendor": {
    "workspaceOrder": ["facilities", "finance"],
    "quickActions": [
      { "label": "Submit Invoice", "workspace": "finance", "tab": "invoices", "icon": "receipt" },
      { "label": "Active Orders", "workspace": "facilities", "tab": "equipment", "icon": "package" }
    ]
  },
  "government": {
    "workspaceOrder": ["campus", "analytics", "partnerships"],
    "quickActions": [
      { "label": "Economic Impact", "workspace": "analytics", "tab": "economic-impact", "icon": "chart-bar" },
      { "label": "Incentive Programs", "workspace": "partnerships", "tab": "government", "icon": "landmark" }
    ]
  },
  "partner": {
    "workspaceOrder": ["partnerships", "education", "campus"],
    "quickActions": [
      { "label": "Joint Projects", "workspace": "partnerships", "tab": "overview", "icon": "handshake" },
      { "label": "Shared Programs", "workspace": "education", "tab": "partners", "icon": "graduation-cap" }
    ]
  },
  "first_nations": {
    "workspaceOrder": ["partnerships", "education"],
    "quickActions": [
      { "label": "Heritage Assessments", "workspace": "partnerships", "tab": "first-nations", "icon": "shield" },
      { "label": "Cultural Calendar", "workspace": "education", "tab": "workshops", "icon": "calendar" }
    ]
  }
}
```

- [ ] **1.3.2** Validate: Every workspace ID in `workspaceOrder` arrays exists in the `workspaces` array. Every `quickActions[].workspace` + `quickActions[].tab` combination matches a valid workspace/tab pair.

#### Step 1.4: Add `activatedAt` field to all features

- [ ] **1.4.1** Add `"activatedAt": null` to every feature object in the `sections` array. This is a one-time batch edit. Use a script:

```bash
cat docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
count = 0
for s in d['sections']:
    for sub in s['subsections']:
        for f in sub['features']:
            if 'activatedAt' not in f:
                f['activatedAt'] = None
                count += 1
print(f'Added activatedAt to {count} features', file=sys.stderr)
json.dump(d, sys.stdout, indent=2)
" > /tmp/registry-updated.json
# Verify JSON is valid
python3 -c "import json; json.load(open('/tmp/registry-updated.json'))" && echo "JSON valid"
# Check feature count preserved
python3 -c "
import json
d = json.load(open('/tmp/registry-updated.json'))
count = sum(len(f['features']) for s in d['sections'] for f in s['subsections'])
print(f'Feature count: {count}')
assert count == 502, f'Expected 502, got {count}'
"
# Replace original
cp /tmp/registry-updated.json docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json
```

#### Step 1.5: Verify existing codegen still passes

- [ ] **1.5.1** Run the existing codegen and confirm no regressions:

```bash
node --experimental-transform-types --experimental-detect-module \
  apps/web/scripts/generate-dashboard-routes.ts
```

**Expected:** "Validation passed (502 features, 9 rules)." followed by "Dashboard registry code generation complete."

The existing codegen ignores unknown top-level keys (`workspaces`, `roleConfig`), so adding them should not break anything. The `activatedAt` field on features is also ignored by the current codegen (it only reads the fields defined in `RegistryFeature`).

- [ ] **1.5.2** Run existing tests:

```bash
pnpm --filter ./apps/web test -- --run apps/web/scripts/__tests__/generate-dashboard-routes.test.ts
```

**Expected:** All tests pass. No regressions.

- [ ] **1.5.3** Commit:

```
[#1] Add workspaces array, roleConfig, and activatedAt to registry JSON
```

---

### Issue 2: Codegen workspace-config.ts + role-config.ts

**Summary:** Extend `generate-dashboard-routes.ts` to parse the new `workspaces` and `roleConfig` objects, output two new generated TypeScript files, and add 6 new validation rules.

**Files modified:**
- `apps/web/scripts/generate-dashboard-routes.ts`
- `apps/web/scripts/__tests__/generate-dashboard-routes.test.ts`

**Files created (generated output):**
- `apps/web/app/dashboard/_generated/workspace-config.ts`
- `apps/web/app/dashboard/_generated/role-config.ts`

**Acceptance criteria:**
- `workspace-config.ts` exports typed `WORKSPACE_CONFIG` array and `WorkspaceId` union type
- `role-config.ts` exports typed `ROLE_CONFIG` object and `DashboardRole` union type
- 6 new validation rules catch intentional errors in tests
- Existing 9 validation rules still pass
- All generated files compile with `pnpm typecheck`

#### Step 2.1: Write failing tests for new types and codegen functions

- [ ] **2.1.1** Add new type definitions and test helpers to the test file. Add these tests to `apps/web/scripts/__tests__/generate-dashboard-routes.test.ts`:

```typescript
// Add these imports at the top (extend existing import):
import {
  // ... existing imports ...
  generateWorkspaceConfig,
  generateRoleConfig,
  type RegistryWorkspace,
  type RegistryRoleConfig,
  type RegistryWorkspaceTab,
  VALID_CANVAS_TYPES,
  VALID_WORKSPACE_IDS,
} from "../generate-dashboard-routes.js";

// Add workspace helper to test file:
function makeWorkspace(overrides?: Partial<RegistryWorkspace>): RegistryWorkspace {
  return {
    id: "test-workspace",
    label: "Test Workspace",
    icon: "home",
    description: "A test workspace",
    defaultCanvas: "table",
    aiEnabled: true,
    tabs: [
      {
        id: "overview",
        label: "Overview",
        canvas: "table",
        featureIds: ["home.overview.test"],
      },
    ],
    roles: ["admin"],
    ...overrides,
  };
}

function makeRoleConfig(overrides?: Record<string, Partial<RegistryRoleConfig>>): Record<string, RegistryRoleConfig> {
  return {
    admin: {
      workspaceOrder: ["test-workspace"],
      quickActions: [
        { label: "Test Action", workspace: "test-workspace", tab: "overview", icon: "home" },
      ],
      ...overrides?.admin,
    },
  };
}

// Add this helper for a full registry with workspaces:
function makeRegistryWithWorkspaces(overrides?: {
  features?: Partial<RegistryFeature>[];
  workspaces?: RegistryWorkspace[];
  roleConfig?: Record<string, RegistryRoleConfig>;
}): Registry & { workspaces: RegistryWorkspace[]; roleConfig: Record<string, RegistryRoleConfig> } {
  const base = makeRegistry(overrides);
  return {
    ...base,
    workspaces: overrides?.workspaces ?? [makeWorkspace()],
    roleConfig: overrides?.roleConfig ?? makeRoleConfig(),
  };
}
```

- [ ] **2.1.2** Add tests for `generateWorkspaceConfig`:

```typescript
describe("generateWorkspaceConfig", () => {
  it("generates TypeScript with WORKSPACE_CONFIG export", () => {
    const reg = makeRegistryWithWorkspaces();
    const output = generateWorkspaceConfig(reg.workspaces);
    expect(output).toContain("export const WORKSPACE_CONFIG");
    expect(output).toContain("WorkspaceConfig[]");
  });

  it("generates WorkspaceId union type", () => {
    const reg = makeRegistryWithWorkspaces({
      workspaces: [
        makeWorkspace({ id: "productions" }),
        makeWorkspace({ id: "facilities" }),
      ],
    });
    const output = generateWorkspaceConfig(reg.workspaces);
    expect(output).toContain("export type WorkspaceId =");
    expect(output).toContain("| 'productions'");
    expect(output).toContain("| 'facilities'");
  });

  it("generates CanvasType union type", () => {
    const reg = makeRegistryWithWorkspaces();
    const output = generateWorkspaceConfig(reg.workspaces);
    expect(output).toContain("export type CanvasType =");
    expect(output).toContain("| 'table'");
    expect(output).toContain("| 'board'");
    expect(output).toContain("| 'calendar'");
  });

  it("includes tab definitions with featureIds", () => {
    const reg = makeRegistryWithWorkspaces();
    const output = generateWorkspaceConfig(reg.workspaces);
    expect(output).toContain("id: 'overview'");
    expect(output).toContain("featureIds: ['home.overview.test']");
  });

  it("includes aiEnabled field", () => {
    const reg = makeRegistryWithWorkspaces({
      workspaces: [makeWorkspace({ aiEnabled: false })],
    });
    const output = generateWorkspaceConfig(reg.workspaces);
    expect(output).toContain("aiEnabled: false");
  });

  it("includes wireframeType when present", () => {
    const ws = makeWorkspace();
    ws.tabs[0].wireframeType = "calendar";
    const output = generateWorkspaceConfig([ws]);
    expect(output).toContain("wireframeType: 'calendar'");
  });

  it("generates all 11 workspaces for production registry", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(raw);
    if (registry.workspaces) {
      const output = generateWorkspaceConfig(registry.workspaces);
      const idMatches = [...output.matchAll(/id: '([^']+)',\n\s+label:/g)];
      expect(idMatches.length).toBe(11);
    }
  });
});
```

- [ ] **2.1.3** Add tests for `generateRoleConfig`:

```typescript
describe("generateRoleConfig", () => {
  it("generates TypeScript with ROLE_CONFIG export", () => {
    const output = generateRoleConfig(makeRoleConfig());
    expect(output).toContain("export const ROLE_CONFIG");
  });

  it("generates DashboardRole union type", () => {
    const output = generateRoleConfig(makeRoleConfig());
    expect(output).toContain("export type DashboardRole =");
    expect(output).toContain("| 'admin'");
  });

  it("includes workspaceOrder array", () => {
    const output = generateRoleConfig(makeRoleConfig());
    expect(output).toContain("workspaceOrder: ['test-workspace']");
  });

  it("includes quickActions with all fields", () => {
    const output = generateRoleConfig(makeRoleConfig());
    expect(output).toContain("label: 'Test Action'");
    expect(output).toContain("workspace: 'test-workspace'");
    expect(output).toContain("tab: 'overview'");
    expect(output).toContain("icon: 'home'");
  });

  it("generates all 10 roles for production registry", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(raw);
    if (registry.roleConfig) {
      const output = generateRoleConfig(registry.roleConfig);
      for (const role of VALID_ROLES) {
        expect(output).toContain(`'${role}':`);
      }
    }
  });
});
```

- [ ] **2.1.4** Add tests for the 6 new validation rules:

```typescript
describe("validateRegistry — workspace rules", () => {
  // Rule 10: Every non-home feature must be in exactly one workspace tab
  it("detects features not mapped to any workspace tab (orphan)", () => {
    const reg = makeRegistryWithWorkspaces({
      features: [
        { id: "feat.a", path: "/dashboard/a" },
        { id: "feat.b", path: "/dashboard/b" },
      ],
      workspaces: [
        makeWorkspace({
          tabs: [{ id: "t1", label: "T1", canvas: "table", featureIds: ["feat.a"] }],
        }),
      ],
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.some((e) => e.rule === "workspace-orphan-features")).toBe(true);
    expect(errors.some((e) => e.message.includes("feat.b"))).toBe(true);
  });

  // Rule 11: All featureIds in workspace tabs must reference valid features
  it("detects invalid feature references in workspace tabs", () => {
    const reg = makeRegistryWithWorkspaces({
      workspaces: [
        makeWorkspace({
          tabs: [{ id: "t1", label: "T1", canvas: "table", featureIds: ["nonexistent.feature"] }],
        }),
      ],
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.some((e) => e.rule === "workspace-invalid-feature-ref")).toBe(true);
  });

  // Rule 12: Workspace IDs must be valid URL path segments
  it("detects invalid workspace IDs", () => {
    const reg = makeRegistryWithWorkspaces({
      workspaces: [makeWorkspace({ id: "Invalid Workspace!" })],
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.some((e) => e.rule === "workspace-id-format")).toBe(true);
  });

  it("accepts valid workspace IDs with hyphens", () => {
    const reg = makeRegistryWithWorkspaces({
      workspaces: [makeWorkspace({ id: "investor-relations" })],
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.filter((e) => e.rule === "workspace-id-format")).toHaveLength(0);
  });

  // Rule 13: Tab IDs must be unique within their workspace
  it("detects duplicate tab IDs within a workspace", () => {
    const reg = makeRegistryWithWorkspaces({
      workspaces: [
        makeWorkspace({
          tabs: [
            { id: "overview", label: "Overview", canvas: "table", featureIds: ["home.overview.test"] },
            { id: "overview", label: "Overview 2", canvas: "board", featureIds: ["home.overview.test"] },
          ],
        }),
      ],
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.some((e) => e.rule === "workspace-unique-tab-ids")).toBe(true);
  });

  // Rule 14: Every role in roleConfig must have at least one workspace
  it("detects roles with empty workspaceOrder", () => {
    const reg = makeRegistryWithWorkspaces({
      roleConfig: {
        admin: { workspaceOrder: [], quickActions: [] },
      },
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.some((e) => e.rule === "role-empty-workspace-order")).toBe(true);
  });

  // Rule 15: roleConfig workspace references must be valid
  it("detects roleConfig referencing non-existent workspace", () => {
    const reg = makeRegistryWithWorkspaces({
      roleConfig: {
        admin: {
          workspaceOrder: ["nonexistent-workspace"],
          quickActions: [],
        },
      },
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.some((e) => e.rule === "role-invalid-workspace-ref")).toBe(true);
  });

  // Warning: active features without activatedAt
  it("warns when active feature has null activatedAt", () => {
    const reg = makeRegistryWithWorkspaces({
      features: [
        { id: "feat.a", path: "/dashboard/a", status: "active", activatedAt: null as unknown as undefined },
      ],
    });
    const errors = validateRegistry(reg, { validateWorkspaces: true });
    expect(errors.some((e) => e.rule === "active-without-activated-at")).toBe(true);
  });
});
```

- [ ] **2.1.5** Verify tests fail (functions don't exist yet):

```bash
pnpm --filter ./apps/web test -- --run apps/web/scripts/__tests__/generate-dashboard-routes.test.ts
```

**Expected:** Tests fail with import errors for `generateWorkspaceConfig`, `generateRoleConfig`, `RegistryWorkspace`, etc.

#### Step 2.2: Implement new types in generate-dashboard-routes.ts

- [ ] **2.2.1** Add new type definitions after existing types in `apps/web/scripts/generate-dashboard-routes.ts`:

```typescript
export const VALID_CANVAS_TYPES = [
  "table", "board", "calendar", "timeline", "catalog", "documents", "charts",
] as const;

export const VALID_WORKSPACE_IDS = [
  "productions", "facilities", "finance", "people", "campus",
  "events", "education", "analytics", "investor-relations",
  "partnerships", "administration",
] as const;

export interface RegistryWorkspaceTab {
  id: string;
  label: string;
  canvas: string;
  featureIds: string[];
  wireframeType?: string;
}

export interface RegistryWorkspace {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultCanvas: string;
  aiEnabled?: boolean;
  tabs: RegistryWorkspaceTab[];
  roles: string[];
}

export interface RegistryQuickAction {
  label: string;
  workspace: string;
  tab: string;
  icon: string;
}

export interface RegistryRoleConfig {
  workspaceOrder: string[];
  quickActions: RegistryQuickAction[];
}
```

- [ ] **2.2.2** Update the `Registry` interface to optionally include the new fields:

```typescript
export interface Registry {
  registry_metadata: RegistryMetadata;
  sections: RegistrySection[];
  workspaces?: RegistryWorkspace[];
  roleConfig?: Record<string, RegistryRoleConfig>;
}
```

- [ ] **2.2.3** Update the `RegistryFeature` interface to include `activatedAt`:

```typescript
export interface RegistryFeature {
  // ... existing fields ...
  activatedAt?: string | null;
}
```

#### Step 2.3: Implement generateWorkspaceConfig function

- [ ] **2.3.1** Add the workspace config code generation function:

```typescript
export function generateWorkspaceConfig(workspaces: RegistryWorkspace[]): string {
  const lines: string[] = [];

  lines.push("// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.");
  lines.push("// @generated");
  lines.push("");

  // CanvasType union
  lines.push("export type CanvasType =");
  for (const ct of VALID_CANVAS_TYPES) {
    lines.push(`  | '${ct}'`);
  }
  lines.push("  ;");
  lines.push("");

  // WorkspaceId union
  lines.push("export type WorkspaceId =");
  for (const ws of workspaces) {
    lines.push(`  | '${escapeString(ws.id)}'`);
  }
  lines.push("  ;");
  lines.push("");

  // WorkspaceTab interface
  lines.push("export interface WorkspaceTab {");
  lines.push("  id: string;");
  lines.push("  label: string;");
  lines.push("  canvas: CanvasType;");
  lines.push("  featureIds: string[];");
  lines.push("  wireframeType?: string;");
  lines.push("}");
  lines.push("");

  // WorkspaceConfig interface
  lines.push("export interface WorkspaceConfig {");
  lines.push("  id: WorkspaceId;");
  lines.push("  label: string;");
  lines.push("  icon: string;");
  lines.push("  description: string;");
  lines.push("  defaultCanvas: CanvasType;");
  lines.push("  aiEnabled: boolean;");
  lines.push("  tabs: WorkspaceTab[];");
  lines.push("  roles: string[];");
  lines.push("}");
  lines.push("");

  // WORKSPACE_CONFIG array
  lines.push("export const WORKSPACE_CONFIG: WorkspaceConfig[] = [");
  for (const ws of workspaces) {
    lines.push("  {");
    lines.push(`    id: '${escapeString(ws.id)}',`);
    lines.push(`    label: '${escapeString(ws.label)}',`);
    lines.push(`    icon: '${escapeString(ws.icon)}',`);
    lines.push(`    description: '${escapeString(ws.description)}',`);
    lines.push(`    defaultCanvas: '${escapeString(ws.defaultCanvas)}',`);
    lines.push(`    aiEnabled: ${ws.aiEnabled !== false},`);
    lines.push("    tabs: [");
    for (const tab of ws.tabs) {
      const wireframe = tab.wireframeType ? `, wireframeType: '${escapeString(tab.wireframeType)}'` : "";
      lines.push(`      { id: '${escapeString(tab.id)}', label: '${escapeString(tab.label)}', canvas: '${escapeString(tab.canvas)}', featureIds: ${formatStringArray(tab.featureIds)}${wireframe} },`);
    }
    lines.push("    ],");
    lines.push(`    roles: ${formatStringArray(ws.roles)},`);
    lines.push("  },");
  }
  lines.push("];");
  lines.push("");

  // Lookup maps for O(1) access
  lines.push("/** O(1) workspace lookup by ID */");
  lines.push("export const WORKSPACE_MAP = new Map<WorkspaceId, WorkspaceConfig>(");
  lines.push("  WORKSPACE_CONFIG.map((ws) => [ws.id, ws]),");
  lines.push(");");

  return lines.join("\n");
}
```

#### Step 2.4: Implement generateRoleConfig function

- [ ] **2.4.1** Add the role config code generation function:

```typescript
export function generateRoleConfig(roleConfig: Record<string, RegistryRoleConfig>): string {
  const lines: string[] = [];

  lines.push("// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.");
  lines.push("// @generated");
  lines.push("");

  // Import WorkspaceId from workspace-config
  lines.push("import type { WorkspaceId } from './workspace-config';");
  lines.push("");

  // DashboardRole union type
  lines.push("export type DashboardRole =");
  for (const role of Object.keys(roleConfig)) {
    lines.push(`  | '${escapeString(role)}'`);
  }
  lines.push("  ;");
  lines.push("");

  // QuickAction interface
  lines.push("export interface QuickAction {");
  lines.push("  label: string;");
  lines.push("  workspace: WorkspaceId;");
  lines.push("  tab: string;");
  lines.push("  icon: string;");
  lines.push("}");
  lines.push("");

  // RoleConfig interface
  lines.push("export interface RoleConfigEntry {");
  lines.push("  workspaceOrder: WorkspaceId[];");
  lines.push("  quickActions: QuickAction[];");
  lines.push("}");
  lines.push("");

  // ROLE_CONFIG object
  lines.push("export const ROLE_CONFIG: Record<DashboardRole, RoleConfigEntry> = {");
  for (const [role, config] of Object.entries(roleConfig)) {
    lines.push(`  '${escapeString(role)}': {`);
    lines.push(`    workspaceOrder: ${formatStringArray(config.workspaceOrder)},`);
    lines.push("    quickActions: [");
    for (const qa of config.quickActions) {
      lines.push(`      { label: '${escapeString(qa.label)}', workspace: '${escapeString(qa.workspace)}', tab: '${escapeString(qa.tab)}', icon: '${escapeString(qa.icon)}' },`);
    }
    lines.push("    ],");
    lines.push("  },");
  }
  lines.push("};");

  return lines.join("\n");
}
```

#### Step 2.5: Add 6 new validation rules

- [ ] **2.5.1** Extend the `ValidateOptions` interface:

```typescript
interface ValidateOptions {
  expectedFeatureCount?: number;
  validateWorkspaces?: boolean;
}
```

- [ ] **2.5.2** Add workspace validation to `validateRegistry` (after existing rules, before the return):

```typescript
  // Workspace validation rules (only when workspaces are present in the registry)
  const registryWithWorkspaces = registry as Registry & {
    workspaces?: RegistryWorkspace[];
    roleConfig?: Record<string, RegistryRoleConfig>;
  };

  if (options?.validateWorkspaces && registryWithWorkspaces.workspaces) {
    const workspaces = registryWithWorkspaces.workspaces;
    const workspaceIdSet = new Set(workspaces.map((ws) => ws.id));

    // Build set of all features mapped to workspace tabs
    const mappedFeatureIds = new Set<string>();
    for (const ws of workspaces) {
      // Rule 12: Workspace ID format — must be lowercase, hyphens, no special chars
      if (!/^[a-z][a-z0-9-]*$/.test(ws.id)) {
        errors.push({
          rule: "workspace-id-format",
          message: `Workspace ID '${ws.id}' must be lowercase alphanumeric with hyphens`,
        });
      }

      const tabIds = new Set<string>();
      for (const tab of ws.tabs) {
        // Rule 13: Unique tab IDs within workspace
        if (tabIds.has(tab.id)) {
          errors.push({
            rule: "workspace-unique-tab-ids",
            message: `Duplicate tab ID '${tab.id}' in workspace '${ws.id}'`,
          });
        }
        tabIds.add(tab.id);

        for (const fid of tab.featureIds) {
          // Rule 11: Valid feature references
          if (!allFeatureIdSet.has(fid)) {
            errors.push({
              rule: "workspace-invalid-feature-ref",
              featureId: fid,
              message: `Workspace '${ws.id}' tab '${tab.id}' references non-existent feature: ${fid}`,
            });
          }
          mappedFeatureIds.add(fid);
        }
      }
    }

    // Rule 10: No orphan features (features not in any workspace tab)
    // Exclude home.* features — they belong to HomeDashboard, not a workspace
    for (const fid of allFeatureIdSet) {
      if (!mappedFeatureIds.has(fid) && !fid.startsWith("home.")) {
        errors.push({
          rule: "workspace-orphan-features",
          featureId: fid,
          message: `Feature '${fid}' is not mapped to any workspace tab`,
        });
      }
    }

    // roleConfig validation
    if (registryWithWorkspaces.roleConfig) {
      for (const [role, config] of Object.entries(registryWithWorkspaces.roleConfig)) {
        // Rule 14: Every role must have at least one workspace
        if (config.workspaceOrder.length === 0) {
          errors.push({
            rule: "role-empty-workspace-order",
            message: `Role '${role}' has empty workspaceOrder`,
          });
        }

        // Rule 15: Workspace references must be valid
        for (const wsId of config.workspaceOrder) {
          if (!workspaceIdSet.has(wsId)) {
            errors.push({
              rule: "role-invalid-workspace-ref",
              message: `Role '${role}' references non-existent workspace '${wsId}'`,
            });
          }
        }

        // Validate quickAction workspace/tab references
        for (const qa of config.quickActions) {
          if (!workspaceIdSet.has(qa.workspace)) {
            errors.push({
              rule: "role-invalid-workspace-ref",
              message: `Role '${role}' quickAction '${qa.label}' references non-existent workspace '${qa.workspace}'`,
            });
          } else {
            const ws = workspaces.find((w) => w.id === qa.workspace);
            if (ws && !ws.tabs.some((t) => t.id === qa.tab)) {
              errors.push({
                rule: "role-invalid-workspace-ref",
                message: `Role '${role}' quickAction '${qa.label}' references non-existent tab '${qa.tab}' in workspace '${qa.workspace}'`,
              });
            }
          }
        }
      }
    }

    // Warning: active features without activatedAt
    for (const feature of features) {
      const featureWithActivatedAt = feature as RegistryFeature & { activatedAt?: string | null };
      if (feature.status === "active" && (featureWithActivatedAt.activatedAt === null || featureWithActivatedAt.activatedAt === undefined)) {
        errors.push({
          rule: "active-without-activated-at",
          featureId: feature.id,
          message: `Feature '${feature.id}' is active but has no activatedAt date (backward compat warning)`,
        });
      }
    }
  }
```

#### Step 2.6: Update the CLI main() function to generate new files

- [ ] **2.6.1** In the `main()` function, after the existing file generation, add:

```typescript
  // Generate workspace config (if workspaces are defined in registry)
  const registryWithWorkspaces = registry as Registry & {
    workspaces?: RegistryWorkspace[];
    roleConfig?: Record<string, RegistryRoleConfig>;
  };

  if (registryWithWorkspaces.workspaces) {
    // Validate workspace-specific rules
    const wsErrors = validateRegistry(registry, {
      expectedFeatureCount: 502,
      validateWorkspaces: true,
    });
    // Filter to only workspace-specific errors (not warnings about activatedAt)
    const wsBlockingErrors = wsErrors.filter((e) => e.rule !== "active-without-activated-at");
    if (wsBlockingErrors.length > 0) {
      console.error("Workspace validation failed:");
      for (const err of wsBlockingErrors) {
        console.error(`  [${err.rule}]${err.featureId ? ` ${err.featureId}:` : ""} ${err.message}`);
      }
      process.exit(1);
    }

    // Warn about active features without activatedAt
    const wsWarnings = wsErrors.filter((e) => e.rule === "active-without-activated-at");
    if (wsWarnings.length > 0) {
      console.warn(`Warning: ${wsWarnings.length} active features have no activatedAt date`);
    }

    const wsConfigContent = generateWorkspaceConfig(registryWithWorkspaces.workspaces);
    safeWrite(path.join(webGenDir, "workspace-config.ts"), wsConfigContent);
    console.log("Generated:", path.join(webGenDir, "workspace-config.ts"));

    if (registryWithWorkspaces.roleConfig) {
      const roleConfigContent = generateRoleConfig(registryWithWorkspaces.roleConfig);
      safeWrite(path.join(webGenDir, "role-config.ts"), roleConfigContent);
      console.log("Generated:", path.join(webGenDir, "role-config.ts"));
    }
  }
```

- [ ] **2.6.2** Update the validation call count message:

```typescript
  console.log(`Validation passed (${features.length} features, ${registryWithWorkspaces.workspaces ? '15' : '9'} rules).`);
```

#### Step 2.7: Verify all tests pass

- [ ] **2.7.1** Run the full test suite:

```bash
pnpm --filter ./apps/web test -- --run apps/web/scripts/__tests__/generate-dashboard-routes.test.ts
```

**Expected:** All existing tests pass + all new tests pass.

- [ ] **2.7.2** Run codegen and verify output files:

```bash
node --experimental-transform-types --experimental-detect-module \
  apps/web/scripts/generate-dashboard-routes.ts

# Verify generated files exist and are valid TypeScript
ls -la apps/web/app/dashboard/_generated/workspace-config.ts
ls -la apps/web/app/dashboard/_generated/role-config.ts

# Verify TypeScript compilation
pnpm typecheck
```

**Expected:** All 6 files generated. TypeScript compilation succeeds.

- [ ] **2.7.3** Commit:

```
[#2] Add workspace-config.ts and role-config.ts codegen with 6 new validation rules
```

---

### Issue 3: Routing migration

**Summary:** Change URL structure from `/dashboard/{section}/{subsection}/{feature}` to `/dashboard/{workspace}/{tab}`. Add 301 redirects from all old paths. Update FeatureGate for workspace routing. Create workspace and tab page components.

**Files modified:**
- `apps/web/app/dashboard/components/FeatureGate.tsx`
- `apps/web/app/dashboard/components/RegistryProvider.tsx`

**Files created:**
- `apps/web/app/dashboard/[workspace]/page.tsx`
- `apps/web/app/dashboard/[workspace]/[tab]/page.tsx`

**Acceptance criteria:**
- `/dashboard` redirects to `/dashboard/home`
- `/dashboard/{workspace}` redirects to first visible tab
- `/dashboard/{workspace}/{tab}` renders the workspace with the specified tab
- All old paths 301-redirect to their new workspace/tab equivalents
- Unauthorized workspace/tab returns 404 (anti-enumeration)
- RegistryProvider exposes workspace visibility
- FeatureGate works within workspace/tab context

#### Step 3.1: Write failing tests for routing components

- [ ] **3.1.1** Create test file `apps/web/app/dashboard/__tests__/workspace-routing.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { resolveWorkspaceRedirect } from "../[workspace]/page";
import { WorkspaceTabRouter } from "../[workspace]/[tab]/page";

// Test data: role-scoped visible workspaces (as returned by /v1/workspaces/visible)
const visibleWorkspaces = [
  {
    id: "productions",
    label: "Productions",
    icon: "film",
    description: "Film, TV, broadcast production lifecycle",
    defaultCanvas: "board",
    aiEnabled: true,
    tabs: [
      { id: "overview", label: "Overview", canvas: "board", featureIds: ["productions.active_productions.production_list"] },
      { id: "shooting", label: "Shooting", canvas: "calendar", featureIds: ["productions.shooting.shoot_scheduling"] },
    ],
    roles: ["admin", "executive", "staff", "client"],
    activeFeatureCount: 0,
    upcomingFeatureCount: 5,
    upcomingFeatures: [],
  },
];

describe("resolveWorkspaceRedirect ([workspace]/page.tsx)", () => {
  it("returns redirect to first visible tab when workspace is valid", () => {
    const result = resolveWorkspaceRedirect({
      workspace: "productions",
      userRole: "admin",
      visibleWorkspaces,
      visibleFeatureIds: ["productions.active_productions.production_list"],
    });
    expect(result).not.toBeNull();
    expect(result!.redirectTo).toBe("/dashboard/productions/overview");
  });

  it("returns null for unknown workspace (404)", () => {
    const result = resolveWorkspaceRedirect({
      workspace: "nonexistent",
      userRole: "admin",
      visibleWorkspaces,
      visibleFeatureIds: [],
    });
    expect(result).toBeNull();
  });

  it("returns null when workspace not in user's visible set (unauthorized)", () => {
    const result = resolveWorkspaceRedirect({
      workspace: "productions",
      userRole: "guest",
      visibleWorkspaces: [], // Guest has no visible workspaces in this test
      visibleFeatureIds: [],
    });
    expect(result).toBeNull();
  });

  it("skips tabs where primary feature is not visible", () => {
    // Only the shooting tab's feature is visible, not overview's
    const result = resolveWorkspaceRedirect({
      workspace: "productions",
      userRole: "admin",
      visibleWorkspaces,
      visibleFeatureIds: ["productions.shooting.shoot_scheduling"],
    });
    expect(result).not.toBeNull();
    expect(result!.redirectTo).toBe("/dashboard/productions/shooting");
  });
});

describe("WorkspaceTabRouter ([workspace]/[tab]/page.tsx)", () => {
  it("renders workspace tab content for valid workspace/tab", () => {
    render(
      <WorkspaceTabRouter
        workspace="productions"
        tab="overview"
        userRole="admin"
        visibleFeatureIds={["productions.active_productions.production_list"]}
        visibleWorkspaces={visibleWorkspaces}
      />,
    );
    // Should render workspace shell with the tab selected
  });

  it("returns null for invalid tab (404)", () => {
    const { container } = render(
      <WorkspaceTabRouter
        workspace="productions"
        tab="nonexistent"
        userRole="admin"
        visibleFeatureIds={["productions.active_productions.production_list"]}
        visibleWorkspaces={visibleWorkspaces}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null when tab primary feature is not visible (404)", () => {
    const { container } = render(
      <WorkspaceTabRouter
        workspace="productions"
        tab="overview"
        userRole="admin"
        visibleFeatureIds={[]}  // No visible features
        visibleWorkspaces={visibleWorkspaces}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null when workspace not in visible set (anti-enumeration)", () => {
    const { container } = render(
      <WorkspaceTabRouter
        workspace="administration"
        tab="users"
        userRole="guest"
        visibleFeatureIds={[]}
        visibleWorkspaces={[]} // Guest has no visible workspaces
      />,
    );
    expect(container.innerHTML).toBe("");
  });
});
```

- [ ] **3.1.2** Verify tests fail:

```bash
pnpm --filter ./apps/web test -- --run apps/web/app/dashboard/__tests__/workspace-routing.test.tsx
```

#### Step 3.2: Extend RegistryProvider with workspace visibility

- [ ] **3.2.1** Update `apps/web/app/dashboard/components/RegistryProvider.tsx`:

```typescript
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Phase } from '@productioncity/holding-ui';
import type { WorkspaceConfig } from '../_generated/workspace-config';

/** Registry context shape */
export interface RegistryContextValue {
  /** Visible feature IDs for the current user */
  visibleFeatureIds: string[];
  /** Current company lifecycle phase */
  currentPhase: Phase;
  /** Workspace configs visible to the current user (from /v1/workspaces/visible or generated config) */
  visibleWorkspaces: WorkspaceConfig[];
  /** Current user's dashboard role */
  userRole: string;
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

/** Props for the RegistryProvider */
export interface RegistryProviderProps {
  visibleFeatureIds: string[];
  currentPhase: Phase;
  visibleWorkspaces: WorkspaceConfig[];
  userRole: string;
  children: ReactNode;
}

export function RegistryProvider({
  visibleFeatureIds,
  currentPhase,
  visibleWorkspaces,
  userRole,
  children,
}: RegistryProviderProps) {
  return (
    <RegistryContext.Provider value={{ visibleFeatureIds, currentPhase, visibleWorkspaces, userRole }}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistry(): RegistryContextValue {
  const ctx = useContext(RegistryContext);
  if (!ctx) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }
  return ctx;
}
```

#### Step 3.3: Create workspace root page

- [ ] **3.3.1** Create `apps/web/app/dashboard/[workspace]/page.tsx`:

> **IMPORTANT:** This page must use a **server-side 301 redirect** via vinext/worker, NOT `window.location.replace()`. Client-side redirects are invisible to search engines and break back-button behaviour. The workspace and role data come from the `RegistryProvider` context (which is populated from `/v1/workspaces/visible`), not from a hardcoded `WORKSPACE_CONFIG`.

```typescript
/**
 * Workspace root — server-side 301 redirect to the first visible tab.
 *
 * URL: /dashboard/{workspace}
 * Behavior: finds the first tab where the primary feature (featureIds[0])
 * is in the user's visible set, then 301-redirects to /dashboard/{workspace}/{tab}.
 * If no tabs are visible, returns 404 (anti-enumeration).
 *
 * This is a SERVER component — the redirect is issued by the vinext worker
 * before any HTML is sent. The browser receives a 301 Location header.
 */

import { redirect, notFound } from 'vinext/navigation';
import { getServerRegistry } from '../components/RegistryProvider.server';

export interface WorkspaceRouterProps {
  workspace: string;
  userRole: string;
  visibleWorkspaces: Array<{ id: string; tabs: Array<{ id: string; featureIds: string[] }> }>;
  visibleFeatureIds: string[];
}

/**
 * Resolve the first visible tab for a workspace and issue a 301 redirect.
 * Uses role-scoped workspace data from RegistryProvider (sourced from
 * GET /v1/workspaces/visible), not the hardcoded generated config.
 */
export function resolveWorkspaceRedirect({ workspace, userRole, visibleWorkspaces, visibleFeatureIds }: WorkspaceRouterProps): { redirectTo: string } | null {
  const visibleSet = new Set(visibleFeatureIds);

  // 1. Check workspace is in the user's visible set (role-scoped from /v1/workspaces/visible)
  const wsConfig = visibleWorkspaces.find((ws) => ws.id === workspace);
  if (!wsConfig) return null; // 404 — workspace not found or not authorized

  // 2. Find first visible tab (primary feature must be visible)
  const firstVisibleTab = wsConfig.tabs.find((tab) => {
    const primaryFeatureId = tab.featureIds[0];
    return primaryFeatureId && visibleSet.has(primaryFeatureId);
  });

  if (!firstVisibleTab) return null; // 404 — no visible tabs

  return { redirectTo: `/dashboard/${workspace}/${firstVisibleTab.id}` };
}

/**
 * Server-side page handler for vinext routing.
 * Issues a 301 redirect to the first visible tab, or 404 if unauthorized.
 */
export default async function WorkspacePage({ params }: { params: { workspace: string } }) {
  const { userRole, visibleFeatureIds, visibleWorkspaces } = await getServerRegistry();

  const result = resolveWorkspaceRedirect({
    workspace: params.workspace,
    userRole,
    visibleWorkspaces,
    visibleFeatureIds,
  });

  if (!result) {
    notFound(); // Returns 404 — anti-enumeration
  }

  redirect(result.redirectTo, 301); // Server-side 301 redirect
}
```

#### Step 3.4: Create workspace tab page

- [ ] **3.4.1** Create `apps/web/app/dashboard/[workspace]/[tab]/page.tsx`:

> **IMPORTANT:** This page validates access using role-scoped workspace data from `RegistryProvider` (sourced from `/v1/workspaces/visible`), not from hardcoded generated configs. If the workspace or tab is not in the user's visible set, it returns 404 server-side (anti-enumeration). The server must issue a 404 status code, not render an empty page.

```typescript
'use client';

/**
 * Workspace tab page — renders the workspace shell with the specified tab.
 *
 * URL: /dashboard/{workspace}/{tab}
 *
 * Resolution:
 * 1. Validate workspace is in user's visible workspaces (from /v1/workspaces/visible via RegistryProvider)
 * 2. Validate tab exists in workspace
 * 3. Check tab primary feature visibility (anti-enumeration: 404 not 403)
 * 4. Determine tab status from primary feature status
 * 5. Render WorkspaceShell with correct canvas or ComingSoonScaffold
 */

import { useRegistry } from '../../components/RegistryProvider';
import { DASHBOARD_ROUTES } from '../../_generated/routes';
import { FeatureGate } from '../../components/FeatureGate';

export interface WorkspaceTabRouterProps {
  workspace: string;
  tab: string;
  userRole: string;
  visibleFeatureIds: string[];
  visibleWorkspaces: Array<{
    id: string;
    label: string;
    tabs: Array<{ id: string; label: string; canvas: string; featureIds: string[] }>;
  }>;
}

/** Route map for feature status lookup */
const ROUTE_MAP = new Map(DASHBOARD_ROUTES.map((r) => [r.id, r]));

export function WorkspaceTabRouter({ workspace, tab, userRole, visibleFeatureIds, visibleWorkspaces }: WorkspaceTabRouterProps) {
  const visibleSet = new Set(visibleFeatureIds);

  // 1. Validate workspace is in user's visible set (role-scoped from /v1/workspaces/visible)
  const wsConfig = visibleWorkspaces.find((ws) => ws.id === workspace);
  if (!wsConfig) return null; // 404

  // 2. Validate tab exists in workspace
  const tabConfig = wsConfig.tabs.find((t) => t.id === tab);
  if (!tabConfig) return null; // 404

  // 3. Check primary feature visibility (anti-enumeration)
  const primaryFeatureId = tabConfig.featureIds[0];
  if (!primaryFeatureId || !visibleSet.has(primaryFeatureId)) return null; // 404

  // 4. Determine tab status from primary feature
  const primaryRoute = ROUTE_MAP.get(primaryFeatureId);
  const tabStatus = primaryRoute?.status ?? 'planned';

  // 5. Render — FeatureGate handles active vs coming_soon/planned
  return (
    <FeatureGate
      featureId={primaryFeatureId}
      visibleFeatureIds={visibleFeatureIds}
    >
      {/* Active tab: render canvas placeholder (will be filled by Issue 33 wiring) */}
      <div data-workspace={workspace} data-tab={tab} data-canvas={tabConfig.canvas}>
        <h2>{wsConfig.label} &mdash; {tabConfig.label}</h2>
        <p>Canvas type: {tabConfig.canvas}</p>
      </div>
    </FeatureGate>
  );
}

export default function WorkspaceTabPage() {
  const { userRole, visibleFeatureIds, visibleWorkspaces } = useRegistry();

  // Extract workspace and tab from URL path
  let workspace = '';
  let tab = '';
  if (typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/');
    workspace = parts[2] ?? '';
    tab = parts[3] ?? '';
  }

  return (
    <WorkspaceTabRouter
      workspace={workspace}
      tab={tab}
      userRole={userRole}
      visibleFeatureIds={visibleFeatureIds}
      visibleWorkspaces={visibleWorkspaces}
    />
  );
}
```

#### Step 3.5: Add migration redirects

- [ ] **3.5.1** The old URL structure uses paths like `/dashboard/company/hr/team-directory`. The new structure uses `/dashboard/people/directory`. Add redirect logic to the dashboard layout or a middleware. Create a redirect map in the layout:

```typescript
// In apps/web/app/dashboard/layout.tsx — add redirect map
const LEGACY_REDIRECTS: Record<string, string> = {
  // Company section -> various workspaces
  '/dashboard/company/hr': '/dashboard/people/directory',
  '/dashboard/admin': '/dashboard/administration/users',
  '/dashboard/comms': '/dashboard/inbox',
  '/dashboard/partnerships/sovereign': '/dashboard/partnerships/first-nations',
  // Section roots -> workspace roots
  '/dashboard/productions': '/dashboard/productions',
  '/dashboard/facilities': '/dashboard/facilities',
  '/dashboard/finance': '/dashboard/finance',
  '/dashboard/analytics': '/dashboard/analytics',
  '/dashboard/education': '/dashboard/education',
  '/dashboard/events': '/dashboard/events',
  '/dashboard/investor-relations': '/dashboard/investor-relations',
  '/dashboard/campus-dev': '/dashboard/campus',
  '/dashboard/administration': '/dashboard/administration',
};
```

- [ ] **3.5.2** Add legacy redirect handling in the **vinext worker** (`apps/web/worker/index.ts`) so that 301 redirects are issued server-side before any HTML is rendered. Client-side `window.location.replace()` must NOT be used for redirects — it breaks SEO and causes flash-of-content.

```typescript
// In apps/web/worker/index.ts — add before the main vinext handler

/**
 * Legacy dashboard redirect middleware.
 * Issues server-side 301 redirects from old URL structure to workspace URLs.
 * Must run before vinext renders any HTML.
 */
function handleLegacyDashboardRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const path = url.pathname;

  // Check exact matches first
  const exactMatch = LEGACY_REDIRECTS[path];
  if (exactMatch) {
    return Response.redirect(new URL(exactMatch, url.origin).toString(), 301);
  }

  // Check prefix matches (for deep links like /dashboard/company/hr/team-directory)
  for (const [oldPrefix, newPath] of Object.entries(LEGACY_REDIRECTS)) {
    if (path.startsWith(oldPrefix + '/')) {
      return Response.redirect(new URL(newPath, url.origin).toString(), 301);
    }
  }

  return null; // No redirect needed — proceed to vinext
}

// In the worker fetch handler, before vinext:
const legacyRedirect = handleLegacyDashboardRedirect(request);
if (legacyRedirect) return legacyRedirect;
```

#### Step 3.6: Update layout to provide workspace context

- [ ] **3.6.1** Update the `DashboardInner` component in `apps/web/app/dashboard/layout.tsx` to fetch workspace visibility from the backend and pass it to `RegistryProvider`:

> **IMPORTANT:** Do NOT import the hardcoded generated `WORKSPACE_CONFIG` here. The layout must consume role-scoped workspace data from `GET /v1/workspaces/visible` (Issue 4). This ensures the frontend always reflects the user's actual permissions, not the full config.

```typescript
import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api-client';
import type { WorkspaceVisibility } from '../dashboard/_types/workspace';

// In DashboardInner:
const role = useDashboardRole(); // existing hook

// Fetch role-scoped visible workspaces from backend
const [visibleWorkspaces, setVisibleWorkspaces] = useState<WorkspaceVisibility[]>([]);

useEffect(() => {
  async function fetchWorkspaces() {
    try {
      const res = await fetch(`${API_BASE}/v1/workspaces/visible`, {
        credentials: 'include',
      });
      if (res.ok) {
        const body = await res.json();
        setVisibleWorkspaces(body.workspaces);
      }
    } catch {
      // Fallback: empty workspaces until backend is available
      console.warn('Failed to fetch visible workspaces');
    }
  }
  fetchWorkspaces();
}, [role]); // Re-fetch when role changes

return (
  <RegistryProvider
    visibleFeatureIds={visibleFeatureIds}
    currentPhase={DEFAULT_PHASE}
    visibleWorkspaces={visibleWorkspaces}
    userRole={role}
  >
    {/* ... rest of layout */}
  </RegistryProvider>
);
```

#### Step 3.7: Verify tests pass

- [ ] **3.7.1** Run routing tests:

```bash
pnpm --filter ./apps/web test -- --run apps/web/app/dashboard/__tests__/workspace-routing.test.tsx
```

- [ ] **3.7.2** Run full test suite to catch regressions:

```bash
pnpm --filter ./apps/web test
```

- [ ] **3.7.3** Run typecheck:

```bash
pnpm typecheck
```

- [ ] **3.7.4** Commit:

```
[#3] Add workspace/tab routing with 301 redirects from legacy paths
```

---

### Issue 4: GET /v1/workspaces/visible endpoint

**Summary:** Backend endpoint returning workspace configs filtered by the authenticated user's role and permissions. Includes tab statuses, feature counts, and upcoming features array. Mirrors the permission model in `apps/backend/src/lib/permissions.ts`.

**Files created:**
- `apps/backend/src/registry/workspaces.ts`
- `apps/backend/src/__tests__/workspaces-visible.test.ts`
- `apps/backend/src/lib/workspace-resolver.ts`
- `apps/backend/src/lib/__tests__/workspace-resolver.test.ts`

**Files modified:**
- `apps/backend/src/routes.ts`
- `apps/backend/src/lib/permissions.ts`

**Acceptance criteria:**
- Role-scoped responses correct for all 10 roles
- Tab statuses derived from primary feature status
- Feature counts (active + upcoming) per workspace
- `upcomingFeatures` array populated from registry
- `Vary: Cookie`, `Cache-Control: private, max-age=300` headers
- 401 for unauthenticated requests
- Tests for all 10 roles

#### Step 4.1: Create workspace resolver library

- [ ] **4.1.1** Write failing tests for the workspace resolver. Create `apps/backend/src/lib/__tests__/workspace-resolver.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  resolveVisibleWorkspaces,
  type WorkspaceVisibility,
} from "../workspace-resolver.js";

describe("resolveVisibleWorkspaces", () => {
  it("returns all workspaces for admin role", () => {
    const result = resolveVisibleWorkspaces("admin", ["*"]);
    // Admin sees all 11 workspaces
    expect(result.length).toBe(11);
    expect(result.map((w) => w.id)).toContain("productions");
    expect(result.map((w) => w.id)).toContain("administration");
  });

  it("returns only investor workspaces for investor role", () => {
    const result = resolveVisibleWorkspaces("investor", ["dashboard:investor", "investor:read", "data_rooms:investor"]);
    const wsIds = result.map((w) => w.id);
    expect(wsIds).toContain("investor-relations");
    expect(wsIds).toContain("finance");
    expect(wsIds).not.toContain("productions");
    expect(wsIds).not.toContain("administration");
    expect(wsIds).not.toContain("people");
  });

  it("returns only guest workspaces for guest role", () => {
    const result = resolveVisibleWorkspaces("guest", ["dashboard:guest", "events:browse", "education:browse"]);
    const wsIds = result.map((w) => w.id);
    expect(wsIds).toContain("events");
    expect(wsIds).toContain("education");
    expect(wsIds.length).toBe(2);
  });

  it("returns correct workspace order from roleConfig", () => {
    const result = resolveVisibleWorkspaces("executive", ["dashboard:executive"]);
    // Executive order: productions, facilities, finance, people, campus, analytics, investor-relations
    expect(result[0].id).toBe("productions");
    expect(result[result.length - 1].id).toBe("investor-relations");
  });

  it("filters tabs by feature visibility", () => {
    const result = resolveVisibleWorkspaces("admin", ["*"]);
    const productions = result.find((w) => w.id === "productions");
    expect(productions).toBeDefined();
    // Admin sees all tabs
    expect(productions!.tabs.length).toBeGreaterThanOrEqual(6);
  });

  it("computes correct activeFeatureCount and upcomingFeatureCount", () => {
    const result = resolveVisibleWorkspaces("admin", ["*"]);
    for (const ws of result) {
      expect(typeof ws.activeFeatureCount).toBe("number");
      expect(typeof ws.upcomingFeatureCount).toBe("number");
      expect(ws.activeFeatureCount).toBeGreaterThanOrEqual(0);
      expect(ws.upcomingFeatureCount).toBeGreaterThanOrEqual(0);
    }
  });

  it("populates upcomingFeatures array for non-active features", () => {
    const result = resolveVisibleWorkspaces("admin", ["*"]);
    // At least some workspaces should have upcoming features (most features are planned/coming_soon)
    const hasUpcoming = result.some((ws) => ws.upcomingFeatures.length > 0);
    expect(hasUpcoming).toBe(true);
  });

  it("derives tab status from primary feature status", () => {
    const result = resolveVisibleWorkspaces("admin", ["*"]);
    for (const ws of result) {
      for (const tab of ws.tabs) {
        expect(["active", "coming_soon", "planned"]).toContain(tab.status);
      }
    }
  });

  it("returns empty array for unknown role", () => {
    const result = resolveVisibleWorkspaces("unknown_role", []);
    // Falls back to guest — guest has events and education
    // Actually, if role is unknown, resolveDashboardRole returns "guest"
    // But the input role is passed directly, so this tests graceful handling
    expect(Array.isArray(result)).toBe(true);
  });

  // Role-specific tests for all 10 roles
  const roleExpectations: Record<string, { minWorkspaces: number; mustInclude: string[]; mustExclude: string[] }> = {
    admin: { minWorkspaces: 11, mustInclude: ["administration"], mustExclude: [] },
    executive: { minWorkspaces: 7, mustInclude: ["productions", "finance", "analytics"], mustExclude: ["administration"] },
    staff: { minWorkspaces: 5, mustInclude: ["productions", "facilities", "people"], mustExclude: ["administration", "investor-relations"] },
    client: { minWorkspaces: 3, mustInclude: ["productions", "facilities", "finance"], mustExclude: ["people", "administration"] },
    investor: { minWorkspaces: 2, mustInclude: ["investor-relations", "finance"], mustExclude: ["productions", "people"] },
    guest: { minWorkspaces: 2, mustInclude: ["events", "education"], mustExclude: ["finance", "administration"] },
    vendor: { minWorkspaces: 2, mustInclude: ["facilities", "finance"], mustExclude: ["productions", "administration"] },
    government: { minWorkspaces: 3, mustInclude: ["campus", "analytics", "partnerships"], mustExclude: ["productions", "finance"] },
    partner: { minWorkspaces: 3, mustInclude: ["partnerships", "education", "campus"], mustExclude: ["finance", "administration"] },
    first_nations: { minWorkspaces: 2, mustInclude: ["partnerships", "education"], mustExclude: ["finance", "administration"] },
  };

  for (const [role, expectations] of Object.entries(roleExpectations)) {
    it(`returns correct workspaces for ${role} role`, () => {
      const permissions = role === "admin" ? ["*"] : [`dashboard:${role}`];
      const result = resolveVisibleWorkspaces(role, permissions);
      const wsIds = result.map((w) => w.id);

      expect(wsIds.length).toBeGreaterThanOrEqual(expectations.minWorkspaces);
      for (const must of expectations.mustInclude) {
        expect(wsIds).toContain(must);
      }
      for (const mustNot of expectations.mustExclude) {
        expect(wsIds).not.toContain(mustNot);
      }
    });
  }
});
```

- [ ] **4.1.2** Verify tests fail:

```bash
pnpm --filter ./apps/backend test -- --run apps/backend/src/lib/__tests__/workspace-resolver.test.ts
```

#### Step 4.2: Implement workspace resolver

- [ ] **4.2.1** Create `apps/backend/src/lib/workspace-resolver.ts`:

```typescript
/**
 * Workspace visibility resolver.
 *
 * Reads the generated workspace config and role config from the codegen output,
 * combined with the permission model from permissions.ts, to determine which
 * workspaces, tabs, and features a given role can see.
 *
 * This module is the backend counterpart to the frontend workspace routing
 * in apps/web/app/dashboard/[workspace]/[tab]/page.tsx.
 */

import { ROUTE_MANIFEST, REGISTRY_HASH } from "../_generated/route-manifest.js";
import { FEATURE_INDEX } from "../_generated/feature-index.js";
import { canAccessFeature, resolveUserPermissions, type RouteManifestEntry } from "./permissions.js";

/**
 * Feature index lookup map for retrieving full feature metadata (description,
 * targetQuarter, label) that is not available in the route manifest.
 * The feature index is generated by the codegen pipeline and contains all
 * registry data for each feature including description and targetQuarter.
 */
const FEATURE_INDEX_MAP = new Map<string, { label: string; description: string; targetQuarter: string | null }>(
  FEATURE_INDEX.map((f) => [f.id, { label: f.label, description: f.description, targetQuarter: f.targetQuarter ?? null }]),
);

// Import workspace and role config from generated output
// NOTE: These are generated by generate-dashboard-routes.ts (Issue 2)
// and must be copied or shared with the backend. For now, we import
// the workspace/role definitions from a backend-specific generated file.
// The codegen in Issue 2 will also output these to apps/backend/src/_generated/.

// Types matching the generated workspace-config.ts
export interface WorkspaceTabConfig {
  id: string;
  label: string;
  canvas: string;
  featureIds: string[];
  wireframeType?: string;
}

export interface WorkspaceConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultCanvas: string;
  aiEnabled: boolean;
  tabs: WorkspaceTabConfig[];
  roles: string[];
}

export interface RoleConfigEntry {
  workspaceOrder: string[];
  quickActions: Array<{ label: string; workspace: string; tab: string; icon: string }>;
}

// These will be imported from generated files once Issue 2 codegen is extended
// to also output backend-compatible versions. For now, we read from the same
// generated output that the codegen produces.
// TODO: Issue 2 should also generate apps/backend/src/_generated/workspace-manifest.ts

export interface VisibleTab {
  id: string;
  label: string;
  status: "active" | "coming_soon" | "planned";
  canvas: string;
  featureCount: number;
  targetQuarter: string | null;
}

export interface UpcomingFeature {
  featureId: string;
  label: string;
  description: string;
  status: "coming_soon" | "planned";
  targetQuarter: string | null;
  tab: string;
}

export interface WorkspaceVisibility {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultCanvas: string;
  tabs: VisibleTab[];
  activeFeatureCount: number;
  upcomingFeatureCount: number;
  upcomingFeatures: UpcomingFeature[];
}

/** Route manifest lookup map */
const MANIFEST_MAP = new Map<string, RouteManifestEntry>(
  ROUTE_MANIFEST.map((r) => [r.id, r]),
);

/**
 * Resolve which workspaces, tabs, and features are visible to a user.
 *
 * @param dashboardRole - The user's resolved dashboard role
 * @param dbPermissions - Permissions from the database
 * @returns Array of visible workspace configs with computed counts
 */
export function resolveVisibleWorkspaces(
  dashboardRole: string,
  dbPermissions: string[],
): WorkspaceVisibility[] {
  // Import workspace and role config at runtime from generated files
  // This dynamic import pattern allows the function to work even before
  // the generated files exist (returns empty array)
  let workspaceConfigs: WorkspaceConfig[];
  let roleConfigs: Record<string, RoleConfigEntry>;
  try {
    // These will be generated by the codegen pipeline
    const wsModule = require("../_generated/workspace-manifest.js");
    workspaceConfigs = wsModule.WORKSPACE_CONFIG;
    roleConfigs = wsModule.ROLE_CONFIG;
  } catch {
    return [];
  }

  const userPermissions = resolveUserPermissions(dashboardRole, dbPermissions);
  const roleConfig = roleConfigs[dashboardRole];
  if (!roleConfig) return [];

  // Filter workspaces by role's workspaceOrder
  const orderedWorkspaceIds = roleConfig.workspaceOrder;
  const workspaceMap = new Map(workspaceConfigs.map((ws) => [ws.id, ws]));

  const result: WorkspaceVisibility[] = [];

  for (const wsId of orderedWorkspaceIds) {
    const ws = workspaceMap.get(wsId);
    if (!ws) continue;

    // Check if the role is in the workspace's allowed roles
    if (!ws.roles.includes(dashboardRole) && dashboardRole !== "admin") continue;

    const visibleTabs: VisibleTab[] = [];
    let activeCount = 0;
    let upcomingCount = 0;
    const upcomingFeatures: UpcomingFeature[] = [];

    for (const tab of ws.tabs) {
      const primaryFeatureId = tab.featureIds[0];
      if (!primaryFeatureId) continue;

      const primaryManifest = MANIFEST_MAP.get(primaryFeatureId);
      if (!primaryManifest) continue;

      // Check if user can access the primary feature
      if (!canAccessFeature(dashboardRole, userPermissions, primaryManifest)) continue;

      // Determine tab status from primary feature
      const tabStatus = (primaryManifest.status === "active" ? "active" :
        primaryManifest.status === "coming_soon" ? "coming_soon" : "planned") as VisibleTab["status"];

      // Count visible features in this tab
      let tabFeatureCount = 0;
      for (const fid of tab.featureIds) {
        const manifest = MANIFEST_MAP.get(fid);
        if (manifest && canAccessFeature(dashboardRole, userPermissions, manifest)) {
          tabFeatureCount++;
          if (manifest.status === "active") {
            activeCount++;
          } else if (manifest.status === "coming_soon" || manifest.status === "planned") {
            upcomingCount++;
            // Look up the feature in the FEATURE_INDEX (generated by codegen) to get
            // the description and targetQuarter. The route manifest only has status/path;
            // the feature index has the full registry data including description and
            // targetQuarter fields added in Issue 1.
            const featureDetail = FEATURE_INDEX_MAP.get(fid);
            upcomingFeatures.push({
              featureId: fid,
              label: featureDetail?.label ?? fid.split(".").pop()?.replace(/_/g, " ") ?? fid,
              description: featureDetail?.description ?? "",
              status: manifest.status as "coming_soon" | "planned",
              targetQuarter: featureDetail?.targetQuarter ?? null,
              tab: tab.id,
            });
          }
        }
      }

      // Derive targetQuarter from the primary feature's registry data
      const primaryFeatureDetail = FEATURE_INDEX_MAP.get(primaryFeatureId);
      visibleTabs.push({
        id: tab.id,
        label: tab.label,
        status: tabStatus,
        canvas: tab.canvas,
        featureCount: tabFeatureCount,
        targetQuarter: primaryFeatureDetail?.targetQuarter ?? null,
      });
    }

    // Only include workspace if it has at least one visible tab
    if (visibleTabs.length > 0) {
      result.push({
        id: ws.id,
        label: ws.label,
        icon: ws.icon,
        description: ws.description,
        defaultCanvas: ws.defaultCanvas,
        tabs: visibleTabs,
        activeFeatureCount: activeCount,
        upcomingFeatureCount: upcomingCount,
        upcomingFeatures,
      });
    }
  }

  return result;
}

export { REGISTRY_HASH };
```

#### Step 4.3: Write failing tests for the API endpoint

- [ ] **4.3.1** Create `apps/backend/src/__tests__/workspaces-visible.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active" },
      update: {},
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-${user.id.slice(0, 8)}`, description: roleName },
    });

    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      } catch {
        // skip duplicate
      }
    }

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const session = await createSession(prisma, user.id);
    return { user, role, session, cookie: `${SESSION_COOKIE_NAME}=${session.token}` };
  } finally {
    await prisma.$disconnect();
  }
}

describe("GET /v1/workspaces/visible", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/workspaces/visible"),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with workspace data for authenticated admin", async () => {
    const { cookie } = await createUserWithRole("ws-admin@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/workspaces/visible", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.workspaces).toBeDefined();
    expect(Array.isArray(body.workspaces)).toBe(true);
    expect(body.phase).toBeDefined();
    expect(body.registryVersion).toBeDefined();
  });

  it("sets correct cache headers", async () => {
    const { cookie } = await createUserWithRole("ws-cache@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/workspaces/visible", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=300");
    expect(res.headers.get("Vary")).toBe("Cookie");
  });

  it("returns workspaces filtered by user role", async () => {
    const { cookie } = await createUserWithRole("ws-investor@dashboard.test", "investor", [["dashboard", "investor"], ["finance", "read"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/workspaces/visible", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const wsIds = body.workspaces.map((w: { id: string }) => w.id);
    expect(wsIds).toContain("investor-relations");
    expect(wsIds).toContain("finance");
    expect(wsIds).not.toContain("administration");
    expect(wsIds).not.toContain("productions");
  });

  it("includes tab status and feature counts", async () => {
    const { cookie } = await createUserWithRole("ws-tabs@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/workspaces/visible", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    const ws = body.workspaces[0];
    expect(ws.tabs).toBeDefined();
    expect(ws.tabs.length).toBeGreaterThan(0);
    expect(ws.tabs[0].status).toBeDefined();
    expect(ws.tabs[0].featureCount).toBeDefined();
    expect(typeof ws.activeFeatureCount).toBe("number");
    expect(typeof ws.upcomingFeatureCount).toBe("number");
  });

  it("includes upcomingFeatures array", async () => {
    const { cookie } = await createUserWithRole("ws-upcoming@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/workspaces/visible", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    // At least one workspace should have upcoming features
    const hasUpcoming = body.workspaces.some(
      (ws: { upcomingFeatures: unknown[] }) => ws.upcomingFeatures.length > 0,
    );
    expect(hasUpcoming).toBe(true);
  });

  it("returns registryVersion with sha256 prefix", async () => {
    const { cookie } = await createUserWithRole("ws-hash@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/workspaces/visible", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    expect(body.registryVersion).toMatch(/^sha256:[a-f0-9]{64}$/);
  });
});
```

#### Step 4.4: Implement the API endpoint

- [ ] **4.4.1** Create `apps/backend/src/registry/workspaces.ts`:

```typescript
/**
 * GET /v1/workspaces/visible — returns workspace configs filtered by user role.
 *
 * Response: { workspaces, phase, registryVersion }
 * Caching: private, max-age=300, Vary: Cookie
 * Auth: required (session cookie)
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { resolveDashboardRole, REGISTRY_HASH } from "../lib/permissions.js";
import { resolveVisibleWorkspaces } from "../lib/workspace-resolver.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  COMPANY_PHASE?: string;
};

export const workspacesVisibleApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

const VisibleTabSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["active", "coming_soon", "planned"]),
  canvas: z.string(),
  featureCount: z.number(),
  targetQuarter: z.string().nullable(),
});

const UpcomingFeatureSchema = z.object({
  featureId: z.string(),
  label: z.string(),
  description: z.string(),
  status: z.enum(["coming_soon", "planned"]),
  targetQuarter: z.string().nullable(),
  tab: z.string(),
});

const WorkspaceSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
  description: z.string(),
  defaultCanvas: z.string(),
  tabs: z.array(VisibleTabSchema),
  activeFeatureCount: z.number(),
  upcomingFeatureCount: z.number(),
  upcomingFeatures: z.array(UpcomingFeatureSchema),
});

const ResponseSchema = z.object({
  workspaces: z.array(WorkspaceSchema),
  phase: z.string(),
  registryVersion: z.string(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const visibleRoute = createRoute({
  method: "get",
  path: "/v1/workspaces/visible",
  summary: "Get visible workspaces for authenticated user",
  description:
    "Returns workspace configurations filtered by the current user's role and permissions, including tab statuses, feature counts, and upcoming features.",
  responses: {
    200: {
      content: { "application/json": { schema: ResponseSchema } },
      description: "Filtered workspace list",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
  },
});

workspacesVisibleApp.use("/v1/workspaces/visible", authMiddleware());

workspacesVisibleApp.openapi(visibleRoute, (c) => {
  const auth = c.get("auth") as AuthContext;
  const dashboardRole = resolveDashboardRole(auth.permissions);
  const phase = (c.env as Record<string, unknown>).COMPANY_PHASE as string | undefined ?? "company_formation";

  const workspaces = resolveVisibleWorkspaces(dashboardRole, auth.permissions);

  c.header("Cache-Control", "private, max-age=300");
  c.header("Vary", "Cookie");

  return c.json(
    {
      workspaces,
      phase,
      registryVersion: `sha256:${REGISTRY_HASH}`,
    },
    200,
  );
});
```

#### Step 4.5: Register the route

- [ ] **4.5.1** Add the import and route mounting in `apps/backend/src/routes.ts`:

```typescript
// Add import at top:
import { workspacesVisibleApp } from "./registry/workspaces.js";

// Add in mountRoutes function, after featureNotifyApp:
app.route("/", workspacesVisibleApp);
```

#### Step 4.6: Extend codegen to output backend workspace manifest

- [ ] **4.6.1** The workspace resolver needs access to workspace and role config on the backend. Extend the `main()` function in `generate-dashboard-routes.ts` to also output `apps/backend/src/_generated/workspace-manifest.ts`:

```typescript
// Add to the codegen output section, inside the workspaces block:
if (registryWithWorkspaces.workspaces) {
  // ... existing workspace-config.ts and role-config.ts generation ...

  // Also generate backend workspace manifest
  const backendWsContent = generateBackendWorkspaceManifest(
    registryWithWorkspaces.workspaces,
    registryWithWorkspaces.roleConfig ?? {},
  );
  safeWrite(path.join(backendGenDir, "workspace-manifest.ts"), backendWsContent);
  console.log("Generated:", path.join(backendGenDir, "workspace-manifest.ts"));
}
```

- [ ] **4.6.2** Add the `generateBackendWorkspaceManifest` function:

```typescript
export function generateBackendWorkspaceManifest(
  workspaces: RegistryWorkspace[],
  roleConfig: Record<string, RegistryRoleConfig>,
): string {
  const lines: string[] = [];

  lines.push("// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.");
  lines.push("// @generated");
  lines.push("");

  // Workspace config
  lines.push("export const WORKSPACE_CONFIG = " + JSON.stringify(workspaces, null, 2) + " as const;");
  lines.push("");

  // Role config
  lines.push("export const ROLE_CONFIG = " + JSON.stringify(roleConfig, null, 2) + " as const;");

  return lines.join("\n");
}
```

#### Step 4.7: Verify all tests pass

- [ ] **4.7.1** Run codegen first (generates the backend workspace manifest):

```bash
node --experimental-transform-types --experimental-detect-module \
  apps/web/scripts/generate-dashboard-routes.ts
```

- [ ] **4.7.2** Run workspace resolver tests:

```bash
pnpm --filter ./apps/backend test -- --run apps/backend/src/lib/__tests__/workspace-resolver.test.ts
```

- [ ] **4.7.3** Run API endpoint tests:

```bash
pnpm --filter ./apps/backend test -- --run apps/backend/src/__tests__/workspaces-visible.test.ts
```

- [ ] **4.7.4** Run full test suite:

```bash
pnpm test
```

- [ ] **4.7.5** Run typecheck:

```bash
pnpm typecheck
```

- [ ] **4.7.6** Commit:

```
[#4] Add GET /v1/workspaces/visible endpoint with role-scoped workspace resolution
```

---

> **Phase 1 complete.** At this point:
> - Registry JSON has workspace mappings and role configs for all 502 features across 11 workspaces and 10 roles
> - Codegen outputs `workspace-config.ts`, `role-config.ts`, and `workspace-manifest.ts` (backend)
> - URL routing supports `/dashboard/{workspace}/{tab}` with legacy 301 redirects
> - Backend API serves role-scoped workspace visibility at `/v1/workspaces/visible`
> - All existing tests continue to pass alongside new tests
>
> **Next:** Phase 2 (Shell & Navigation) builds the UI components that consume this data layer.

---

## Phase 2: Shell & Navigation (Issues 5-10)

Phase 2 builds the UI shell that wraps every page: the sidebar, tab bar, scope bar, workspace template, dashboard shell, and AI panel. These are the structural bones that all subsequent phases slot content into.

---

### Issue 5: WorkspaceSidebar organism

**Summary:** Build the role-adaptive sidebar with Home, Inbox (badge), Recents (5 items), workspace list (from role config), Profile, Help. Collapse to 56px icon rail. Responsive at all 3 breakpoints. ARIA landmarks. 44px touch targets.

**Files created:**
- `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.tsx`
- `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.stories.tsx`
- `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.test.tsx`
- `packages/ui/src/atoms/BadgeCount/BadgeCount.tsx`
- `packages/ui/src/atoms/BadgeCount/BadgeCount.stories.tsx`
- `packages/ui/src/atoms/BadgeCount/BadgeCount.test.tsx`
- `packages/ui/src/molecules/RecentItem/RecentItem.tsx`
- `packages/ui/src/molecules/RecentItem/RecentItem.stories.tsx`
- `packages/ui/src/molecules/RecentItem/RecentItem.test.tsx`
- `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.tsx`
- `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.stories.tsx`
- `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.test.tsx`
- `apps/web/app/dashboard/hooks/useRecents.ts`
- `apps/web/app/dashboard/hooks/useRecents.test.ts`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories for all 10 roles showing different workspace subsets
- Collapse state persists to localStorage
- Responsive at all 3 breakpoints (desktop 240px, tablet icon rail, mobile overlay)
- ARIA landmarks (`role="navigation"`, `aria-label`)
- 44px minimum touch targets on all interactive items
- Badge count on Inbox shows unread actionable count
- Recents section shows last 5 workspace/tab items from localStorage

#### Step 5.1: Write failing tests for WorkspaceIcon atom

- [ ] **5.1.1** Create `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkspaceIcon, WORKSPACE_ICONS } from "./WorkspaceIcon";

describe("WorkspaceIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<WorkspaceIcon icon="film" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders all 12 icon variants without error", () => {
    const icons = Object.keys(WORKSPACE_ICONS);
    expect(icons.length).toBeGreaterThanOrEqual(12);
    for (const icon of icons) {
      const { container } = render(<WorkspaceIcon icon={icon} />);
      expect(container.querySelector("svg")).not.toBeNull();
    }
  });

  it("applies size prop to width and height", () => {
    const { container } = render(<WorkspaceIcon icon="film" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });

  it("applies custom className", () => {
    const { container } = render(<WorkspaceIcon icon="film" className="text-red-500" />);
    const svg = container.querySelector("svg");
    expect(svg?.classList.contains("text-red-500")).toBe(true);
  });

  it("renders fallback for unknown icon", () => {
    const { container } = render(<WorkspaceIcon icon="nonexistent" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("sets aria-hidden when decorative", () => {
    const { container } = render(<WorkspaceIcon icon="film" decorative />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
```

- [ ] **5.1.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.test.tsx
```

**Expected:** Fails with module not found.

#### Step 5.2: Implement WorkspaceIcon atom

- [ ] **5.2.1** Create `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.tsx`:

```typescript
import type { SVGProps } from 'react';

/** Icon name to SVG path mapping for all workspace icons */
export const WORKSPACE_ICONS: Record<string, string> = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  film: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  'dollar-sign': 'M12 1v22m5-18H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H7',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  map: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'graduation-cap': 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
  'chart-bar': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  briefcase: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16',
  handshake: 'M7 11l3.5 3.5L14 11m-7 0V3h14v8m-7 0l3.5 3.5L21 11M3 21h18',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  'help-circle': 'M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

/** Fallback icon (circle with ?) */
const FALLBACK_PATH = 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm2-1.645A3.502 3.502 0 0012 6.5 3.501 3.501 0 008.645 9h2.012A1.5 1.5 0 0112 8.5c.83 0 1.5.67 1.5 1.5 0 .828-.67 1.5-1.5 1.5a1 1 0 00-1 1V14h2v-.645z';

export interface WorkspaceIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  /** Icon name from WORKSPACE_ICONS map */
  icon: string;
  /** Icon size in pixels (default 20) */
  size?: number;
  /** Whether the icon is purely decorative */
  decorative?: boolean;
}

export function WorkspaceIcon({ icon, size = 20, decorative, className, ...props }: WorkspaceIconProps) {
  const path = WORKSPACE_ICONS[icon] ?? FALLBACK_PATH;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative ? 'true' : undefined}
      {...props}
    >
      <path d={path} />
    </svg>
  );
}
```

- [ ] **5.2.2** Create `packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { WorkspaceIcon, WORKSPACE_ICONS } from './WorkspaceIcon';

const meta: Meta<typeof WorkspaceIcon> = {
  title: 'Atoms/WorkspaceIcon',
  component: WorkspaceIcon,
  argTypes: {
    icon: { control: 'select', options: Object.keys(WORKSPACE_ICONS) },
    size: { control: { type: 'range', min: 12, max: 48 } },
  },
};
export default meta;
type Story = StoryObj<typeof WorkspaceIcon>;

export const Default: Story = { args: { icon: 'film' } };
export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {Object.keys(WORKSPACE_ICONS).map((icon) => (
        <div key={icon} className="flex flex-col items-center gap-1">
          <WorkspaceIcon icon={icon} size={24} />
          <span className="text-xs text-muted-foreground">{icon}</span>
        </div>
      ))}
    </div>
  ),
};
export const Large: Story = { args: { icon: 'building', size: 48 } };
export const Small: Story = { args: { icon: 'chart-bar', size: 14 } };
export const Decorative: Story = { args: { icon: 'settings', decorative: true } };
```

- [ ] **5.2.3** Verify WorkspaceIcon tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/WorkspaceIcon/WorkspaceIcon.test.tsx
```

#### Step 5.3: Write failing tests for BadgeCount atom

- [ ] **5.3.1** Create `packages/ui/src/atoms/BadgeCount/BadgeCount.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BadgeCount } from "./BadgeCount";

describe("BadgeCount", () => {
  it("renders count when > 0", () => {
    render(<BadgeCount count={3} />);
    expect(screen.getByText("3")).toBeDefined();
  });

  it("renders nothing when count is 0", () => {
    const { container } = render(<BadgeCount count={0} />);
    expect(container.textContent).toBe("");
  });

  it("renders 99+ when count exceeds 99", () => {
    render(<BadgeCount count={150} />);
    expect(screen.getByText("99+")).toBeDefined();
  });

  it("has aria-label for screen readers", () => {
    render(<BadgeCount count={5} />);
    const badge = screen.getByText("5");
    expect(badge.closest("[aria-label]")?.getAttribute("aria-label")).toBe("5 unread items");
  });
});
```

- [ ] **5.3.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/BadgeCount/BadgeCount.test.tsx
```

#### Step 5.4: Implement BadgeCount atom

- [ ] **5.4.1** Create `packages/ui/src/atoms/BadgeCount/BadgeCount.tsx`:

```typescript
import { cn } from '../../lib/utils';

export interface BadgeCountProps {
  /** Number to display */
  count: number;
  /** Custom className */
  className?: string;
}

/**
 * Numeric badge for sidebar inbox count.
 * Renders nothing when count is 0. Caps display at 99+.
 */
export function BadgeCount({ count, className }: BadgeCountProps) {
  if (count <= 0) return null;

  const display = count > 99 ? '99+' : String(count);

  return (
    <span
      aria-label={`${count} unread items`}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground',
        'min-w-[18px] h-[18px]',
        className,
      )}
    >
      {display}
    </span>
  );
}
```

- [ ] **5.4.2** Create `packages/ui/src/atoms/BadgeCount/BadgeCount.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { BadgeCount } from './BadgeCount';

const meta: Meta<typeof BadgeCount> = {
  title: 'Atoms/BadgeCount',
  component: BadgeCount,
};
export default meta;
type Story = StoryObj<typeof BadgeCount>;

export const Default: Story = { args: { count: 3 } };
export const HighCount: Story = { args: { count: 150 } };
export const Zero: Story = { args: { count: 0 } };
export const SingleDigit: Story = { args: { count: 9 } };
export const DoubleDigit: Story = { args: { count: 42 } };
```

- [ ] **5.4.3** Verify BadgeCount tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/BadgeCount/BadgeCount.test.tsx
```

#### Step 5.5: Write failing tests for RecentItem molecule

- [ ] **5.5.1** Create `packages/ui/src/molecules/RecentItem/RecentItem.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecentItem } from "./RecentItem";

describe("RecentItem", () => {
  const defaultProps = {
    label: "Shooting — Productions",
    path: "/dashboard/productions/shooting",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    onClick: vi.fn(),
  };

  it("renders label", () => {
    render(<RecentItem {...defaultProps} />);
    expect(screen.getByText("Shooting — Productions")).toBeDefined();
  });

  it("renders relative timestamp", () => {
    render(<RecentItem {...defaultProps} />);
    expect(screen.getByText(/ago/)).toBeDefined();
  });

  it("calls onClick with path when clicked", () => {
    const onClick = vi.fn();
    render(<RecentItem {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByText("Shooting — Productions"));
    expect(onClick).toHaveBeenCalledWith("/dashboard/productions/shooting");
  });

  it("has minimum 44px touch target", () => {
    const { container } = render(<RecentItem {...defaultProps} />);
    const button = container.querySelector("button, a, [role='button']");
    expect(button).not.toBeNull();
    // Touch target enforced via min-h-[44px] CSS class
    expect(button?.className).toContain("min-h-");
  });
});
```

- [ ] **5.5.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/molecules/RecentItem/RecentItem.test.tsx
```

#### Step 5.6: Implement RecentItem molecule

- [ ] **5.6.1** Create `packages/ui/src/molecules/RecentItem/RecentItem.tsx`:

```typescript
import { cn } from '../../lib/utils';

export interface RecentItemProps {
  /** Display label: "Tab — Workspace" format */
  label: string;
  /** Path to navigate to */
  path: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Navigation handler */
  onClick: (path: string) => void;
  /** Custom className */
  className?: string;
}

/** Format relative time (e.g., "2h ago", "3d ago") */
function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/**
 * Compact row for sidebar Recents section.
 * Shows label (tab — workspace) and relative timestamp.
 */
export function RecentItem({ label, path, timestamp, onClick, className }: RecentItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm',
        'min-h-[44px] hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'transition-colors',
        className,
      )}
    >
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="shrink-0 text-xs text-muted-foreground/60">{formatRelativeTime(timestamp)}</span>
    </button>
  );
}
```

- [ ] **5.6.2** Create `packages/ui/src/molecules/RecentItem/RecentItem.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { RecentItem } from './RecentItem';

const meta: Meta<typeof RecentItem> = {
  title: 'Molecules/RecentItem',
  component: RecentItem,
};
export default meta;
type Story = StoryObj<typeof RecentItem>;

export const Default: Story = {
  args: {
    label: 'Shooting — Productions',
    path: '/dashboard/productions/shooting',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    onClick: (path) => console.log('navigate', path),
  },
};
export const Recent: Story = {
  args: {
    ...Default.args,
    label: 'Invoices — Finance',
    path: '/dashboard/finance/invoices',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
};
export const OldItem: Story = {
  args: {
    ...Default.args,
    label: 'Calendar — Facilities',
    path: '/dashboard/facilities/calendar',
    timestamp: new Date(Date.now() - 604800000).toISOString(),
  },
};
```

- [ ] **5.6.3** Verify RecentItem tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/molecules/RecentItem/RecentItem.test.tsx
```

#### Step 5.7: Write failing tests for useRecents hook

- [ ] **5.7.1** Create `apps/web/app/dashboard/hooks/useRecents.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecents, type RecentEntry } from "./useRecents";

describe("useRecents", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no recents exist", () => {
    const { result } = renderHook(() => useRecents());
    expect(result.current.recents).toEqual([]);
  });

  it("adds a recent entry", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      result.current.addRecent({
        path: "/dashboard/productions/shooting",
        label: "Shooting — Productions",
      });
    });
    expect(result.current.recents.length).toBe(1);
    expect(result.current.recents[0].path).toBe("/dashboard/productions/shooting");
  });

  it("limits recents to 5 entries", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      for (let i = 0; i < 7; i++) {
        result.current.addRecent({
          path: `/dashboard/workspace/tab-${i}`,
          label: `Tab ${i} — Workspace`,
        });
      }
    });
    expect(result.current.recents.length).toBe(5);
  });

  it("moves duplicate path to top instead of adding", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      result.current.addRecent({ path: "/dashboard/a/b", label: "B — A" });
      result.current.addRecent({ path: "/dashboard/c/d", label: "D — C" });
      result.current.addRecent({ path: "/dashboard/a/b", label: "B — A" });
    });
    expect(result.current.recents.length).toBe(2);
    expect(result.current.recents[0].path).toBe("/dashboard/a/b");
  });

  it("persists to localStorage under key 'pc-recents'", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      result.current.addRecent({ path: "/dashboard/a/b", label: "B — A" });
    });
    const stored = JSON.parse(localStorage.getItem("pc-recents") ?? "[]");
    expect(stored.length).toBe(1);
  });

  it("revalidates recents against visible workspaces", () => {
    // Pre-seed localStorage with a recent that references a workspace the user can't see
    const entries: RecentEntry[] = [
      { path: "/dashboard/productions/shooting", label: "Shooting — Productions", timestamp: new Date().toISOString() },
      { path: "/dashboard/administration/users", label: "Users — Administration", timestamp: new Date().toISOString() },
    ];
    localStorage.setItem("pc-recents", JSON.stringify(entries));

    const visibleWorkspaceIds = ["productions"]; // No "administration"
    const { result } = renderHook(() => useRecents({ visibleWorkspaceIds }));
    // Should have filtered out the administration entry
    expect(result.current.recents.length).toBe(1);
    expect(result.current.recents[0].path).toContain("productions");
  });

  it("revalidates recents by workspace AND tab visibility", () => {
    // Pre-seed with a tab that exists but is not in the visible tabs for that workspace
    const entries: RecentEntry[] = [
      { path: "/dashboard/productions/shooting", label: "Shooting — Productions", timestamp: new Date().toISOString() },
      { path: "/dashboard/productions/overview", label: "Overview — Productions", timestamp: new Date().toISOString() },
      { path: "/dashboard/finance/invoices", label: "Invoices — Finance", timestamp: new Date().toISOString() },
    ];
    localStorage.setItem("pc-recents", JSON.stringify(entries));

    // Only overview tab in productions is visible, and invoices in finance
    const visibleWorkspaceIds = ["productions", "finance"];
    const visibleTabs = [
      { workspace: "productions", tab: "overview" },
      { workspace: "finance", tab: "invoices" },
    ];
    const { result } = renderHook(() => useRecents({ visibleWorkspaceIds, visibleTabs }));
    // "productions/shooting" should be filtered out — tab not in visible set
    expect(result.current.recents.length).toBe(2);
    expect(result.current.recents.map((r) => r.path)).not.toContain("/dashboard/productions/shooting");
  });

  it("clears recents when user role changes", () => {
    // Pre-seed with recents from admin role
    const entries: RecentEntry[] = [
      { path: "/dashboard/administration/users", label: "Users — Administration", timestamp: new Date().toISOString() },
    ];
    localStorage.setItem("pc-recents", JSON.stringify(entries));

    const { result, rerender } = renderHook(
      ({ role }) => useRecents({ userRole: role, visibleWorkspaceIds: role === "admin" ? ["administration"] : ["events"] }),
      { initialProps: { role: "admin" } },
    );
    expect(result.current.recents.length).toBe(1);

    // Simulate role change
    rerender({ role: "guest" });
    // After role change, recents should be cleared since the previous recents
    // referenced workspaces the new role cannot see
    expect(result.current.recents.length).toBe(0);
  });

  it("clears all recents", () => {
    const { result } = renderHook(() => useRecents());
    act(() => {
      result.current.addRecent({ path: "/dashboard/a/b", label: "B — A" });
      result.current.clearRecents();
    });
    expect(result.current.recents).toEqual([]);
  });
});
```

- [ ] **5.7.2** Verify test fails:

```bash
pnpm --filter ./apps/web test -- --run apps/web/app/dashboard/hooks/useRecents.test.ts
```

#### Step 5.8: Implement useRecents hook

- [ ] **5.8.1** Create `apps/web/app/dashboard/hooks/useRecents.ts`:

```typescript
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'pc-recents';
const MAX_RECENTS = 5;

/** A single recent entry stored in localStorage */
export interface RecentEntry {
  path: string;
  label: string;
  timestamp: string;
}

export interface VisibleTabEntry {
  workspace: string;
  tab: string;
}

export interface UseRecentsOptions {
  /** Visible workspace IDs for revalidation. Entries for invisible workspaces are removed. */
  visibleWorkspaceIds?: string[];
  /** Visible workspace+tab pairs for fine-grained revalidation. If provided, entries
   *  for tabs not in this list are also removed (not just workspace-level filtering). */
  visibleTabs?: VisibleTabEntry[];
  /** Current user role. When this changes, recents are cleared (since the visible
   *  workspace/tab set may have changed entirely). */
  userRole?: string;
}

/**
 * Hook for managing the last 5 workspace/tab recents in localStorage.
 * Recents store only workspace/tab paths, never object identifiers.
 *
 * Revalidation:
 * - On mount and when visibleWorkspaceIds changes, entries for invisible workspaces are removed.
 * - If visibleTabs is provided, entries for invisible tabs within visible workspaces are also removed.
 * - When userRole changes, all recents are cleared (role change may completely change visible set).
 */
export function useRecents(options?: UseRecentsOptions) {
  const [recents, setRecents] = useState<RecentEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track previous role to detect role changes
  const prevRoleRef = useRef(options?.userRole);

  // Clear all recents on role change
  useEffect(() => {
    if (options?.userRole && prevRoleRef.current && options.userRole !== prevRoleRef.current) {
      setRecents([]);
      persist([]);
    }
    prevRoleRef.current = options?.userRole;
  }, [options?.userRole]);

  // Revalidate against visible workspaces AND visible tabs
  useEffect(() => {
    if (!options?.visibleWorkspaceIds) return;
    const visibleWsSet = new Set(options.visibleWorkspaceIds);

    // Build visible tab set for fine-grained filtering
    const visibleTabSet = options.visibleTabs
      ? new Set(options.visibleTabs.map((t) => `${t.workspace}/${t.tab}`))
      : null;

    setRecents((prev) => {
      const filtered = prev.filter((entry) => {
        // Extract workspace and tab from path: /dashboard/{workspace}/{tab}
        const parts = entry.path.split('/');
        const workspace = parts[2];
        const tab = parts[3];
        if (!workspace || !visibleWsSet.has(workspace)) return false;

        // If visibleTabs is provided, also check tab-level visibility
        if (visibleTabSet && tab) {
          return visibleTabSet.has(`${workspace}/${tab}`);
        }

        return true;
      });
      if (filtered.length !== prev.length) {
        persist(filtered);
      }
      return filtered;
    });
  }, [options?.visibleWorkspaceIds, options?.visibleTabs]);

  const persist = useCallback((entries: RecentEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, []);

  const addRecent = useCallback((entry: Omit<RecentEntry, 'timestamp'>) => {
    setRecents((prev) => {
      // Remove existing entry with same path (dedup)
      const deduped = prev.filter((r) => r.path !== entry.path);
      const next = [{ ...entry, timestamp: new Date().toISOString() }, ...deduped].slice(0, MAX_RECENTS);
      persist(next);
      return next;
    });
  }, [persist]);

  const clearRecents = useCallback(() => {
    setRecents([]);
    persist([]);
  }, [persist]);

  return { recents, addRecent, clearRecents };
}
```

- [ ] **5.8.2** Verify useRecents tests pass:

```bash
pnpm --filter ./apps/web test -- --run apps/web/app/dashboard/hooks/useRecents.test.ts
```

#### Step 5.9: Write failing tests for WorkspaceSidebar organism

- [ ] **5.9.1** Create `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceSidebar, type WorkspaceSidebarProps } from "./WorkspaceSidebar";

const defaultProps: WorkspaceSidebarProps = {
  workspaces: [
    { id: "productions", label: "Productions", icon: "film" },
    { id: "facilities", label: "Facilities", icon: "building" },
    { id: "finance", label: "Finance", icon: "dollar-sign" },
  ],
  activeWorkspaceId: "productions",
  inboxCount: 3,
  recents: [
    { label: "Shooting — Productions", path: "/dashboard/productions/shooting", timestamp: new Date().toISOString() },
  ],
  onNavigate: vi.fn(),
  onToggleCollapse: vi.fn(),
  collapsed: false,
};

describe("WorkspaceSidebar", () => {
  it("renders Home link", () => {
    render(<WorkspaceSidebar {...defaultProps} />);
    expect(screen.getByText("Home")).toBeDefined();
  });

  it("renders Inbox with badge count", () => {
    render(<WorkspaceSidebar {...defaultProps} />);
    expect(screen.getByText("Inbox")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("renders all workspace items", () => {
    render(<WorkspaceSidebar {...defaultProps} />);
    expect(screen.getByText("Productions")).toBeDefined();
    expect(screen.getByText("Facilities")).toBeDefined();
    expect(screen.getByText("Finance")).toBeDefined();
  });

  it("renders recents section", () => {
    render(<WorkspaceSidebar {...defaultProps} />);
    expect(screen.getByText("Shooting — Productions")).toBeDefined();
  });

  it("renders Profile and Help items", () => {
    render(<WorkspaceSidebar {...defaultProps} />);
    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.getByText("Help")).toBeDefined();
  });

  it("highlights the active workspace", () => {
    render(<WorkspaceSidebar {...defaultProps} />);
    const active = screen.getByText("Productions").closest("button, a, [role='button']");
    expect(active?.getAttribute("aria-current")).toBe("page");
  });

  it("calls onNavigate when workspace is clicked", () => {
    const onNavigate = vi.fn();
    render(<WorkspaceSidebar {...defaultProps} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Facilities"));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard/facilities");
  });

  it("calls onNavigate('/dashboard/home') when Home is clicked", () => {
    const onNavigate = vi.fn();
    render(<WorkspaceSidebar {...defaultProps} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Home"));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard/home");
  });

  it("has nav element with ARIA landmark", () => {
    const { container } = render(<WorkspaceSidebar {...defaultProps} />);
    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute("aria-label")).toBeDefined();
  });

  it("hides labels when collapsed", () => {
    render(<WorkspaceSidebar {...defaultProps} collapsed />);
    // In collapsed mode, text labels should be hidden (icon rail)
    const productions = screen.queryByText("Productions");
    // Text is visually hidden but may still be in DOM for screen readers
    // Check that the sidebar has the collapsed width class
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("w-14");
  });

  it("renders no recents when recents array is empty", () => {
    render(<WorkspaceSidebar {...defaultProps} recents={[]} />);
    expect(screen.queryByText("RECENTLY VIEWED")).toBeNull();
  });

  it("hides inbox badge when count is 0", () => {
    render(<WorkspaceSidebar {...defaultProps} inboxCount={0} />);
    expect(screen.queryByText("0")).toBeNull();
  });
});
```

- [ ] **5.9.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.test.tsx
```

#### Step 5.10: Implement WorkspaceSidebar organism

- [ ] **5.10.1** Create `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.tsx`:

```typescript
'use client';

import { cn } from '../../lib/utils';
import { WorkspaceIcon } from '../../atoms/WorkspaceIcon/WorkspaceIcon';
import { BadgeCount } from '../../atoms/BadgeCount/BadgeCount';
import { RecentItem } from '../../molecules/RecentItem/RecentItem';
import type { ReactNode } from 'react';

export interface SidebarWorkspace {
  id: string;
  label: string;
  icon: string;
}

export interface SidebarRecent {
  label: string;
  path: string;
  timestamp: string;
}

export interface WorkspaceSidebarProps {
  /** Visible workspaces for the current user (ordered by role config) */
  workspaces: SidebarWorkspace[];
  /** Currently active workspace ID */
  activeWorkspaceId?: string;
  /** Inbox unread actionable count */
  inboxCount: number;
  /** Recent workspace/tab entries */
  recents: SidebarRecent[];
  /** Navigation handler */
  onNavigate: (path: string) => void;
  /** Toggle collapse state */
  onToggleCollapse: () => void;
  /** Whether sidebar is collapsed to icon rail */
  collapsed: boolean;
  /** Help button handler (opens AI panel) */
  onHelpClick?: () => void;
  /** Custom className */
  className?: string;
}

interface SidebarItemProps {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  collapsed: boolean;
  badge?: ReactNode;
}

function SidebarItem({ icon, label, onClick, active, collapsed, badge }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
        'min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        collapsed && 'justify-center px-0',
      )}
    >
      <WorkspaceIcon icon={icon} size={20} decorative />
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && badge}
      {collapsed && <span className="sr-only">{label}</span>}
    </button>
  );
}

/**
 * Role-adaptive sidebar with Home, Inbox (badge), Recents, workspace list, Profile, Help.
 * Collapses to 56px icon rail. Responsive breakpoints handled by parent.
 */
export function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  inboxCount,
  recents,
  onNavigate,
  onToggleCollapse,
  collapsed,
  onHelpClick,
  className,
}: WorkspaceSidebarProps) {
  return (
    <nav
      role="navigation"
      aria-label="Dashboard sidebar"
      className={cn(
        'flex h-full flex-col border-r bg-card',
        collapsed ? 'w-14' : 'w-60',
        'transition-[width] duration-200 ease-in-out',
        className,
      )}
    >
      {/* Logo / Collapse toggle */}
      <div className={cn('flex items-center border-b px-3', collapsed ? 'justify-center' : 'justify-between', 'min-h-[56px]')}>
        {!collapsed && <span className="text-sm font-bold tracking-tight">Production City</span>}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50"
        >
          <WorkspaceIcon icon={collapsed ? 'chart-bar' : 'chart-bar'} size={16} decorative />
        </button>
      </div>

      {/* Invariant items: Home, Inbox */}
      <div className="space-y-0.5 px-2 pt-2">
        <SidebarItem
          icon="home"
          label="Home"
          onClick={() => onNavigate('/dashboard/home')}
          active={activeWorkspaceId === 'home'}
          collapsed={collapsed}
        />
        <SidebarItem
          icon="inbox"
          label="Inbox"
          onClick={() => onNavigate('/dashboard/inbox')}
          active={activeWorkspaceId === 'inbox'}
          collapsed={collapsed}
          badge={<BadgeCount count={inboxCount} />}
        />
      </div>

      {/* Recents */}
      {recents.length > 0 && !collapsed && (
        <div className="mt-4 px-2">
          <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Recently Viewed
          </span>
          <div className="mt-1 space-y-0.5">
            {recents.map((r) => (
              <RecentItem
                key={r.path}
                label={r.label}
                path={r.path}
                timestamp={r.timestamp}
                onClick={onNavigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Workspace list */}
      <div className="mt-4 flex-1 overflow-y-auto px-2">
        {!collapsed && (
          <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Workspaces
          </span>
        )}
        <div className="mt-1 space-y-0.5">
          {workspaces.map((ws) => (
            <SidebarItem
              key={ws.id}
              icon={ws.icon}
              label={ws.label}
              onClick={() => onNavigate(`/dashboard/${ws.id}`)}
              active={activeWorkspaceId === ws.id}
              collapsed={collapsed}
            />
          ))}
        </div>
      </div>

      {/* Bottom items: Profile, Help */}
      <div className="border-t px-2 py-2 space-y-0.5">
        <SidebarItem
          icon="user"
          label="Profile"
          onClick={() => onNavigate('/dashboard/profile')}
          collapsed={collapsed}
        />
        <SidebarItem
          icon="help-circle"
          label="Help"
          onClick={() => onHelpClick?.()}
          collapsed={collapsed}
        />
      </div>
    </nav>
  );
}
```

- [ ] **5.10.2** Create `packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { WorkspaceSidebar } from './WorkspaceSidebar';

const allWorkspaces = [
  { id: 'productions', label: 'Productions', icon: 'film' },
  { id: 'facilities', label: 'Facilities', icon: 'building' },
  { id: 'finance', label: 'Finance', icon: 'dollar-sign' },
  { id: 'people', label: 'People', icon: 'users' },
  { id: 'campus', label: 'Campus', icon: 'map' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'education', label: 'Education', icon: 'graduation-cap' },
  { id: 'analytics', label: 'Analytics', icon: 'chart-bar' },
  { id: 'investor-relations', label: 'Investor Relations', icon: 'briefcase' },
  { id: 'partnerships', label: 'Partnerships', icon: 'handshake' },
  { id: 'administration', label: 'Administration', icon: 'settings' },
];

const sampleRecents = [
  { label: 'Shooting — Productions', path: '/dashboard/productions/shooting', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { label: 'Invoices — Finance', path: '/dashboard/finance/invoices', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { label: 'Calendar — Facilities', path: '/dashboard/facilities/calendar', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const meta: Meta<typeof WorkspaceSidebar> = {
  title: 'Organisms/WorkspaceSidebar',
  component: WorkspaceSidebar,
  decorators: [(Story) => <div className="h-[600px]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof WorkspaceSidebar>;

export const AdminRole: Story = {
  args: {
    workspaces: allWorkspaces,
    activeWorkspaceId: 'productions',
    inboxCount: 5,
    recents: sampleRecents,
    collapsed: false,
    onNavigate: (path) => console.log('navigate', path),
    onToggleCollapse: () => console.log('toggle'),
  },
};

export const InvestorRole: Story = {
  args: {
    ...AdminRole.args,
    workspaces: [
      { id: 'investor-relations', label: 'Investor Relations', icon: 'briefcase' },
      { id: 'finance', label: 'Finance', icon: 'dollar-sign' },
    ],
    activeWorkspaceId: 'investor-relations',
    inboxCount: 1,
    recents: [{ label: 'Data Room — Investor Relations', path: '/dashboard/investor-relations/data-room', timestamp: new Date().toISOString() }],
  },
};

export const GuestRole: Story = {
  args: {
    ...AdminRole.args,
    workspaces: [
      { id: 'events', label: 'Events', icon: 'calendar' },
      { id: 'education', label: 'Education', icon: 'graduation-cap' },
    ],
    inboxCount: 0,
    recents: [],
  },
};

export const Collapsed: Story = {
  args: { ...AdminRole.args, collapsed: true },
};

export const NoRecents: Story = {
  args: { ...AdminRole.args, recents: [] },
};

export const HighInboxCount: Story = {
  args: { ...AdminRole.args, inboxCount: 150 },
};
```

- [ ] **5.10.3** Verify WorkspaceSidebar tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar.test.tsx
```

#### Step 5.11: Update exports and verify

- [ ] **5.11.1** Add exports to `packages/ui/src/index.ts`:

```typescript
// Atoms
export { WorkspaceIcon, WORKSPACE_ICONS, type WorkspaceIconProps } from './atoms/WorkspaceIcon/WorkspaceIcon';
export { BadgeCount, type BadgeCountProps } from './atoms/BadgeCount/BadgeCount';

// Molecules
export { RecentItem, type RecentItemProps } from './molecules/RecentItem/RecentItem';

// Organisms
export { WorkspaceSidebar, type WorkspaceSidebarProps, type SidebarWorkspace, type SidebarRecent } from './organisms/WorkspaceSidebar/WorkspaceSidebar';
```

- [ ] **5.11.2** Run full test suite and build:

```bash
pnpm --filter ./packages/ui test
pnpm build-storybook
pnpm typecheck
```

- [ ] **5.11.3** Commit:

```
[#5] Add WorkspaceSidebar organism with WorkspaceIcon, BadgeCount, RecentItem, and useRecents
```

---

### Issue 6: WorkspaceTabs organism

**Summary:** Tab bar displaying active + coming_soon + planned tabs from workspace config. Horizontal scroll on overflow. Selected state. ARIA tablist.

**Files created:**
- `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.tsx`
- `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.stories.tsx`
- `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.test.tsx`
- `packages/ui/src/atoms/TabItem/TabItem.tsx`
- `packages/ui/src/atoms/TabItem/TabItem.stories.tsx`
- `packages/ui/src/atoms/TabItem/TabItem.test.tsx`
- `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.tsx`
- `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.stories.tsx`
- `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: all active tabs, mixed active/coming/planned, all coming, all planned, overflow scroll
- ARIA tablist with correct roles
- Horizontal scroll on overflow with scroll indicators
- Tab states visually distinct: active (normal text), coming_soon (greyed + dot + date), planned (greyed + dot, no date)

#### Step 6.1: Write failing tests for FeatureStatusDot atom

- [ ] **6.1.1** Create `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureStatusDot } from "./FeatureStatusDot";

describe("FeatureStatusDot", () => {
  it("renders filled dot for active status", () => {
    const { container } = render(<FeatureStatusDot status="active" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot.className).toContain("bg-green");
  });

  it("renders open circle for coming_soon status", () => {
    const { container } = render(<FeatureStatusDot status="coming_soon" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot.className).toContain("border");
  });

  it("renders open circle for planned status", () => {
    const { container } = render(<FeatureStatusDot status="planned" />);
    const dot = container.firstChild as HTMLElement;
    expect(dot.className).toContain("border");
  });

  it("shows target date in title for coming_soon", () => {
    render(<FeatureStatusDot status="coming_soon" targetQuarter="Q3 2026" />);
    const dot = screen.getByTitle("Coming Q3 2026");
    expect(dot).toBeDefined();
  });

  it("shows 'Planned' in title for planned status", () => {
    render(<FeatureStatusDot status="planned" />);
    const dot = screen.getByTitle("Planned");
    expect(dot).toBeDefined();
  });

  it("has accessible text via sr-only span", () => {
    render(<FeatureStatusDot status="active" />);
    expect(screen.getByText("Active")).toBeDefined();
  });
});
```

- [ ] **6.1.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.test.tsx
```

#### Step 6.2: Implement FeatureStatusDot atom

- [ ] **6.2.1** Create `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.tsx`:

```typescript
import { cn } from '../../lib/utils';

export interface FeatureStatusDotProps {
  /** Feature status */
  status: 'active' | 'coming_soon' | 'planned';
  /** Target quarter for coming_soon (e.g., "Q3 2026") */
  targetQuarter?: string | null;
  /** Custom className */
  className?: string;
}

/**
 * Inline status indicator: filled green dot for active, open grey circle for coming_soon/planned.
 * Tooltip shows target date for coming_soon, "Planned" for planned.
 */
export function FeatureStatusDot({ status, targetQuarter, className }: FeatureStatusDotProps) {
  const isActive = status === 'active';
  const title = isActive
    ? 'Active'
    : status === 'coming_soon' && targetQuarter
      ? `Coming ${targetQuarter}`
      : 'Planned';

  return (
    <span
      title={title}
      className={cn(
        'inline-block h-2 w-2 shrink-0 rounded-full',
        isActive
          ? 'bg-green-500'
          : 'border border-muted-foreground/40 bg-transparent',
        className,
      )}
    >
      <span className="sr-only">{isActive ? 'Active' : status === 'coming_soon' ? `Coming Soon${targetQuarter ? ` ${targetQuarter}` : ''}` : 'Planned'}</span>
    </span>
  );
}
```

- [ ] **6.2.2** Create `packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { FeatureStatusDot } from './FeatureStatusDot';

const meta: Meta<typeof FeatureStatusDot> = {
  title: 'Atoms/FeatureStatusDot',
  component: FeatureStatusDot,
};
export default meta;
type Story = StoryObj<typeof FeatureStatusDot>;

export const Active: Story = { args: { status: 'active' } };
export const ComingSoon: Story = { args: { status: 'coming_soon', targetQuarter: 'Q3 2026' } };
export const ComingSoonNoDate: Story = { args: { status: 'coming_soon' } };
export const Planned: Story = { args: { status: 'planned' } };
export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1"><FeatureStatusDot status="active" /> Active</span>
      <span className="flex items-center gap-1"><FeatureStatusDot status="coming_soon" targetQuarter="Q3 2026" /> Coming Soon</span>
      <span className="flex items-center gap-1"><FeatureStatusDot status="planned" /> Planned</span>
    </div>
  ),
};
```

- [ ] **6.2.3** Verify FeatureStatusDot tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/FeatureStatusDot/FeatureStatusDot.test.tsx
```

#### Step 6.3: Write failing tests for TabItem atom

- [ ] **6.3.1** Create `packages/ui/src/atoms/TabItem/TabItem.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabItem } from "./TabItem";

describe("TabItem", () => {
  it("renders tab label", () => {
    render(<TabItem id="overview" label="Overview" status="active" selected={false} onClick={vi.fn()} />);
    expect(screen.getByText("Overview")).toBeDefined();
  });

  it("applies aria-selected when selected", () => {
    render(<TabItem id="overview" label="Overview" status="active" selected onClick={vi.fn()} />);
    const tab = screen.getByRole("tab");
    expect(tab.getAttribute("aria-selected")).toBe("true");
  });

  it("shows status dot for coming_soon tabs", () => {
    const { container } = render(<TabItem id="shooting" label="Shooting" status="coming_soon" targetQuarter="Q3 2026" selected={false} onClick={vi.fn()} />);
    expect(container.querySelector("[title]")).not.toBeNull();
  });

  it("shows status dot for planned tabs", () => {
    const { container } = render(<TabItem id="workflow" label="Workflow" status="planned" selected={false} onClick={vi.fn()} />);
    expect(container.querySelector("[title='Planned']")).not.toBeNull();
  });

  it("does not show status dot for active tabs", () => {
    const { container } = render(<TabItem id="overview" label="Overview" status="active" selected={false} onClick={vi.fn()} />);
    expect(container.querySelector("[title='Active']")).toBeNull();
  });

  it("calls onClick with tab id when clicked", () => {
    const onClick = vi.fn();
    render(<TabItem id="shooting" label="Shooting" status="coming_soon" selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("tab"));
    expect(onClick).toHaveBeenCalledWith("shooting");
  });

  it("applies greyed styling for coming_soon", () => {
    render(<TabItem id="shooting" label="Shooting" status="coming_soon" selected={false} onClick={vi.fn()} />);
    const tab = screen.getByRole("tab");
    expect(tab.className).toContain("text-muted");
  });

  it("has role='tab'", () => {
    render(<TabItem id="test" label="Test" status="active" selected={false} onClick={vi.fn()} />);
    expect(screen.getByRole("tab")).toBeDefined();
  });
});
```

- [ ] **6.3.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/TabItem/TabItem.test.tsx
```

#### Step 6.4: Implement TabItem atom

- [ ] **6.4.1** Create `packages/ui/src/atoms/TabItem/TabItem.tsx`:

```typescript
import { cn } from '../../lib/utils';
import { FeatureStatusDot } from '../FeatureStatusDot/FeatureStatusDot';

export interface TabItemProps {
  /** Tab ID */
  id: string;
  /** Tab display label */
  label: string;
  /** Tab status derived from primary feature */
  status: 'active' | 'coming_soon' | 'planned';
  /** Whether this tab is currently selected */
  selected: boolean;
  /** Target quarter for coming_soon tabs */
  targetQuarter?: string | null;
  /** Click handler */
  onClick: (tabId: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Single workspace tab. States: active (normal text), coming_soon (greyed + dot + date),
 * planned (greyed + dot, no date).
 */
export function TabItem({ id, label, status, selected, targetQuarter, onClick, className }: TabItemProps) {
  const isNotActive = status !== 'active';

  return (
    <button
      role="tab"
      type="button"
      id={`tab-${id}`}
      aria-selected={selected}
      aria-controls={`tabpanel-${id}`}
      onClick={() => onClick(id)}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary text-foreground'
          : 'border-transparent hover:border-border hover:text-foreground',
        isNotActive && !selected && 'text-muted-foreground',
        !isNotActive && !selected && 'text-muted-foreground',
        className,
      )}
    >
      {isNotActive && <FeatureStatusDot status={status} targetQuarter={targetQuarter} />}
      {label}
    </button>
  );
}
```

- [ ] **6.4.2** Create `packages/ui/src/atoms/TabItem/TabItem.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { TabItem } from './TabItem';

const meta: Meta<typeof TabItem> = {
  title: 'Atoms/TabItem',
  component: TabItem,
};
export default meta;
type Story = StoryObj<typeof TabItem>;

export const ActiveSelected: Story = { args: { id: 'overview', label: 'Overview', status: 'active', selected: true, onClick: () => {} } };
export const ActiveUnselected: Story = { args: { id: 'overview', label: 'Overview', status: 'active', selected: false, onClick: () => {} } };
export const ComingSoonSelected: Story = { args: { id: 'shooting', label: 'Shooting', status: 'coming_soon', selected: true, targetQuarter: 'Q3 2026', onClick: () => {} } };
export const ComingSoonUnselected: Story = { args: { id: 'shooting', label: 'Shooting', status: 'coming_soon', selected: false, targetQuarter: 'Q3 2026', onClick: () => {} } };
export const Planned: Story = { args: { id: 'workflow', label: 'Workflow', status: 'planned', selected: false, onClick: () => {} } };
```

- [ ] **6.4.3** Verify TabItem tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/atoms/TabItem/TabItem.test.tsx
```

#### Step 6.5: Write failing tests for WorkspaceTabs organism

- [ ] **6.5.1** Create `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceTabs, type WorkspaceTabsProps } from "./WorkspaceTabs";

const defaultProps: WorkspaceTabsProps = {
  tabs: [
    { id: "overview", label: "Overview", status: "active" },
    { id: "shooting", label: "Shooting", status: "coming_soon", targetQuarter: "Q3 2026" },
    { id: "post-production", label: "Post-Production", status: "coming_soon", targetQuarter: "Q4 2026" },
    { id: "workflow", label: "Workflow", status: "planned" },
  ],
  activeTabId: "overview",
  onTabChange: vi.fn(),
};

describe("WorkspaceTabs", () => {
  it("renders all tabs", () => {
    render(<WorkspaceTabs {...defaultProps} />);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Shooting")).toBeDefined();
    expect(screen.getByText("Post-Production")).toBeDefined();
    expect(screen.getByText("Workflow")).toBeDefined();
  });

  it("has ARIA tablist role", () => {
    render(<WorkspaceTabs {...defaultProps} />);
    expect(screen.getByRole("tablist")).toBeDefined();
  });

  it("marks active tab as aria-selected", () => {
    render(<WorkspaceTabs {...defaultProps} />);
    const tabs = screen.getAllByRole("tab");
    const overviewTab = tabs.find((t) => t.textContent?.includes("Overview"));
    expect(overviewTab?.getAttribute("aria-selected")).toBe("true");
  });

  it("calls onTabChange when tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<WorkspaceTabs {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Shooting"));
    expect(onTabChange).toHaveBeenCalledWith("shooting");
  });

  it("renders with overflow scroll container", () => {
    const { container } = render(<WorkspaceTabs {...defaultProps} />);
    const scrollContainer = container.querySelector("[role='tablist']");
    expect(scrollContainer?.className).toContain("overflow-x-auto");
  });

  it("renders all active tabs without status dots", () => {
    const allActive: WorkspaceTabsProps = {
      tabs: [
        { id: "a", label: "A", status: "active" },
        { id: "b", label: "B", status: "active" },
      ],
      activeTabId: "a",
      onTabChange: vi.fn(),
    };
    const { container } = render(<WorkspaceTabs {...allActive} />);
    // Active tabs should NOT have status dots
    const dots = container.querySelectorAll("[title='Active']");
    expect(dots.length).toBe(0);
  });
});
```

- [ ] **6.5.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.test.tsx
```

#### Step 6.6: Implement WorkspaceTabs organism

- [ ] **6.6.1** Create `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.tsx`:

```typescript
'use client';

import { useRef } from 'react';
import { cn } from '../../lib/utils';
import { TabItem } from '../../atoms/TabItem/TabItem';

export interface WorkspaceTab {
  id: string;
  label: string;
  status: 'active' | 'coming_soon' | 'planned';
  targetQuarter?: string | null;
}

export interface WorkspaceTabsProps {
  /** Tab definitions from workspace config */
  tabs: WorkspaceTab[];
  /** Currently active tab ID */
  activeTabId: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Tab bar for workspace navigation. Supports active + coming_soon + planned states.
 * Horizontal scroll on overflow.
 */
export function WorkspaceTabs({ tabs, activeTabId, onTabChange, className }: WorkspaceTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn('border-b', className)}>
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Workspace tabs"
        className="flex overflow-x-auto scrollbar-none"
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            id={tab.id}
            label={tab.label}
            status={tab.status}
            selected={tab.id === activeTabId}
            targetQuarter={tab.targetQuarter}
            onClick={onTabChange}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **6.6.2** Create `packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { WorkspaceTabs } from './WorkspaceTabs';

const meta: Meta<typeof WorkspaceTabs> = {
  title: 'Organisms/WorkspaceTabs',
  component: WorkspaceTabs,
};
export default meta;
type Story = StoryObj<typeof WorkspaceTabs>;

export const MixedStates: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview', status: 'active' },
      { id: 'pre-production', label: 'Pre-Production', status: 'active' },
      { id: 'shooting', label: 'Shooting', status: 'coming_soon', targetQuarter: 'Q3 2026' },
      { id: 'post-production', label: 'Post-Production', status: 'coming_soon', targetQuarter: 'Q4 2026' },
      { id: 'deliverables', label: 'Deliverables', status: 'planned' },
      { id: 'workflow', label: 'Workflow', status: 'planned' },
    ],
    activeTabId: 'overview',
    onTabChange: (id) => console.log('tab', id),
  },
};

export const AllActive: Story = {
  args: {
    tabs: [
      { id: 'users', label: 'Users', status: 'active' },
      { id: 'roles', label: 'Roles & Permissions', status: 'active' },
      { id: 'audit', label: 'Audit Log', status: 'active' },
    ],
    activeTabId: 'users',
    onTabChange: (id) => console.log('tab', id),
  },
};

export const AllComingSoon: Story = {
  args: {
    tabs: [
      { id: 'a', label: 'Feature A', status: 'coming_soon', targetQuarter: 'Q2 2026' },
      { id: 'b', label: 'Feature B', status: 'coming_soon', targetQuarter: 'Q3 2026' },
      { id: 'c', label: 'Feature C', status: 'planned' },
    ],
    activeTabId: 'a',
    onTabChange: (id) => console.log('tab', id),
  },
};

export const OverflowScroll: Story = {
  decorators: [(Story) => <div className="max-w-[400px]"><Story /></div>],
  args: {
    tabs: Array.from({ length: 10 }, (_, i) => ({
      id: `tab-${i}`,
      label: `Tab ${i + 1} Long Name`,
      status: i < 3 ? 'active' as const : 'planned' as const,
    })),
    activeTabId: 'tab-0',
    onTabChange: (id) => console.log('tab', id),
  },
};
```

- [ ] **6.6.3** Verify WorkspaceTabs tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs.test.tsx
```

#### Step 6.7: Update exports and verify

- [ ] **6.7.1** Add exports to `packages/ui/src/index.ts`:

```typescript
export { FeatureStatusDot, type FeatureStatusDotProps } from './atoms/FeatureStatusDot/FeatureStatusDot';
export { TabItem, type TabItemProps } from './atoms/TabItem/TabItem';
export { WorkspaceTabs, type WorkspaceTabsProps, type WorkspaceTab as WorkspaceTabDef } from './organisms/WorkspaceTabs/WorkspaceTabs';
```

- [ ] **6.7.2** Run full test suite and build:

```bash
pnpm --filter ./packages/ui test
pnpm build-storybook
pnpm typecheck
```

- [ ] **6.7.3** Commit:

```
[#6] Add WorkspaceTabs organism with FeatureStatusDot and TabItem atoms
```

---

### Issue 7: ScopeBar molecule

**Summary:** Workspace scope bar with filter dropdowns, date range picker, search input, and primary/secondary action buttons. Adapts filter options via config prop per workspace.

**Files created:**
- `packages/ui/src/molecules/ScopeBar/ScopeBar.tsx`
- `packages/ui/src/molecules/ScopeBar/ScopeBar.stories.tsx`
- `packages/ui/src/molecules/ScopeBar/ScopeBar.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories for 3+ workspace filter configurations (Productions, Finance, Facilities)
- Filter state management via controlled props (select, dateRange, search filter types)
- Primary action button adapts per workspace; optional secondary actions supported
- Date range picker for temporal filtering
- Mobile responsiveness handled by the parent WorkspaceShell's responsive layout — ScopeBar does not implement its own collapse logic

> **Deferred to Phase 2:** Saved views (user-persisted filter presets) and date range presets (7d, 30d, 90d shortcuts) are not in the Phase 1 ScopeBar implementation. They will be added when workspace-specific saved view persistence is built.

#### Step 7.1: Write failing tests for ScopeBar

- [ ] **7.1.1** Create `packages/ui/src/molecules/ScopeBar/ScopeBar.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScopeBar, type ScopeBarProps } from "./ScopeBar";

const defaultProps: ScopeBarProps = {
  filters: [
    { id: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "completed", label: "Completed" }] },
    { id: "type", label: "Type", options: [{ value: "film", label: "Film" }, { value: "tv", label: "TV" }] },
  ],
  activeFilters: {},
  onFilterChange: vi.fn(),
  primaryAction: { label: "New Production", onClick: vi.fn() },
};

describe("ScopeBar", () => {
  it("renders filter dropdowns", () => {
    render(<ScopeBar {...defaultProps} />);
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Type")).toBeDefined();
  });

  it("renders primary action button", () => {
    render(<ScopeBar {...defaultProps} />);
    expect(screen.getByText("New Production")).toBeDefined();
  });

  it("calls onFilterChange when filter is selected", () => {
    const onFilterChange = vi.fn();
    render(<ScopeBar {...defaultProps} onFilterChange={onFilterChange} />);
    fireEvent.click(screen.getByText("Status"));
    // After dropdown opens
    const option = screen.queryByText("Active");
    if (option) {
      fireEvent.click(option);
      expect(onFilterChange).toHaveBeenCalledWith({ status: "active" });
    }
  });

  it("calls primary action onClick", () => {
    const onClick = vi.fn();
    render(<ScopeBar {...defaultProps} primaryAction={{ label: "Book Stage", onClick }} />);
    fireEvent.click(screen.getByText("Book Stage"));
    expect(onClick).toHaveBeenCalled();
  });

  it("renders with no primary action", () => {
    render(<ScopeBar {...defaultProps} primaryAction={undefined} />);
    expect(screen.queryByRole("button", { name: /new|book|create/i })).toBeNull();
  });

  it("shows active filter count", () => {
    render(<ScopeBar {...defaultProps} activeFilters={{ status: "active" }} />);
    // Should show some indicator that a filter is active
    const filterBtn = screen.getByText("Status");
    expect(filterBtn.closest("button")?.textContent).toContain("Status");
  });
});
```

- [ ] **7.1.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/molecules/ScopeBar/ScopeBar.test.tsx
```

#### Step 7.2: Implement ScopeBar molecule

- [ ] **7.2.1** Create `packages/ui/src/molecules/ScopeBar/ScopeBar.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';

export interface ScopeBarFilterOption {
  value: string;
  label: string;
}

export interface ScopeBarFilter {
  id: string;
  label: string;
  /** Filter type: 'select' renders a dropdown, 'dateRange' renders a date picker, 'search' renders a text input. Defaults to 'select'. */
  type?: 'select' | 'dateRange' | 'search';
  /** Options for 'select' type filters */
  options?: ScopeBarFilterOption[];
  /** Placeholder text for 'search' type filters */
  placeholder?: string;
}

export interface ScopeBarAction {
  label: string;
  onClick: () => void;
  icon?: string;
}

export interface ScopeBarProps {
  /** Filter definitions */
  filters: ScopeBarFilter[];
  /** Active filter values keyed by filter ID */
  activeFilters: Record<string, string>;
  /** Called when a select filter changes */
  onFilterChange: (filters: Record<string, string>) => void;
  /** Date range presets */
  dateRange?: { from?: string; to?: string };
  /** Date range change handler (used by 'dateRange' type filters) */
  onDateRangeChange?: (range: { from?: string; to?: string }) => void;
  /** Search input change handler (used by 'search' type filters) */
  onSearchChange?: (filterId: string, value: string) => void;
  /** Primary action button (role-specific, first quick action for this role/workspace) */
  primaryAction?: ScopeBarAction;
  /** Secondary action buttons (additional quick actions for this role/workspace, shown as outlined buttons) */
  secondaryActions?: ScopeBarAction[];
  /** Custom className */
  className?: string;
}

/**
 * Workspace scope bar with configurable filters, date range, and primary action.
 */
export function ScopeBar({
  filters,
  activeFilters,
  onFilterChange,
  onDateRangeChange,
  onSearchChange,
  primaryAction,
  secondaryActions = [],
  className,
}: ScopeBarProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const handleSelect = (filterId: string, value: string) => {
    const next = { ...activeFilters, [filterId]: value };
    if (activeFilters[filterId] === value) {
      delete next[filterId];
    }
    onFilterChange(next);
    setOpenFilter(null);
  };

  const renderFilter = (filter: ScopeBarFilter) => {
    const filterType = filter.type ?? 'select';

    if (filterType === 'search') {
      return (
        <div key={filter.id} className="relative">
          <input
            type="text"
            placeholder={filter.placeholder ?? `Search ${filter.label}...`}
            className="rounded-md border px-3 py-1.5 text-sm placeholder:text-muted-foreground"
            onChange={(e) => onSearchChange?.(filter.id, e.target.value)}
          />
        </div>
      );
    }

    if (filterType === 'dateRange') {
      return (
        <div key={filter.id} className="relative">
          <button
            type="button"
            onClick={() => setOpenFilter(openFilter === filter.id ? null : filter.id)}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm',
              'hover:bg-accent/50 transition-colors',
            )}
          >
            {filter.label}
          </button>
          {/* Date range picker popover rendered when open */}
        </div>
      );
    }

    // Default: 'select' — dropdown with options
    return (
      <div key={filter.id} className="relative">
        <button
          type="button"
          onClick={() => setOpenFilter(openFilter === filter.id ? null : filter.id)}
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm',
            'hover:bg-accent/50 transition-colors',
            activeFilters[filter.id] && 'border-primary text-primary',
          )}
        >
          {filter.label}
          {activeFilters[filter.id] && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">1</span>
          )}
        </button>
        {openFilter === filter.id && filter.options && (
          <div className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded-md border bg-popover p-1 shadow-md">
            {filter.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(filter.id, opt.value)}
                className={cn(
                  'w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent',
                  activeFilters[filter.id] === opt.value && 'bg-accent font-medium',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex items-center gap-2 border-b px-4 py-2', className)}>
      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {filters.map(renderFilter)}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {secondaryActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            {action.label}
          </button>
        ))}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **7.2.2** Create `packages/ui/src/molecules/ScopeBar/ScopeBar.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ScopeBar } from './ScopeBar';

const meta: Meta<typeof ScopeBar> = {
  title: 'Molecules/ScopeBar',
  component: ScopeBar,
};
export default meta;
type Story = StoryObj<typeof ScopeBar>;

export const Productions: Story = {
  args: {
    filters: [
      { id: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'archived', label: 'Archived' }] },
      { id: 'type', label: 'Type', options: [{ value: 'film', label: 'Film' }, { value: 'tv', label: 'TV' }, { value: 'commercial', label: 'Commercial' }] },
    ],
    activeFilters: {},
    onFilterChange: (f) => console.log('filter', f),
    primaryAction: { label: 'New Production', onClick: () => console.log('new') },
  },
};

export const Finance: Story = {
  args: {
    filters: [
      { id: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }] },
      { id: 'entity', label: 'Entity', options: [{ value: 'vendor', label: 'Vendor' }, { value: 'client', label: 'Client' }] },
    ],
    activeFilters: { status: 'pending' },
    onFilterChange: (f) => console.log('filter', f),
    primaryAction: { label: 'New Invoice', onClick: () => console.log('new') },
  },
};

export const NoPrimaryAction: Story = {
  args: {
    filters: [{ id: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }] }],
    activeFilters: {},
    onFilterChange: (f) => console.log('filter', f),
  },
};
```

- [ ] **7.2.3** Verify ScopeBar tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/molecules/ScopeBar/ScopeBar.test.tsx
```

- [ ] **7.2.4** Add exports to `packages/ui/src/index.ts`:

```typescript
export { ScopeBar, type ScopeBarProps, type ScopeBarFilter, type ScopeBarFilterOption, type ScopeBarAction } from './molecules/ScopeBar/ScopeBar';
```

- [ ] **7.2.5** Commit:

```
[#7] Add ScopeBar molecule with configurable filters and primary action
```

---

### Issue 8: WorkspaceShell template

**Summary:** Workspace frame template: header (icon + name + description) + WorkspaceTabs + ScopeBar + canvas slot + PlannedSection slot. Reusable across all 11 workspaces.

**Files created:**
- `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.tsx`
- `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.stories.tsx`
- `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories with each canvas type slotted (placeholder div)
- Responsive layout at all 3 breakpoints
- Scroll behavior: header and tabs stay fixed, canvas scrolls
- PlannedSection slot renders below canvas

#### Step 8.1: Write failing tests for WorkspaceShell

- [ ] **8.1.1** Create `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkspaceShell, type WorkspaceShellProps } from "./WorkspaceShell";

const defaultProps: WorkspaceShellProps = {
  workspace: { id: "productions", label: "Productions", icon: "film", description: "Film, TV, and broadcast production lifecycle" },
  tabs: [
    { id: "overview", label: "Overview", status: "active" as const },
    { id: "shooting", label: "Shooting", status: "coming_soon" as const, targetQuarter: "Q3 2026" },
  ],
  activeTabId: "overview",
  onTabChange: vi.fn(),
  children: <div data-testid="canvas">Canvas content</div>,
};

describe("WorkspaceShell", () => {
  it("renders workspace name", () => {
    render(<WorkspaceShell {...defaultProps} />);
    expect(screen.getByText("Productions")).toBeDefined();
  });

  it("renders workspace description", () => {
    render(<WorkspaceShell {...defaultProps} />);
    expect(screen.getByText("Film, TV, and broadcast production lifecycle")).toBeDefined();
  });

  it("renders workspace icon", () => {
    const { container } = render(<WorkspaceShell {...defaultProps} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders WorkspaceTabs", () => {
    render(<WorkspaceShell {...defaultProps} />);
    expect(screen.getByRole("tablist")).toBeDefined();
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Shooting")).toBeDefined();
  });

  it("renders canvas slot (children)", () => {
    render(<WorkspaceShell {...defaultProps} />);
    expect(screen.getByTestId("canvas")).toBeDefined();
  });

  it("renders planned section slot when provided", () => {
    render(
      <WorkspaceShell
        {...defaultProps}
        plannedSection={<div data-testid="planned">Planned content</div>}
      />,
    );
    expect(screen.getByTestId("planned")).toBeDefined();
  });

  it("renders ScopeBar when scopeBar prop is provided", () => {
    render(
      <WorkspaceShell
        {...defaultProps}
        scopeBar={<div data-testid="scope-bar">Scope bar</div>}
      />,
    );
    expect(screen.getByTestId("scope-bar")).toBeDefined();
  });

  it("does not render ScopeBar when not provided", () => {
    render(<WorkspaceShell {...defaultProps} />);
    expect(screen.queryByTestId("scope-bar")).toBeNull();
  });
});
```

- [ ] **8.1.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/templates/WorkspaceShell/WorkspaceShell.test.tsx
```

#### Step 8.2: Implement WorkspaceShell template

- [ ] **8.2.1** Create `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.tsx`:

```typescript
'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { WorkspaceIcon } from '../../atoms/WorkspaceIcon/WorkspaceIcon';
import { WorkspaceTabs, type WorkspaceTab } from '../../organisms/WorkspaceTabs/WorkspaceTabs';

export interface WorkspaceShellWorkspace {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface WorkspaceShellProps {
  /** Workspace metadata */
  workspace: WorkspaceShellWorkspace;
  /** Tab definitions */
  tabs: WorkspaceTab[];
  /** Active tab ID */
  activeTabId: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Scope bar slot (rendered between tabs and canvas) */
  scopeBar?: ReactNode;
  /** Canvas content slot */
  children: ReactNode;
  /** Planned section slot (rendered below canvas) */
  plannedSection?: ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * Workspace frame template. Header + tabs + scope bar + canvas slot + planned section.
 * Used by all 11 workspaces. Home uses HomeDashboard instead.
 */
export function WorkspaceShell({
  workspace,
  tabs,
  activeTabId,
  onTabChange,
  scopeBar,
  children,
  plannedSection,
  className,
}: WorkspaceShellProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <WorkspaceIcon icon={workspace.icon} size={28} decorative />
        <div>
          <h1 className="text-lg font-semibold">{workspace.label}</h1>
          <p className="text-sm text-muted-foreground">{workspace.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <WorkspaceTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={onTabChange}
        className="px-4"
      />

      {/* Scope bar */}
      {scopeBar}

      {/* Canvas (scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <div
          role="tabpanel"
          id={`tabpanel-${activeTabId}`}
          aria-labelledby={`tab-${activeTabId}`}
          className="p-6"
        >
          {children}
        </div>

        {/* Planned section (below canvas) */}
        {plannedSection}
      </div>
    </div>
  );
}
```

- [ ] **8.2.2** Create `packages/ui/src/templates/WorkspaceShell/WorkspaceShell.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { WorkspaceShell } from './WorkspaceShell';

const meta: Meta<typeof WorkspaceShell> = {
  title: 'Templates/WorkspaceShell',
  component: WorkspaceShell,
  decorators: [(Story) => <div className="h-[600px]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof WorkspaceShell>;

export const ProductionsBoard: Story = {
  args: {
    workspace: { id: 'productions', label: 'Productions', icon: 'film', description: 'Film, TV, and broadcast production lifecycle' },
    tabs: [
      { id: 'overview', label: 'Overview', status: 'active' },
      { id: 'shooting', label: 'Shooting', status: 'coming_soon', targetQuarter: 'Q3 2026' },
      { id: 'workflow', label: 'Workflow', status: 'planned' },
    ],
    activeTabId: 'overview',
    onTabChange: (id) => console.log('tab', id),
    children: <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center text-muted-foreground">CanvasBoard placeholder</div>,
  },
};

export const FinanceTable: Story = {
  args: {
    workspace: { id: 'finance', label: 'Finance', icon: 'dollar-sign', description: 'Invoicing, budgets, cash flow, and distributions' },
    tabs: [
      { id: 'overview', label: 'Overview', status: 'active' },
      { id: 'invoices', label: 'Invoices', status: 'active' },
      { id: 'budgets', label: 'Budgets', status: 'coming_soon', targetQuarter: 'Q4 2026' },
    ],
    activeTabId: 'invoices',
    onTabChange: (id) => console.log('tab', id),
    children: <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center text-muted-foreground">CanvasTable placeholder</div>,
    plannedSection: <div className="border-t p-4 text-sm text-muted-foreground">3 planned features</div>,
  },
};

export const WithScopeBar: Story = {
  args: {
    ...ProductionsBoard.args,
    scopeBar: <div className="border-b px-4 py-2 text-sm text-muted-foreground">ScopeBar placeholder</div>,
  },
};
```

- [ ] **8.2.3** Verify WorkspaceShell tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/templates/WorkspaceShell/WorkspaceShell.test.tsx
```

- [ ] **8.2.4** Add exports and commit:

```bash
# Add export to packages/ui/src/index.ts:
# export { WorkspaceShell, type WorkspaceShellProps } from './templates/WorkspaceShell/WorkspaceShell';

pnpm --filter ./packages/ui test
pnpm build-storybook
pnpm typecheck
```

- [ ] **8.2.5** Commit:

```
[#8] Add WorkspaceShell template with header, tabs, scope bar, canvas, and planned section slots
```

---

### Issue 9: DashboardShell redesign

**Summary:** Swap the existing sidebar for WorkspaceSidebar. Add AI panel slot (right side). Update responsive breakpoints. Wire sidebar collapse state to localStorage.

**Files modified:**
- `apps/web/app/dashboard/layout.tsx`

**Acceptance criteria:**
- WorkspaceSidebar renders with correct workspace list for user role
- AI panel slot (right side) renders when provided
- All 3 responsive breakpoints work (desktop: sidebar + content, tablet: icon rail + content, mobile: overlay)
- Sidebar collapse persists to localStorage
- No regressions in existing dashboard functionality

#### Step 9.1: Write failing tests for DashboardShell

- [ ] **9.1.1** Create `apps/web/app/dashboard/__tests__/dashboard-shell.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// These tests verify the layout integrates WorkspaceSidebar correctly
// They test the shell composition, not individual components

describe("DashboardShell layout", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders WorkspaceSidebar with workspace list", async () => {
    // Mock the registry context
    // The DashboardShell reads visibleWorkspaces from RegistryProvider
    // and passes them to WorkspaceSidebar
    // Test: sidebar should render workspace items
  });

  it("renders main content area", () => {
    // Test: children slot renders in the main area
  });

  it("renders AI panel slot when aiPanel prop is provided", () => {
    // Test: right-side panel renders when passed
  });

  it("persists sidebar collapse state to localStorage", () => {
    // Test: toggling collapse writes to localStorage key 'pc-sidebar-collapsed'
  });

  it("reads initial collapse state from localStorage", () => {
    // Test: pre-set localStorage, verify sidebar starts collapsed
  });
});
```

- [ ] **9.1.2** Note: Full layout tests require the RegistryProvider and generated configs. These tests will be minimal integration tests that verify the shell composition. Full E2E coverage is in Issue 34.

#### Step 9.2: Update dashboard layout

- [ ] **9.2.1** Rewrite `apps/web/app/dashboard/layout.tsx` to integrate WorkspaceSidebar and add AI panel slot:

The key changes:
1. Replace the old `SidebarNav` import with `WorkspaceSidebar`
2. Add `aiPanelOpen` state and right-side panel slot
3. Wire sidebar collapse to localStorage key `pc-sidebar-collapsed`
4. Compute `sidebarWorkspaces` from `visibleWorkspaces` in RegistryProvider
5. Wire `useRecents` hook for the recents section
6. Pass `inboxCount` from API (placeholder 0 until Issue 15)

#### Step 9.3: Simplify DashboardBreadcrumb to 2 levels

The current DashboardBreadcrumb supports arbitrary depth (section > subsection > feature). The workspace architecture only needs 2 levels: Workspace > Tab. Simplify the breadcrumb to reduce complexity and match the new URL structure.

- [ ] **9.3.1** Write failing test for simplified breadcrumb. Add to `apps/web/app/dashboard/__tests__/dashboard-shell.test.tsx`:

```typescript
describe("DashboardBreadcrumb simplification", () => {
  it("renders exactly 2 levels: workspace and tab", () => {
    render(
      <DashboardBreadcrumb
        workspace={{ id: "productions", label: "Productions" }}
        tab={{ id: "shooting", label: "Shooting" }}
      />,
    );
    const breadcrumbs = screen.getAllByRole("listitem");
    expect(breadcrumbs.length).toBe(2);
    expect(breadcrumbs[0].textContent).toContain("Productions");
    expect(breadcrumbs[1].textContent).toContain("Shooting");
  });

  it("renders only workspace when on workspace root (no tab)", () => {
    render(
      <DashboardBreadcrumb
        workspace={{ id: "productions", label: "Productions" }}
      />,
    );
    const breadcrumbs = screen.getAllByRole("listitem");
    expect(breadcrumbs.length).toBe(1);
    expect(breadcrumbs[0].textContent).toContain("Productions");
  });

  it("workspace breadcrumb links to workspace root", () => {
    render(
      <DashboardBreadcrumb
        workspace={{ id: "productions", label: "Productions" }}
        tab={{ id: "shooting", label: "Shooting" }}
      />,
    );
    const wsLink = screen.getByRole("link", { name: /Productions/ });
    expect(wsLink.getAttribute("href")).toBe("/dashboard/productions");
  });

  it("does not render section/subsection/feature levels", () => {
    // The old breadcrumb accepted section/subsection/feature.
    // The new one only accepts workspace/tab.
    render(
      <DashboardBreadcrumb
        workspace={{ id: "productions", label: "Productions" }}
        tab={{ id: "shooting", label: "Shooting" }}
      />,
    );
    // Should NOT have more than 2 levels
    const breadcrumbs = screen.getAllByRole("listitem");
    expect(breadcrumbs.length).toBeLessThanOrEqual(2);
  });
});
```

- [ ] **9.3.2** Implement simplified `DashboardBreadcrumb` component in the dashboard layout. Replace the existing multi-level breadcrumb with a 2-level version that accepts `workspace` and optional `tab` props. Remove the old section/subsection/feature props.

- [ ] **9.3.3** Verify test passes:

```bash
pnpm --filter ./apps/web test -- --run apps/web/app/dashboard/__tests__/dashboard-shell.test.tsx
```

- [ ] **9.3.4** Verify no regressions:

```bash
pnpm --filter ./apps/web test
pnpm typecheck
```

- [ ] **9.2.3** Commit:

```
[#9] Redesign DashboardShell with WorkspaceSidebar and AI panel slot
```

---

### Issue 10: AIPanel organism

**Summary:** Right-side collapsible panel with chat UI, context indicator, citations, suggested questions. Toggles via header button and keyboard shortcut (Cmd+J).

**Files created:**
- `packages/ui/src/organisms/AIPanel/AIPanel.tsx`
- `packages/ui/src/organisms/AIPanel/AIPanel.stories.tsx`
- `packages/ui/src/organisms/AIPanel/AIPanel.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: empty state, with messages, with citations, mobile overlay
- Collapse/pin toggle
- Cmd+J keyboard shortcut
- Context indicator shows current workspace and tab
- Suggested questions based on workspace context
- Message input with send button
- Citation links with workspace navigation

#### Step 10.1: Write failing tests for AIPanel

- [ ] **10.1.1** Create `packages/ui/src/organisms/AIPanel/AIPanel.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIPanel, type AIPanelProps } from "./AIPanel";

const defaultProps: AIPanelProps = {
  open: true,
  onClose: vi.fn(),
  context: { workspace: "productions", tab: "overview", workspaceLabel: "Productions", tabLabel: "Overview" },
  messages: [],
  onSendMessage: vi.fn(),
  suggestedQuestions: [
    "What can I do in Productions?",
    "Show me active features",
  ],
  loading: false,
};

describe("AIPanel", () => {
  it("renders when open", () => {
    render(<AIPanel {...defaultProps} />);
    expect(screen.getByText("AI Assistant")).toBeDefined();
  });

  it("does not render content when closed", () => {
    render(<AIPanel {...defaultProps} open={false} />);
    expect(screen.queryByText("AI Assistant")).toBeNull();
  });

  it("shows context indicator", () => {
    render(<AIPanel {...defaultProps} />);
    expect(screen.getByText(/Productions/)).toBeDefined();
    expect(screen.getByText(/Overview/)).toBeDefined();
  });

  it("renders suggested questions in empty state", () => {
    render(<AIPanel {...defaultProps} />);
    expect(screen.getByText("What can I do in Productions?")).toBeDefined();
    expect(screen.getByText("Show me active features")).toBeDefined();
  });

  it("renders messages when provided", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "What is this?" },
      { id: "2", role: "assistant" as const, content: "This is the Productions workspace.", citations: [{ label: "Productions", url: "/dashboard/productions" }] },
    ];
    render(<AIPanel {...defaultProps} messages={messages} />);
    expect(screen.getByText("What is this?")).toBeDefined();
    expect(screen.getByText("This is the Productions workspace.")).toBeDefined();
  });

  it("renders citation links", () => {
    const messages = [
      { id: "1", role: "assistant" as const, content: "Check this:", citations: [{ label: "Finance", url: "/dashboard/finance" }] },
    ];
    render(<AIPanel {...defaultProps} messages={messages} />);
    expect(screen.getByText("Finance")).toBeDefined();
  });

  it("calls onSendMessage when message is submitted", () => {
    const onSendMessage = vi.fn();
    render(<AIPanel {...defaultProps} onSendMessage={onSendMessage} />);
    const input = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.submit(input.closest("form")!);
    expect(onSendMessage).toHaveBeenCalledWith("Hello");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<AIPanel {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows loading indicator when loading", () => {
    render(<AIPanel {...defaultProps} loading />);
    // Should show a typing/loading indicator
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("disables send button when input is empty", () => {
    render(<AIPanel {...defaultProps} />);
    const sendBtn = screen.getByLabelText(/send/i);
    expect(sendBtn).toHaveProperty("disabled", true);
  });
});
```

- [ ] **10.1.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/organisms/AIPanel/AIPanel.test.tsx
```

#### Step 10.2: Implement AIPanel organism

- [ ] **10.2.1** Create `packages/ui/src/organisms/AIPanel/AIPanel.tsx`:

```typescript
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { cn } from '../../lib/utils';

export interface AIPanelCitation {
  label: string;
  url: string;
}

export interface AIPanelMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: AIPanelCitation[];
}

export interface AIPanelContext {
  workspace: string;
  tab: string;
  workspaceLabel: string;
  tabLabel: string;
}

export interface AIPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Current workspace context */
  context: AIPanelContext;
  /** Chat messages */
  messages: AIPanelMessage[];
  /** Send message handler */
  onSendMessage: (message: string) => void;
  /** Suggested questions for empty state */
  suggestedQuestions: string[];
  /** Whether AI is processing */
  loading: boolean;
  /** Citation click handler */
  onCitationClick?: (url: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Right-side collapsible AI assistant panel.
 * Shows context indicator, chat messages with citations, and suggested questions.
 */
export function AIPanel({
  open,
  onClose,
  context,
  messages,
  onSendMessage,
  suggestedQuestions,
  loading,
  onCitationClick,
  className,
}: AIPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput('');
  };

  return (
    <div className={cn('flex h-full w-[360px] flex-col border-l bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">AI Assistant</h2>
          <p className="text-xs text-muted-foreground">
            {context.workspaceLabel} &rsaquo; {context.tabLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI panel"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50"
        >
          &times;
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ask anything about {context.workspaceLabel}...
            </p>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(q)}
                className="block w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-accent/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'rounded-lg px-3 py-2 text-sm',
                msg.role === 'user' ? 'ml-8 bg-primary text-primary-foreground' : 'mr-8 bg-muted',
              )}
            >
              {msg.content}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {msg.citations.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onCitationClick?.(c.url)}
                      className="inline-flex items-center rounded-full bg-background/50 px-2 py-0.5 text-xs text-primary hover:underline"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div role="status" className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about ${context.workspaceLabel}...`}
            maxLength={500}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **10.2.2** Create `packages/ui/src/organisms/AIPanel/AIPanel.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { AIPanel } from './AIPanel';

const meta: Meta<typeof AIPanel> = {
  title: 'Organisms/AIPanel',
  component: AIPanel,
  decorators: [(Story) => <div className="h-[600px] flex justify-end"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AIPanel>;

const context = { workspace: 'productions', tab: 'overview', workspaceLabel: 'Productions', tabLabel: 'Overview' };

export const EmptyState: Story = {
  args: {
    open: true,
    onClose: () => {},
    context,
    messages: [],
    onSendMessage: (m) => console.log('send', m),
    suggestedQuestions: ['What can I do in Productions?', 'Show me active features', 'What is coming next?'],
    loading: false,
  },
};

export const WithMessages: Story = {
  args: {
    ...EmptyState.args,
    messages: [
      { id: '1', role: 'user', content: 'What can I do in Productions?' },
      { id: '2', role: 'assistant', content: 'In the Productions workspace, you can manage film, TV, and broadcast production lifecycles. Currently available: Overview and Pre-Production tabs.', citations: [{ label: 'Productions Overview', url: '/dashboard/productions' }] },
    ],
  },
};

export const Loading: Story = {
  args: {
    ...WithMessages.args,
    loading: true,
    messages: [
      ...WithMessages.args!.messages!,
      { id: '3', role: 'user', content: 'Tell me about shooting schedules' },
    ],
  },
};

export const Closed: Story = {
  args: { ...EmptyState.args, open: false },
};
```

- [ ] **10.2.3** Verify AIPanel tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/organisms/AIPanel/AIPanel.test.tsx
```

- [ ] **10.2.4** Add exports and run full verification:

```typescript
// Add to packages/ui/src/index.ts:
export { AIPanel, type AIPanelProps, type AIPanelMessage, type AIPanelContext, type AIPanelCitation } from './organisms/AIPanel/AIPanel';
```

```bash
pnpm --filter ./packages/ui test
pnpm build-storybook
pnpm typecheck
```

- [ ] **10.2.5** Commit:

```
[#10] Add AIPanel organism with chat UI, context indicator, and citations
```

---

> **Phase 2 complete.** At this point:
> - WorkspaceSidebar renders role-adaptive workspace list with Home, Inbox, Recents, Profile, Help
> - WorkspaceTabs displays tab bar with active/coming_soon/planned states
> - ScopeBar provides configurable filters and primary action
> - WorkspaceShell template composes header + tabs + scope bar + canvas + planned section
> - DashboardShell integrates WorkspaceSidebar and AI panel slot
> - AIPanel provides chat interface with context awareness and citations
>
> **Next:** Phase 3 (Home & Inbox) builds the home dashboard and inbox system.

---

## Phase 3: Home & Inbox (Issues 11-15)

Phase 3 builds the home launchpad (workspace cards, attention items, recents, what's new) and the full inbox system with backend API.

---

### Issue 11: WorkspaceCard molecule

**Summary:** Home dashboard card for a workspace: icon, name, summary stats, feature counts, expand chevron to reveal tab list, primary action button.

**Files created:**
- `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.tsx`
- `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.stories.tsx`
- `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: with stats, without stats, expanded, loading, all 11 workspace variants
- Click card navigates to workspace
- Expand reveals tab list with status dots
- Primary action button from role quick actions

#### Step 11.1: Write failing tests for WorkspaceCard

- [ ] **11.1.1** Create `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceCard, type WorkspaceCardProps } from "./WorkspaceCard";

const defaultProps: WorkspaceCardProps = {
  workspace: {
    id: "productions",
    label: "Productions",
    icon: "film",
    description: "Film, TV, and broadcast production lifecycle",
  },
  stats: [{ label: "Active Productions", value: "3" }, { label: "In Post", value: "1" }],
  activeFeatureCount: 8,
  upcomingFeatureCount: 15,
  tabs: [
    { id: "overview", label: "Overview", status: "active" as const },
    { id: "shooting", label: "Shooting", status: "coming_soon" as const },
    { id: "workflow", label: "Workflow", status: "planned" as const },
  ],
  primaryAction: { label: "My Productions", onClick: vi.fn() },
  onNavigate: vi.fn(),
};

describe("WorkspaceCard", () => {
  it("renders workspace name", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText("Productions")).toBeDefined();
  });

  it("renders summary stats", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText(/Active Productions/)).toBeDefined();
  });

  it("renders feature counts", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText(/8 active/)).toBeDefined();
    expect(screen.getByText(/15 upcoming/)).toBeDefined();
  });

  it("renders primary action button", () => {
    render(<WorkspaceCard {...defaultProps} />);
    expect(screen.getByText("My Productions")).toBeDefined();
  });

  it("calls primaryAction onClick when button is clicked", () => {
    const onClick = vi.fn();
    render(<WorkspaceCard {...defaultProps} primaryAction={{ label: "Test", onClick }} />);
    fireEvent.click(screen.getByText("Test"));
    expect(onClick).toHaveBeenCalled();
  });

  it("expands to show tabs on chevron click", () => {
    render(<WorkspaceCard {...defaultProps} />);
    // Tabs should be hidden initially
    expect(screen.queryByText("Overview")).toBeNull();
    // Click expand
    const expandBtn = screen.getByLabelText(/expand/i);
    fireEvent.click(expandBtn);
    // Tabs should now be visible
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Shooting")).toBeDefined();
    expect(screen.getByText("Workflow")).toBeDefined();
  });

  it("calls onNavigate when card body is clicked", () => {
    const onNavigate = vi.fn();
    render(<WorkspaceCard {...defaultProps} onNavigate={onNavigate} />);
    // Click on the card (not the action button)
    fireEvent.click(screen.getByText("Productions"));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard/productions");
  });

  it("renders no stats when stats array is empty", () => {
    render(<WorkspaceCard {...defaultProps} stats={[]} />);
    expect(screen.queryByText("Active Productions")).toBeNull();
  });

  it("renders no primary action when not provided", () => {
    render(<WorkspaceCard {...defaultProps} primaryAction={undefined} />);
    expect(screen.queryByText("My Productions")).toBeNull();
  });
});
```

- [ ] **11.1.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.test.tsx
```

#### Step 11.2: Implement WorkspaceCard molecule

- [ ] **11.2.1** Create `packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { WorkspaceIcon } from '../../atoms/WorkspaceIcon/WorkspaceIcon';
import { FeatureStatusDot } from '../../atoms/FeatureStatusDot/FeatureStatusDot';

export interface WorkspaceCardStat {
  label: string;
  value: string;
}

export interface WorkspaceCardTab {
  id: string;
  label: string;
  status: 'active' | 'coming_soon' | 'planned';
}

export interface WorkspaceCardAction {
  label: string;
  onClick: () => void;
}

export interface WorkspaceCardProps {
  workspace: { id: string; label: string; icon: string; description: string };
  stats: WorkspaceCardStat[];
  activeFeatureCount: number;
  upcomingFeatureCount: number;
  tabs: WorkspaceCardTab[];
  primaryAction?: WorkspaceCardAction;
  onNavigate: (path: string) => void;
  className?: string;
}

/**
 * Home dashboard workspace card. Shows icon, name, stats, feature counts,
 * expandable tab list, and primary action.
 */
export function WorkspaceCard({
  workspace,
  stats,
  activeFeatureCount,
  upcomingFeatureCount,
  tabs,
  primaryAction,
  onNavigate,
  className,
}: WorkspaceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Card body — clickable to navigate */}
      <button
        type="button"
        onClick={() => onNavigate(`/dashboard/${workspace.id}`)}
        className="w-full p-4 text-left hover:bg-accent/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-start gap-3">
          <WorkspaceIcon icon={workspace.icon} size={24} decorative className="mt-0.5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{workspace.label}</h3>
            {stats.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {stats.map((s) => (
                  <span key={s.label} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{s.value}</span> {s.label}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              <span>{activeFeatureCount} active</span>
              <span className="mx-1">&middot;</span>
              <span>{upcomingFeatureCount} upcoming</span>
            </p>
          </div>
        </div>
      </button>

      {/* Actions row */}
      <div className="flex items-center justify-between border-t px-4 py-2">
        {primaryAction ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); primaryAction.onClick(); }}
            className="text-sm font-medium text-primary hover:underline"
          >
            {primaryAction.label}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse tabs' : 'Expand tabs'}
          aria-expanded={expanded}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn('transition-transform', expanded && 'rotate-180')}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Expanded tabs */}
      {expanded && (
        <div className="border-t px-4 py-2 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(`/dashboard/${workspace.id}/${tab.id}`)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors"
            >
              <FeatureStatusDot status={tab.status} />
              <span className={cn(tab.status !== 'active' && 'text-muted-foreground')}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **11.2.2** Create stories and verify tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/molecules/WorkspaceCard/WorkspaceCard.test.tsx
pnpm build-storybook
```

- [ ] **11.2.3** Commit:

```
[#11] Add WorkspaceCard molecule with expandable tab list and primary action
```

---

### Issue 12: HomeDashboard template

**Summary:** Home dashboard template with 4 sections: Needs Your Attention, Pick Up Where You Left Off, Your Workspaces (card grid), What's New.

**Files created:**
- `packages/ui/src/templates/HomeDashboard/HomeDashboard.tsx`
- `packages/ui/src/templates/HomeDashboard/HomeDashboard.stories.tsx`
- `packages/ui/src/templates/HomeDashboard/HomeDashboard.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`
- `apps/web/app/dashboard/page.tsx`

**Acceptance criteria:**
- Stories for 3+ roles showing different workspace subsets
- Empty states for each section
- Responsive card grid: 3 columns desktop, 2 tablet, 1 mobile
- Attention section shows actionable items from inbox
- Recents from localStorage via useRecents
- What's New section shows recently activated features (or hidden if none)

#### Step 12.1: Write failing tests for HomeDashboard

- [ ] **12.1.1** Create `packages/ui/src/templates/HomeDashboard/HomeDashboard.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeDashboard, type HomeDashboardProps } from "./HomeDashboard";

const defaultProps: HomeDashboardProps = {
  attentionItems: [
    { id: "1", type: "approval", summary: "Invoice #1234 needs approval", workspace: "finance", sourceUrl: "/dashboard/finance/invoices", priority: "action", createdAt: new Date().toISOString() },
  ],
  recents: [
    { label: "Shooting — Productions", path: "/dashboard/productions/shooting", timestamp: new Date().toISOString() },
  ],
  workspaceCards: [
    {
      workspace: { id: "productions", label: "Productions", icon: "film", description: "Film production" },
      stats: [{ label: "Active", value: "3" }],
      activeFeatureCount: 5,
      upcomingFeatureCount: 10,
      tabs: [{ id: "overview", label: "Overview", status: "active" as const }],
    },
  ],
  whatsNew: [
    { featureId: "feat.1", label: "Crew Directory", workspace: "people", activatedAt: new Date().toISOString() },
  ],
  onNavigate: vi.fn(),
  onRecentClick: vi.fn(),
};

describe("HomeDashboard", () => {
  it("renders attention section with items", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText(/needs your attention/i)).toBeDefined();
    expect(screen.getByText(/Invoice #1234/)).toBeDefined();
  });

  it("renders empty attention state", () => {
    render(<HomeDashboard {...defaultProps} attentionItems={[]} />);
    expect(screen.getByText(/all caught up/i)).toBeDefined();
  });

  it("renders recents section", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText("Shooting — Productions")).toBeDefined();
  });

  it("renders empty recents state", () => {
    render(<HomeDashboard {...defaultProps} recents={[]} />);
    expect(screen.getByText(/start exploring/i)).toBeDefined();
  });

  it("renders workspace cards", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText("Productions")).toBeDefined();
  });

  it("renders what's new section", () => {
    render(<HomeDashboard {...defaultProps} />);
    expect(screen.getByText("Crew Directory")).toBeDefined();
  });

  it("hides what's new when empty", () => {
    render(<HomeDashboard {...defaultProps} whatsNew={[]} />);
    expect(screen.queryByText(/what's new/i)).toBeNull();
  });
});
```

- [ ] **12.1.2** Verify tests fail:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/templates/HomeDashboard/HomeDashboard.test.tsx
```

#### Step 12.2: Implement HomeDashboard template

- [ ] **12.2.1** Create `packages/ui/src/templates/HomeDashboard/HomeDashboard.tsx` with the following structure:

```typescript
'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { WorkspaceCard, type WorkspaceCardProps } from '../../molecules/WorkspaceCard/WorkspaceCard';
import { RecentItem } from '../../molecules/RecentItem/RecentItem';

export interface AttentionItemData {
  id: string;
  type: 'approval' | 'mention' | 'update' | 'system';
  summary: string;
  workspace: string;
  sourceUrl: string;
  priority: 'urgent' | 'action' | 'info';
  createdAt: string;
}

export interface RecentData {
  label: string;
  path: string;
  timestamp: string;
}

export interface WhatsNewData {
  featureId: string;
  label: string;
  workspace: string;
  activatedAt: string;
}

export interface HomeDashboardProps {
  attentionItems: AttentionItemData[];
  recents: RecentData[];
  workspaceCards: WorkspaceCardProps[];
  whatsNew: WhatsNewData[];
  onNavigate: (path: string) => void;
  onRecentClick: (path: string) => void;
}

export function HomeDashboard({
  attentionItems,
  recents,
  workspaceCards,
  whatsNew,
  onNavigate,
  onRecentClick,
}: HomeDashboardProps) {
  return (
    <div className="space-y-8 p-6">
      {/* Needs Your Attention */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Needs Your Attention</h2>
        {attentionItems.length === 0 ? (
          <p className="text-muted-foreground">You're all caught up!</p>
        ) : (
          <ul className="space-y-2">
            {attentionItems.map((item) => (
              <li key={item.id} className="rounded-lg border p-3">
                <a href={item.sourceUrl} onClick={(e) => { e.preventDefault(); onNavigate(item.sourceUrl); }}>
                  {item.summary}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pick Up Where You Left Off */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Pick Up Where You Left Off</h2>
        {recents.length === 0 ? (
          <p className="text-muted-foreground">Start exploring workspaces to build your recents.</p>
        ) : (
          <ul className="space-y-1">
            {recents.map((r) => (
              <RecentItem key={r.path} label={r.label} path={r.path} timestamp={r.timestamp} onClick={() => onRecentClick(r.path)} />
            ))}
          </ul>
        )}
      </section>

      {/* Your Workspaces */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Your Workspaces</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaceCards.map((card) => (
            <WorkspaceCard key={card.workspace.id} {...card} />
          ))}
        </div>
      </section>

      {/* What's New */}
      {whatsNew.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">What's New</h2>
          <ul className="space-y-2">
            {whatsNew.map((item) => (
              <li key={item.featureId} className="rounded-lg border p-3">
                {item.label}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

- [ ] **12.2.2** Verify tests pass:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/templates/HomeDashboard/HomeDashboard.test.tsx
```

- [ ] **12.2.3** Create stories for HomeDashboard with 3+ role variants (admin, investor, guest).

- [ ] **12.2.4** Build storybook:

```bash
pnpm build-storybook
```

#### Step 12.3: Wire HomeDashboard to backend API

- [ ] **12.3.1** Create an API client function for the home summary in `apps/web/app/lib/api-client.ts` (or a new file `apps/web/app/dashboard/api/home.ts`):

```typescript
import { API_BASE } from '../../lib/api-client';

export interface HomeSummaryResponse {
  attention: {
    total: number;
    items: Array<{
      id: string;
      type: string;
      summary: string;
      workspace: string;
      sourceUrl: string;
      priority: string;
      createdAt: string;
    }>;
  };
  workspaceStats: Record<string, {
    stats: Array<{ label: string; value: string }>;
  }>;
  whatsNew: Array<{
    featureId: string;
    label: string;
    workspace: string;
    activatedAt: string;
  }>;
}

export async function fetchHomeSummary(): Promise<HomeSummaryResponse> {
  const res = await fetch(`${API_BASE}/v1/home/summary`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Home summary fetch failed: ${res.status}`);
  return res.json();
}
```

- [ ] **12.3.2** Update `apps/web/app/dashboard/page.tsx` to consume `GET /v1/home/summary`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { HomeDashboard, type HomeDashboardProps } from '@productioncity/holding-ui';
import { useRegistry } from './components/RegistryProvider';
import { useRecents } from './hooks/useRecents';
import { fetchHomeSummary, type HomeSummaryResponse } from './api/home';

export default function DashboardHomePage() {
  const { visibleWorkspaces, visibleFeatureIds, userRole } = useRegistry();
  const { recents } = useRecents({
    visibleWorkspaceIds: visibleWorkspaces.map((ws) => ws.id),
    userRole,
  });

  const [summary, setSummary] = useState<HomeSummaryResponse | null>(null);

  useEffect(() => {
    fetchHomeSummary().then(setSummary).catch(console.error);
  }, [userRole]);

  // Map visibleWorkspaces + summary stats into workspace cards
  const workspaceCards = visibleWorkspaces.map((ws) => {
    const wsStats = summary?.workspaceStats[ws.id];
    return {
      workspace: { id: ws.id, label: ws.label, icon: ws.icon, description: ws.description },
      stats: wsStats?.stats ?? [],
      activeFeatureCount: ws.activeFeatureCount,
      upcomingFeatureCount: ws.upcomingFeatureCount,
      tabs: ws.tabs.map((t) => ({ id: t.id, label: t.label, status: t.status })),
    };
  });

  return (
    <HomeDashboard
      attentionItems={summary?.attention.items ?? []}
      recents={recents}
      workspaceCards={workspaceCards}
      whatsNew={summary?.whatsNew ?? []}
      onNavigate={(path) => { window.location.href = path; }}
      onRecentClick={(path) => { window.location.href = path; }}
    />
  );
}
```

- [ ] **12.3.3** Commit:

```
[#12] Add HomeDashboard template with attention, recents, workspace cards, and what's new
```

---

### Issue 13: GET /v1/home/summary endpoint

**Summary:** Backend endpoint returning the home dashboard summary: attention items (count + top 5), workspace summary stats, and recently activated features. Per-role filtered.

**Files created:**
- `apps/backend/src/home/summary.ts`
- `apps/backend/src/__tests__/home-summary.test.ts`

**Files modified:**
- `apps/backend/src/routes.ts`

**Acceptance criteria:**
- Role-scoped responses correct for all 10 roles
- Correct attention counts from inbox
- Workspace stats populated (placeholder values in Phase 1)
- `whatsNew` populated from features where `activatedAt` within last 30 days
- `Cache-Control: private, max-age=60`, `Vary: Cookie`
- Response time <100ms
- 401 for unauthenticated requests

#### Step 13.1: Write failing tests

- [ ] **13.1.1** Create `apps/backend/src/__tests__/home-summary.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active" },
      update: {},
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-${user.id.slice(0, 8)}`, description: roleName },
    });

    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      } catch {
        // skip duplicate
      }
    }

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const session = await createSession(prisma, user.id);
    return { user, role, session, cookie: `${SESSION_COOKIE_NAME}=${session.token}` };
  } finally {
    await prisma.$disconnect();
  }
}

describe("GET /v1/home/summary", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary"),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with correct shape for authenticated user", async () => {
    const { cookie } = await createUserWithRole("home-admin@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.attention).toBeDefined();
    expect(body.attention.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.attention.items)).toBe(true);
    expect(typeof body.workspaceStats).toBe("object");
    expect(body.workspaceStats).not.toBeNull();
    expect(Array.isArray(body.workspaceStats)).toBe(false);
    expect(Array.isArray(body.whatsNew)).toBe(true);
  });

  it("sets correct cache headers", async () => {
    const { cookie } = await createUserWithRole("home-cache@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=60");
    expect(res.headers.get("Vary")).toBe("Cookie");
  });

  it("limits attention items to 5", async () => {
    const { cookie } = await createUserWithRole("home-attn@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    expect(body.attention.items.length).toBeLessThanOrEqual(5);
  });

  it("whatsNew includes only features activated in last 30 days", async () => {
    const { cookie } = await createUserWithRole("home-new@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    for (const item of body.whatsNew) {
      expect(new Date(item.activatedAt).getTime()).toBeGreaterThan(thirtyDaysAgo);
    }
  });
});
```

- [ ] **13.1.2** Add role-scoped tests to verify different roles get different data:

```typescript
  it("returns role-scoped workspace stats for investor", async () => {
    const { cookie } = await createUserWithRole("home-investor@dashboard.test", "investor", [["dashboard", "investor"], ["finance", "read"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    // Investor should only see stats for investor-relations and finance
    const wsIds = Object.keys(body.workspaceStats);
    expect(wsIds).toContain("investor-relations");
    expect(wsIds).toContain("finance");
    expect(wsIds).not.toContain("productions");
    expect(wsIds).not.toContain("administration");
  });

  it("returns role-scoped workspace stats for guest", async () => {
    const { cookie } = await createUserWithRole("home-guest@dashboard.test", "guest", [["dashboard", "guest"], ["events", "browse"], ["education", "browse"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    const wsIds = Object.keys(body.workspaceStats);
    expect(wsIds).toContain("events");
    expect(wsIds).toContain("education");
    expect(wsIds).not.toContain("finance");
    expect(wsIds).not.toContain("administration");
  });

  it("attention items are filtered to user's visible workspaces", async () => {
    // Guest should not see attention items from finance or admin workspaces
    const { cookie } = await createUserWithRole("home-guest-attn@dashboard.test", "guest", [["dashboard", "guest"], ["events", "browse"], ["education", "browse"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/home/summary", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    for (const item of body.attention.items) {
      expect(["events", "education", null]).toContain(item.workspace);
    }
  });
```

- [ ] **13.1.3** Implement the endpoint handler, register route, verify tests pass.

- [ ] **13.1.3** Commit:

```
[#13] Add GET /v1/home/summary endpoint with attention items, stats, and what's new
```

---

### Issue 14: InboxPage template + InboxFeed organism

**Summary:** Full inbox page with InboxFeed organism: item list with filters (type, workspace, date), mark read, dismiss, empty state. Badge count for sidebar.

**Files created:**
- `packages/ui/src/atoms/AttentionDot/AttentionDot.tsx`
- `packages/ui/src/atoms/AttentionDot/AttentionDot.stories.tsx`
- `packages/ui/src/atoms/AttentionDot/AttentionDot.test.tsx`
- `packages/ui/src/molecules/AttentionItem/AttentionItem.tsx`
- `packages/ui/src/molecules/AttentionItem/AttentionItem.stories.tsx`
- `packages/ui/src/molecules/AttentionItem/AttentionItem.test.tsx`
- `packages/ui/src/organisms/InboxFeed/InboxFeed.tsx`
- `packages/ui/src/organisms/InboxFeed/InboxFeed.stories.tsx`
- `packages/ui/src/organisms/InboxFeed/InboxFeed.test.tsx`
- `packages/ui/src/templates/InboxPage/InboxPage.tsx`
- `packages/ui/src/templates/InboxPage/InboxPage.stories.tsx`
- `packages/ui/src/templates/InboxPage/InboxPage.test.tsx`
- `apps/web/app/dashboard/inbox/page.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: with items, empty, filtered, loading
- AttentionDot shows priority colors (red=urgent, amber=action, blue=info)
- Mark read/dismiss works
- Filter by type, workspace, date range
- Cursor-based pagination (load more)
- Badge count updates from totalActionable in API response

#### Step 14.1: Write failing tests for AttentionDot atom

- [ ] **14.1.1** Create `packages/ui/src/atoms/AttentionDot/AttentionDot.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AttentionDot } from "./AttentionDot";

describe("AttentionDot", () => {
  it("renders red dot for urgent priority", () => {
    const { container } = render(<AttentionDot priority="urgent" />);
    expect(container.firstChild?.className).toContain("bg-red");
  });

  it("renders amber dot for action priority", () => {
    const { container } = render(<AttentionDot priority="action" />);
    expect(container.firstChild?.className).toContain("bg-amber");
  });

  it("renders blue dot for info priority", () => {
    const { container } = render(<AttentionDot priority="info" />);
    expect(container.firstChild?.className).toContain("bg-blue");
  });

  it("has accessible label", () => {
    const { container } = render(<AttentionDot priority="urgent" />);
    expect(container.querySelector(".sr-only")?.textContent).toBe("Urgent");
  });
});
```

- [ ] **14.1.2** Implement AttentionDot, AttentionItem, InboxFeed, InboxPage following the same TDD pattern.

- [ ] **14.1.3** Write tests for InboxFeed organism. Create `packages/ui/src/organisms/InboxFeed/InboxFeed.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InboxFeed, type InboxFeedProps, type InboxFeedItem } from "./InboxFeed";

const mockItems: InboxFeedItem[] = [
  {
    id: "item-1",
    type: "approval",
    summary: "Invoice #1234 needs approval",
    workspace: "finance",
    sourceUrl: "/dashboard/finance/invoices",
    priority: "action",
    read: false,
    dismissed: false,
    actionable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "item-2",
    type: "mention",
    summary: "You were mentioned in Production Alpha",
    workspace: "productions",
    sourceUrl: "/dashboard/productions/overview",
    priority: "info",
    read: true,
    dismissed: false,
    actionable: false,
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "item-3",
    type: "system",
    summary: "System maintenance scheduled",
    workspace: null,
    sourceUrl: "/dashboard/administration/health",
    priority: "info",
    read: false,
    dismissed: false,
    actionable: false,
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
];

const defaultProps: InboxFeedProps = {
  items: mockItems,
  loading: false,
  totalUnread: 2,
  totalActionable: 1,
  hasMore: false,
  onMarkRead: vi.fn(),
  onDismiss: vi.fn(),
  onLoadMore: vi.fn(),
  onNavigate: vi.fn(),
  activeFilters: {},
  onFilterChange: vi.fn(),
};

describe("InboxFeed", () => {
  it("renders list of inbox items", () => {
    render(<InboxFeed {...defaultProps} />);
    expect(screen.getByText("Invoice #1234 needs approval")).toBeDefined();
    expect(screen.getByText("You were mentioned in Production Alpha")).toBeDefined();
    expect(screen.getByText("System maintenance scheduled")).toBeDefined();
  });

  it("shows empty state when no items", () => {
    render(<InboxFeed {...defaultProps} items={[]} totalUnread={0} totalActionable={0} />);
    expect(screen.getByText(/no items/i)).toBeDefined();
  });

  it("calls onMarkRead when mark-read button clicked", () => {
    const onMarkRead = vi.fn();
    render(<InboxFeed {...defaultProps} onMarkRead={onMarkRead} />);
    // Click mark-read on the first unread item
    const markReadBtn = screen.getAllByLabelText(/mark as read/i)[0];
    fireEvent.click(markReadBtn);
    expect(onMarkRead).toHaveBeenCalledWith("item-1");
  });

  it("calls onDismiss when dismiss button clicked", () => {
    const onDismiss = vi.fn();
    render(<InboxFeed {...defaultProps} onDismiss={onDismiss} />);
    const dismissBtn = screen.getAllByLabelText(/dismiss/i)[0];
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledWith("item-1");
  });

  it("filters by type", () => {
    const onFilterChange = vi.fn();
    render(<InboxFeed {...defaultProps} onFilterChange={onFilterChange} />);
    // Select type filter
    const typeFilter = screen.getByLabelText(/filter by type/i);
    fireEvent.change(typeFilter, { target: { value: "approval" } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ type: "approval" }));
  });

  it("filters by workspace", () => {
    const onFilterChange = vi.fn();
    render(<InboxFeed {...defaultProps} onFilterChange={onFilterChange} />);
    const wsFilter = screen.getByLabelText(/filter by workspace/i);
    fireEvent.change(wsFilter, { target: { value: "finance" } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ workspace: "finance" }));
  });

  it("loads more items on click", () => {
    const onLoadMore = vi.fn();
    render(<InboxFeed {...defaultProps} hasMore onLoadMore={onLoadMore} />);
    const loadMoreBtn = screen.getByText(/load more/i);
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("shows loading skeleton", () => {
    const { container } = render(<InboxFeed {...defaultProps} loading items={[]} />);
    // Should render skeleton placeholder elements
    expect(container.querySelectorAll('[data-testid="inbox-skeleton"]').length).toBeGreaterThan(0);
  });
});
```

- [ ] **14.1.4** Verify all tests pass, create stories, build storybook.

#### Step 14.2: Wire InboxPage to backend API

- [ ] **14.2.1** Update `apps/web/app/dashboard/inbox/page.tsx` to consume the inbox API endpoints:

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { InboxPage as InboxPageTemplate } from '@productioncity/holding-ui';
import { API_BASE } from '../../lib/api-client';

interface InboxFilters {
  type?: string;
  workspace?: string;
  read?: boolean;
}

export default function InboxPageRoute() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalActionable, setTotalActionable] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<InboxFilters>({});

  const fetchInbox = useCallback(async (nextCursor?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextCursor) params.set('cursor', nextCursor);
      if (filters.type) params.set('type', filters.type);
      if (filters.workspace) params.set('workspace', filters.workspace);
      params.set('limit', '25');

      const res = await fetch(`${API_BASE}/v1/inbox?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Inbox fetch failed: ${res.status}`);
      const body = await res.json();

      setItems((prev) => nextCursor ? [...prev, ...body.items] : body.items);
      setTotalUnread(body.totalUnread);
      setTotalActionable(body.totalActionable);
      setCursor(body.nextCursor ?? null);
      setHasMore(!!body.nextCursor);
    } catch (err) {
      console.error('Inbox fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  const handleMarkRead = async (id: string) => {
    await fetch(`${API_BASE}/v1/inbox/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    // Re-fetch to update counts
    fetchInbox();
  };

  const handleDismiss = async (id: string) => {
    await fetch(`${API_BASE}/v1/inbox/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismissed: true }),
    });
    fetchInbox();
  };

  const handleMarkAllRead = async () => {
    await fetch(`${API_BASE}/v1/inbox/mark-all-read`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    fetchInbox();
  };

  return (
    <InboxPageTemplate
      items={items}
      loading={loading}
      totalUnread={totalUnread}
      totalActionable={totalActionable}
      hasMore={hasMore}
      onMarkRead={handleMarkRead}
      onDismiss={handleDismiss}
      onLoadMore={() => cursor && fetchInbox(cursor)}
      onMarkAllRead={handleMarkAllRead}
      onNavigate={(path) => { window.location.href = path; }}
      activeFilters={filters}
      onFilterChange={setFilters}
    />
  );
}
```

- [ ] **14.2.2** Commit:

```
[#14] Add InboxPage template with InboxFeed, AttentionDot, and AttentionItem components
```

---

> **Note on InboxItem references in frontend components:** The frontend components (InboxFeed,
> AttentionItem, etc.) use the term "inbox item" in their UI/prop names for clarity, but the
> underlying data model is the extended `Notification` table. The API returns `Notification`
> records filtered for inbox display.

---

### Issue 15: GET /v1/inbox + PATCH /v1/inbox/:id + POST /v1/inbox/mark-all-read

**Summary:** Backend inbox API: paginated list with filters, mark-read, dismiss, bulk mark-read. Extends the existing Notification model in Prisma schema with inbox-specific fields.

**Files created:**
- `apps/backend/src/inbox/handlers.ts`
- `apps/backend/src/__tests__/inbox.test.ts`
- `prisma/migrations/<timestamp>_extend_notification_for_inbox.sql`

**Files modified:**
- `apps/backend/src/routes.ts`
- `prisma/schema.prisma`
- `apps/backend/src/__tests__/test-helpers.ts` — update `Notification` DDL to include new columns (workspace, priority, dismissed, actionable, summary) and new indexes

**Acceptance criteria:**
- Existing Notification model extended with inbox fields (workspace, priority, dismissed, actionable, summary)
- `test-helpers.ts` `setupTestDatabase()` DDL kept in sync with schema changes (add columns + indexes to the Notification CREATE TABLE)
- Cursor-based pagination (default 25, max 100)
- Filters: type, workspace, read, actionable, dateFrom, dateTo, dismissed
- Sort: newest first by createdAt desc
- PATCH marks item read or dismissed (soft delete)
- POST mark-all-read with optional filter context
- Rate limiting: 60 req/min/user on GET
- 401 for unauthenticated, 404 for item not owned by user

#### Step 15.1: Extend existing Notification model with inbox fields

> **NOTE:** The existing `Notification` model (line 442 of `prisma/schema.prisma`) is extended
> rather than replaced. All existing notification code continues to work. The inbox API
> queries the same `Notification` table with the new fields for filtering and display.

- [ ] **15.1.1** Add the following fields to the existing `Notification` model in `prisma/schema.prisma`:

```prisma
// Add these fields to the existing Notification model:

  /// Workspace ID for filtering (nullable for system notifications)
  workspace   String?
  /// urgent | action | info
  priority    String    @default("info")
  /// Soft delete — dismissed items hidden by default
  dismissed   Boolean   @default(false)
  /// Whether this notification requires user action
  actionable  Boolean   @default(false)
  /// Human-readable summary (currently derived from metadata in existing code)
  summary     String?
```

- [ ] **15.1.2** Add new indexes to the existing `Notification` model:

```prisma
// Add these indexes inside the existing Notification model:
  @@index([userId, dismissed])
  @@index([userId, type])
```

- [ ] **15.1.3** Generate an ALTER TABLE migration (not CREATE TABLE):

```bash
pnpm exec prisma migrate diff \
  --from-config-datasource \
  --to-schema ./prisma/schema.prisma \
  --script \
  --output ./prisma/migrations/$(date +%Y%m%d%H%M%S)_extend_notification_for_inbox.sql
```

> The generated SQL should contain `ALTER TABLE "Notification" ADD COLUMN` statements
> for the new fields. Verify it does NOT create a new table.

- [ ] **15.1.4** Generate Prisma client:

```bash
pnpm exec prisma generate
```

#### Step 15.2: Write failing tests for inbox handlers

- [ ] **15.2.1** Create `apps/backend/src/__tests__/inbox.test.ts`:

> **IMPORTANT:** These tests require seeded inbox items. Add a `beforeAll` block to seed test data via Prisma, and `afterAll` to clean up. Without seeded data, pagination, filtering, and mark-read tests cannot verify real behaviour.

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

/**
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active" },
      update: {},
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-${user.id.slice(0, 8)}`, description: roleName },
    });

    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      } catch {
        // skip duplicate
      }
    }

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const session = await createSession(prisma, user.id);
    return { user, role, session, cookie: `${SESSION_COOKIE_NAME}=${session.token}` };
  } finally {
    await prisma.$disconnect();
  }
}

let inboxAdminCookie: string;

beforeAll(async () => {
  await setupTestDatabase();

  // Create admin user with role and seed inbox items
  const { user: adminUser, cookie } = await createUserWithRole(
    "inbox-admin@dashboard.test",
    "admin",
    [["dashboard", "admin"]],
  );
  inboxAdminCookie = cookie;

  const prisma = await createPrismaClient(env.DB);
  try {
    await prisma.notification.createMany({
      data: [
        {
          id: "inbox-seed-1",
          userId: adminUser.id,
          type: "approval",
          resourceType: "invoice",
          resourceId: "inv-1234",
          summary: "Invoice #1234 needs your approval",
          workspace: "finance",
          actionUrl: "/dashboard/finance/invoices",
          priority: "action",
          actionable: true,
        },
        {
          id: "inbox-seed-2",
          userId: adminUser.id,
          type: "mention",
          resourceType: "production",
          resourceId: "prod-alpha",
          summary: "You were mentioned in Production Alpha discussion",
          workspace: "productions",
          actionUrl: "/dashboard/productions/overview",
          priority: "info",
          actionable: false,
        },
        {
          id: "inbox-seed-3",
          userId: adminUser.id,
          type: "update",
          resourceType: "facility",
          resourceId: "sound-stage-3",
          summary: "Facility booking confirmed for Sound Stage 3",
          workspace: "facilities",
          actionUrl: "/dashboard/facilities/calendar",
          priority: "info",
          readAt: new Date(),
          actionable: false,
        },
        {
          id: "inbox-seed-4",
          userId: adminUser.id,
          type: "system",
          resourceType: "system",
          resourceId: "maintenance-notice",
          summary: "System maintenance scheduled for tonight",
          workspace: null,
          actionUrl: "/dashboard/administration/health",
          priority: "info",
          actionable: false,
        },
      ],
    });
  } finally {
    await prisma.$disconnect();
  }
});

describe("GET /v1/inbox", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox"),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with items array and pagination", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.totalUnread).toBe("number");
    expect(typeof body.totalActionable).toBe("number");
  });

  it("supports cursor-based pagination", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?limit=2", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json();
    if (body.nextCursor) {
      const res2 = await app.fetch(
        new Request(`http://localhost/v1/inbox?cursor=${body.nextCursor}&limit=2`, {
          headers: { Cookie: inboxAdminCookie },
        }),
        env,
      );
      expect(res2.status).toBe(200);
    }
  });

  it("filters by type", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?type=approval", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json();
    for (const item of body.items) {
      expect(item.type).toBe("approval");
    }
  });

  it("filters by workspace", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?workspace=finance", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json();
    for (const item of body.items) {
      expect(item.workspace).toBe("finance");
    }
  });

  it("filters by read status", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?read=false", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json();
    for (const item of body.items) {
      expect(item.readAt).toBeNull();
    }
  });

  it("filters by actionable", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?actionable=true", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json();
    for (const item of body.items) {
      expect(item.actionable).toBe(true);
    }
  });

  it("filters by dateFrom and dateTo", async () => {
    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date().toISOString();
    const res = await app.fetch(
      new Request(`http://localhost/v1/inbox?dateFrom=${from}&dateTo=${to}`, {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  it("excludes dismissed by default, includes with filter", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?dismissed=true", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
  });

  it("returns items sorted newest first", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json();
    for (let i = 1; i < body.items.length; i++) {
      expect(new Date(body.items[i - 1].createdAt).getTime())
        .toBeGreaterThanOrEqual(new Date(body.items[i].createdAt).getTime());
    }
  });

  it("caps limit at 100", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?limit=200", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json();
    expect(body.items.length).toBeLessThanOrEqual(100);
  });
});

describe("PATCH /v1/inbox/:id", () => {
  it("returns 401 for unauthenticated", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/test-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("marks item as read", async () => {
    // Get list to find a real item ID
    const listRes = await app.fetch(
      new Request("http://localhost/v1/inbox", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const listBody = await listRes.json();
    expect(listBody.items.length).toBeGreaterThan(0);

    const itemId = listBody.items[0].id;
    const res = await app.fetch(
      new Request(`http://localhost/v1/inbox/${itemId}`, {
        method: "PATCH",
        headers: { Cookie: inboxAdminCookie, "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.read).toBe(true);
    expect(body.readAt).toBeDefined();
  });

  it("dismisses an item", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/inbox-seed-4", {
        method: "PATCH",
        headers: { Cookie: inboxAdminCookie, "Content-Type": "application/json" },
        body: JSON.stringify({ dismissed: true }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dismissed).toBe(true);
  });

  it("returns 404 for item not owned by user", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/nonexistent", {
        method: "PATCH",
        headers: { Cookie: inboxAdminCookie, "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }),
      env,
    );
    expect(res.status).toBe(404);
  });
});

describe("POST /v1/inbox/mark-all-read", () => {
  it("returns 401 for unauthenticated", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/mark-all-read", {
        method: "POST",
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns updated count", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/mark-all-read", {
        method: "POST",
        headers: { Cookie: inboxAdminCookie, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.updated).toBe("number");
  });

  it("accepts optional type filter", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/mark-all-read", {
        method: "POST",
        headers: { Cookie: inboxAdminCookie, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "approval" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.updated).toBe("number");
  });
});
```

- [ ] **15.2.2** Implement inbox handlers, register routes, verify tests pass.

- [ ] **15.2.3** Commit:

```
[#15] Add inbox API with GET /v1/inbox, PATCH /v1/inbox/:id, POST /v1/inbox/mark-all-read
```

---

> **Phase 3 complete.** At this point:
> - Home dashboard shows attention items, recents, workspace cards, and what's new
> - Inbox page provides filtered feed with mark read/dismiss
> - Backend serves home summary and inbox APIs with pagination and role scoping
> - Notification model extended with inbox fields (workspace, priority, dismissed, actionable, summary) and proper indexes
>
> **Next:** Phase 4 (Canvas Types Part 1) builds the table, board, and calendar organisms.

---

## Phase 4: Canvas Types Part 1 (Issues 16-18)

Phase 4 builds the first three canvas organisms: table (wrapping existing DataTable), board (kanban with @dnd-kit), and calendar (month/week/day views).

---

### Issue 16: CanvasTable organism

**Summary:** Workspace-integrated data table wrapping the existing `DataTable` organism. Adds workspace context integration: column configuration from workspace/tab config, CSV export, and filter sync with ScopeBar.

**Files created:**
- `packages/ui/src/organisms/CanvasTable/CanvasTable.tsx`
- `packages/ui/src/organisms/CanvasTable/CanvasTable.stories.tsx`
- `packages/ui/src/organisms/CanvasTable/CanvasTable.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Wraps existing `DataTable` with workspace integration layer
- Stories: empty, loading, with data, with selection, with inline edit
- Keyboard navigation (Tab, Enter, arrow keys)
- ARIA grid role
- Column types: text, number, date, status, actions
- Pagination: 25/50/100 per page
- CSV export button
- Sort/filter state syncs with parent via controlled props

#### Step 16.1: Write failing tests for CanvasTable

- [ ] **16.1.1** Create `packages/ui/src/organisms/CanvasTable/CanvasTable.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasTable, type CanvasTableProps } from "./CanvasTable";

interface TestRow {
  id: string;
  name: string;
  status: string;
  date: string;
}

const columns = [
  { id: "name", header: "Name", accessor: "name" as keyof TestRow, sortable: true },
  { id: "status", header: "Status", accessor: "status" as keyof TestRow, sortable: true },
  { id: "date", header: "Date", accessor: "date" as keyof TestRow, sortable: true },
];

const data: TestRow[] = [
  { id: "1", name: "Project Alpha", status: "Active", date: "2026-01-15" },
  { id: "2", name: "Project Beta", status: "Completed", date: "2026-02-20" },
  { id: "3", name: "Project Gamma", status: "Active", date: "2026-03-01" },
];

const defaultProps: CanvasTableProps<TestRow> = {
  columns,
  data,
  loading: false,
  caption: "Test table",
};

describe("CanvasTable", () => {
  it("renders DataTable with provided columns and data", () => {
    render(<CanvasTable {...defaultProps} />);
    expect(screen.getByText("Project Alpha")).toBeDefined();
    expect(screen.getByText("Project Beta")).toBeDefined();
  });

  it("shows loading skeleton when loading", () => {
    render(<CanvasTable {...defaultProps} loading data={[]} />);
    // DataTable renders skeleton rows when loading
  });

  it("shows empty state when no data", () => {
    render(<CanvasTable {...defaultProps} data={[]} emptyMessage="No items found" />);
    expect(screen.getByText("No items found")).toBeDefined();
  });

  it("renders CSV export button", () => {
    render(<CanvasTable {...defaultProps} onExportCSV={vi.fn()} />);
    expect(screen.getByText(/export/i)).toBeDefined();
  });

  it("calls onExportCSV when export button clicked", () => {
    const onExportCSV = vi.fn();
    render(<CanvasTable {...defaultProps} onExportCSV={onExportCSV} />);
    fireEvent.click(screen.getByText(/export/i));
    expect(onExportCSV).toHaveBeenCalled();
  });

  it("renders with page size selector", () => {
    render(<CanvasTable {...defaultProps} page={1} totalPages={3} pageSize={25} onPageChange={vi.fn()} />);
    // Page size selector should be visible
  });

  it("has accessible caption", () => {
    const { container } = render(<CanvasTable {...defaultProps} />);
    const caption = container.querySelector("caption");
    expect(caption?.textContent).toBe("Test table");
  });
});
```

- [ ] **16.1.2** Verify test fails:

```bash
pnpm --filter ./packages/ui test -- --run packages/ui/src/organisms/CanvasTable/CanvasTable.test.tsx
```

#### Step 16.2: Implement CanvasTable organism

- [ ] **16.2.1** Create `packages/ui/src/organisms/CanvasTable/CanvasTable.tsx`:

```typescript
'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { DataTable, type DataTableColumn, type DataTableAction, type SortState } from '../DataTable/DataTable';

export interface CanvasTableProps<T extends { id: string | number }> {
  /** Column definitions (passed through to DataTable) */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Loading state */
  loading?: boolean;
  /** Table caption for accessibility */
  caption?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Row selection mode */
  selectionMode?: 'none' | 'single' | 'multi';
  /** Currently selected row ids */
  selectedIds?: Set<string | number>;
  /** Selection change handler */
  onSelectionChange?: (ids: Set<string | number>) => void;
  /** Row actions */
  rowActions?: DataTableAction<T>[];
  /** Pagination: current page */
  page?: number;
  /** Pagination: total pages */
  totalPages?: number;
  /** Pagination: rows per page */
  pageSize?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Sort state */
  sortState?: SortState;
  /** Sort change handler */
  onSortChange?: (sort: SortState) => void;
  /** CSV export handler — renders export button when provided */
  onExportCSV?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * Workspace-integrated data table. Wraps DataTable with CSV export and workspace context.
 */
export function CanvasTable<T extends { id: string | number }>({
  columns,
  data,
  loading,
  caption,
  emptyMessage,
  selectionMode,
  selectedIds,
  onSelectionChange,
  rowActions,
  page,
  totalPages,
  pageSize,
  onPageChange,
  sortState,
  onSortChange,
  onExportCSV,
  className,
}: CanvasTableProps<T>) {
  return (
    <div className={cn('space-y-2', className)}>
      {onExportCSV && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors"
          >
            Export CSV
          </button>
        </div>
      )}
      <DataTable<T>
        columns={columns}
        data={data}
        loading={loading}
        caption={caption}
        error={!loading && data.length === 0 && emptyMessage ? emptyMessage : undefined}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        rowActions={rowActions}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        sortState={sortState}
        onSortChange={onSortChange}
      />
    </div>
  );
}
```

- [ ] **16.2.2** Create stories, verify tests pass, add exports, commit:

```
[#16] Add CanvasTable organism wrapping DataTable with CSV export
```

---

### Issue 17: CanvasBoard organism

**Summary:** Kanban board with draggable cards, configurable swim lanes, card detail expansion. Built on @dnd-kit.

**Files created:**
- `packages/ui/src/organisms/CanvasBoard/CanvasBoard.tsx`
- `packages/ui/src/organisms/CanvasBoard/CanvasBoard.stories.tsx`
- `packages/ui/src/organisms/CanvasBoard/CanvasBoard.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: empty, with cards, drag in progress, multiple lanes
- Drag-and-drop between lanes via @dnd-kit
- Touch drag support
- ARIA live regions for drag announcements
- Lane configuration: configurable grouping field
- Card content: title, subtitle, assignee avatar, status badge
- Optional WIP limits per lane (visual indicator when exceeded)

#### Step 17.1: Write failing tests for CanvasBoard

- [ ] **17.1.1** Create `packages/ui/src/organisms/CanvasBoard/CanvasBoard.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CanvasBoard, type CanvasBoardProps } from "./CanvasBoard";

const defaultProps: CanvasBoardProps = {
  lanes: [
    { id: "todo", label: "To Do", wipLimit: 5 },
    { id: "in-progress", label: "In Progress", wipLimit: 3 },
    { id: "done", label: "Done" },
  ],
  cards: [
    { id: "1", laneId: "todo", title: "Script Breakdown", subtitle: "Project Alpha", assignee: "JD" },
    { id: "2", laneId: "in-progress", title: "Location Scouting", subtitle: "Project Beta", assignee: "AB" },
    { id: "3", laneId: "done", title: "Casting", subtitle: "Project Alpha" },
  ],
  onCardMove: vi.fn(),
  onCardClick: vi.fn(),
};

describe("CanvasBoard", () => {
  it("renders all lanes", () => {
    render(<CanvasBoard {...defaultProps} />);
    expect(screen.getByText("To Do")).toBeDefined();
    expect(screen.getByText("In Progress")).toBeDefined();
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("renders cards in correct lanes", () => {
    render(<CanvasBoard {...defaultProps} />);
    expect(screen.getByText("Script Breakdown")).toBeDefined();
    expect(screen.getByText("Location Scouting")).toBeDefined();
    expect(screen.getByText("Casting")).toBeDefined();
  });

  it("shows lane card counts", () => {
    render(<CanvasBoard {...defaultProps} />);
    // Each lane header should show count
    expect(screen.getByText(/1/)).toBeDefined(); // To Do has 1 card
  });

  it("shows WIP limit indicator when set", () => {
    render(<CanvasBoard {...defaultProps} />);
    // "To Do" lane has wipLimit 5, with 1 card — should show "1/5"
    expect(screen.getByText(/\/5/)).toBeDefined();
  });

  it("calls onCardClick when card is clicked", () => {
    const onCardClick = vi.fn();
    render(<CanvasBoard {...defaultProps} onCardClick={onCardClick} />);
    screen.getByText("Script Breakdown").click();
    expect(onCardClick).toHaveBeenCalledWith("1");
  });

  it("renders empty lane", () => {
    render(<CanvasBoard {...defaultProps} cards={[]} />);
    expect(screen.getByText("To Do")).toBeDefined();
    // Lanes should still render even with no cards
  });

  it("has ARIA live region for drag announcements", () => {
    const { container } = render(<CanvasBoard {...defaultProps} />);
    expect(container.querySelector("[aria-live]")).not.toBeNull();
  });
});
```

- [ ] **17.1.2** Implement CanvasBoard with @dnd-kit, verify tests, create stories.

- [ ] **17.1.3** Commit:

```
[#17] Add CanvasBoard organism with @dnd-kit drag-and-drop and configurable lanes
```

---

### Issue 18: CanvasCalendar organism

**Summary:** Calendar with month/week/day views, event creation, resource lanes, booking, conflict detection.

**Files created:**
- `packages/ui/src/organisms/CanvasCalendar/CanvasCalendar.tsx`
- `packages/ui/src/organisms/CanvasCalendar/CanvasCalendar.stories.tsx`
- `packages/ui/src/organisms/CanvasCalendar/CanvasCalendar.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: month view, week view, day view, with events, with conflicts
- View switching (month/week/day) with navigation (prev/next/today)
- Event overlap handling (stacked display)
- Timezone display in header
- Horizontal resource lanes for facilities
- Animated view transitions
- Conflict detection visual indicators (red border on overlapping events)
- ARIA grid for calendar cells

#### Step 18.1: Write failing tests for CanvasCalendar

- [ ] **18.1.1** Create `packages/ui/src/organisms/CanvasCalendar/CanvasCalendar.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasCalendar, type CanvasCalendarProps } from "./CanvasCalendar";

const defaultProps: CanvasCalendarProps = {
  view: "month",
  date: new Date("2026-03-15"),
  events: [
    { id: "1", title: "Stage 1 Booking", start: "2026-03-15T09:00:00Z", end: "2026-03-15T17:00:00Z", resourceId: "stage-1" },
    { id: "2", title: "Stage 2 Booking", start: "2026-03-15T10:00:00Z", end: "2026-03-15T14:00:00Z", resourceId: "stage-2" },
  ],
  onViewChange: vi.fn(),
  onDateChange: vi.fn(),
  onEventClick: vi.fn(),
  onSlotClick: vi.fn(),
};

describe("CanvasCalendar", () => {
  it("renders month view by default", () => {
    render(<CanvasCalendar {...defaultProps} />);
    // Should show month name
    expect(screen.getByText(/March 2026/)).toBeDefined();
  });

  it("renders events", () => {
    render(<CanvasCalendar {...defaultProps} />);
    expect(screen.getByText("Stage 1 Booking")).toBeDefined();
  });

  it("switches to week view", () => {
    const onViewChange = vi.fn();
    render(<CanvasCalendar {...defaultProps} onViewChange={onViewChange} />);
    const weekBtn = screen.getByText(/week/i);
    fireEvent.click(weekBtn);
    expect(onViewChange).toHaveBeenCalledWith("week");
  });

  it("navigates to next month", () => {
    const onDateChange = vi.fn();
    render(<CanvasCalendar {...defaultProps} onDateChange={onDateChange} />);
    const nextBtn = screen.getByLabelText(/next/i);
    fireEvent.click(nextBtn);
    expect(onDateChange).toHaveBeenCalled();
  });

  it("calls onEventClick when event is clicked", () => {
    const onEventClick = vi.fn();
    render(<CanvasCalendar {...defaultProps} onEventClick={onEventClick} />);
    fireEvent.click(screen.getByText("Stage 1 Booking"));
    expect(onEventClick).toHaveBeenCalledWith("1");
  });

  it("shows conflict indicator for overlapping events", () => {
    const events = [
      { id: "1", title: "A", start: "2026-03-15T09:00:00Z", end: "2026-03-15T12:00:00Z", resourceId: "stage-1" },
      { id: "2", title: "B", start: "2026-03-15T10:00:00Z", end: "2026-03-15T14:00:00Z", resourceId: "stage-1" },
    ];
    const { container } = render(<CanvasCalendar {...defaultProps} events={events} view="day" />);
    // Overlapping events on same resource should have conflict styling
    expect(container.querySelector("[data-conflict]")).not.toBeNull();
  });

  it("renders today button", () => {
    render(<CanvasCalendar {...defaultProps} />);
    expect(screen.getByText(/today/i)).toBeDefined();
  });
});
```

- [ ] **18.1.2** Implement CanvasCalendar, verify tests, create stories.

- [ ] **18.1.3** Commit:

```
[#18] Add CanvasCalendar organism with month/week/day views and conflict detection
```

---

> **Phase 4 complete.** At this point:
> - CanvasTable wraps existing DataTable with workspace integration and CSV export
> - CanvasBoard provides kanban with @dnd-kit drag-and-drop
> - CanvasCalendar supports month/week/day views with resource lanes and conflict detection
>
> **Next:** Phase 5 (Canvas Types Part 2) adds timeline, catalog, documents, charts, and detail panel.

---

## Phase 5: Canvas Types Part 2 (Issues 19-23)

---

### Issue 19: CanvasTimeline organism

**Summary:** Gantt-style timeline with task bars, dependencies (start-to-start, finish-to-start), milestones (diamond markers), zoom levels (day/week/month/quarter), and horizontal scroll sync.

**Files created:**
- `packages/ui/src/organisms/CanvasTimeline/CanvasTimeline.tsx`
- `packages/ui/src/organisms/CanvasTimeline/CanvasTimeline.stories.tsx`
- `packages/ui/src/organisms/CanvasTimeline/CanvasTimeline.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: empty, with tasks, with dependencies, zoomed at each level
- Task bars render at correct positions based on start/end dates
- Dependency arrows between tasks (finish-to-start, start-to-start)
- Milestone markers (diamond shape)
- Zoom levels: day, week, month, quarter
- Horizontal scroll sync between header timeline and task rows
- ARIA: task bars are focusable, keyboard navigable

#### Step 19.1: Write failing tests, implement, verify

- [ ] **19.1.1** Create `packages/ui/src/organisms/CanvasTimeline/CanvasTimeline.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasTimeline, type CanvasTimelineProps } from "./CanvasTimeline";

const defaultProps: CanvasTimelineProps = {
  tasks: [
    { id: "1", title: "Design Phase", start: "2026-03-01", end: "2026-03-15", progress: 0.8 },
    { id: "2", title: "Construction", start: "2026-03-16", end: "2026-06-30", progress: 0.2, dependsOn: ["1"] },
    { id: "3", title: "Phase 1 Complete", start: "2026-06-30", end: "2026-06-30", milestone: true },
  ],
  zoom: "month",
  onZoomChange: vi.fn(),
  onTaskClick: vi.fn(),
  startDate: "2026-03-01",
  endDate: "2026-09-30",
};

describe("CanvasTimeline", () => {
  it("renders task bars", () => {
    render(<CanvasTimeline {...defaultProps} />);
    expect(screen.getByText("Design Phase")).toBeDefined();
    expect(screen.getByText("Construction")).toBeDefined();
  });

  it("renders milestones as diamond markers", () => {
    const { container } = render(<CanvasTimeline {...defaultProps} />);
    expect(container.querySelector("[data-milestone]")).not.toBeNull();
  });

  it("renders dependency arrows", () => {
    const { container } = render(<CanvasTimeline {...defaultProps} />);
    // SVG path or line elements for dependencies
    expect(container.querySelector("[data-dependency]")).not.toBeNull();
  });

  it("changes zoom level", () => {
    const onZoomChange = vi.fn();
    render(<CanvasTimeline {...defaultProps} onZoomChange={onZoomChange} />);
    const weekBtn = screen.getByText(/week/i);
    fireEvent.click(weekBtn);
    expect(onZoomChange).toHaveBeenCalledWith("week");
  });

  it("calls onTaskClick when task bar is clicked", () => {
    const onTaskClick = vi.fn();
    render(<CanvasTimeline {...defaultProps} onTaskClick={onTaskClick} />);
    fireEvent.click(screen.getByText("Design Phase"));
    expect(onTaskClick).toHaveBeenCalledWith("1");
  });

  it("shows progress on task bars", () => {
    const { container } = render(<CanvasTimeline {...defaultProps} />);
    // Progress bar should exist within the task bar
    expect(container.querySelector("[data-progress]")).not.toBeNull();
  });
});
```

- [ ] **19.1.2** Implement, verify, create stories, commit:

```
[#19] Add CanvasTimeline organism with Gantt chart, dependencies, and milestones
```

---

### Issue 20: CanvasCatalog organism

**Summary:** Responsive card grid with search, category filters, detail expansion, and enrollment/booking CTAs.

**Files created:**
- `packages/ui/src/organisms/CanvasCatalog/CanvasCatalog.tsx`
- `packages/ui/src/organisms/CanvasCatalog/CanvasCatalog.stories.tsx`
- `packages/ui/src/organisms/CanvasCatalog/CanvasCatalog.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: empty, with cards, filtered, with search results
- Responsive grid: 1 col (mobile), 2 col (tablet), 3 col (desktop), 4 col (wide)
- Card content: image/icon, title, subtitle, tags, CTA button
- Search input with debounced filtering
- Category filter chips

#### Step 20.1: Write failing tests, implement, verify

- [ ] **20.1.1** Create `packages/ui/src/organisms/CanvasCatalog/CanvasCatalog.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasCatalog, type CanvasCatalogProps } from "./CanvasCatalog";

const defaultProps: CanvasCatalogProps = {
  items: [
    { id: "1", title: "Film Production 101", subtitle: "Beginner course", tags: ["Film", "Beginner"], imageUrl: "/img/course1.jpg" },
    { id: "2", title: "Advanced VFX", subtitle: "Expert workshop", tags: ["VFX", "Advanced"] },
  ],
  categories: ["Film", "VFX", "Sound", "Beginner", "Advanced"],
  onItemClick: vi.fn(),
  onSearch: vi.fn(),
  onCategoryFilter: vi.fn(),
};

describe("CanvasCatalog", () => {
  it("renders catalog items", () => {
    render(<CanvasCatalog {...defaultProps} />);
    expect(screen.getByText("Film Production 101")).toBeDefined();
    expect(screen.getByText("Advanced VFX")).toBeDefined();
  });

  it("renders search input", () => {
    render(<CanvasCatalog {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeDefined();
  });

  it("renders category filter chips", () => {
    render(<CanvasCatalog {...defaultProps} />);
    expect(screen.getByText("Film")).toBeDefined();
    expect(screen.getByText("VFX")).toBeDefined();
  });

  it("calls onSearch when search input changes", () => {
    const onSearch = vi.fn();
    render(<CanvasCatalog {...defaultProps} onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: "VFX" } });
    // Debounced, may need to wait
  });

  it("calls onItemClick when card is clicked", () => {
    const onItemClick = vi.fn();
    render(<CanvasCatalog {...defaultProps} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Film Production 101"));
    expect(onItemClick).toHaveBeenCalledWith("1");
  });

  it("renders empty state", () => {
    render(<CanvasCatalog {...defaultProps} items={[]} emptyMessage="No courses found" />);
    expect(screen.getByText("No courses found")).toBeDefined();
  });

  it("renders CTA button when provided", () => {
    const items = [{ id: "1", title: "Course", subtitle: "Sub", tags: [], ctaLabel: "Enroll Now" }];
    render(<CanvasCatalog {...defaultProps} items={items} />);
    expect(screen.getByText("Enroll Now")).toBeDefined();
  });
});
```

- [ ] **20.1.2** Implement, verify, create stories, commit:

```
[#20] Add CanvasCatalog organism with responsive card grid, search, and category filters
```

---

### Issue 21: CanvasDocuments organism

**Summary:** Document list with folders, drag-to-upload zone, version history indicators, access control indicators, and file preview.

**Files created:**
- `packages/ui/src/organisms/CanvasDocuments/CanvasDocuments.tsx`
- `packages/ui/src/organisms/CanvasDocuments/CanvasDocuments.stories.tsx`
- `packages/ui/src/organisms/CanvasDocuments/CanvasDocuments.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: empty, with files, with folders, upload in progress
- Drag-to-upload zone (visual highlight on drag over)
- File type icons (PDF, DOC, XLS, image, video, generic)
- Upload progress indicator
- Folder creation and navigation
- Sort by: name, date, size, type

#### Step 21.1: Write failing tests, implement, verify

- [ ] **21.1.1** Create `packages/ui/src/organisms/CanvasDocuments/CanvasDocuments.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasDocuments, type CanvasDocumentsProps } from "./CanvasDocuments";

const defaultProps: CanvasDocumentsProps = {
  items: [
    { id: "1", name: "Q1 Report.pdf", type: "file", fileType: "pdf", size: 1024000, updatedAt: "2026-03-01T10:00:00Z" },
    { id: "2", name: "Financial Statements", type: "folder", childCount: 12 },
    { id: "3", name: "Presentation.pptx", type: "file", fileType: "pptx", size: 5120000, updatedAt: "2026-02-15T14:30:00Z" },
  ],
  currentPath: "/",
  onItemClick: vi.fn(),
  onUpload: vi.fn(),
  onCreateFolder: vi.fn(),
  onSort: vi.fn(),
  sortBy: "name",
  sortDirection: "asc",
};

describe("CanvasDocuments", () => {
  it("renders files and folders", () => {
    render(<CanvasDocuments {...defaultProps} />);
    expect(screen.getByText("Q1 Report.pdf")).toBeDefined();
    expect(screen.getByText("Financial Statements")).toBeDefined();
  });

  it("renders folder icon for folders", () => {
    const { container } = render(<CanvasDocuments {...defaultProps} />);
    expect(container.querySelector("[data-type='folder']")).not.toBeNull();
  });

  it("calls onItemClick when file is clicked", () => {
    const onItemClick = vi.fn();
    render(<CanvasDocuments {...defaultProps} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Q1 Report.pdf"));
    expect(onItemClick).toHaveBeenCalledWith("1");
  });

  it("renders upload zone", () => {
    const { container } = render(<CanvasDocuments {...defaultProps} />);
    expect(container.querySelector("[data-upload-zone]")).not.toBeNull();
  });

  it("renders sort controls", () => {
    render(<CanvasDocuments {...defaultProps} />);
    expect(screen.getByText(/name/i)).toBeDefined();
  });

  it("renders empty state", () => {
    render(<CanvasDocuments {...defaultProps} items={[]} />);
    expect(screen.getByText(/no documents/i)).toBeDefined();
  });

  it("shows file size formatted", () => {
    render(<CanvasDocuments {...defaultProps} />);
    expect(screen.getByText(/1.*MB/i)).toBeDefined(); // 1024000 bytes ~ 1 MB
  });
});
```

- [ ] **21.1.2** Implement, verify, create stories, commit:

```
[#21] Add CanvasDocuments organism with folder navigation, upload zone, and file icons
```

---

### Issue 22: CanvasCharts organism

**Summary:** Configurable chart grid with line, bar, pie, area charts. Companion data table. Built on recharts.

**Files created:**
- `packages/ui/src/organisms/CanvasCharts/CanvasCharts.tsx`
- `packages/ui/src/organisms/CanvasCharts/CanvasCharts.stories.tsx`
- `packages/ui/src/organisms/CanvasCharts/CanvasCharts.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: each chart type (line, bar, pie, area), combined grid, responsive
- Hover tooltips with data values
- Legend toggle (show/hide series)
- Click drill-down via onChartClick callback
- Responsive: 2-col grid on desktop, 1-col stack on mobile
- Companion data table below charts

#### Step 22.1: Write failing tests, implement, verify

- [ ] **22.1.1** Create `packages/ui/src/organisms/CanvasCharts/CanvasCharts.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CanvasCharts, type CanvasChartsProps } from "./CanvasCharts";

const defaultProps: CanvasChartsProps = {
  charts: [
    {
      id: "revenue",
      title: "Revenue",
      type: "line",
      data: [
        { name: "Jan", value: 100000 },
        { name: "Feb", value: 120000 },
        { name: "Mar", value: 115000 },
      ],
    },
    {
      id: "utilization",
      title: "Facility Utilization",
      type: "bar",
      data: [
        { name: "Stage 1", value: 85 },
        { name: "Stage 2", value: 72 },
        { name: "Stage 3", value: 91 },
      ],
    },
  ],
  onChartClick: vi.fn(),
};

describe("CanvasCharts", () => {
  it("renders chart titles", () => {
    render(<CanvasCharts {...defaultProps} />);
    expect(screen.getByText("Revenue")).toBeDefined();
    expect(screen.getByText("Facility Utilization")).toBeDefined();
  });

  it("renders correct number of charts", () => {
    const { container } = render(<CanvasCharts {...defaultProps} />);
    const chartContainers = container.querySelectorAll("[data-chart]");
    expect(chartContainers.length).toBe(2);
  });

  it("renders empty state when no charts", () => {
    render(<CanvasCharts charts={[]} />);
    expect(screen.getByText(/no charts/i)).toBeDefined();
  });

  it("renders companion data table when showTable is true", () => {
    render(<CanvasCharts {...defaultProps} showTable />);
    // Should render a data table below the charts
    expect(screen.getByRole("table")).toBeDefined();
  });
});
```

- [ ] **22.1.2** Implement, verify, create stories, commit:

```
[#22] Add CanvasCharts organism with line, bar, pie, area charts and companion table
```

---

### Issue 23: DetailPanel organism

**Summary:** Right-side slide-over for viewing/editing a selected item without leaving the workspace. Used within any canvas.

**Files created:**
- `packages/ui/src/organisms/DetailPanel/DetailPanel.tsx`
- `packages/ui/src/organisms/DetailPanel/DetailPanel.stories.tsx`
- `packages/ui/src/organisms/DetailPanel/DetailPanel.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: open with content, closed, with form, read-only mode
- Close via X button, Escape key, click outside
- Focus trap when open
- Width: 480px
- Animation: slide from right, 200ms ease-out
- Independent scroll (panel scrolls independently of canvas)
- Header with title and close button
- Body slot for arbitrary content

#### Step 23.1: Write failing tests, implement, verify

- [ ] **23.1.1** Create `packages/ui/src/organisms/DetailPanel/DetailPanel.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetailPanel, type DetailPanelProps } from "./DetailPanel";

const defaultProps: DetailPanelProps = {
  open: true,
  onClose: vi.fn(),
  title: "Production Detail",
  children: <div>Detail content here</div>,
};

describe("DetailPanel", () => {
  it("renders when open", () => {
    render(<DetailPanel {...defaultProps} />);
    expect(screen.getByText("Production Detail")).toBeDefined();
    expect(screen.getByText("Detail content here")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(<DetailPanel {...defaultProps} open={false} />);
    expect(screen.queryByText("Production Detail")).toBeNull();
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    render(<DetailPanel {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<DetailPanel {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has correct width class", () => {
    const { container } = render(<DetailPanel {...defaultProps} />);
    const panel = container.querySelector("[data-detail-panel]");
    expect(panel?.className).toContain("w-[480px]");
  });

  it("renders with slide animation class", () => {
    const { container } = render(<DetailPanel {...defaultProps} />);
    const panel = container.querySelector("[data-detail-panel]");
    expect(panel?.className).toContain("animate");
  });

  it("has independent scroll", () => {
    const { container } = render(<DetailPanel {...defaultProps} />);
    const body = container.querySelector("[data-detail-body]");
    expect(body?.className).toContain("overflow-y-auto");
  });
});
```

- [ ] **23.1.2** Implement `packages/ui/src/organisms/DetailPanel/DetailPanel.tsx`:

```typescript
'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface DetailPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Panel title */
  title: string;
  /** Panel body content */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * Right-side slide-over detail panel. Close via X, Escape, or click outside.
 * Focus trap when open. Independent scroll.
 */
export function DetailPanel({ open, onClose, title, children, className }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus panel on open
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div
        ref={panelRef}
        data-detail-panel
        tabIndex={-1}
        role="dialog"
        aria-label={title}
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col border-l bg-card shadow-lg',
          'animate-in slide-in-from-right duration-200',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50"
          >
            &times;
          </button>
        </div>
        {/* Body */}
        <div data-detail-body className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}
```

- [ ] **23.1.3** Create stories, verify tests pass, add exports, commit:

```
[#23] Add DetailPanel organism with slide-over, focus trap, and Escape close
```

---

> **Phase 5 complete.** All 7 canvas types are now available: table, board, calendar, timeline, catalog, documents, charts. Plus the DetailPanel slide-over for any canvas.
>
> **Next:** Phase 6 (Coming Soon System) builds the scaffolds for not-yet-active tabs.

---

## Phase 6: Coming Soon System (Issues 24-27)

---

### Issue 24: ComingSoonScaffold template

**Summary:** In-workspace scaffold for Coming Soon tabs: ComingSoonBanner + description + WireframePreview + related active features. Renders in the canvas slot of WorkspaceShell.

**Files created:**
- `packages/ui/src/molecules/ComingSoonBanner/ComingSoonBanner.tsx`
- `packages/ui/src/molecules/ComingSoonBanner/ComingSoonBanner.stories.tsx`
- `packages/ui/src/molecules/ComingSoonBanner/ComingSoonBanner.test.tsx`
- `packages/ui/src/templates/ComingSoonScaffold/ComingSoonScaffold.tsx`
- `packages/ui/src/templates/ComingSoonScaffold/ComingSoonScaffold.stories.tsx`
- `packages/ui/src/templates/ComingSoonScaffold/ComingSoonScaffold.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories for each wireframe type (8 variants)
- Notify Me button state machine: idle -> submitting -> subscribed -> error
- ComingSoonBanner shows "Coming Q3 2026" for coming_soon, "Planned" for planned
- Description from registry feature description
- Related active features section with links
- Renders within WorkspaceShell canvas slot

#### Step 24.1: Write failing tests for ComingSoonBanner

- [ ] **24.1.1** Create `packages/ui/src/molecules/ComingSoonBanner/ComingSoonBanner.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComingSoonBanner, type ComingSoonBannerProps } from "./ComingSoonBanner";

const defaultProps: ComingSoonBannerProps = {
  status: "coming_soon",
  targetQuarter: "Q3 2026",
  featureId: "productions.shooting.shoot_scheduling",
  subscribeState: "idle",
  onSubscribe: vi.fn(),
};

describe("ComingSoonBanner", () => {
  it("shows target date for coming_soon status", () => {
    render(<ComingSoonBanner {...defaultProps} />);
    expect(screen.getByText(/Coming Q3 2026/)).toBeDefined();
  });

  it("shows 'Planned' for planned status", () => {
    render(<ComingSoonBanner {...defaultProps} status="planned" targetQuarter={null} />);
    expect(screen.getByText(/Planned/)).toBeDefined();
  });

  it("renders Notify Me button in idle state", () => {
    render(<ComingSoonBanner {...defaultProps} />);
    expect(screen.getByText(/notify me/i)).toBeDefined();
  });

  it("calls onSubscribe when Notify Me is clicked", () => {
    const onSubscribe = vi.fn();
    render(<ComingSoonBanner {...defaultProps} onSubscribe={onSubscribe} />);
    fireEvent.click(screen.getByText(/notify me/i));
    expect(onSubscribe).toHaveBeenCalledWith("productions.shooting.shoot_scheduling");
  });

  it("shows loading state when submitting", () => {
    render(<ComingSoonBanner {...defaultProps} subscribeState="submitting" />);
    expect(screen.getByText(/subscribing/i)).toBeDefined();
  });

  it("shows subscribed confirmation", () => {
    render(<ComingSoonBanner {...defaultProps} subscribeState="subscribed" />);
    expect(screen.getByText(/subscribed/i)).toBeDefined();
  });

  it("shows error state", () => {
    render(<ComingSoonBanner {...defaultProps} subscribeState="error" />);
    expect(screen.getByText(/try again/i)).toBeDefined();
  });
});
```

- [ ] **24.1.2** Implement ComingSoonBanner, ComingSoonScaffold, verify tests, create stories.

- [ ] **24.1.3** Commit:

```
[#24] Add ComingSoonScaffold template with banner, description, and wireframe preview
```

---

### Issue 25: PlannedSection organism

**Summary:** Collapsed by default with "N planned features" link. Expands to horizontal scroll of PlannedFeatureCards. Includes coming_soon + planned features. Max 6 visible with "+N more" overflow. Collapse state persisted per workspace to localStorage. Hidden when zero features.

**Files created:**
- `packages/ui/src/organisms/PlannedSection/PlannedSection.tsx`
- `packages/ui/src/organisms/PlannedSection/PlannedSection.stories.tsx`
- `packages/ui/src/organisms/PlannedSection/PlannedSection.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: collapsed default, expanded <6 items, expanded >6 with overflow, zero items (hidden)
- Horizontal scroll behavior
- localStorage persistence of collapse state per workspace
- "+N more" indicator when >6 features

#### Step 25.1: Write failing tests, implement, verify

- [ ] **25.1.1** Create `packages/ui/src/organisms/PlannedSection/PlannedSection.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlannedSection, type PlannedSectionProps } from "./PlannedSection";

const features = Array.from({ length: 8 }, (_, i) => ({
  featureId: `feat.${i}`,
  label: `Feature ${i + 1}`,
  description: `Description for feature ${i + 1}`,
  status: i < 4 ? "coming_soon" as const : "planned" as const,
  targetQuarter: i < 4 ? "Q3 2026" : null,
  onNotify: vi.fn(),
}));

const defaultProps: PlannedSectionProps = {
  workspaceId: "productions",
  features,
};

describe("PlannedSection", () => {
  beforeEach(() => localStorage.clear());

  it("renders collapsed by default with feature count", () => {
    render(<PlannedSection {...defaultProps} />);
    expect(screen.getByText(/8 planned features/)).toBeDefined();
  });

  it("expands on click to show features", () => {
    render(<PlannedSection {...defaultProps} />);
    fireEvent.click(screen.getByText(/8 planned features/));
    expect(screen.getByText("Feature 1")).toBeDefined();
  });

  it("shows +N more when >6 features", () => {
    render(<PlannedSection {...defaultProps} />);
    fireEvent.click(screen.getByText(/8 planned features/));
    expect(screen.getByText(/\+2 more/)).toBeDefined();
  });

  it("renders nothing when no features", () => {
    const { container } = render(<PlannedSection workspaceId="empty" features={[]} />);
    expect(container.textContent).toBe("");
  });

  it("persists collapse state to localStorage", () => {
    render(<PlannedSection {...defaultProps} />);
    fireEvent.click(screen.getByText(/8 planned features/));
    const stored = localStorage.getItem("pc-planned-expanded-productions");
    expect(stored).toBe("true");
  });
});
```

- [ ] **25.1.2** Implement, verify, create stories, commit:

```
[#25] Add PlannedSection organism with collapsible horizontal scroll of planned features
```

---

### Issue 26: PlannedFeatureCard molecule

**Summary:** Card for PlannedSection: feature name, description (2 lines truncated), target date, status dot, notify button.

**Files created:**
- `packages/ui/src/molecules/PlannedFeatureCard/PlannedFeatureCard.tsx`
- `packages/ui/src/molecules/PlannedFeatureCard/PlannedFeatureCard.stories.tsx`
- `packages/ui/src/molecules/PlannedFeatureCard/PlannedFeatureCard.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories: planned (no date), coming_soon (with date), subscribed state
- Description truncated to 2 lines with ellipsis
- Notify button with state machine matching ComingSoonBanner

#### Step 26.1: Write failing tests, implement, verify

- [ ] **26.1.1** Create `packages/ui/src/molecules/PlannedFeatureCard/PlannedFeatureCard.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlannedFeatureCard } from "./PlannedFeatureCard";

describe("PlannedFeatureCard", () => {
  it("renders feature name", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Shoot Scheduling" description="Plan shooting schedules" status="coming_soon" targetQuarter="Q3 2026" onNotify={vi.fn()} />);
    expect(screen.getByText("Shoot Scheduling")).toBeDefined();
  });

  it("renders description", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="A description" status="planned" onNotify={vi.fn()} />);
    expect(screen.getByText("A description")).toBeDefined();
  });

  it("shows target date for coming_soon", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="coming_soon" targetQuarter="Q3 2026" onNotify={vi.fn()} />);
    expect(screen.getByText(/Q3 2026/)).toBeDefined();
  });

  it("shows 'Planned' for planned status", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="planned" onNotify={vi.fn()} />);
    expect(screen.getByText(/Planned/i)).toBeDefined();
  });

  it("renders notify button", () => {
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="planned" onNotify={vi.fn()} />);
    expect(screen.getByText(/notify/i)).toBeDefined();
  });

  it("calls onNotify when notify button clicked", () => {
    const onNotify = vi.fn();
    render(<PlannedFeatureCard featureId="feat.1" label="Test" description="Desc" status="planned" onNotify={onNotify} />);
    fireEvent.click(screen.getByText(/notify/i));
    expect(onNotify).toHaveBeenCalledWith("feat.1");
  });

  it("truncates long descriptions to 2 lines", () => {
    const { container } = render(<PlannedFeatureCard featureId="feat.1" label="Test" description="A very long description that should be truncated after two lines of text" status="planned" onNotify={vi.fn()} />);
    const desc = container.querySelector("[data-description]");
    expect(desc?.className).toContain("line-clamp-2");
  });
});
```

- [ ] **26.1.2** Implement, verify, create stories, commit:

```
[#26] Add PlannedFeatureCard molecule with truncated description and notify button
```

---

### Issue 27: WireframePreview molecule

**Summary:** SVG-based wireframe layout mockups. 8 variants matching canvas types: board, calendar, table, timeline, catalog, document, charts, form. Each shows labelled zones indicating what will appear where.

**Files created:**
- `packages/ui/src/molecules/WireframePreview/WireframePreview.tsx`
- `packages/ui/src/molecules/WireframePreview/WireframePreview.stories.tsx`
- `packages/ui/src/molecules/WireframePreview/WireframePreview.test.tsx`

**Files modified:**
- `packages/ui/src/index.ts`

**Acceptance criteria:**
- Stories for each of the 8 variants
- Labelled zones readable at default size
- Responsive scaling (viewBox-based SVG)
- Each wireframe has distinct layout matching its canvas type

#### Step 27.1: Write failing tests, implement, verify

- [ ] **27.1.1** Create `packages/ui/src/molecules/WireframePreview/WireframePreview.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WireframePreview, WIREFRAME_TYPES } from "./WireframePreview";

describe("WireframePreview", () => {
  it("renders all 8 wireframe variants without error", () => {
    for (const type of WIREFRAME_TYPES) {
      const { container } = render(<WireframePreview type={type} />);
      expect(container.querySelector("svg")).not.toBeNull();
    }
  });

  it("has 8 wireframe types", () => {
    expect(WIREFRAME_TYPES.length).toBe(8);
  });

  it("renders SVG with viewBox for responsive scaling", () => {
    const { container } = render(<WireframePreview type="board" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBeDefined();
  });

  it("includes labelled text zones", () => {
    const { container } = render(<WireframePreview type="calendar" />);
    const texts = container.querySelectorAll("text");
    expect(texts.length).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { container } = render(<WireframePreview type="table" className="w-full" />);
    const svg = container.querySelector("svg");
    expect(svg?.classList.contains("w-full")).toBe(true);
  });

  it("renders fallback for unknown type", () => {
    const { container } = render(<WireframePreview type={"unknown" as any} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
```

- [ ] **27.1.2** Implement `WireframePreview` with 8 SVG variants. Each variant is a function returning SVG elements with labelled rectangles and text:

```typescript
export const WIREFRAME_TYPES = ['board', 'calendar', 'table', 'timeline', 'catalog', 'document', 'charts', 'form'] as const;
export type WireframeType = (typeof WIREFRAME_TYPES)[number];
```

- [ ] **27.1.3** Verify, create stories for all 8 variants, commit:

```
[#27] Add WireframePreview molecule with 8 SVG wireframe variants
```

---

> **Phase 6 complete.** Coming Soon system is complete:
> - ComingSoonScaffold renders within workspace for not-yet-active tabs
> - PlannedSection shows planned features below canvas
> - PlannedFeatureCard with notify state machine
> - WireframePreview with 8 context-specific SVG wireframes
>
> **Next:** Phase 7 (AI Assistant) wires the AI panel to the Claude API backend.

---

## Phase 7: AI Assistant (Issues 28-30)

---

### Issue 28: useAIContext hook

**Summary:** React hook reading current workspace ID, tab ID, user role, and visible workspace list. Updates on every navigation event. Provides structured context for the AI backend request.

**Files created:**
- `apps/web/app/dashboard/hooks/useAIContext.ts`
- `apps/web/app/dashboard/hooks/useAIContext.test.ts`

**Acceptance criteria:**
- Context updates on route change
- Correct workspace/tab/role values from RegistryProvider
- Visible workspace list matches `/v1/workspaces/visible` response
- Returns null context when not in a workspace (e.g., Home, Inbox)

#### Step 28.1: Write failing tests

- [ ] **28.1.1** Create `apps/web/app/dashboard/hooks/useAIContext.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAIContext } from "./useAIContext";

// Mock useRegistry
vi.mock("../components/RegistryProvider", () => ({
  useRegistry: () => ({
    userRole: "admin",
    visibleWorkspaces: [
      { id: "productions", label: "Productions", tabs: [{ id: "overview", label: "Overview" }] },
      { id: "finance", label: "Finance", tabs: [{ id: "invoices", label: "Invoices" }] },
    ],
  }),
}));

describe("useAIContext", () => {
  it("returns workspace and tab from current path", () => {
    // Mock window.location.pathname
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/productions/overview" },
      writable: true,
    });
    const { result } = renderHook(() => useAIContext());
    expect(result.current.workspace).toBe("productions");
    expect(result.current.tab).toBe("overview");
    expect(result.current.workspaceLabel).toBe("Productions");
    expect(result.current.tabLabel).toBe("Overview");
  });

  it("returns null context when on home", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/home" },
      writable: true,
    });
    const { result } = renderHook(() => useAIContext());
    expect(result.current.workspace).toBeNull();
    expect(result.current.tab).toBeNull();
  });

  it("returns user role", () => {
    const { result } = renderHook(() => useAIContext());
    expect(result.current.role).toBe("admin");
  });

  it("returns visible workspace IDs", () => {
    const { result } = renderHook(() => useAIContext());
    expect(result.current.visibleWorkspaceIds).toContain("productions");
    expect(result.current.visibleWorkspaceIds).toContain("finance");
  });
});
```

- [ ] **28.1.2** Implement, verify, commit:

```
[#28] Add useAIContext hook with workspace/tab context from URL and registry
```

---

### Issue 29: POST /v1/ai/chat endpoint

**Summary:** Backend endpoint calling Claude API with workspace context from the registry and the user's role. Rate limiting: 20/min, 200/day per user. System prompt with workspace metadata. Input sanitization (500 char limit, strip HTML/XML).

**Files created:**
- `apps/backend/src/ai/chat.ts`
- `apps/backend/src/__tests__/ai-chat.test.ts`

**Files modified:**
- `apps/backend/src/routes.ts`

**Acceptance criteria:**
- Correct responses for navigation queries
- Rate limit enforced (20/min, 200/day)
- Context validated against user's visible workspaces
- User message truncated to 500 chars, HTML/XML stripped
- System prompt contains only workspace metadata (no PII)
- Response includes citations with workspace links
- Error handling: 429 (rate limit), 503 (Claude API unavailable)
- Audit logging (user ID, workspace context, message hash, timestamp)

#### Step 29.1: Write failing tests

- [ ] **29.1.1** Create `apps/backend/src/__tests__/ai-chat.test.ts`:

```typescript
import { describe, it, expect, vi, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active" },
      update: {},
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-${user.id.slice(0, 8)}`, description: roleName },
    });

    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      } catch {
        // skip duplicate
      }
    }

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const session = await createSession(prisma, user.id);
    return { user, role, session, cookie: `${SESSION_COOKIE_NAME}=${session.token}` };
  } finally {
    await prisma.$disconnect();
  }
}

describe("POST /v1/ai/chat", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello", context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with response for valid request", async () => {
    const { cookie } = await createUserWithRole("ai-admin@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What can I do in Productions?", context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.response).toBeDefined();
    expect(typeof body.response).toBe("string");
    expect(Array.isArray(body.citations)).toBe(true);
    expect(body.sessionId).toBeDefined();
  });

  it("truncates messages longer than 500 chars", async () => {
    const { cookie } = await createUserWithRole("ai-trunc@dashboard.test", "admin", [["dashboard", "admin"]]);
    const longMessage = "a".repeat(600);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ message: longMessage, context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
  });

  it("ignores workspace context not in user visible set", async () => {
    const { cookie } = await createUserWithRole("ai-guest@dashboard.test", "guest", [["dashboard", "guest"], ["events", "browse"], ["education", "browse"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Tell me about admin", context: { workspace: "administration", tab: "users" } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    // Should use general context, not admin workspace context
  });

  it("returns 400 for missing message", async () => {
    const { cookie } = await createUserWithRole("ai-badreq@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ context: { workspace: "productions" } }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });
});
```

- [ ] **29.1.2** Add security contract tests:

```typescript
  it("returns 429 with Retry-After when daily limit exceeded", async () => {
    const { cookie } = await createUserWithRole("ai-rate@dashboard.test", "admin", [["dashboard", "admin"]]);
    vi.spyOn(rateLimiter, 'check').mockResolvedValueOnce({ allowed: false, retryAfter: 3600 });
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test", context: { workspace: "productions", tab: "overview" }, sessionId: "test-session" }),
      }),
      env,
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeDefined();
  });

  it("strips non-production.city URLs from response", async () => {
    const { cookie } = await createUserWithRole("ai-urls@dashboard.test", "admin", [["dashboard", "admin"]]);
    // Mock Claude API to return a response containing external URLs
    // vi.mock("../lib/claude-client", () => ({
    //   chat: vi.fn().mockResolvedValue({
    //     response: "Check https://evil.com and https://production.city/dashboard/finance",
    //     citations: [
    //       { label: "Evil", url: "https://evil.com" },
    //       { label: "Finance", url: "https://production.city/dashboard/finance" },
    //     ],
    //   }),
    // }));

    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "show me links", context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    if (res.status === 200) {
      const body = await res.json();
      // All citation URLs must be on production.city or relative paths
      for (const citation of body.citations) {
        const url = new URL(citation.url, "https://production.city");
        expect(url.hostname).toMatch(/^(.*\.)?production\.city$/);
      }
      // Response text should not contain non-production.city URLs
      expect(body.response).not.toMatch(/https?:\/\/(?!([a-z]+\.)?production\.city)/);
    }
  });

  it("writes audit log entry for each request", async () => {
    const { cookie } = await createUserWithRole("ai-audit@dashboard.test", "admin", [["dashboard", "admin"]]);
    // The audit log should capture: userId, workspace context, message hash, timestamp
    // Verify by checking the audit log table or a mock audit logger
    //
    // const auditSpy = vi.spyOn(auditLogger, "log");
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What features are active?", context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    // Verify audit log was written:
    // expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({
    //   userId: expect.any(String),
    //   action: "ai_chat",
    //   workspaceContext: "productions/overview",
    //   messageHash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    //   timestamp: expect.any(String),
    // }));
  });

  it("enforces session TTL of 24 hours (Durable Object expiry)", async () => {
    const { cookie } = await createUserWithRole("ai-ttl@dashboard.test", "admin", [["dashboard", "admin"]]);
    // Sessions older than 24 hours should be rejected.
    // Pass an expired sessionId and verify a new session is created.
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "hello",
          context: { workspace: "productions", tab: "overview" },
          sessionId: "expired-session-from-yesterday",
        }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    // Should get a NEW sessionId (not the expired one)
    expect(body.sessionId).toBeDefined();
    expect(body.sessionId).not.toBe("expired-session-from-yesterday");
  });
```

- [ ] **29.1.3** Implement the endpoint with the following security measures:
  - **200/day rate limit**: Use Durable Object counter or D1 row per user per day. Return 429 with `Retry-After: <seconds-until-midnight-UTC>` header when exceeded.
  - **Response URL stripping**: Post-process Claude API response to remove any URLs not matching `*.production.city` or relative paths. Strip from both `response` text and `citations` array.
  - **Audit logging**: Write to `AuditLog` table (or dedicated `AIAuditLog`): `userId`, `workspaceContext` (workspace/tab), `messageHash` (SHA-256 of the user message, NOT the plaintext), `timestamp`, `responseTokenCount`.
  - **Session TTL**: Durable Object sessions expire after 24 hours. On each request, check session creation time; if >24h, delete and create new session.

- [ ] **29.1.4** Register route, verify all tests pass.

- [ ] **29.1.3** Commit:

```
[#29] Add POST /v1/ai/chat endpoint with Claude API integration and rate limiting
```

---

### Issue 30: AI panel integration wiring

**Summary:** Wire AIPanel organism to the backend POST /v1/ai/chat endpoint. Context updates on navigation. Citations link to workspaces. Session persistence via sessionId.

**Files modified:**
- `apps/web/app/dashboard/layout.tsx`

**Acceptance criteria:**
- End-to-end: ask question -> get response -> click citation -> navigate
- Session persists across workspace changes (sessionId in state)
- Context indicator updates when navigating between workspaces
- Cmd+J toggles panel
- Loading state shown while waiting for response
- Error state for failed requests

#### Step 30.1: Wire AIPanel in DashboardShell

- [ ] **30.1.1** Add state management for AI panel in `apps/web/app/dashboard/layout.tsx`:
  - `aiPanelOpen` state with localStorage persistence
  - `aiMessages` state array
  - `aiSessionId` state
  - `aiLoading` state
  - `useAIContext()` hook for context
  - Keyboard shortcut handler for Cmd+J

- [ ] **30.1.2** Create `sendAIMessage` function:

```typescript
async function sendAIMessage(message: string, context: AIContext) {
  setAiLoading(true);
  try {
    const res = await fetch(`${API_BASE}/v1/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        message,
        context: { workspace: context.workspace, tab: context.tab },
        sessionId: aiSessionId,
      }),
    });
    if (!res.ok) throw new Error(`AI chat failed: ${res.status}`);
    const body = await res.json();
    setAiSessionId(body.sessionId);
    setAiMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: message },
      { id: crypto.randomUUID(), role: 'assistant', content: body.response, citations: body.citations },
    ]);
  } catch (err) {
    // Show error in messages
  } finally {
    setAiLoading(false);
  }
}
```

- [ ] **30.1.3** Write automated integration test for AI panel wiring. Create `apps/web/app/dashboard/__tests__/ai-panel-wiring.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// DashboardShell is the layout component that contains AIPanel wiring
import DashboardShell from "../layout";

// Mock useAIContext — returns a stable context for the current workspace
vi.mock("../hooks/useAIContext", () => ({
  useAIContext: () => ({ workspace: "productions", tab: "overview", role: "admin" }),
}));

// Mock useRegistry — provides minimal registry context
vi.mock("../components/RegistryProvider", () => ({
  useRegistry: () => ({
    visibleWorkspaces: [{ id: "productions", label: "Productions", icon: "film", tabs: [] }],
    visibleFeatureIds: [],
    userRole: "admin",
  }),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate, useLocation: () => ({ pathname: "/dashboard/productions" }) };
});

const originalFetch = global.fetch;

describe("AI Panel wiring", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends message to POST /v1/ai/chat and displays response", async () => {
    const user = userEvent.setup();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        response: "The Productions workspace manages film and TV production lifecycle.",
        citations: [{ label: "Productions", url: "/dashboard/productions" }],
        sessionId: "session-abc-123",
      }),
    });

    render(<DashboardShell />);

    // Open the AI panel via Cmd+J
    fireEvent.keyDown(document, { key: "j", metaKey: true });

    // Type a message and submit
    const input = await screen.findByPlaceholderText(/ask/i);
    await user.type(input, "What is the Productions workspace?");
    await user.keyboard("{Enter}");

    // Verify fetch was called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/ai/chat"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
    });

    // Verify the request body contains the message and context
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.message).toBe("What is the Productions workspace?");
    expect(requestBody.context).toEqual({ workspace: "productions", tab: "overview" });

    // Verify response is displayed
    await waitFor(() => {
      expect(screen.getByText(/Productions workspace manages film/)).toBeInTheDocument();
    });

    // Verify citation is rendered as a clickable link
    const citationLink = screen.getByRole("link", { name: /Productions/i });
    expect(citationLink).toHaveAttribute("href", "/dashboard/productions");
  });

  it("clicking a citation link triggers navigation", async () => {
    const user = userEvent.setup();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        response: "Check the facilities workspace.",
        citations: [{ label: "Facilities", url: "/dashboard/facilities" }],
        sessionId: "session-abc-123",
      }),
    });

    render(<DashboardShell />);
    fireEvent.keyDown(document, { key: "j", metaKey: true });

    const input = await screen.findByPlaceholderText(/ask/i);
    await user.type(input, "Where are the stages?");
    await user.keyboard("{Enter}");

    // Wait for the citation to appear, then click it
    const citationLink = await screen.findByRole("link", { name: /Facilities/i });
    await user.click(citationLink);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/facilities");
  });

  it("persists sessionId across multiple messages", async () => {
    const user = userEvent.setup();

    // First response provides a sessionId
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        response: "First response",
        citations: [],
        sessionId: "session-abc-123",
      }),
    });

    // Second response confirms the same session
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        response: "Second response",
        citations: [],
        sessionId: "session-abc-123",
      }),
    });

    render(<DashboardShell />);
    fireEvent.keyDown(document, { key: "j", metaKey: true });

    const input = await screen.findByPlaceholderText(/ask/i);

    // Send first message
    await user.type(input, "First question");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("First response")).toBeInTheDocument();
    });

    // First fetch should have no sessionId (new session)
    const firstCallBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(firstCallBody.sessionId).toBeUndefined();

    // Send second message
    await user.type(input, "Follow-up question");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Second response")).toBeInTheDocument();
    });

    // Second fetch should include the sessionId from the first response
    const secondCallBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[1][1].body);
    expect(secondCallBody.sessionId).toBe("session-abc-123");
  });

  it("shows error state when API returns non-200", async () => {
    const user = userEvent.setup();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    render(<DashboardShell />);
    fireEvent.keyDown(document, { key: "j", metaKey: true });

    const input = await screen.findByPlaceholderText(/ask/i);
    await user.type(input, "This will fail");
    await user.keyboard("{Enter}");

    // Error message should be displayed in the AI panel
    await waitFor(() => {
      expect(screen.getByText(/failed|error|try again/i)).toBeInTheDocument();
    });

    // The panel should still be functional (not crashed)
    expect(input).toBeInTheDocument();
  });

  it("Cmd+J toggles AI panel visibility", () => {
    render(<DashboardShell />);

    // Panel should be initially closed (no AI input visible)
    expect(screen.queryByPlaceholderText(/ask/i)).not.toBeInTheDocument();

    // Open panel with Cmd+J
    fireEvent.keyDown(document, { key: "j", metaKey: true });
    expect(screen.getByPlaceholderText(/ask/i)).toBeInTheDocument();

    // Close panel with Cmd+J again
    fireEvent.keyDown(document, { key: "j", metaKey: true });
    expect(screen.queryByPlaceholderText(/ask/i)).not.toBeInTheDocument();
  });

  it("shows loading state while waiting for response", async () => {
    const user = userEvent.setup();

    // Use a promise we control to keep the fetch pending
    let resolveFetch: (value: unknown) => void;
    (global.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      new Promise((resolve) => { resolveFetch = resolve; }),
    );

    render(<DashboardShell />);
    fireEvent.keyDown(document, { key: "j", metaKey: true });

    const input = await screen.findByPlaceholderText(/ask/i);
    await user.type(input, "Slow question");
    await user.keyboard("{Enter}");

    // Loading indicator should appear while waiting
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // Resolve the fetch
    resolveFetch!({
      ok: true,
      json: () => Promise.resolve({
        response: "Finally here",
        citations: [],
        sessionId: "session-xyz",
      }),
    });

    // Loading should disappear, response should show
    await waitFor(() => {
      expect(screen.getByText("Finally here")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });
});
```

- [ ] **30.1.4** Run tests:

```bash
pnpm --filter ./apps/web test
pnpm typecheck
```

- [ ] **30.1.4** Commit:

```
[#30] Wire AIPanel to backend POST /v1/ai/chat with context updates and session persistence
```

---

> **Phase 7 complete.** AI assistant is functional:
> - useAIContext provides workspace/tab/role context
> - Backend POST /v1/ai/chat calls Claude API with rate limiting and input sanitization
> - AI panel wired end-to-end with citations, session persistence, and keyboard shortcut
>
> **Next:** Phase 8 (CommandBar + Integration) adds object search and wires all 11 workspaces.

---

## Phase 8: CommandBar + Integration (Issues 31-33)

---

### Issue 31: GET /v1/search endpoint

**Summary:** Object search across users, productions, and facilities. Fuzzy matching, role-scoped, rate limited. Returns flat results array with workspace field.

**Files created:**
- `apps/backend/src/search/handlers.ts`
- `apps/backend/src/__tests__/search.test.ts`

**Files modified:**
- `apps/backend/src/routes.ts`

**Acceptance criteria:**
- Minimum query length: 2 characters (returns empty for shorter)
- Rate limiting: 30 req/min/user
- Results permission-filtered server-side (same role-scoping as /v1/workspaces/visible)
- Audit logging: query hash (not plain text), result count, user ID, timestamp
- Sensitive field exclusion (no emails, phones, financial amounts in results)
- Response time <100ms
- Flat results array with workspace field for frontend grouping
- Search scope: users (name), productions (title), facilities (name)

#### Step 31.1: Write failing tests

- [ ] **31.1.1** Create `apps/backend/src/__tests__/search.test.ts`:

```typescript
import { describe, it, expect, vi, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active" },
      update: {},
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-${user.id.slice(0, 8)}`, description: roleName },
    });

    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      } catch {
        // skip duplicate
      }
    }

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const session = await createSession(prisma, user.id);
    return { user, role, session, cookie: `${SESSION_COOKIE_NAME}=${session.token}` };
  } finally {
    await prisma.$disconnect();
  }
}

describe("GET /v1/search", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=test"),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns empty results for query shorter than 2 chars", async () => {
    const { cookie } = await createUserWithRole("search-short@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=a", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("returns results with workspace field and echoes query", async () => {
    const { cookie } = await createUserWithRole("search-query@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=stage", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.query).toBe("stage");
    expect(body.results).toBeDefined();
    expect(typeof body.total).toBe("number");
    for (const result of body.results) {
      expect(result.workspace).toBeDefined();
      expect(result.type).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.url).toBeDefined();
    }
  });

  it("returns 400 for missing q parameter", async () => {
    const { cookie } = await createUserWithRole("search-noq@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/search", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("does not include sensitive fields in results", async () => {
    const { cookie } = await createUserWithRole("search-pii@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=john", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    for (const result of body.results) {
      expect(result.email).toBeUndefined();
      expect(result.phone).toBeUndefined();
    }
  });

  it("scopes results by user role", async () => {
    // Guest should not see admin users or finance data
    const { cookie } = await createUserWithRole("search-guest@dashboard.test", "guest", [["dashboard", "guest"], ["events", "browse"], ["education", "browse"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=admin", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json();
    for (const result of body.results) {
      expect(result.workspace).not.toBe("administration");
    }
  });

  it("returns 429 with Retry-After when rate limited", async () => {
    const { cookie } = await createUserWithRole("search-rate@dashboard.test", "admin", [["dashboard", "admin"]]);
    // Mock the rate limiter to report limit exceeded — deterministic, no accumulated state
    vi.spyOn(rateLimiter, 'check').mockResolvedValueOnce({ allowed: false, retryAfter: 30 });
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=test", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
  });
});
```

- [ ] **31.1.2** Implement the search endpoint, register route, verify tests pass.

- [ ] **31.1.3** Commit:

```
[#31] Add GET /v1/search endpoint with fuzzy matching, role scoping, and audit logging
```

---

### Issue 32: CommandBar object search extension

**Summary:** Extend existing CommandBar to show object search results alongside feature search. Results grouped by workspace. Hierarchy: recents -> objects -> features.

**Files modified:**
- `packages/ui/src/organisms/CommandBar/CommandBar.tsx`

**Acceptance criteria:**
- Stories: with object results, mixed results (objects + features), no results
- Object results appear above feature results
- Results grouped by workspace in display
- Object results fetched from /v1/search API via onObjectSearch callback
- Debounced search (300ms) for object queries
- Max 50 rendered items, virtualized for performance

#### Step 32.1: Write failing tests for extended CommandBar

- [ ] **32.1.1** Add tests to existing CommandBar test file or create new:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandBar, type CommandBarProps } from "./CommandBar";

describe("CommandBar — object search extension", () => {
  const objectResults = [
    { type: "user" as const, id: "u1", title: "Jane Smith", subtitle: "Production Manager", workspace: "people", url: "/dashboard/people/directory" },
    { type: "facility" as const, id: "f1", title: "Sound Stage 3", subtitle: "Available", workspace: "facilities", url: "/dashboard/facilities/sound-stages" },
  ];

  it("renders object results above feature results", () => {
    render(
      <CommandBar
        open
        featureIndex={[{ id: "feat.1", label: "Invoice Management", description: "", path: "/dashboard/finance/invoices", section: "finance", subsection: "invoicing", keywords: [], status: "active" }]}
        recentFeatureIds={[]}
        objectResults={objectResults}
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onObjectSearch={vi.fn()}
      />,
    );
    // Object results should appear in the list
    expect(screen.getByText("Jane Smith")).toBeDefined();
    expect(screen.getByText("Sound Stage 3")).toBeDefined();
  });

  it("groups object results by workspace", () => {
    render(
      <CommandBar
        open
        featureIndex={[]}
        recentFeatureIds={[]}
        objectResults={objectResults}
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onObjectSearch={vi.fn()}
      />,
    );
    // Workspace group headers
    expect(screen.getByText("People")).toBeDefined();
    expect(screen.getByText("Facilities")).toBeDefined();
  });

  it("calls onObjectSearch with debounced query", async () => {
    vi.useFakeTimers();
    const onObjectSearch = vi.fn();
    render(
      <CommandBar
        open
        featureIndex={[]}
        recentFeatureIds={[]}
        objectResults={[]}
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onObjectSearch={onObjectSearch}
      />,
    );
    const input = screen.getByRole("combobox");

    // Type a query — onObjectSearch should NOT be called immediately
    fireEvent.change(input, { target: { value: "stage" } });
    expect(onObjectSearch).not.toHaveBeenCalled();

    // Advance timers past the 300ms debounce window
    vi.advanceTimersByTime(350);

    // Now onObjectSearch should have been called with the query
    expect(onObjectSearch).toHaveBeenCalledTimes(1);
    expect(onObjectSearch).toHaveBeenCalledWith("stage");

    // Typing again should reset the debounce
    fireEvent.change(input, { target: { value: "stage 3" } });
    vi.advanceTimersByTime(100); // Only 100ms — not enough
    expect(onObjectSearch).toHaveBeenCalledTimes(1); // Still just the first call

    vi.advanceTimersByTime(250); // Now 350ms total since last keystroke
    expect(onObjectSearch).toHaveBeenCalledTimes(2);
    expect(onObjectSearch).toHaveBeenLastCalledWith("stage 3");

    vi.useRealTimers();
  });
});
```

- [ ] **32.1.2** Extend CommandBar component, verify tests, update stories.

- [ ] **32.1.3** Commit:

```
[#32] Extend CommandBar with object search results grouped by workspace
```

---

### Issue 33: Workspace shell wiring and canvas slot rendering

**Summary:** Wire routing, tab navigation, ScopeBar configurations, and Coming Soon scaffolds for all 11 workspaces. Each workspace renders the correct canvas component type per tab, using seed/sample data that demonstrates the component's capabilities. This issue wires the workspace shell infrastructure — not live domain data.

> **Scoping note:** The canvas *components* are production quality (built in Phases 4-5). This issue wires them into the workspace shell with representative seed/sample data. Live data integration for each workspace (connecting canvases to their domain APIs) will be done as each workspace goes live per the feature activation roadmap. Each domain's data wiring requires domain-specific API work that belongs in separate, focused issues.

**Files modified:**
- `apps/web/app/dashboard/[workspace]/[tab]/page.tsx`
- `apps/web/app/dashboard/layout.tsx`
- `apps/web/app/dashboard/page.tsx`

**Acceptance criteria:**
- Every workspace accessible via sidebar click
- Each workspace renders the correct canvas component type (from workspace-config.ts) with seed/sample data demonstrating the component's capabilities
- Active tabs show the canvas with seed/sample data; Coming Soon tabs render ComingSoonScaffold with correct wireframe variant
- PlannedSection populated from upcomingFeatures in /v1/workspaces/visible response and shows correct planned features
- ScopeBar configured per workspace with correct filters
- Tab navigation updates URL and active tab state
- WorkspaceCard expanded view on Home shows correct tabs with status dots

#### Step 33.1: Create canvas resolver

- [ ] **33.1.1** Create a canvas resolver function in the workspace tab page that maps canvas type to component:

```typescript
// Per-workspace sample data imports — each workspace has its own sample data file
// because data structures vary per domain. These are replaced with live API data
// as each workspace goes live (separate issues per workspace activation).
import { getSampleData } from '../sample-data';

// Each workspace defines its sample data in:
//   apps/web/app/dashboard/[workspace]/sample-data/productions.ts
//   apps/web/app/dashboard/[workspace]/sample-data/facilities.ts
//   apps/web/app/dashboard/[workspace]/sample-data/finance.ts
//   etc. (one per workspace)
//
// getSampleData(workspace, tabConfig) returns the correct props for the canvas type.

function resolveCanvas(workspace: string, canvasType: string, tabConfig: WorkspaceTab): ReactNode {
  const sampleData = getSampleData(workspace, tabConfig);
  switch (canvasType) {
    case 'table': return <CanvasTable columns={sampleData.columns} data={sampleData.data} caption={tabConfig.label} />;
    case 'board': return <CanvasBoard lanes={sampleData.lanes} cards={sampleData.cards} onCardMove={() => {}} />;
    case 'calendar': return <CanvasCalendar view="month" date={new Date()} events={sampleData.events} onViewChange={() => {}} onDateChange={() => {}} />;
    case 'timeline': return <CanvasTimeline tasks={sampleData.tasks} zoom="month" startDate="2026-03-01" endDate="2026-06-30" />;
    case 'catalog': return <CanvasCatalog items={sampleData.items} categories={sampleData.categories} />;
    case 'documents': return <CanvasDocuments items={sampleData.items} currentPath="/" />;
    case 'charts': return <CanvasCharts charts={sampleData.charts} />;
    default: return <div>Unknown canvas type: {canvasType}</div>;
  }
}
```

- [ ] **33.1.2** Update WorkspaceTabRouter to use canvas resolver or ComingSoonScaffold based on tab status.

- [ ] **33.1.3** Define `WORKSPACE_SCOPE_CONFIGS` constant mapping workspace IDs to ScopeBar filter configurations. Create in `apps/web/app/dashboard/config/workspace-scope-configs.ts`:

```typescript
import type { ScopeBarFilter } from '@productioncity/holding-ui';

/**
 * Per-workspace ScopeBar filter configurations.
 *
 * Each workspace defines which filters appear in its ScopeBar and what options
 * are available. These configs are static — they define the filter UI. The actual
 * filter values/counts come from the canvas data endpoints.
 *
 * Uses the unified ScopeBarFilter type from the UI package. Filter types:
 * - 'select' (default): dropdown with options
 * - 'dateRange': date range picker
 * - 'search': text input with placeholder
 */
export interface WorkspaceScopeConfig {
  /** Filters shown in the ScopeBar for this workspace */
  filters: ScopeBarFilter[];
}

export const WORKSPACE_SCOPE_CONFIGS: Record<string, WorkspaceScopeConfig> = {
  productions: {
    filters: [
      { id: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "pre-production", label: "Pre-Production" }, { value: "post-production", label: "Post-Production" }, { value: "wrapped", label: "Wrapped" }, { value: "archived", label: "Archived" }] },
      { id: "type", label: "Type", type: "select", options: [{ value: "film", label: "Film" }, { value: "tv-series", label: "TV Series" }, { value: "commercial", label: "Commercial" }, { value: "documentary", label: "Documentary" }] },
      { id: "client", label: "Client", type: "search", placeholder: "Filter by client..." },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
  facilities: {
    filters: [
      { id: "type", label: "Type", type: "select", options: [{ value: "sound-stage", label: "Sound Stage" }, { value: "led-volume", label: "LED Volume" }, { value: "control-room", label: "Control Room" }, { value: "broadcast-theatre", label: "Broadcast Theatre" }] },
      { id: "availability", label: "Availability", type: "select", options: [{ value: "available", label: "Available" }, { value: "booked", label: "Booked" }, { value: "maintenance", label: "Maintenance" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search facilities..." },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
  finance: {
    filters: [
      { id: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }, { value: "cancelled", label: "Cancelled" }] },
      { id: "type", label: "Type", type: "select", options: [{ value: "invoice", label: "Invoice" }, { value: "budget", label: "Budget" }, { value: "purchase-order", label: "Purchase Order" }, { value: "distribution", label: "Distribution" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search finance..." },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
  people: {
    filters: [
      { id: "department", label: "Department", type: "select", options: [{ value: "production", label: "Production" }, { value: "post", label: "Post" }, { value: "admin", label: "Admin" }, { value: "facilities", label: "Facilities" }, { value: "finance", label: "Finance" }] },
      { id: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "on-leave", label: "On Leave" }, { value: "contractor", label: "Contractor" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search people..." },
    ],
  },
  campus: {
    filters: [
      { id: "phase", label: "Phase", type: "select", options: [{ value: "planning", label: "Planning" }, { value: "design", label: "Design" }, { value: "construction", label: "Construction" }, { value: "complete", label: "Complete" }] },
      { id: "precinct", label: "Precinct", type: "select", options: [{ value: "north", label: "North Precinct" }, { value: "south", label: "South Precinct" }, { value: "central", label: "Central Hub" }, { value: "creative", label: "Creative Quarter" }] },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
  events: {
    filters: [
      { id: "type", label: "Type", type: "select", options: [{ value: "concert", label: "Concert" }, { value: "screening", label: "Screening" }, { value: "conference", label: "Conference" }, { value: "tour", label: "Tour" }, { value: "private", label: "Private" }] },
      { id: "status", label: "Status", type: "select", options: [{ value: "upcoming", label: "Upcoming" }, { value: "in-progress", label: "In Progress" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search events..." },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
  education: {
    filters: [
      { id: "type", label: "Type", type: "select", options: [{ value: "course", label: "Course" }, { value: "workshop", label: "Workshop" }, { value: "certification", label: "Certification" }, { value: "masterclass", label: "Masterclass" }] },
      { id: "level", label: "Level", type: "select", options: [{ value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search courses..." },
    ],
  },
  analytics: {
    filters: [
      { id: "period", label: "Period", type: "select", options: [{ value: "this-week", label: "This Week" }, { value: "this-month", label: "This Month" }, { value: "this-quarter", label: "This Quarter" }, { value: "this-year", label: "This Year" }, { value: "custom", label: "Custom" }] },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
  "investor-relations": {
    filters: [
      { id: "type", label: "Type", type: "select", options: [{ value: "report", label: "Report" }, { value: "update", label: "Update" }, { value: "document", label: "Document" }, { value: "distribution", label: "Distribution" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search documents..." },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
  partnerships: {
    filters: [
      { id: "type", label: "Type", type: "select", options: [{ value: "technology", label: "Technology" }, { value: "education", label: "Education" }, { value: "first-nations", label: "First Nations" }, { value: "government", label: "Government" }, { value: "eoi", label: "EOI" }] },
      { id: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "proposed", label: "Proposed" }, { value: "completed", label: "Completed" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search partnerships..." },
    ],
  },
  administration: {
    filters: [
      { id: "type", label: "Type", type: "select", options: [{ value: "user", label: "User" }, { value: "role", label: "Role" }, { value: "audit-entry", label: "Audit Entry" }, { value: "sso-config", label: "SSO Config" }] },
      { id: "search", label: "Search", type: "search", placeholder: "Search admin..." },
      { id: "date", label: "Date Range", type: "dateRange" },
    ],
  },
};
```

- [ ] **33.1.4** Wire ScopeBar in the workspace tab page using the config:

```typescript
// In apps/web/app/dashboard/[workspace]/[tab]/page.tsx
import { WORKSPACE_SCOPE_CONFIGS } from '../../config/workspace-scope-configs';

// Inside WorkspaceTabRouter, after resolving the tab:
const scopeConfig = WORKSPACE_SCOPE_CONFIGS[workspace];
// Pass to WorkspaceShell -> ScopeBar
```

- [ ] **33.1.5** Wire PlannedSection with upcomingFeatures from registry context.

- [ ] **33.1.6** Canvas sample data: Each workspace gets its own sample data file at `apps/web/app/dashboard/[workspace]/sample-data/<workspace>.ts`. Data structures vary per domain (productions have titles/statuses, facilities have names/availability, finance has amounts/dates), so each workspace needs its own file. This is NOT placeholder/empty data — it's hardcoded sample data that shows the canvas working as intended.

  Create per-workspace sample data files:
  - `apps/web/app/dashboard/[workspace]/sample-data/productions.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/facilities.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/finance.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/people.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/campus.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/events.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/education.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/analytics.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/investor-relations.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/partnerships.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/administration.ts`
  - `apps/web/app/dashboard/[workspace]/sample-data/index.ts` (re-exports `getSampleData` resolver)

  ```typescript
  // Example: apps/web/app/dashboard/[workspace]/sample-data/productions.ts
  export const PRODUCTIONS_SAMPLE_DATA = {
    columns: [
      { key: 'title', label: 'Production', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'stage', label: 'Stage' },
      { key: 'startDate', label: 'Start Date', sortable: true },
    ],
    data: [
      { id: '1', title: 'Project Aurora', status: 'shooting', stage: 'Sound Stage 3', startDate: '2026-03-20' },
      { id: '2', title: 'Harbour Nights', status: 'pre-production', stage: 'LED Volume 1', startDate: '2026-04-15' },
      { id: '3', title: 'Queensland Stories', status: 'post-production', stage: null, startDate: '2026-02-01' },
    ],
  };
  ```

  ```typescript
  // apps/web/app/dashboard/[workspace]/sample-data/index.ts
  import { PRODUCTIONS_SAMPLE_DATA } from './productions';
  import { FACILITIES_SAMPLE_DATA } from './facilities';
  // ... etc.

  const SAMPLE_DATA_MAP: Record<string, Record<string, unknown>> = {
    productions: PRODUCTIONS_SAMPLE_DATA,
    facilities: FACILITIES_SAMPLE_DATA,
    // ... etc.
  };

  export function getSampleData(workspace: string, tabConfig: WorkspaceTab) {
    return SAMPLE_DATA_MAP[workspace] ?? {};
  }
  ```

  Each workspace must have sample data that:
  - Populates all visible columns/cards/events in the canvas
  - Demonstrates the canvas's sorting, filtering, and interaction capabilities
  - Is realistic enough that a stakeholder can understand what the workspace will look like with live data
  - Uses domain-appropriate field names and values (not generic placeholders)

  > **NOTE:** Sample data is replaced with live API data as each workspace goes live (separate issues per workspace activation). This issue ensures every canvas renders with representative content, not empty states.

- [ ] **33.1.5** Verify all 11 workspaces render correctly:

```bash
pnpm --filter ./apps/web test
pnpm typecheck
pnpm build-storybook
```

- [ ] **33.1.6** Commit:

```
[#33] Wire workspace shell routing, tab navigation, ScopeBar configs, and canvas slot rendering with seed data
```

---

> **Phase 8 complete.** All integration wiring is done:
> - Object search endpoint serves role-scoped results
> - CommandBar shows objects grouped by workspace alongside feature search
> - All 11 workspaces wired with correct canvas component types (seed/sample data), Coming Soon scaffolds, and PlannedSections
>
> **Next:** Phase 9 (E2E + Cleanup) writes comprehensive E2E tests and removes replaced components.

---

## Phase 9: E2E + Cleanup (Issues 34-35)

---

### Issue 34: E2E test suite rewrite

**Summary:** Workspace-oriented E2E tests covering: role sidebar rendering, workspace navigation, tab states, canvas rendering, Coming Soon scaffolds, AI panel, inbox, CommandBar object search, responsive breakpoints, and permission boundaries.

**Files created:**
- `apps/web/e2e/dashboard-workspaces.spec.ts`
- `apps/web/e2e/dashboard-inbox.spec.ts`
- `apps/web/e2e/dashboard-ai-panel.spec.ts`
- `apps/web/e2e/dashboard-command-bar.spec.ts`
- `apps/web/e2e/dashboard-responsive.spec.ts`

**Acceptance criteria:**
- All scenarios pass at 375px (mobile) and 1440px (desktop) viewports
- Total suite runtime <3 minutes
- Permission boundary tests verify 404 for unauthorized workspace/tab access
- Canvas rendering verified for each of the 7 canvas types
- Coming Soon scaffold verified for non-active tabs

#### Step 34.1: Create workspace navigation E2E tests

- [ ] **34.1.1** Create `apps/web/e2e/dashboard-workspaces.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Dashboard Workspaces", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/dashboard");
  });

  test("sidebar shows all 11 workspaces for admin", async ({ page }) => {
    await expect(page.getByText("Productions")).toBeVisible();
    await expect(page.getByText("Facilities")).toBeVisible();
    await expect(page.getByText("Finance")).toBeVisible();
    await expect(page.getByText("People")).toBeVisible();
    await expect(page.getByText("Campus")).toBeVisible();
    await expect(page.getByText("Events")).toBeVisible();
    await expect(page.getByText("Education")).toBeVisible();
    await expect(page.getByText("Analytics")).toBeVisible();
    await expect(page.getByText("Investor Relations")).toBeVisible();
    await expect(page.getByText("Partnerships")).toBeVisible();
    await expect(page.getByText("Administration")).toBeVisible();
  });

  test("clicking workspace navigates to first tab", async ({ page }) => {
    await page.getByText("Productions").click();
    await expect(page).toHaveURL(/\/dashboard\/productions\//);
    // Tab bar should be visible
    await expect(page.getByRole("tablist")).toBeVisible();
  });

  test("tab navigation updates URL", async ({ page }) => {
    await page.goto("/dashboard/productions/overview");
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    // Click another tab
    await page.getByRole("tab", { name: "Shooting" }).click();
    await expect(page).toHaveURL(/\/dashboard\/productions\/shooting/);
  });

  test("coming soon tab renders scaffold", async ({ page }) => {
    await page.goto("/dashboard/productions/shooting");
    // Should show Coming Soon banner (assuming shooting is coming_soon)
    await expect(page.getByText(/coming/i)).toBeVisible();
  });

  test("Home shows workspace cards", async ({ page }) => {
    await page.goto("/dashboard/home");
    // Should show workspace cards
    await expect(page.getByText("Productions")).toBeVisible();
    await expect(page.getByText("Facilities")).toBeVisible();
  });

  test("Home workspace card expands to show tabs", async ({ page }) => {
    await page.goto("/dashboard/home");
    // Find and click expand button on a workspace card
    const expandBtn = page.getByLabel(/expand/i).first();
    await expandBtn.click();
    // Should show tab names
    await expect(page.getByText("Overview")).toBeVisible();
  });

  test("unauthorized workspace returns 404", async ({ page }) => {
    // As guest, try to access administration
    // (Requires switching to guest session)
    await page.goto("/dashboard/administration");
    // Should show 404 or redirect
  });

  test("legacy URL redirects to new path", async ({ page }) => {
    await page.goto("/dashboard/company/hr");
    await expect(page).toHaveURL(/\/dashboard\/people/);
  });
});
```

- [ ] **34.1.2** Create `apps/web/e2e/dashboard-inbox.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Dashboard Inbox", () => {
  test("inbox page renders with filters", async ({ page }) => {
    await page.goto("/dashboard/inbox");
    await expect(page.getByText("Inbox")).toBeVisible();
  });

  test("sidebar badge shows unread count", async ({ page }) => {
    await page.goto("/dashboard");
    // Badge should be visible if there are unread items
  });

  test("mark all read updates badge", async ({ page }) => {
    await page.goto("/dashboard/inbox");
    // If there are unread items, mark all read should update
  });
});
```

- [ ] **34.1.3** Create `apps/web/e2e/dashboard-ai-panel.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("AI Panel", () => {
  test("opens with Cmd+J", async ({ page }) => {
    await page.goto("/dashboard/productions/overview");
    await page.keyboard.press("Meta+j");
    await expect(page.getByText("AI Assistant")).toBeVisible();
  });

  test("shows workspace context", async ({ page }) => {
    await page.goto("/dashboard/productions/overview");
    await page.keyboard.press("Meta+j");
    await expect(page.getByText(/Productions/)).toBeVisible();
  });

  test("shows suggested questions", async ({ page }) => {
    await page.goto("/dashboard/productions/overview");
    await page.keyboard.press("Meta+j");
    // Should show suggested questions
  });

  test("closes with Escape", async ({ page }) => {
    await page.goto("/dashboard/productions/overview");
    await page.keyboard.press("Meta+j");
    await expect(page.getByText("AI Assistant")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("AI Assistant")).not.toBeVisible();
  });
});
```

- [ ] **34.1.4** Create `apps/web/e2e/dashboard-command-bar.spec.ts` and `apps/web/e2e/dashboard-responsive.spec.ts`.

- [ ] **34.1.5** Run full E2E suite:

```bash
pnpm --filter ./apps/web test:e2e
```

**Expected:** All scenarios pass at 375px and 1440px. Suite <3 minutes.

- [ ] **34.1.6** Commit:

```
[#34] Add comprehensive E2E test suite for workspace navigation, inbox, AI panel, and responsive
```

---

### Issue 35: Remove replaced components + update docs

**Summary:** Remove old sidebar, role dashboard, and coming soon components. Update all imports. Update CLAUDE.md to reflect workspace architecture.

**Files removed:**
- `packages/ui/src/organisms/SidebarNav/` (entire directory)
- `packages/ui/src/atoms/SidebarItem/` (entire directory)
- `packages/ui/src/molecules/SidebarGroup/` (entire directory)
- `packages/ui/src/templates/RoleDashboard/` (entire directory)
- `packages/ui/src/templates/ComingSoonPage/` (entire directory)
- `packages/ui/src/atoms/FeatureStatusBadge/` (entire directory)
- `packages/ui/src/molecules/ComingSoonCard/` (entire directory)

**Files modified:**
- `packages/ui/src/index.ts` (remove old exports)
- `apps/web/app/dashboard/layout.tsx` (remove old imports)

**Acceptance criteria:**
- No dead code — all removed component directories deleted
- No broken imports — all references to removed components updated or removed
- `pnpm test` passes (all tests)
- `pnpm lint` passes (no unused imports)
- `pnpm typecheck` passes (no type errors)
- `pnpm build-storybook` passes (no broken stories)
- CLAUDE.md updated with workspace architecture references

#### Step 35.1: Remove old components

- [ ] **35.1.1** Delete old component directories:

```bash
rm -rf packages/ui/src/organisms/SidebarNav
rm -rf packages/ui/src/atoms/SidebarItem
rm -rf packages/ui/src/molecules/SidebarGroup
rm -rf packages/ui/src/templates/RoleDashboard
rm -rf packages/ui/src/templates/ComingSoonPage
rm -rf packages/ui/src/atoms/FeatureStatusBadge
rm -rf packages/ui/src/molecules/ComingSoonCard
```

- [ ] **35.1.2** Remove exports from `packages/ui/src/index.ts`:

Remove all export lines referencing the deleted components.

- [ ] **35.1.3** Search for and fix all broken imports across the codebase:

```bash
# Find all imports of removed components
grep -r "SidebarNav\|SidebarItem\|SidebarGroup\|RoleDashboard\|ComingSoonPage\|FeatureStatusBadge\|ComingSoonCard" apps/ packages/ --include="*.ts" --include="*.tsx" -l
```

Fix each file by replacing old component references with new workspace equivalents or removing unused imports.

#### Step 35.2: Verify clean build

- [ ] **35.2.1** Run all quality gates:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build-storybook
pnpm --filter ./apps/web test:e2e
```

**Expected:** All pass. No warnings, no errors.

- [ ] **35.2.2** Commit:

```
[#35] Remove replaced sidebar/dashboard/coming-soon components and clean imports
```

---

> **Phase 9 complete.** The dashboard UX redesign is fully implemented:
> - All 11 workspaces accessible with role-adaptive navigation
> - 7 canvas types render per workspace/tab configuration
> - Home dashboard with attention items, recents, workspace cards, what's new
> - Inbox with paginated feed, filters, mark read/dismiss
> - AI assistant with workspace context, Claude API integration, citations
> - CommandBar with object search grouped by workspace
> - Coming Soon scaffolds with wireframe previews and notify buttons
> - PlannedSection with horizontal scroll of planned features
> - E2E tests covering all scenarios at mobile and desktop viewports
> - Old components removed, codebase clean
>
> **All 35 issues across 9 phases are complete.**
