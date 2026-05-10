import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CanvasTag,
  CanvasTagWrapper,
} from "./CanvasTag";
import type { CanvasTagVariant, CanvasType } from "./CanvasTag";

// ---------------------------------------------------------------------------
// CanvasTag badge stories
// ---------------------------------------------------------------------------

const meta = {
  title: "Atoms/CanvasTag",
  component: CanvasTag,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Persistent status badge for dashboard canvas surfaces. Three variants: Live (neutral), Provisional (amber), Concept (slate/outline-only). WCAG 2.2 AA compliant.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["live", "provisional", "concept"] satisfies CanvasTagVariant[],
    },
    canvasType: {
      control: "select",
      options: [
        "chart",
        "table",
        "document",
        "board",
        "calendar",
        "generic",
      ] satisfies CanvasType[],
    },
  },
} satisfies Meta<typeof CanvasTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {
  args: { variant: "live" },
};

export const Provisional: Story = {
  args: { variant: "provisional" },
};

export const Concept: Story = {
  args: { variant: "concept" },
};

// All three side-by-side
export const AllVariants: Story = {
  args: { variant: "live" },
  render: () => (
    <div className="flex items-center gap-3">
      <CanvasTag variant="live" />
      <CanvasTag variant="provisional" />
      <CanvasTag variant="concept" />
    </div>
  ),
};

// Canvas-type aware labels
export const WithCanvasTypes: Story = {
  args: { variant: "live" },
  render: () => (
    <div className="grid gap-3">
      {(
        ["chart", "table", "document", "board", "calendar"] satisfies CanvasType[]
      ).map((type) => (
        <div key={type} className="flex items-center gap-3">
          <span className="w-20 text-xs text-muted-foreground capitalize">
            {type}
          </span>
          <CanvasTag variant="live" canvasType={type} />
          <CanvasTag variant="provisional" canvasType={type} />
          <CanvasTag variant="concept" canvasType={type} />
        </div>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// CanvasTagWrapper stories (wrapping a mock canvas surface)
// ---------------------------------------------------------------------------

const MockCanvas = ({ label }: { label: string }) => (
  <div className="flex h-48 w-80 items-center justify-center rounded-lg border border-border bg-neutral-900 text-muted-foreground text-sm">
    {label}
  </div>
);

export const WrapperLive: Story = {
  name: "Wrapper — Live",
  args: { variant: "live" },
  render: () => (
    <CanvasTagWrapper variant="live">
      <MockCanvas label="Chart canvas" />
    </CanvasTagWrapper>
  ),
};

export const WrapperProvisional: Story = {
  name: "Wrapper — Provisional",
  args: { variant: "provisional" },
  render: () => (
    <CanvasTagWrapper variant="provisional">
      <MockCanvas label="Table canvas" />
    </CanvasTagWrapper>
  ),
};

export const WrapperConcept: Story = {
  name: "Wrapper — Concept (with watermark)",
  args: { variant: "concept" },
  render: () => (
    <CanvasTagWrapper variant="concept">
      <MockCanvas label="Document canvas" />
    </CanvasTagWrapper>
  ),
};

// All three wrappers side by side
export const AllWrappers: Story = {
  name: "All Wrappers",
  args: { variant: "live" },
  render: () => (
    <div className="flex flex-col gap-4">
      <CanvasTagWrapper variant="live">
        <MockCanvas label="Live — chart" />
      </CanvasTagWrapper>
      <CanvasTagWrapper variant="provisional">
        <MockCanvas label="Provisional — board" />
      </CanvasTagWrapper>
      <CanvasTagWrapper variant="concept">
        <MockCanvas label="Concept — document" />
      </CanvasTagWrapper>
    </div>
  ),
};

// Light mode override for contrast verification
export const LightMode: Story = {
  args: { variant: "live" },
  parameters: {
    backgrounds: { default: "light" },
    docs: {
      description: {
        story: "All three variants on a light background — verify WCAG AA contrast.",
      },
    },
  },
  render: () => (
    <div className="light flex items-center gap-3 rounded-lg bg-neutral-50 p-4">
      <CanvasTag variant="live" />
      <CanvasTag variant="provisional" />
      <CanvasTag variant="concept" />
    </div>
  ),
};
