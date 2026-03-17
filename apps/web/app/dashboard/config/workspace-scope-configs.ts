/**
 * Per-workspace ScopeBar filter configurations.
 *
 * Each workspace defines which scope options appear in its ScopeBar.
 * These are static display options; actual filtering is applied client-side
 * against canvas data.
 *
 * @see Issue #415
 */

import type { ScopeOption } from '@productioncity/holding-ui';

export interface WorkspaceScopeConfig {
  /** Scope options shown in the ScopeBar for this workspace */
  options: ScopeOption[];
  /** Search placeholder text */
  searchPlaceholder?: string;
}

export const WORKSPACE_SCOPE_CONFIGS: Record<string, WorkspaceScopeConfig> = {
  productions: {
    options: [
      { id: "all", label: "All" },
      { id: "active", label: "Active" },
      { id: "pre-production", label: "Pre-Production" },
      { id: "post-production", label: "Post-Production" },
      { id: "wrapped", label: "Wrapped" },
    ],
    searchPlaceholder: "Filter productions...",
  },
  facilities: {
    options: [
      { id: "all", label: "All" },
      { id: "available", label: "Available" },
      { id: "booked", label: "Booked" },
      { id: "maintenance", label: "Maintenance" },
    ],
    searchPlaceholder: "Filter facilities...",
  },
  finance: {
    options: [
      { id: "all", label: "All" },
      { id: "pending", label: "Pending" },
      { id: "paid", label: "Paid" },
      { id: "overdue", label: "Overdue" },
    ],
    searchPlaceholder: "Filter finance...",
  },
  people: {
    options: [
      { id: "all", label: "All" },
      { id: "active", label: "Active" },
      { id: "on-leave", label: "On Leave" },
      { id: "contractor", label: "Contractor" },
    ],
    searchPlaceholder: "Search people...",
  },
  campus: {
    options: [
      { id: "all", label: "All" },
      { id: "planning", label: "Planning" },
      { id: "construction", label: "Construction" },
      { id: "complete", label: "Complete" },
    ],
    searchPlaceholder: "Filter campus...",
  },
  events: {
    options: [
      { id: "all", label: "All" },
      { id: "upcoming", label: "Upcoming" },
      { id: "in-progress", label: "In Progress" },
      { id: "completed", label: "Completed" },
    ],
    searchPlaceholder: "Filter events...",
  },
  education: {
    options: [
      { id: "all", label: "All" },
      { id: "courses", label: "Courses" },
      { id: "workshops", label: "Workshops" },
      { id: "certifications", label: "Certifications" },
    ],
    searchPlaceholder: "Search courses...",
  },
  analytics: {
    options: [
      { id: "this-week", label: "This Week" },
      { id: "this-month", label: "This Month" },
      { id: "this-quarter", label: "This Quarter" },
      { id: "this-year", label: "This Year" },
    ],
  },
  "investor-relations": {
    options: [
      { id: "all", label: "All" },
      { id: "reports", label: "Reports" },
      { id: "updates", label: "Updates" },
      { id: "documents", label: "Documents" },
    ],
    searchPlaceholder: "Search documents...",
  },
  partnerships: {
    options: [
      { id: "all", label: "All" },
      { id: "active", label: "Active" },
      { id: "proposed", label: "Proposed" },
      { id: "completed", label: "Completed" },
    ],
    searchPlaceholder: "Search partnerships...",
  },
  administration: {
    options: [
      { id: "all", label: "All" },
      { id: "users", label: "Users" },
      { id: "roles", label: "Roles" },
      { id: "audit", label: "Audit Log" },
    ],
    searchPlaceholder: "Search admin...",
  },
};
