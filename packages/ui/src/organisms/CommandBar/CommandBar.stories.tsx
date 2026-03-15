import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandBar, type CommandBarFeature } from "./CommandBar";

const meta = {
  title: "Organisms/CommandBar",
  component: CommandBar,
  tags: ["autodocs"],
} satisfies Meta<typeof CommandBar>;

export default meta;

const sampleFeatures: CommandBarFeature[] = [
  {
    id: "home.overview.executive",
    label: "Executive Dashboard",
    description: "Company-wide KPIs, campus status, financial summary",
    path: "/dashboard/home/executive",
    section: "Dashboard",
    subsection: "Overview",
    keywords: ["kpi", "metrics", "overview"],
    status: "planned",
  },
  {
    id: "company_ops.hr.directory",
    label: "Team Directory",
    description: "Employee directory with profiles, contact details",
    path: "/dashboard/company/hr/directory",
    section: "Company Operations",
    subsection: "Human Resources",
    keywords: ["employee", "staff", "people", "contact"],
    status: "coming_soon",
  },
  {
    id: "administration.users.management",
    label: "User Management",
    description: "Manage user accounts, roles, and permissions",
    path: "/dashboard/admin/users/management",
    section: "Administration",
    subsection: "Users",
    keywords: ["admin", "roles", "permissions"],
    status: "active",
  },
  {
    id: "facilities.sound_stages.calendar",
    label: "Sound Stage Calendar",
    description: "Book and manage sound stage availability",
    path: "/dashboard/facilities/sound-stages/calendar",
    section: "Facilities",
    subsection: "Sound Stages",
    keywords: ["booking", "studio", "schedule"],
    status: "planned",
  },
  {
    id: "finance.accounts.receivable",
    label: "Accounts Receivable",
    description: "Track incoming payments and invoices",
    path: "/dashboard/finance/accounts/receivable",
    section: "Finance",
    subsection: "Accounts",
    keywords: ["money", "payments", "invoices"],
    status: "coming_soon",
  },
  {
    id: "analytics.dashboards.executive",
    label: "Executive Analytics",
    description: "High-level analytics dashboard for leadership",
    path: "/dashboard/analytics/dashboards/executive",
    section: "Analytics",
    subsection: "Dashboards",
    keywords: ["charts", "reports", "data"],
    status: "planned",
  },
  {
    id: "productions.active.board",
    label: "Production Board",
    description: "Track all active productions and their status",
    path: "/dashboard/productions/active/board",
    section: "Productions",
    subsection: "Active Productions",
    keywords: ["film", "show", "project"],
    status: "deprecated",
  },
];

function CommandBarDemo({
  features = sampleFeatures,
  recentIds = [],
}: {
  features?: CommandBarFeature[];
  recentIds?: string[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div>
      <button
        className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
        onClick={() => setOpen(true)}
      >
        Open CommandBar (or Cmd+K)
      </button>
      <CommandBar
        featureIndex={features}
        recentFeatureIds={recentIds}
        onSelect={(id, path) => {
          alert(`Selected: ${id} → ${path}`);
        }}
        onClose={() => setOpen(false)}
        open={open}
      />
    </div>
  );
}

export const Default: StoryObj = {
  render: () => <CommandBarDemo />,
};

export const WithRecentFeatures: StoryObj = {
  render: () => (
    <CommandBarDemo
      recentIds={[
        "administration.users.management",
        "company_ops.hr.directory",
      ]}
    />
  ),
};

export const EmptyState: StoryObj = {
  render: () => <CommandBarDemo features={[]} />,
};

export const AllStatusBadges: StoryObj = {
  render: () => <CommandBarDemo />,
  name: "All Status Badge Variants",
};

export const MobileLayout: StoryObj = {
  render: () => <CommandBarDemo />,
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
};
