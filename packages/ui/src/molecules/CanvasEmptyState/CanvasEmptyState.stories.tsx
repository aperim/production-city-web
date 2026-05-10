import type { Meta, StoryObj } from "@storybook/react-vite";
import { CanvasEmptyState } from "./CanvasEmptyState";

const meta = {
  title: "Molecules/CanvasEmptyState",
  component: CanvasEmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Dignified empty state for dashboard canvas surfaces. Replaces 'Coming soon' copy with an activation timeline label and a specific description of what the surface will deliver.",
      },
    },
    backgrounds: {
      default: "production-dark",
      values: [
        { name: "production-dark", value: "oklch(0.12 0.01 260)" },
        { name: "neutral-950", value: "#0a0a0a" },
      ],
    },
  },
  argTypes: {
    canvasType: {
      control: "select",
      options: [
        "table",
        "chart",
        "charts",
        "board",
        "calendar",
        "documents",
        "timeline",
        "catalog",
        "communications",
      ],
    },
    variant: { control: "radio", options: ["page", "inline"] },
  },
} satisfies Meta<typeof CanvasEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_NOTIFY_BUTTON = (
  <button
    type="button"
    className="rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
  >
    Notify me at activation
  </button>
);

// Required Phase 1 canvas types

export const Table: Story = {
  name: "Table — Productions roster",
  args: {
    canvasType: "table",
    activationLabel: "Activates Q3 2026",
    description: "Active production roster with crew, schedule, and budget at a glance.",
    note: "Wired to live production data once the operations workspace ships.",
    action: SAMPLE_NOTIFY_BUTTON,
  },
};

export const Chart: Story = {
  name: "Chart — Investor performance",
  args: {
    canvasType: "chart",
    activationLabel: "Activates Q4 2026",
    description: "Quarterly performance against operating plan, segmented by venue.",
    note: "Sources finance ledger via the IR data feed.",
  },
};

export const Charts: Story = {
  name: "Charts — Multi-series analytics",
  args: {
    canvasType: "charts",
    activationLabel: "Activates Q4 2026",
    description: "Cross-cut analytics across audience, revenue, and utilisation.",
  },
};

export const Board: Story = {
  name: "Board — Pre-production pipeline",
  args: {
    canvasType: "board",
    activationLabel: "Activates Q3 2026",
    description: "Pre-production pipeline from script breakdown to final greenlight.",
    action: SAMPLE_NOTIFY_BUTTON,
  },
};

export const Calendar: Story = {
  name: "Calendar — Shooting schedules",
  args: {
    canvasType: "calendar",
    activationLabel: "Activates September 2026",
    description: "Day-by-day shooting schedule with crew calls and stage holds.",
    note: "Calendar accepts feeds from CallSheet and the EOI pipeline.",
  },
};

export const Documents: Story = {
  name: "Documents — Investor briefings",
  args: {
    canvasType: "documents",
    activationLabel: "Activates Q4 2026",
    description: "Briefing pack library with version history and watermark control.",
  },
};

// Phase 2 canvas types — covered for completeness against generated CanvasType union

export const Timeline: Story = {
  name: "Timeline — Post-production",
  args: {
    canvasType: "timeline",
    activationLabel: "Activates Q1 2027",
    description: "End-to-end post-production timeline from edit to delivery.",
  },
};

export const Catalog: Story = {
  name: "Catalog — Capability library",
  args: {
    canvasType: "catalog",
    activationLabel: "Activates Q4 2026",
    description: "Capability and equipment catalogue indexed by venue and discipline.",
  },
};

export const Communications: Story = {
  name: "Communications — Announcements feed",
  args: {
    canvasType: "communications",
    activationLabel: "Activates Q3 2026",
    description: "Cross-workspace announcements, governance notices, and replies.",
  },
};

// Variants

export const Inline: Story = {
  name: "Inline variant — table card",
  args: {
    canvasType: "table",
    variant: "inline",
    activationLabel: "Activates Q3 2026",
    description: "Active production roster.",
  },
};

export const WithCanvasTagSlot: Story = {
  name: "With Concept tag slot",
  args: {
    canvasType: "board",
    activationLabel: "Activates Q3 2026",
    description: "Pre-production pipeline from script breakdown to final greenlight.",
    tag: (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/80">
        Concept
      </span>
    ),
  },
};

export const TitleOnly: Story = {
  name: "Minimum: type + activation + description",
  args: {
    canvasType: "documents",
    activationLabel: "Activates Q4 2026",
    description: "Briefing pack library with version history.",
  },
};

export const AllCanvasTypes: Story = {
  name: "Gallery — all canvas types",
  args: {
    canvasType: "table",
    activationLabel: "Activates Q3 2026",
    description: "Gallery placeholder",
  },
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {(
        [
          { type: "table", q: "Q3 2026", body: "Active production roster with crew, schedule, and budget." },
          { type: "chart", q: "Q4 2026", body: "Quarterly performance against operating plan." },
          { type: "board", q: "Q3 2026", body: "Pre-production pipeline from breakdown to greenlight." },
          { type: "calendar", q: "September 2026", body: "Day-by-day shooting schedule with crew calls." },
          { type: "documents", q: "Q4 2026", body: "Briefing pack library with version history." },
          { type: "timeline", q: "Q1 2027", body: "Post-production timeline from edit to delivery." },
          { type: "catalog", q: "Q4 2026", body: "Capability and equipment catalogue by venue." },
          { type: "communications", q: "Q3 2026", body: "Cross-workspace announcements and replies." },
        ] as const
      ).map(({ type, q, body }) => (
        <CanvasEmptyState
          key={type}
          canvasType={type}
          activationLabel={`Activates ${q}`}
          description={body}
        />
      ))}
    </div>
  ),
};
