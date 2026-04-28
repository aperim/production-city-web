import type { Meta, StoryObj } from "@storybook/react-vite";
import { FailureModeCard } from "./FailureModeCard";

const meta = {
  title: "Molecules/FailureModeCard",
  component: FailureModeCard,
  tags: ["autodocs"],
} satisfies Meta<typeof FailureModeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const THREE_ITEMS = [
  {
    number: 1,
    title: "Fragmented Vendors",
    description:
      "Coordinating LED volume, post, and broadcast across multiple vendors creates handoff risk, schedule slippage, and ballooning contingency costs.",
  },
  {
    number: 2,
    title: "Location Dependency",
    description:
      "Weather, permits, and travel logistics add unpredictable risk to every exterior shoot — a single rain day can consume the entire contingency budget.",
  },
  {
    number: 3,
    title: "Talent Availability Windows",
    description:
      "Scheduling A-list talent across multiple cities and time zones compresses shooting days and raises the cost of every setback.",
  },
];

const FIVE_ITEMS = [
  ...THREE_ITEMS,
  {
    number: 4,
    title: "Data Silos",
    description:
      "When production, post, and delivery live on separate systems, version control failures and asset-loss incidents become a matter of when, not if.",
  },
  {
    number: 5,
    title: "Sustainability Obligations",
    description:
      "Major studios and broadcasters now require documented carbon reporting. Productions without a credible green pathway face growing reputational and contractual risk.",
  },
];

export const ThreeItems: Story = {
  args: { items: THREE_ITEMS },
};

export const FiveItems: Story = {
  args: { items: FIVE_ITEMS },
};

export const SingleItem: Story = {
  args: {
    items: [THREE_ITEMS[0]!],
  },
};
