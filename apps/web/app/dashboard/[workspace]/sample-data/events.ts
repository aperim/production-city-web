/**
 * Sample data for Events workspace canvases.
 * @see Issue #415
 */

export const EVENTS_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'name', label: 'Event', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'date', label: 'Date', sortable: true },
      { key: 'venue', label: 'Venue' },
      { key: 'status', label: 'Status' },
    ],
    data: [
      { id: '1', name: 'Production City Open Day', type: 'Tour', date: '2026-04-12', venue: 'Campus-wide', status: 'Upcoming' },
      { id: '2', name: 'Film Festival Screening', type: 'Screening', date: '2026-04-20', venue: 'Broadcast Theatre', status: 'Upcoming' },
      { id: '3', name: 'VFX Masterclass', type: 'Conference', date: '2026-05-05', venue: 'Education Centre', status: 'Upcoming' },
      { id: '4', name: 'Sound Design Workshop', type: 'Workshop', date: '2026-03-10', venue: 'Recording Studio 1', status: 'Completed' },
      { id: '5', name: 'Investor Showcase', type: 'Private', date: '2026-06-15', venue: 'Central Hub', status: 'Upcoming' },
    ],
  },
  calendar: {
    events: [
      { id: 'e1', title: 'Production City Open Day', start: '2026-04-12T09:00:00', end: '2026-04-12T17:00:00' },
      { id: 'e2', title: 'Film Festival Screening', start: '2026-04-20T18:00:00', end: '2026-04-20T22:00:00' },
      { id: 'e3', title: 'VFX Masterclass', start: '2026-05-05T09:00:00', end: '2026-05-07T17:00:00' },
      { id: 'e4', title: 'Investor Showcase', start: '2026-06-15T10:00:00', end: '2026-06-15T16:00:00' },
    ],
  },
};
