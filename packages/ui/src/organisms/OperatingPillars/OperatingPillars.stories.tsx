import type { Meta, StoryObj } from "@storybook/react-vite";
import { OperatingPillars } from "./OperatingPillars";

const PILLARS = [
  {
    numeral: "i",
    heading: "One IP · two formats",
    body: "Script, libretto, score, pre-vis and digital assets are authored once, then split into a screen lane and a stage lane that run in parallel rather than in sequence.",
  },
  {
    numeral: "ii",
    heading: "One operator · one campus",
    body: "Venue, stack and service teams under a single brand. Tenants sign one contract, coordinate with one counterparty, and draw on whichever combination of capabilities the work requires.",
  },
  {
    numeral: "iii",
    heading: "Shared pipeline, specialised finishes",
    body: "Design, build, costume, and digital assets are common. The screen lane takes them into photography, editorial, VFX and sound. The stage lane takes them into rehearsal, tech, opening and tour.",
  },
  {
    numeral: "iv",
    heading: "Closed-loop canon",
    body: "Distribution and audience data feed back into the IP strategy. The next cycle of ideation inherits what the last cycle learned — across both formats, not just one.",
  },
];

const meta = {
  title: "Organisms/OperatingPillars",
  component: OperatingPillars,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "ink",
      values: [{ name: "ink", value: "#1A1A14" }],
    },
  },
  args: {
    pillars: PILLARS,
  },
} satisfies Meta<typeof OperatingPillars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OchreAccent: Story = {
  args: {
    accentColor: "var(--ochre)",
  },
};

export const TwoPillars: Story = {
  args: {
    pillars: PILLARS.slice(0, 2),
  },
};
