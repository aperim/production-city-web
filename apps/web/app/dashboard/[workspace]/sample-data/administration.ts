/**
 * Sample data for Administration workspace canvases.
 * @see Issue #415
 */

export const ADMINISTRATION_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'lastLogin', label: 'Last Login', sortable: true },
    ],
    data: [
      { id: '1', name: 'Admin User', email: 'admin@production.city', role: 'Admin', status: 'Active', lastLogin: '2026-03-17' },
      { id: '2', name: 'Jane Smith', email: 'jane@production.city', role: 'Staff', status: 'Active', lastLogin: '2026-03-16' },
      { id: '3', name: 'Bob Johnson', email: 'bob@production.city', role: 'Staff', status: 'Active', lastLogin: '2026-03-15' },
      { id: '4', name: 'Guest Viewer', email: 'guest@production.city', role: 'Guest', status: 'Active', lastLogin: '2026-03-10' },
      { id: '5', name: 'Pending User', email: 'pending@production.city', role: 'Staff', status: 'Pending', lastLogin: '' },
    ],
  },
};
