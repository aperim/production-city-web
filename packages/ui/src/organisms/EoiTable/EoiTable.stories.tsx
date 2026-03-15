import type { Meta, StoryObj } from "@storybook/react-vite";
import { EoiTable } from "./EoiTable";

const meta = {
  title: "Organisms/EoiTable",
  component: EoiTable,
  tags: ["autodocs"],
} satisfies Meta<typeof EoiTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  { id: "1", name: "Jane Doe", email: "jane@example.com", category: "producer", status: "new", locale: "en", sourcePage: "/", createdAt: "2026-03-10T10:00:00Z" },
  { id: "2", name: "John Smith", email: "john@example.com", category: "creative", status: "contacted", locale: "en", sourcePage: "/creative", createdAt: "2026-03-09T14:30:00Z" },
  { id: "3", name: "Alice Chen", email: "alice@example.com", category: "investor", status: "converted", locale: "zh", sourcePage: "/vision", createdAt: "2026-03-08T09:00:00Z" },
  { id: "4", name: "Bob Garcia", email: "bob@example.com", category: "general", status: "archived", locale: "es", sourcePage: "/contact", createdAt: "2026-03-07T16:00:00Z" },
];

export const WithData: Story = {
  args: {
    items: sampleItems,
    pagination: { page: 1, totalPages: 3, total: 30, limit: 10 },
    onPageChange: () => {},
    onSearch: () => {},
    onCategoryFilter: () => {},
    onStatusFilter: () => {},
  },
};

export const Empty: Story = {
  args: {
    items: [],
    pagination: { page: 1, totalPages: 1, total: 0, limit: 10 },
    onPageChange: () => {},
    onSearch: () => {},
    onCategoryFilter: () => {},
    onStatusFilter: () => {},
  },
};

export const Loading: Story = {
  args: {
    items: [],
    pagination: { page: 1, totalPages: 1, total: 0, limit: 10 },
    onPageChange: () => {},
    onSearch: () => {},
    onCategoryFilter: () => {},
    onStatusFilter: () => {},
    loading: true,
  },
};
