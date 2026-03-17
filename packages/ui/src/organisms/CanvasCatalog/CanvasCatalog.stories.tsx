import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasCatalog } from './CanvasCatalog';

const meta: Meta<typeof CanvasCatalog> = {
  title: 'Organisms/CanvasCatalog',
  component: CanvasCatalog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CanvasCatalog>;

const sampleItems = [
  { id: '1', title: 'Film Production 101', subtitle: 'Introduction to film making', tags: ['Film', 'Beginner'], imageUrl: 'https://picsum.photos/seed/film/400/225' },
  { id: '2', title: 'Advanced VFX Compositing', subtitle: 'Nuke and Fusion techniques', tags: ['VFX', 'Advanced'] },
  { id: '3', title: 'Sound Design Fundamentals', subtitle: 'Foley, ADR, and mixing', tags: ['Sound', 'Beginner'], imageUrl: 'https://picsum.photos/seed/sound/400/225' },
  { id: '4', title: 'Color Grading Workshop', subtitle: 'DaVinci Resolve mastery', tags: ['Film', 'Advanced'], ctaLabel: 'Enroll Now' },
  { id: '5', title: 'Motion Capture Studio', subtitle: 'Real-time performance capture', tags: ['VFX', 'Advanced'], imageUrl: 'https://picsum.photos/seed/mocap/400/225', ctaLabel: 'Book Session' },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    categories: ['Film', 'VFX', 'Sound', 'Beginner', 'Advanced'],
  },
};

export const Empty: Story = {
  args: {
    items: [],
    categories: ['Film', 'VFX'],
    emptyMessage: 'No courses match your criteria',
  },
};

export const WithSearchResults: Story = {
  args: {
    items: sampleItems.filter((i) => i.tags?.includes('VFX')),
    categories: ['Film', 'VFX', 'Sound', 'Beginner', 'Advanced'],
  },
};

export const NoCategoriesFilter: Story = {
  args: {
    items: sampleItems,
    categories: [],
  },
};
