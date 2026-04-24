// Issue #67: Data Table, Modal, Toast
export { DataTable } from './DataTable/DataTable';
export type {
  DataTableProps,
  DataTableColumn,
  DataTableAction,
  SortDirection,
  SortState,
} from './DataTable/DataTable';

export { Modal } from './Modal/Modal';
export type { ModalProps, ModalSize } from './Modal/Modal';

export { ToastProvider, useToast } from './Toast/Toast';
export type {
  ToastProviderProps,
  ToastItem,
  ToastOptions,
  ToastVariant,
  ToastPosition,
} from './Toast/Toast';

// Issue #68: NavigationHeader, Sidebar, PageShell, Form
export { NavigationHeader } from './NavigationHeader/NavigationHeader';
export type { NavigationHeaderProps, NavItem } from './NavigationHeader/NavigationHeader';

export { Sidebar } from './Sidebar/Sidebar';
export type {
  SidebarProps,
  SidebarItem as LegacySidebarItem,
  SidebarSection,
} from './Sidebar/Sidebar';

export { PageShell } from './PageShell/PageShell';
export type { PageShellProps, PageShellLayout } from './PageShell/PageShell';

export { Form, useFormContext } from './Form/Form';
export type {
  FormProps,
  FormErrors,
  FormSubmitResult,
  FormValidator,
} from './Form/Form';

// Issue #121: Auth & Admin Components
export { LoginForm } from './LoginForm/LoginForm';
export type { LoginFormProps } from './LoginForm/LoginForm';
export { MagicCodeForm } from './MagicCodeForm/MagicCodeForm';
export type { MagicCodeFormProps } from './MagicCodeForm/MagicCodeForm';
export { UserTable } from './UserTable/UserTable';
export type { UserTableProps, UserTableUser, PaginationInfo } from './UserTable/UserTable';
export { InvitationTable } from './InvitationTable/InvitationTable';
export type { InvitationTableProps, InvitationTableInvitation } from './InvitationTable/InvitationTable';
export { UserDetailPanel } from './UserDetailPanel/UserDetailPanel';
export type { UserDetailPanelProps, UserDetail } from './UserDetailPanel/UserDetailPanel';
export { InvitationForm } from './InvitationForm/InvitationForm';
export type { InvitationFormProps } from './InvitationForm/InvitationForm';
export { ApprovalCard } from './ApprovalCard/ApprovalCard';
export type { ApprovalCardProps } from './ApprovalCard/ApprovalCard';

// Issue #159: Media Display Organisms
export { MediaDisplay } from './MediaDisplay/MediaDisplay';
export type { MediaDisplayProps } from './MediaDisplay/MediaDisplay';
export { MediaGallery } from './MediaGallery/MediaGallery';
export type { MediaGalleryProps } from './MediaGallery/MediaGallery';
export { MediaHero } from './MediaHero/MediaHero';
export type { MediaHeroProps } from './MediaHero/MediaHero';

// Issue #190: WebSocket UI Organisms
export { NotificationPanel } from './NotificationPanel/NotificationPanel';
export type { NotificationPanelProps, NotificationEntry } from './NotificationPanel/NotificationPanel';
export { NotificationBell } from './NotificationBell/NotificationBell';
export type { NotificationBellProps } from './NotificationBell/NotificationBell';
export { ConnectionBanner } from './ConnectionBanner/ConnectionBanner';
export type { ConnectionBannerProps, BannerState } from './ConnectionBanner/ConnectionBanner';

// Issue #143: Landing Page Organisms
export { LandingNavigation } from './LandingNavigation/LandingNavigation';
export type { LandingNavigationProps, NavLinkItem, NavAuthLink } from './LandingNavigation/LandingNavigation';
export { LandingFooter } from './LandingFooter/LandingFooter';
export type {
  LandingFooterProps,
  FooterLink,
  FooterLinkGroup,
  FooterLegalText,
  FooterContactInfo,
} from './LandingFooter/LandingFooter';
export { FacilityShowcase } from './FacilityShowcase/FacilityShowcase';
export type { FacilityShowcaseProps, FacilityShowcaseItem } from './FacilityShowcase/FacilityShowcase';
export { ServiceGrid } from './ServiceGrid/ServiceGrid';
export type { ServiceGridProps, ServiceGridItem } from './ServiceGrid/ServiceGrid';
export { EOISection } from './EOISection/EOISection';
export type { EOISectionProps } from './EOISection/EOISection';
export { FAQSection } from './FAQSection/FAQSection';
export type { FAQSectionProps, FAQSectionItem } from './FAQSection/FAQSection';
export { GlobalCampusMap } from './GlobalCampusMap/GlobalCampusMap';
export type { GlobalCampusMapProps, CampusLocation } from './GlobalCampusMap/GlobalCampusMap';
export { StakeholderGrid } from './StakeholderGrid/StakeholderGrid';
export type { StakeholderGridProps, StakeholderItem } from './StakeholderGrid/StakeholderGrid';
export { ForwardLookingDisclaimer } from './ForwardLookingDisclaimer/ForwardLookingDisclaimer';
export type { ForwardLookingDisclaimerProps } from './ForwardLookingDisclaimer/ForwardLookingDisclaimer';

// Issue #238: Cinematic Core Components
export { CinematicHero } from './CinematicHero/CinematicHero';
export type { CinematicHeroProps, CinematicHeroCTA, CinematicHeroAttribution } from './CinematicHero/CinematicHero';
export { ScrollRevealSection } from './ScrollRevealSection/ScrollRevealSection';
export type { ScrollRevealSectionProps } from './ScrollRevealSection/ScrollRevealSection';
export { MediaPanel } from './MediaPanel/MediaPanel';
export type { MediaPanelProps, MediaPanelAttribution } from './MediaPanel/MediaPanel';
export { StatementBlock } from './StatementBlock/StatementBlock';
export type { StatementBlockProps } from './StatementBlock/StatementBlock';
export { BrandAccentDivider } from './BrandAccentDivider/BrandAccentDivider';
export type { BrandAccentDividerProps } from './BrandAccentDivider/BrandAccentDivider';
// Issue #270: EOI Admin Components
export { EoiTable } from './EoiTable/EoiTable';
export type { EoiTableProps, EoiTableItem, EoiPagination } from './EoiTable/EoiTable';
export { EoiDetailPanel } from './EoiDetailPanel/EoiDetailPanel';
export type { EoiDetailPanelProps, EoiDetail } from './EoiDetailPanel/EoiDetailPanel';
export { EoiStats } from './EoiStats/EoiStats';
export type { EoiStatsProps } from './EoiStats/EoiStats';

// AcknowledgementOfCountry lives in molecules (shared component with compact mode for footer)

// Issue #290: Announcement System Organisms
export { AnnouncementList } from './AnnouncementList/AnnouncementList';
export type { AnnouncementListProps } from './AnnouncementList/AnnouncementList';
export { ContentBlockEditor } from './ContentBlockEditor/ContentBlockEditor';
export type { ContentBlockEditorProps } from './ContentBlockEditor/ContentBlockEditor';
export { AnnouncementDetail } from './AnnouncementDetail/AnnouncementDetail';
export type { AnnouncementDetailProps } from './AnnouncementDetail/AnnouncementDetail';
export { SubscriptionManager } from './SubscriptionManager/SubscriptionManager';
export type { SubscriptionManagerProps } from './SubscriptionManager/SubscriptionManager';
export { AdminAnnouncementTable } from './AdminAnnouncementTable/AdminAnnouncementTable';
export type { AdminAnnouncementTableProps } from './AdminAnnouncementTable/AdminAnnouncementTable';
export { AdminSubscriptionTable, maskPhone } from './AdminSubscriptionTable/AdminSubscriptionTable';
export type { AdminSubscriptionTableProps } from './AdminSubscriptionTable/AdminSubscriptionTable';

// Issue #334: Dashboard SidebarNav
export { SidebarNav, PHASE_ORDER } from './SidebarNav/SidebarNav';
export type { SidebarNavProps, NavGroup, NavSection, NavSubsection, NavRoute, Phase } from './SidebarNav/SidebarNav';

// Issue #342: Dashboard CommandBar
export { CommandBar } from './CommandBar/CommandBar';
export type { CommandBarProps, CommandBarFeature, CommandBarObjectResult } from './CommandBar/CommandBar';

// Issue #398: CanvasTable organism
export { CanvasTable } from './CanvasTable/CanvasTable';
export type { CanvasTableProps } from './CanvasTable/CanvasTable';

// Issue #399: CanvasBoard organism
export { CanvasBoard } from './CanvasBoard/CanvasBoard';
export type { CanvasBoardProps, BoardLane, BoardCard } from './CanvasBoard/CanvasBoard';

// Issue #400: CanvasCalendar organism
export { CanvasCalendar } from './CanvasCalendar/CanvasCalendar';
export type { CanvasCalendarProps, CalendarView, CalendarEvent } from './CanvasCalendar/CanvasCalendar';

// Issue #401: CanvasTimeline organism
export { CanvasTimeline } from './CanvasTimeline/CanvasTimeline';
export type { CanvasTimelineProps, TimelineTask, TimelineZoom } from './CanvasTimeline/CanvasTimeline';

// Issue #402: CanvasCatalog organism
export { CanvasCatalog } from './CanvasCatalog/CanvasCatalog';
export type { CanvasCatalogProps, CatalogItem } from './CanvasCatalog/CanvasCatalog';

// Issue #403: CanvasDocuments organism
export { CanvasDocuments } from './CanvasDocuments/CanvasDocuments';
export type { CanvasDocumentsProps, DocumentItem, DocumentSortField } from './CanvasDocuments/CanvasDocuments';

// Issue #404: CanvasCharts organism
export { CanvasCharts } from './CanvasCharts/CanvasCharts';
export type { CanvasChartsProps, ChartConfig, ChartDataPoint, ChartType } from './CanvasCharts/CanvasCharts';

// Issue #405: DetailPanel organism
export { DetailPanel } from './DetailPanel/DetailPanel';
export type { DetailPanelProps } from './DetailPanel/DetailPanel';

// Issue #387: WorkspaceSidebar
export { WorkspaceSidebar } from './WorkspaceSidebar/WorkspaceSidebar';
export type { WorkspaceSidebarProps, WorkspaceSidebarItem } from './WorkspaceSidebar/WorkspaceSidebar';

// Issue #388: WorkspaceTabs
export { WorkspaceTabs } from './WorkspaceTabs/WorkspaceTabs';
export type { WorkspaceTabsProps, WorkspaceTab } from './WorkspaceTabs/WorkspaceTabs';

// Issue #392: AIPanel
export { AIPanel } from './AIPanel/AIPanel';
export type { AIPanelProps, AIPanelMessage } from './AIPanel/AIPanel';

// Issue #396: InboxFeed
export { InboxFeed } from './InboxFeed/InboxFeed';
export type { InboxFeedProps, InboxFeedItem, InboxFilters } from './InboxFeed/InboxFeed';

// Issue #407: PlannedSection
export { PlannedSection } from './PlannedSection/PlannedSection';
export type { PlannedSectionProps, PlannedFeature } from './PlannedSection/PlannedSection';

// Issue #442: CommunicationsCanvas
export { CommunicationsCanvas } from './CommunicationsCanvas/CommunicationsCanvas';
export type { CommunicationsCanvasProps, CommunicationsView } from './CommunicationsCanvas/CommunicationsCanvas';

// Issue #443: AnnouncementEditorCanvas + AnnouncementPreviewCanvas
export { AnnouncementEditorCanvas } from './AnnouncementEditorCanvas/AnnouncementEditorCanvas';
export type { AnnouncementEditorCanvasProps } from './AnnouncementEditorCanvas/AnnouncementEditorCanvas';
export { AnnouncementPreviewCanvas } from './AnnouncementPreviewCanvas/AnnouncementPreviewCanvas';
export type { AnnouncementPreviewCanvasProps, PreviewAnnouncement, DeliveryStats } from './AnnouncementPreviewCanvas/AnnouncementPreviewCanvas';

// Issue #445: UsersCanvas, SecurityCanvas, EoiCanvas
export { UsersCanvas } from './UsersCanvas/UsersCanvas';
export type { UsersCanvasProps, UsersCanvasPermissions, ApprovalItem } from './UsersCanvas/UsersCanvas';
export { SecurityCanvas } from './SecurityCanvas/SecurityCanvas';
export type { SecurityCanvasProps, AuditLogEntryData, AuditLogFilters } from './SecurityCanvas/SecurityCanvas';
export { EoiCanvas } from './EoiCanvas/EoiCanvas';
export type { EoiCanvasProps } from './EoiCanvas/EoiCanvas';

// Issue #91: Landing page component audit
export { PageHero } from './PageHero/PageHero';
export type { PageHeroProps, PageHeroCTA } from './PageHero/PageHero';
export { OperatingPillars } from './OperatingPillars/OperatingPillars';
export type { OperatingPillarsProps, OperatingPillarItem } from './OperatingPillars/OperatingPillars';
export { ServiceTable } from './ServiceTable/ServiceTable';
export type { ServiceTableProps, ServiceTableRow } from './ServiceTable/ServiceTable';
export { AudienceGrid } from './AudienceGrid/AudienceGrid';
export type { AudienceGridProps, AudienceCard } from './AudienceGrid/AudienceGrid';
export { FnPrincipleList } from './FnPrincipleList/FnPrincipleList';
export type { FnPrincipleListProps, FnPrincipleItem } from './FnPrincipleList/FnPrincipleList';
