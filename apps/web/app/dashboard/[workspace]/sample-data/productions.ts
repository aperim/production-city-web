/**
 * Sample data for Productions workspace canvases.
 * Replaced with live API data when the workspace goes live.
 * @see Issue #415
 */

export const PRODUCTIONS_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'title', label: 'Production', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'stage', label: 'Stage' },
      { key: 'startDate', label: 'Start Date', sortable: true },
    ],
    data: [
      { id: '1', title: 'Project Aurora', status: 'shooting', stage: 'Sound Stage 3', startDate: '2026-03-20' },
      { id: '2', title: 'Harbour Nights', status: 'pre-production', stage: 'LED Volume 1', startDate: '2026-04-15' },
      { id: '3', title: 'Australian Stories', status: 'post-production', stage: '', startDate: '2026-02-01' },
      { id: '4', title: 'Reef Runners', status: 'active', stage: 'Sound Stage 1', startDate: '2026-03-01' },
      { id: '5', title: 'The Great Divide', status: 'pre-production', stage: '', startDate: '2026-05-10' },
    ],
  },
  board: {
    lanes: [
      { id: 'development', label: 'Development' },
      { id: 'pre-production', label: 'Pre-Production' },
      { id: 'shooting', label: 'Shooting' },
      { id: 'post-production', label: 'Post-Production' },
      { id: 'delivered', label: 'Delivered' },
    ],
    cards: [
      { id: 'c1', laneId: 'shooting', title: 'Project Aurora', subtitle: 'Sound Stage 3', assignee: 'J. Smith' },
      { id: 'c2', laneId: 'pre-production', title: 'Harbour Nights', subtitle: 'LED Volume 1' },
      { id: 'c3', laneId: 'post-production', title: 'Australian Stories', subtitle: 'Editing' },
      { id: 'c4', laneId: 'shooting', title: 'Reef Runners', subtitle: 'Sound Stage 1', assignee: 'M. Chen' },
      { id: 'c5', laneId: 'development', title: 'The Great Divide', subtitle: 'Script review' },
    ],
  },
  calendar: {
    events: [
      { id: 'e1', title: 'Aurora — Day 15', start: '2026-03-17T07:00:00', end: '2026-03-17T19:00:00' },
      { id: 'e2', title: 'Harbour Nights — Location Scout', start: '2026-03-18T09:00:00', end: '2026-03-18T17:00:00' },
      { id: 'e3', title: 'Reef Runners — Day 8', start: '2026-03-19T06:00:00', end: '2026-03-19T18:00:00' },
      { id: 'e4', title: 'Aurora — Day 16', start: '2026-03-20T07:00:00', end: '2026-03-20T19:00:00' },
    ],
  },
  timeline: {
    tasks: [
      { id: 't1', title: 'Project Aurora', start: '2026-02-01', end: '2026-04-30', progress: 45 },
      { id: 't2', title: 'Harbour Nights', start: '2026-03-15', end: '2026-06-30', progress: 10 },
      { id: 't3', title: 'Australian Stories', start: '2026-01-10', end: '2026-03-25', progress: 85, color: '#22c55e' },
      { id: 't4', title: 'Reef Runners', start: '2026-02-15', end: '2026-05-20', progress: 30 },
      { id: 't5', title: 'The Great Divide', start: '2026-04-01', end: '2026-08-30', progress: 5 },
    ],
  },
};
