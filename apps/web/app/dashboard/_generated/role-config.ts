// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.
// @generated

import type { WorkspaceId } from './workspace-config';

export type DashboardRole =
  | 'admin'
  | 'executive'
  | 'staff'
  | 'client'
  | 'investor'
  | 'guest'
  | 'vendor'
  | 'government'
  | 'partner'
  | 'first_nations'
  ;

export interface QuickAction {
  label: string;
  workspace: WorkspaceId;
  tab: string;
  icon: string;
}

export interface RoleConfigEntry {
  workspaceOrder: WorkspaceId[];
  quickActions: QuickAction[];
}

export const ROLE_CONFIG: Record<DashboardRole, RoleConfigEntry> = {
  'admin': {
    workspaceOrder: ['productions', 'facilities', 'finance', 'people', 'campus', 'events', 'education', 'analytics', 'investor-relations', 'partnerships', 'administration'],
    quickActions: [
      { label: 'New User', workspace: 'administration', tab: 'users', icon: 'user-plus' },
      { label: 'View Audit Log', workspace: 'administration', tab: 'roles', icon: 'scroll' },
    ],
  },
  'executive': {
    workspaceOrder: ['productions', 'facilities', 'finance', 'people', 'campus', 'analytics', 'investor-relations'],
    quickActions: [
      { label: 'Company Overview', workspace: 'analytics', tab: 'operational', icon: 'chart-bar' },
      { label: 'Financial Summary', workspace: 'finance', tab: 'overview', icon: 'dollar-sign' },
    ],
  },
  'staff': {
    workspaceOrder: ['productions', 'facilities', 'people', 'events', 'education'],
    quickActions: [
      { label: 'Book Facility', workspace: 'facilities', tab: 'calendar', icon: 'calendar' },
      { label: 'Request Leave', workspace: 'people', tab: 'leave', icon: 'calendar-off' },
    ],
  },
  'client': {
    workspaceOrder: ['productions', 'facilities', 'finance'],
    quickActions: [
      { label: 'My Productions', workspace: 'productions', tab: 'overview', icon: 'film' },
      { label: 'Book Stage', workspace: 'facilities', tab: 'sound-stages', icon: 'building' },
      { label: 'View Invoices', workspace: 'finance', tab: 'invoices', icon: 'receipt' },
    ],
  },
  'investor': {
    workspaceOrder: ['investor-relations', 'finance'],
    quickActions: [
      { label: 'Portfolio Summary', workspace: 'investor-relations', tab: 'portfolio', icon: 'briefcase' },
      { label: 'Data Room', workspace: 'investor-relations', tab: 'data-room', icon: 'folder' },
    ],
  },
  'guest': {
    workspaceOrder: ['events', 'education'],
    quickActions: [
      { label: 'Browse Events', workspace: 'events', tab: 'calendar', icon: 'calendar' },
      { label: 'View Courses', workspace: 'education', tab: 'courses', icon: 'graduation-cap' },
    ],
  },
  'vendor': {
    workspaceOrder: ['facilities', 'finance'],
    quickActions: [
      { label: 'Submit Invoice', workspace: 'finance', tab: 'invoices', icon: 'receipt' },
      { label: 'Active Orders', workspace: 'facilities', tab: 'equipment', icon: 'package' },
    ],
  },
  'government': {
    workspaceOrder: ['campus', 'analytics', 'partnerships'],
    quickActions: [
      { label: 'Economic Impact', workspace: 'analytics', tab: 'sustainability', icon: 'chart-bar' },
      { label: 'Incentive Programs', workspace: 'partnerships', tab: 'government', icon: 'landmark' },
    ],
  },
  'partner': {
    workspaceOrder: ['partnerships', 'education', 'campus'],
    quickActions: [
      { label: 'Joint Projects', workspace: 'partnerships', tab: 'overview', icon: 'handshake' },
      { label: 'Shared Programs', workspace: 'education', tab: 'partners', icon: 'graduation-cap' },
    ],
  },
  'first_nations': {
    workspaceOrder: ['partnerships', 'education'],
    quickActions: [
      { label: 'Heritage Assessments', workspace: 'partnerships', tab: 'first-nations', icon: 'shield' },
      { label: 'Cultural Calendar', workspace: 'education', tab: 'workshops', icon: 'calendar' },
    ],
  },
};