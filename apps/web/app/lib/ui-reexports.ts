"use client";

/**
 * RSC-safe re-exports from @productioncity/holding-ui.
 *
 * Vite's resolve.alias redirects `@productioncity/holding-ui` here
 * to avoid barrel imports that crash vinext's RSC rendering.
 *
 * @see https://github.com/cloudflare/vinext/pull/138
 */

// Re-export everything from the original barrel EXCEPT Toast and Form
// which call React.createContext() at module level.
//
// We use the original barrel's sub-barrel files (atoms/index, molecules/index, etc.)
// and skip the problematic organisms individually.

export * from "../../../../packages/ui/src/atoms";
export * from "../../../../packages/ui/src/molecules";
// Skip organisms barrel — cherry-pick to exclude Toast and Form
export { ApprovalCard } from "../../../../packages/ui/src/organisms/ApprovalCard/ApprovalCard";
export { DataTable } from "../../../../packages/ui/src/organisms/DataTable/DataTable";
export type { DataTableProps, DataTableColumn, DataTableAction, SortDirection, SortState } from "../../../../packages/ui/src/organisms/DataTable/DataTable";
export { Modal } from "../../../../packages/ui/src/organisms/Modal/Modal";
export type { ModalProps, ModalSize } from "../../../../packages/ui/src/organisms/Modal/Modal";
export { EOISection } from "../../../../packages/ui/src/organisms/EOISection/EOISection";
export { FacilityShowcase } from "../../../../packages/ui/src/organisms/FacilityShowcase/FacilityShowcase";
export { FAQSection } from "../../../../packages/ui/src/organisms/FAQSection/FAQSection";
export type { FAQSectionProps } from "../../../../packages/ui/src/organisms/FAQSection/FAQSection";
export { LandingNavigation } from "../../../../packages/ui/src/organisms/LandingNavigation/LandingNavigation";
export type { LandingNavigationProps, NavLinkItem } from "../../../../packages/ui/src/organisms/LandingNavigation/LandingNavigation";
export { LandingFooter } from "../../../../packages/ui/src/organisms/LandingFooter/LandingFooter";
export type { LandingFooterProps } from "../../../../packages/ui/src/organisms/LandingFooter/LandingFooter";
export { LoginForm } from "../../../../packages/ui/src/organisms/LoginForm/LoginForm";
export { MagicCodeForm } from "../../../../packages/ui/src/organisms/MagicCodeForm/MagicCodeForm";
export { InvitationForm } from "../../../../packages/ui/src/organisms/InvitationForm/InvitationForm";
export { InvitationTable } from "../../../../packages/ui/src/organisms/InvitationTable/InvitationTable";
export type { InvitationTableInvitation } from "../../../../packages/ui/src/organisms/InvitationTable/InvitationTable";
export { UserTable } from "../../../../packages/ui/src/organisms/UserTable/UserTable";
export type { UserTableUser } from "../../../../packages/ui/src/organisms/UserTable/UserTable";
export { UserDetailPanel } from "../../../../packages/ui/src/organisms/UserDetailPanel/UserDetailPanel";
export type { UserDetail } from "../../../../packages/ui/src/organisms/UserDetailPanel/UserDetailPanel";
export { NavigationHeader } from "../../../../packages/ui/src/organisms/NavigationHeader/NavigationHeader";
export { Sidebar } from "../../../../packages/ui/src/organisms/Sidebar/Sidebar";
export type { SidebarSection } from "../../../../packages/ui/src/organisms/Sidebar/Sidebar";
export { PageShell } from "../../../../packages/ui/src/organisms/PageShell/PageShell";
export { ServiceGrid } from "../../../../packages/ui/src/organisms/ServiceGrid/ServiceGrid";
export { StakeholderGrid } from "../../../../packages/ui/src/organisms/StakeholderGrid/StakeholderGrid";
export { GlobalCampusMap } from "../../../../packages/ui/src/organisms/GlobalCampusMap/GlobalCampusMap";
export { ForwardLookingDisclaimer } from "../../../../packages/ui/src/organisms/ForwardLookingDisclaimer/ForwardLookingDisclaimer";
export { MediaHero } from "../../../../packages/ui/src/organisms/MediaHero/MediaHero";
export type { MediaHeroProps } from "../../../../packages/ui/src/organisms/MediaHero/MediaHero";
export { NotificationBell } from "../../../../packages/ui/src/organisms/NotificationBell/NotificationBell";
export { NotificationPanel } from "../../../../packages/ui/src/organisms/NotificationPanel/NotificationPanel";
export type { NotificationPanelProps, NotificationEntry } from "../../../../packages/ui/src/organisms/NotificationPanel/NotificationPanel";
export { EoiTable } from "../../../../packages/ui/src/organisms/EoiTable/EoiTable";
export type { EoiTableProps, EoiTableItem, EoiPagination } from "../../../../packages/ui/src/organisms/EoiTable/EoiTable";
export { EoiDetailPanel } from "../../../../packages/ui/src/organisms/EoiDetailPanel/EoiDetailPanel";
export type { EoiDetailPanelProps, EoiDetail } from "../../../../packages/ui/src/organisms/EoiDetailPanel/EoiDetailPanel";
export { EoiStats } from "../../../../packages/ui/src/organisms/EoiStats/EoiStats";
export type { EoiStatsProps } from "../../../../packages/ui/src/organisms/EoiStats/EoiStats";
export { CinematicHero } from "../../../../packages/ui/src/organisms/CinematicHero/CinematicHero";
export type { CinematicHeroProps } from "../../../../packages/ui/src/organisms/CinematicHero/CinematicHero";
export { ScrollRevealSection } from "../../../../packages/ui/src/organisms/ScrollRevealSection/ScrollRevealSection";
export type { ScrollRevealSectionProps } from "../../../../packages/ui/src/organisms/ScrollRevealSection/ScrollRevealSection";
export { MediaPanel } from "../../../../packages/ui/src/organisms/MediaPanel/MediaPanel";
export type { MediaPanelProps } from "../../../../packages/ui/src/organisms/MediaPanel/MediaPanel";
export { StatementBlock } from "../../../../packages/ui/src/organisms/StatementBlock/StatementBlock";
export type { StatementBlockProps } from "../../../../packages/ui/src/organisms/StatementBlock/StatementBlock";
export { BrandAccentDivider } from "../../../../packages/ui/src/organisms/BrandAccentDivider/BrandAccentDivider";
export type { BrandAccentDividerProps } from "../../../../packages/ui/src/organisms/BrandAccentDivider/BrandAccentDivider";
export { AnnouncementList } from "../../../../packages/ui/src/organisms/AnnouncementList/AnnouncementList";
export type { AnnouncementListProps } from "../../../../packages/ui/src/organisms/AnnouncementList/AnnouncementList";
export { AnnouncementDetail } from "../../../../packages/ui/src/organisms/AnnouncementDetail/AnnouncementDetail";
export type { AnnouncementDetailProps } from "../../../../packages/ui/src/organisms/AnnouncementDetail/AnnouncementDetail";
export { SubscriptionManager } from "../../../../packages/ui/src/organisms/SubscriptionManager/SubscriptionManager";
export type { SubscriptionManagerProps } from "../../../../packages/ui/src/organisms/SubscriptionManager/SubscriptionManager";
export { ContentBlockEditor } from "../../../../packages/ui/src/organisms/ContentBlockEditor/ContentBlockEditor";
export { AdminAnnouncementTable } from "../../../../packages/ui/src/organisms/AdminAnnouncementTable/AdminAnnouncementTable";
export { AdminSubscriptionTable } from "../../../../packages/ui/src/organisms/AdminSubscriptionTable/AdminSubscriptionTable";
export { SidebarNav } from "../../../../packages/ui/src/organisms/SidebarNav/SidebarNav";
export type { SidebarNavProps } from "../../../../packages/ui/src/organisms/SidebarNav/SidebarNav";
export { CommandBar } from "../../../../packages/ui/src/organisms/CommandBar/CommandBar";
export { WorkspaceSidebar } from "../../../../packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar";
export type { WorkspaceSidebarProps, WorkspaceSidebarItem } from "../../../../packages/ui/src/organisms/WorkspaceSidebar/WorkspaceSidebar";
export { WorkspaceTabs } from "../../../../packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs";
export type { WorkspaceTabsProps, WorkspaceTab } from "../../../../packages/ui/src/organisms/WorkspaceTabs/WorkspaceTabs";
export { AIPanel } from "../../../../packages/ui/src/organisms/AIPanel/AIPanel";
export type { AIPanelProps, AIPanelMessage } from "../../../../packages/ui/src/organisms/AIPanel/AIPanel";
export * from "../../../../packages/ui/src/templates";
export * from "../../../../packages/ui/src/pages";
export * from "../../../../packages/ui/src/foundations";
export * from "../../../../packages/ui/src/hooks";
export { cn } from "../../../../packages/ui/src/lib/utils";
export * from "../../../../packages/ui/src/lib/i18n-constants";
export * from "../../../../packages/ui/src/lib/i18n-format";
// Issue #292: Announcement System Types
export type {
  ContentBlockType,
  AnnouncementStatus,
  AnnouncementVisibility,
  SubscriptionStatus,
  SubscriptionChannel,
  ContentBlock,
  Category,
  Tag,
  AnnouncementSummary,
  AdminAnnouncement,
  Subscription,
  AdminSubscription,
  SubscriptionFilters,
  PaginationState,
} from "../../../../packages/ui/src/types/announcements";
