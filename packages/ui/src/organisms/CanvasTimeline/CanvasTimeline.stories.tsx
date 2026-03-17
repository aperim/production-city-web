import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasTimeline } from './CanvasTimeline';

const meta: Meta<typeof CanvasTimeline> = {
  title: 'Organisms/CanvasTimeline',
  component: CanvasTimeline,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CanvasTimeline>;

const baseTasks = [
  { id: '1', title: 'Pre-production', start: '2026-03-01', end: '2026-03-20', progress: 1.0 },
  { id: '2', title: 'Principal Photography', start: '2026-03-21', end: '2026-05-15', progress: 0.4, dependsOn: ['1'] },
  { id: '3', title: 'Post-production', start: '2026-05-16', end: '2026-07-30', progress: 0, dependsOn: ['2'] },
  { id: '4', title: 'Final Cut', start: '2026-07-30', end: '2026-07-30', milestone: true, dependsOn: ['3'] },
];

export const Default: Story = {
  args: {
    tasks: baseTasks,
    zoom: 'month',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
  },
};

export const Empty: Story = {
  args: {
    tasks: [],
    zoom: 'month',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
  },
};

export const DayZoom: Story = {
  args: {
    tasks: baseTasks.slice(0, 2),
    zoom: 'day',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
  },
};

export const WeekZoom: Story = {
  args: {
    tasks: baseTasks,
    zoom: 'week',
    startDate: '2026-03-01',
    endDate: '2026-06-30',
  },
};

export const WithDependencies: Story = {
  args: {
    tasks: baseTasks,
    zoom: 'month',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
  },
};

export const MilestonesOnly: Story = {
  args: {
    tasks: [
      { id: '1', title: 'Greenlight', start: '2026-03-15', end: '2026-03-15', milestone: true },
      { id: '2', title: 'Wrap', start: '2026-06-01', end: '2026-06-01', milestone: true },
      { id: '3', title: 'Premiere', start: '2026-09-01', end: '2026-09-01', milestone: true },
    ],
    zoom: 'month',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
  },
};
