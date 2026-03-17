import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasCalendar } from './CanvasCalendar';

const meta: Meta<typeof CanvasCalendar> = {
  title: 'Organisms/CanvasCalendar',
  component: CanvasCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof CanvasCalendar>;

const events = [
  { id: '1', title: 'Stage 1 Booking', start: '2026-03-15T09:00:00Z', end: '2026-03-15T17:00:00Z', resourceId: 'stage-1' },
  { id: '2', title: 'Stage 2 Booking', start: '2026-03-15T10:00:00Z', end: '2026-03-15T14:00:00Z', resourceId: 'stage-2' },
  { id: '3', title: 'Crew Call', start: '2026-03-16T06:00:00Z', end: '2026-03-16T08:00:00Z' },
  { id: '4', title: 'Wrap Meeting', start: '2026-03-16T18:00:00Z', end: '2026-03-16T19:00:00Z' },
  { id: '5', title: 'Rehearsal', start: '2026-03-20T10:00:00Z', end: '2026-03-20T13:00:00Z', resourceId: 'stage-1' },
  { id: '6', title: 'VFX Review', start: '2026-03-22T14:00:00Z', end: '2026-03-22T16:00:00Z' },
];

const conflictEvents = [
  { id: '1', title: 'Stage 1 - Morning', start: '2026-03-15T09:00:00Z', end: '2026-03-15T12:00:00Z', resourceId: 'stage-1' },
  { id: '2', title: 'Stage 1 - Overlap', start: '2026-03-15T10:00:00Z', end: '2026-03-15T14:00:00Z', resourceId: 'stage-1' },
  { id: '3', title: 'Stage 2 - No Conflict', start: '2026-03-15T09:00:00Z', end: '2026-03-15T12:00:00Z', resourceId: 'stage-2' },
];

export const MonthView: Story = {
  args: {
    view: 'month',
    date: new Date('2026-03-15'),
    events,
    onViewChange: (view) => console.log('View:', view),
    onDateChange: (date) => console.log('Date:', date),
    onEventClick: (id) => console.log('Event:', id),
  },
};

export const WeekView: Story = {
  args: {
    view: 'week',
    date: new Date('2026-03-15'),
    events,
    onViewChange: (view) => console.log('View:', view),
    onDateChange: (date) => console.log('Date:', date),
    onEventClick: (id) => console.log('Event:', id),
  },
};

export const DayView: Story = {
  args: {
    view: 'day',
    date: new Date('2026-03-15'),
    events,
    onViewChange: (view) => console.log('View:', view),
    onDateChange: (date) => console.log('Date:', date),
    onEventClick: (id) => console.log('Event:', id),
  },
};

export const WithConflicts: Story = {
  args: {
    view: 'day',
    date: new Date('2026-03-15'),
    events: conflictEvents,
    onViewChange: (view) => console.log('View:', view),
    onDateChange: (date) => console.log('Date:', date),
    onEventClick: (id) => console.log('Event:', id),
  },
};

export const Empty: Story = {
  args: {
    view: 'month',
    date: new Date('2026-03-15'),
    events: [],
    onViewChange: (view) => console.log('View:', view),
    onDateChange: (date) => console.log('Date:', date),
  },
};
