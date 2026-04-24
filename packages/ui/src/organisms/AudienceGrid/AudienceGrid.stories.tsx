import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudienceGrid } from "./AudienceGrid";

const CARDS = [
  {
    numeral: "I",
    heading: "For producers",
    description: "Book stages, access the full service stack, bring your production to one campus.",
    href: "/for-producers",
  },
  {
    numeral: "II",
    heading: "For government",
    description: "Industry development, screen sector investment, and creative economy growth.",
    href: "/for-government",
  },
  {
    numeral: "III",
    heading: "For investors",
    description: "A vertically integrated model with multiple revenue streams from day one.",
    href: "/for-investors",
  },
  {
    numeral: "IV",
    heading: "For technology partners",
    description: "Integrate your technology into a world-class production campus.",
    href: "/for-technology-partners",
  },
];

const meta = {
  title: "Organisms/AudienceGrid",
  component: AudienceGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    cards: CARDS,
  },
} satisfies Meta<typeof AudienceGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoCards: Story = {
  args: {
    cards: CARDS.slice(0, 2),
  },
};
