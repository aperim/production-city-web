import type { Meta, StoryObj } from "@storybook/react-vite";
import { GlobalCampusMap } from "./GlobalCampusMap";

const locations = [
  { name: "Queensland, Australia", status: "Primary", description: "Main creative campus with full production capabilities." },
  { name: "Singapore", status: "Planned", description: "Asia-Pacific hub for regional content creation." },
  { name: "Hawaii, USA", status: "Planned", description: "Pacific hub for nature and adventure content." },
  { name: "Europe", status: "Planned", description: "European base for international co-productions." },
  { name: "USA (Mainland)", status: "Planned", description: "North American gateway for studio partnerships." },
];

const meta = {
  title: "Organisms/GlobalCampusMap",
  component: GlobalCampusMap,
  tags: ["autodocs"],
} satisfies Meta<typeof GlobalCampusMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { heading: "Global Campus Locations", locations },
};
