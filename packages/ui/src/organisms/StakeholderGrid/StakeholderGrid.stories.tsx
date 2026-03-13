import type { Meta, StoryObj } from "@storybook/react-vite";
import { StakeholderGrid } from "./StakeholderGrid";

const stakeholders = [
  { type: "Creators", description: "Film, TV, and digital content makers.", benefits: ["Access world-class facilities", "Connect with industry partners", "Scale production capabilities"] },
  { type: "Industry", description: "Production companies and studios.", benefits: ["Reduce overhead costs", "Access skilled workforce", "Flexible space options"] },
  { type: "Investors", description: "Growth capital and strategic partners.", benefits: ["Portfolio diversification", "Industry growth exposure", "Long-term value creation"] },
  { type: "Government", description: "Local and state government partners.", benefits: ["Job creation", "Economic development", "Cultural infrastructure"] },
  { type: "Communities", description: "Local communities and educational institutions.", benefits: ["Training opportunities", "Cultural programs", "Community spaces"] },
];

const meta = {
  title: "Organisms/StakeholderGrid",
  component: StakeholderGrid,
  tags: ["autodocs"],
} satisfies Meta<typeof StakeholderGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { heading: "Who Benefits", stakeholders },
};
