import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementList } from "./AnnouncementList";
import type { AnnouncementSummary, Category } from "../../types/announcements";

const meta = {
  title: "Organisms/AnnouncementList",
  component: AnnouncementList,
  tags: ["autodocs"],
} satisfies Meta<typeof AnnouncementList>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories: Category[] = [
  { id: "1", name: "Facilities", slug: "facilities" },
  { id: "2", name: "Events", slug: "events" },
  { id: "3", name: "Updates", slug: "updates" },
];

const makeAnnouncements = (count: number): AnnouncementSummary[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `a${i}`,
    title: `Announcement ${i + 1}`,
    summary: `This is the summary for announcement ${i + 1}. It contains relevant details.`,
    slug: `announcement-${i + 1}`,
    categories: [categories[i % categories.length]!],
    tags: [],
    author: { name: "Production Team" },
    publishedAt: new Date(2026, 2, 10 + i).toISOString(),
    visibility: i % 3 === 0 ? ("private" as const) : ("public" as const),
  }));

export const Default: Story = {
  args: {
    announcements: makeAnnouncements(6),
    categories,
    activeCategory: null,
    onCategoryFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const EmptyState: Story = {
  args: {
    announcements: [],
    categories,
    activeCategory: null,
    onCategoryFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const SinglePage: Story = {
  args: {
    announcements: makeAnnouncements(3),
    categories,
    activeCategory: null,
    onCategoryFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const MultiplePages: Story = {
  args: {
    announcements: makeAnnouncements(6),
    categories,
    activeCategory: null,
    onCategoryFilter: () => {},
    pagination: { page: 2, totalPages: 5, onPageChange: () => {} },
  },
};

export const FilteredByCategory: Story = {
  args: {
    announcements: makeAnnouncements(3),
    categories,
    activeCategory: "events",
    onCategoryFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const ErrorLoading: Story = {
  args: {
    announcements: [],
    categories,
    activeCategory: null,
    onCategoryFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
    error: "Failed to load announcements. Please try again.",
  },
};
