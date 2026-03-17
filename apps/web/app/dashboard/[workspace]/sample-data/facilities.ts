/**
 * Sample data for Facilities workspace canvases.
 * @see Issue #415
 */

export const FACILITIES_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'name', label: 'Facility', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'status', label: 'Status' },
      { key: 'capacity', label: 'Capacity' },
    ],
    data: [
      { id: '1', name: 'Sound Stage 1', type: 'Sound Stage', status: 'Booked', capacity: '500 sqm' },
      { id: '2', name: 'Sound Stage 2', type: 'Sound Stage', status: 'Available', capacity: '750 sqm' },
      { id: '3', name: 'Sound Stage 3', type: 'Sound Stage', status: 'Booked', capacity: '1000 sqm' },
      { id: '4', name: 'LED Volume 1', type: 'LED Volume', status: 'Booked', capacity: '300 sqm' },
      { id: '5', name: 'Control Room A', type: 'Control Room', status: 'Available', capacity: '50 sqm' },
      { id: '6', name: 'Broadcast Theatre', type: 'Broadcast', status: 'Maintenance', capacity: '200 sqm' },
      { id: '7', name: 'Recording Studio 1', type: 'Recording', status: 'Available', capacity: '80 sqm' },
    ],
  },
  calendar: {
    events: [
      { id: 'e1', title: 'SS1 — Reef Runners', start: '2026-03-17T06:00:00', end: '2026-03-17T22:00:00' },
      { id: 'e2', title: 'SS3 — Project Aurora', start: '2026-03-17T07:00:00', end: '2026-03-17T19:00:00' },
      { id: 'e3', title: 'LED1 — Harbour Nights test', start: '2026-03-18T09:00:00', end: '2026-03-18T17:00:00' },
      { id: 'e4', title: 'Broadcast Theatre — Maintenance', start: '2026-03-19T08:00:00', end: '2026-03-21T18:00:00' },
      { id: 'e5', title: 'SS2 — Commercial shoot', start: '2026-03-22T06:00:00', end: '2026-03-22T20:00:00' },
    ],
  },
};
