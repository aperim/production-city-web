import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComparisonGrid } from "./ComparisonGrid";

const meta = {
  title: "Molecules/ComparisonGrid",
  component: ComparisonGrid,
  tags: ["autodocs"],
  argTypes: {
    highlightRight: { control: "boolean" },
  },
} satisfies Meta<typeof ComparisonGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const THREE_ROWS = [
  { label: "Setup time", left: "3–5 weeks", right: "1–2 days" },
  { label: "Location risk", left: "High", right: "Zero" },
  { label: "Reshoots", left: "$80k–$200k average", right: "Included in day rate" },
];

const FULL_INTEGRATION_ROWS = [
  { label: "LED volume", left: "External hire", right: "On-campus, owned" },
  { label: "Motion capture", left: "Third-party facility", right: "Integrated stage" },
  { label: "Post production", left: "Separate vendor", right: "Same campus" },
  { label: "VFX supervision", left: "Day-rate contractor", right: "Resident team" },
  { label: "Colour grading", left: "Off-site suite", right: "In-house DI suite" },
  { label: "Sound mix", left: "Separate studio", right: "On-campus dub stage" },
  { label: "Broadcast playout", left: "External MCR", right: "Integrated control room" },
  { label: "Data management", left: "Manual wrap + ship", right: "On-site RAID + cloud sync" },
];

export const ThreeRow: Story = {
  args: {
    leftHeading: "Traditional Workflow",
    rightHeading: "Production City",
    rows: THREE_ROWS,
  },
};

export const FullIntegrationTable: Story = {
  args: {
    leftHeading: "Fragmented Vendors",
    rightHeading: "Production City",
    rows: FULL_INTEGRATION_ROWS,
  },
};

export const NoHighlight: Story = {
  args: {
    leftHeading: "Option A",
    rightHeading: "Option B",
    rows: THREE_ROWS,
    highlightRight: false,
  },
};
