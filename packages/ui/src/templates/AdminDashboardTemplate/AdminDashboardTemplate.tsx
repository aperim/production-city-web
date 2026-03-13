import { type ReactNode } from 'react';
import { PageShell } from '../../organisms/PageShell/PageShell';
import { Sidebar, type SidebarSection } from '../../organisms/Sidebar/Sidebar';
import { NavigationHeader, type NavItem } from '../../organisms/NavigationHeader/NavigationHeader';
import { Breadcrumb, type BreadcrumbItem } from '../../molecules/Breadcrumb/Breadcrumb';

/** Props for the AdminDashboardTemplate */
export interface AdminDashboardTemplateProps {
  /**
   * Logo slot for the navigation header.
   */
  logo?: ReactNode;
  /**
   * Header navigation items.
   */
  navItems?: NavItem[];
  /**
   * Header right-side actions slot.
   */
  headerActions?: ReactNode;
  /**
   * Sidebar section definitions.
   */
  sidebarSections?: SidebarSection[];
  /**
   * Sidebar footer slot.
   */
  sidebarFooter?: ReactNode;
  /**
   * Breadcrumb trail.
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Main content area.
   */
  children: ReactNode;
  /**
   * Loading state.
   */
  loading?: boolean;
  /**
   * Additional class names.
   */
  className?: string;
}

/**
 * AdminDashboardTemplate — full admin layout with sidebar, header, breadcrumbs.
 *
 * Composes PageShell + Sidebar + NavigationHeader + Breadcrumb + content.
 * Follows Uncodixify: simple sidebar (240px), clean header, no decorative elements.
 */
export function AdminDashboardTemplate({
  logo,
  navItems,
  headerActions,
  sidebarSections = [],
  sidebarFooter,
  breadcrumbs,
  children,
  loading = false,
  className,
}: AdminDashboardTemplateProps) {
  return (
    <PageShell
      loading={loading}
      className={className}
      header={
        <NavigationHeader
          logo={logo}
          navItems={navItems}
          actions={headerActions}
          sticky
        />
      }
      sidebar={
        <Sidebar
          sections={sidebarSections}
          footer={sidebarFooter}
          showToggle
        />
      }
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}
      {children}
    </PageShell>
  );
}
