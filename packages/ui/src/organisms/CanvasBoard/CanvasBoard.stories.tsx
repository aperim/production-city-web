import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasBoard } from './CanvasBoard';

const meta: Meta<typeof CanvasBoard> = {
  title: 'Organisms/CanvasBoard',
  component: CanvasBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof CanvasBoard>;

const lanes = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do', wipLimit: 5 },
  { id: 'in-progress', label: 'In Progress', wipLimit: 3 },
  { id: 'review', label: 'Review', wipLimit: 2 },
  { id: 'done', label: 'Done' },
];

const cards = [
  { id: '1', laneId: 'backlog', title: 'Storyboard Review', subtitle: 'Episode 4' },
  { id: '2', laneId: 'backlog', title: 'VFX Breakdown', subtitle: 'Episode 5', assignee: 'MK' },
  { id: '3', laneId: 'todo', title: 'Script Breakdown', subtitle: 'Project Alpha', assignee: 'JD' },
  { id: '4', laneId: 'todo', title: 'Permit Filing', subtitle: 'Location B' },
  { id: '5', laneId: 'in-progress', title: 'Location Scouting', subtitle: 'Project Beta', assignee: 'AB' },
  { id: '6', laneId: 'in-progress', title: 'Casting Session', subtitle: 'Lead Roles', assignee: 'RS' },
  { id: '7', laneId: 'review', title: 'Budget Approval', subtitle: 'Q2 Budget', assignee: 'TL' },
  { id: '8', laneId: 'done', title: 'Casting', subtitle: 'Project Alpha' },
  { id: '9', laneId: 'done', title: 'Crew Hiring', subtitle: 'Project Alpha', assignee: 'JD' },
];

export const Default: Story = {
  args: {
    lanes,
    cards,
    onCardMove: (cardId, from, to) => console.log(`Moved ${cardId} from ${from} to ${to}`),
    onCardClick: (cardId) => console.log(`Clicked ${cardId}`),
  },
};

export const EmptyBoard: Story = {
  args: {
    lanes,
    cards: [],
    onCardMove: () => {},
  },
};

export const SingleLane: Story = {
  args: {
    lanes: [{ id: 'all', label: 'All Tasks' }],
    cards: [
      { id: '1', laneId: 'all', title: 'Task A', subtitle: 'Description' },
      { id: '2', laneId: 'all', title: 'Task B' },
    ],
    onCardMove: () => {},
  },
};

export const WipLimitExceeded: Story = {
  args: {
    lanes: [
      { id: 'wip', label: 'In Progress', wipLimit: 2 },
      { id: 'done', label: 'Done' },
    ],
    cards: [
      { id: '1', laneId: 'wip', title: 'Task A', assignee: 'JD' },
      { id: '2', laneId: 'wip', title: 'Task B', assignee: 'AB' },
      { id: '3', laneId: 'wip', title: 'Task C', assignee: 'RS' },
    ],
    onCardMove: () => {},
  },
};
