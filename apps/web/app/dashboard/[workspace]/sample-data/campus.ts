/**
 * Sample data for Campus workspace canvases.
 * @see Issue #415
 */

export const CAMPUS_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'name', label: 'Project', sortable: true },
      { key: 'precinct', label: 'Precinct' },
      { key: 'phase', label: 'Phase', sortable: true },
      { key: 'completion', label: 'Completion' },
    ],
    data: [
      { id: '1', name: 'North Precinct — Stage Complex', precinct: 'North', phase: 'Construction', completion: '65%' },
      { id: '2', name: 'Central Hub — Admin Tower', precinct: 'Central', phase: 'Complete', completion: '100%' },
      { id: '3', name: 'Creative Quarter — Workshop Wing', precinct: 'Creative', phase: 'Design', completion: '20%' },
      { id: '4', name: 'South Precinct — Broadcast Centre', precinct: 'South', phase: 'Planning', completion: '5%' },
      { id: '5', name: 'Landscaping — Phase 2', precinct: 'Central', phase: 'Construction', completion: '40%' },
    ],
  },
  timeline: {
    tasks: [
      { id: 't1', title: 'North Stage Complex', start: '2025-06-01', end: '2026-09-30', progress: 65 },
      { id: 't2', title: 'Central Admin Tower', start: '2024-01-01', end: '2025-12-31', progress: 100, color: '#22c55e' },
      { id: 't3', title: 'Creative Workshop Wing', start: '2026-01-01', end: '2027-06-30', progress: 20 },
      { id: 't4', title: 'South Broadcast Centre', start: '2026-06-01', end: '2028-12-31', progress: 5 },
      { id: 't5', title: 'Landscaping Phase 2', start: '2026-01-15', end: '2026-08-30', progress: 40 },
    ],
  },
};
