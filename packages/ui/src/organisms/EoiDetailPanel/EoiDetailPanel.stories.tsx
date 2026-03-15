import type { Meta, StoryObj } from "@storybook/react-vite";
import { EoiDetailPanel } from "./EoiDetailPanel";

const meta = {
  title: "Organisms/EoiDetailPanel",
  component: EoiDetailPanel,
  tags: ["autodocs"],
} satisfies Meta<typeof EoiDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleEoi = {
  id: "eoi-1",
  category: "producer",
  status: "new",
  locale: "en",
  name: "Jane Doe",
  email: "jane@example.com",
  message: "I'm interested in partnering on a documentary project about sustainable architecture.",
  metadata: { company: "Jane Productions", experience: "10 years" },
  sourcePage: "/creative",
  sourceCategory: "film",
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: "q1-2026",
  consentVersion: "1.0",
  privacyAcceptedAt: "2026-03-10T10:00:00Z",
  marketingOptIn: true,
  confirmationSentAt: "2026-03-10T10:01:00Z",
  createdAt: "2026-03-10T10:00:00Z",
  updatedAt: "2026-03-10T10:00:00Z",
  archivedAt: null,
};

export const OpenWithData: Story = {
  args: {
    open: true,
    onClose: () => {},
    eoi: sampleEoi,
    canUpdateStatus: true,
  },
};

export const ReadOnly: Story = {
  args: {
    open: true,
    onClose: () => {},
    eoi: sampleEoi,
    canUpdateStatus: false,
  },
};

export const NoMessage: Story = {
  args: {
    open: true,
    onClose: () => {},
    eoi: { ...sampleEoi, message: null, metadata: null },
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onClose: () => {},
    eoi: null,
  },
};
