import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardShell } from './DashboardShell';

const MockSidebar = ({ collapsed = false }: { collapsed?: boolean }) => (
  <aside className={`${collapsed ? 'w-14' : 'w-60'} border-r border-border bg-background flex flex-col`}>
    <div className="p-4 text-sm text-muted-foreground">
      {collapsed ? '...' : 'Sidebar navigation'}
    </div>
    <nav className="flex-1 p-2">
      <ul className="flex flex-col gap-1">
        {['Dashboard', 'Company', 'Admin'].map((item) => (
          <li key={item}>
            <span className="block px-2 py-1.5 text-sm text-muted-foreground">
              {collapsed ? item[0] : item}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

const MockBreadcrumb = () => (
  <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
    <ol className="flex items-center gap-1.5">
      <li><a href="/dashboard" className="hover:text-foreground">Dashboard</a></li>
      <li className="flex items-center gap-1.5">
        <span>/</span>
        <a href="/dashboard/company" className="hover:text-foreground">Company</a>
      </li>
      <li className="flex items-center gap-1.5">
        <span>/</span>
        <span className="text-foreground font-medium">HR</span>
      </li>
    </ol>
  </nav>
);

const MockContent = () => (
  <div className="p-6">
    <h1 className="text-lg font-semibold text-foreground mb-4">Team Directory</h1>
    <p className="text-sm text-muted-foreground">Coming soon...</p>
  </div>
);

const meta: Meta<typeof DashboardShell> = {
  title: 'Templates/DashboardShell',
  component: DashboardShell,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof DashboardShell>;

export const ExpandedSidebar: Story = {
  args: {
    sidebar: <MockSidebar />,
    breadcrumb: <MockBreadcrumb />,
    header: <div className="text-sm text-muted-foreground">Header actions</div>,
    children: <MockContent />,
  },
};

export const CollapsedSidebar: Story = {
  args: {
    sidebar: <MockSidebar collapsed />,
    breadcrumb: <MockBreadcrumb />,
    children: <MockContent />,
  },
};

export const NoBreadcrumb: Story = {
  args: {
    sidebar: <MockSidebar />,
    children: <MockContent />,
  },
};

export const LongContent: Story = {
  args: {
    sidebar: <MockSidebar />,
    breadcrumb: <MockBreadcrumb />,
    children: (
      <div className="p-6">
        <h1 className="text-lg font-semibold text-foreground mb-4">Long Content Page</h1>
        {Array.from({ length: 50 }, (_, i) => (
          <p key={i} className="text-sm text-muted-foreground mb-4">
            Content paragraph {i + 1}. This is a long page to demonstrate scrolling behavior.
          </p>
        ))}
      </div>
    ),
  },
};
