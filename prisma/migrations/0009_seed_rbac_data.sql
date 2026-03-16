-- Seed ALL RBAC data: roles, permissions, role-permission mappings,
-- announcement categories, and admin role assignment.
-- Fully idempotent via INSERT OR IGNORE with deterministic IDs.

-- ============================================================================
-- 1. Roles
-- ============================================================================

INSERT OR IGNORE INTO "Role" ("id", "name", "description", "isSystem", "createdAt", "updatedAt")
VALUES
  ('role-super_admin', 'super_admin', 'Full platform access, can manage all resources and users', 1, datetime('now'), datetime('now')),
  ('role-admin',       'admin',       'Can manage users, invitations, view audit logs',           1, datetime('now'), datetime('now')),
  ('role-member',      'member',      'Standard authenticated user',                              1, datetime('now'), datetime('now')),
  ('role-viewer',      'viewer',      'Read-only access',                                         1, datetime('now'), datetime('now'));

-- ============================================================================
-- 2. Permissions (67 total)
-- ============================================================================

INSERT OR IGNORE INTO "Permission" ("id", "resource", "action", "description", "createdAt")
VALUES
  -- User permissions
  ('perm-user-read',           'user',           'read',             'View user profiles',                        datetime('now')),
  ('perm-user-create',         'user',           'create',           'Create users',                              datetime('now')),
  ('perm-user-update',         'user',           'update',           'Edit user profiles, activate/deactivate',   datetime('now')),
  ('perm-user-delete',         'user',           'delete',           'Delete users',                              datetime('now')),
  ('perm-user-admin',          'user',           'admin',            'Full user administration',                  datetime('now')),
  -- Role permissions
  ('perm-role-read',           'role',           'read',             'View roles and permissions',                datetime('now')),
  ('perm-role-create',         'role',           'create',           'Create custom roles',                       datetime('now')),
  ('perm-role-update',         'role',           'update',           'Modify role permissions',                   datetime('now')),
  ('perm-role-delete',         'role',           'delete',           'Delete custom roles',                       datetime('now')),
  -- Invitation permissions
  ('perm-invitation-read',     'invitation',     'read',             'View invitations',                          datetime('now')),
  ('perm-invitation-create',   'invitation',     'create',           'Create and send invitations',               datetime('now')),
  ('perm-invitation-revoke',   'invitation',     'revoke',           'Revoke pending invitations',                datetime('now')),
  -- Audit permissions
  ('perm-audit-read',          'audit',          'read',             'View audit log',                            datetime('now')),
  -- System permissions
  ('perm-system-admin',        'system',         'admin',            'System-level administration',               datetime('now')),
  -- Facility permissions
  ('perm-facility-read',       'facility',       'read',             'View facilities',                           datetime('now')),
  ('perm-facility-create',     'facility',       'create',           'Create facilities',                         datetime('now')),
  ('perm-facility-update',     'facility',       'update',           'Edit facilities',                           datetime('now')),
  ('perm-facility-delete',     'facility',       'delete',           'Delete facilities',                         datetime('now')),
  ('perm-facility-manage',     'facility',       'manage',           'Manage facility operations',                datetime('now')),
  -- Production permissions
  ('perm-production-read',     'production',     'read',             'View productions',                          datetime('now')),
  ('perm-production-create',   'production',     'create',           'Create productions',                        datetime('now')),
  ('perm-production-update',   'production',     'update',           'Edit productions',                          datetime('now')),
  ('perm-production-delete',   'production',     'delete',           'Delete productions',                        datetime('now')),
  ('perm-production-manage',   'production',     'manage',           'Manage production operations',              datetime('now')),
  -- Guest permissions
  ('perm-guest-read',          'guest',          'read',             'View guests',                               datetime('now')),
  ('perm-guest-create',        'guest',          'create',           'Register guests',                           datetime('now')),
  ('perm-guest-update',        'guest',          'update',           'Edit guest info',                           datetime('now')),
  ('perm-guest-delete',        'guest',          'delete',           'Remove guests',                             datetime('now')),
  -- Dashboard role permissions
  ('perm-dashboard-admin',         'dashboard',      'admin',            'Dashboard admin role',                  datetime('now')),
  ('perm-dashboard-executive',     'dashboard',      'executive',        'Dashboard executive role',              datetime('now')),
  ('perm-dashboard-staff',         'dashboard',      'staff',            'Dashboard staff role',                  datetime('now')),
  ('perm-dashboard-client',        'dashboard',      'client',           'Dashboard client role',                 datetime('now')),
  ('perm-dashboard-vendor',        'dashboard',      'vendor',           'Dashboard vendor role',                 datetime('now')),
  ('perm-dashboard-investor',      'dashboard',      'investor',         'Dashboard investor role',               datetime('now')),
  ('perm-dashboard-guest',         'dashboard',      'guest',            'Dashboard guest role',                  datetime('now')),
  ('perm-dashboard-government',    'dashboard',      'government',       'Dashboard government role',             datetime('now')),
  ('perm-dashboard-partner',       'dashboard',      'partner',          'Dashboard partner role',                datetime('now')),
  ('perm-dashboard-first_nations', 'dashboard',      'first_nations',    'Dashboard First Nations role',          datetime('now')),
  -- Dashboard-specific permissions
  ('perm-hr-read',                 'hr',             'read',             'Read HR data',                          datetime('now')),
  ('perm-legal-read',              'legal',          'read',             'Read legal data',                       datetime('now')),
  ('perm-company_finance-read',    'company_finance','read',             'Read company finance',                  datetime('now')),
  ('perm-productions-read',        'productions',    'read',             'Read productions',                      datetime('now')),
  ('perm-facilities-read',         'facilities',     'read',             'Read facilities',                       datetime('now')),
  ('perm-facilities-book',         'facilities',     'book',             'Book facilities',                       datetime('now')),
  ('perm-analytics-read',          'analytics',      'read',             'Read analytics',                        datetime('now')),
  ('perm-investor-read',           'investor',       'read',             'Read investor data',                    datetime('now')),
  ('perm-events-browse',           'events',         'browse',           'Browse events',                         datetime('now')),
  ('perm-education-browse',        'education',      'browse',           'Browse education',                      datetime('now')),
  ('perm-education-collaborate',   'education',      'collaborate',      'Collaborate on education',              datetime('now')),
  ('perm-workflow-read',           'workflow',       'read',             'Read workflow',                         datetime('now')),
  ('perm-workflow-review',         'workflow',       'review',           'Review workflows',                      datetime('now')),
  ('perm-vendors-read',            'vendors',        'read',             'Read vendor data',                      datetime('now')),
  ('perm-data_rooms-investor',     'data_rooms',     'investor',         'Investor data room access',             datetime('now')),
  ('perm-data_rooms-government',   'data_rooms',     'government',       'Government data room access',           datetime('now')),
  ('perm-data_rooms-partner',      'data_rooms',     'partner',          'Partner data room access',              datetime('now')),
  ('perm-gov_policy-read',         'gov_policy',     'read',             'Read government policy',                datetime('now')),
  ('perm-analytics-economic_impact','analytics',     'economic_impact',  'View economic impact analytics',        datetime('now')),
  ('perm-partnerships-read',       'partnerships',   'read',             'Read partnerships',                     datetime('now')),
  ('perm-first_nations-read',      'first_nations',  'read',             'Read First Nations data',               datetime('now')),
  ('perm-community-read',          'community',      'read',             'Read community data',                   datetime('now')),
  ('perm-talent-read',             'talent',         'read',             'Read talent data',                      datetime('now')),
  -- Announcement permissions
  ('perm-announcement-read',       'announcement',   'read',             'Public read access to announcements',         datetime('now')),
  ('perm-announcement-read_admin', 'announcement',   'read_admin',       'Admin dashboard access to announcements',     datetime('now')),
  ('perm-announcement-create',     'announcement',   'create',           'Create announcements',                        datetime('now')),
  ('perm-announcement-update',     'announcement',   'update',           'Update announcements',                        datetime('now')),
  ('perm-announcement-delete',     'announcement',   'delete',           'Delete announcements',                        datetime('now')),
  ('perm-announcement-publish',    'announcement',   'publish',          'Publish announcements',                       datetime('now')),
  -- Category permissions
  ('perm-category-read',           'category',       'read',             'View announcement categories',                datetime('now')),
  ('perm-category-create',         'category',       'create',           'Create announcement categories',              datetime('now')),
  ('perm-category-update',         'category',       'update',           'Update announcement categories',              datetime('now')),
  ('perm-category-delete',         'category',       'delete',           'Delete announcement categories',              datetime('now')),
  -- Tag permissions
  ('perm-tag-read',                'tag',            'read',             'View announcement tags',                      datetime('now')),
  ('perm-tag-create',              'tag',            'create',           'Create announcement tags',                    datetime('now')),
  ('perm-tag-update',              'tag',            'update',           'Update announcement tags',                    datetime('now')),
  ('perm-tag-delete',              'tag',            'delete',           'Delete announcement tags',                    datetime('now')),
  -- Subscription permissions
  ('perm-subscription-read',       'subscription',   'read',             'View subscriptions',                          datetime('now')),
  ('perm-subscription-manage',     'subscription',   'manage',           'Manage subscriptions',                        datetime('now')),
  ('perm-subscription-read_pii',   'subscription',   'read_pii',         'View subscriber phone numbers (PII)',         datetime('now'));

-- ============================================================================
-- 3. Role-Permission Mappings
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 3a. super_admin gets ALL permissions (67 mappings)
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT 'rp-super_admin-' || p."resource" || '-' || p."action", r."id", p."id", datetime('now')
FROM "Role" r, "Permission" p
WHERE r."name" = 'super_admin';

-- ---------------------------------------------------------------------------
-- 3b. admin gets specific subset (26 permissions)
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT 'rp-admin-' || p."resource" || '-' || p."action", r."id", p."id", datetime('now')
FROM "Role" r, "Permission" p
WHERE r."name" = 'admin'
  AND (p."resource" || ':' || p."action") IN (
    'user:read',
    'user:create',
    'user:update',
    'user:delete',
    'user:admin',
    'role:read',
    'invitation:read',
    'invitation:create',
    'invitation:revoke',
    'audit:read',
    'announcement:read',
    'announcement:read_admin',
    'announcement:create',
    'announcement:update',
    'announcement:delete',
    'announcement:publish',
    'category:read',
    'category:create',
    'category:update',
    'category:delete',
    'tag:read',
    'tag:create',
    'tag:update',
    'tag:delete',
    'subscription:read',
    'subscription:manage'
  );

-- ---------------------------------------------------------------------------
-- 3c. member gets 4 permissions
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT 'rp-member-' || p."resource" || '-' || p."action", r."id", p."id", datetime('now')
FROM "Role" r, "Permission" p
WHERE r."name" = 'member'
  AND (p."resource" || ':' || p."action") IN (
    'user:read',
    'announcement:read',
    'category:read',
    'tag:read'
  );

-- ---------------------------------------------------------------------------
-- 3d. viewer gets 4 permissions
-- ---------------------------------------------------------------------------

INSERT OR IGNORE INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT 'rp-viewer-' || p."resource" || '-' || p."action", r."id", p."id", datetime('now')
FROM "Role" r, "Permission" p
WHERE r."name" = 'viewer'
  AND (p."resource" || ':' || p."action") IN (
    'user:read',
    'announcement:read',
    'category:read',
    'tag:read'
  );

-- ============================================================================
-- 4. Announcement Categories
-- ============================================================================

INSERT OR IGNORE INTO "AnnouncementCategory" ("id", "name", "slug", "description", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES
  ('cat-general-updates', 'General Updates', 'general-updates', 'General platform news and updates',            0, 1, datetime('now'), datetime('now')),
  ('cat-development',     'Development',     'development',     'Development progress and technical updates',    1, 1, datetime('now'), datetime('now')),
  ('cat-events',          'Events',          'events',          'Upcoming events and activities',                2, 1, datetime('now'), datetime('now')),
  ('cat-community',       'Community',       'community',       'Community news and highlights',                 3, 1, datetime('now'), datetime('now'));

-- ============================================================================
-- 5. Assign super_admin role to bootstrap admin user
--    (troy@team.production.city was created by migration 0008)
-- ============================================================================

INSERT OR IGNORE INTO "UserRole" ("id", "userId", "roleId", "grantedAt")
SELECT
  'seed-admin-super_admin',
  u."id",
  r."id",
  datetime('now')
FROM "User" u, "Role" r
WHERE u."email" = 'troy@team.production.city'
  AND r."name" = 'super_admin';

-- ============================================================================
-- 6. Notification preferences for bootstrap admin
-- ============================================================================

INSERT OR IGNORE INTO "NotificationPreference" ("id", "userId", "channel", "enabled", "createdAt", "updatedAt")
SELECT 'notifpref-admin-notifications', u."id", 'admin:notifications', 1, datetime('now'), datetime('now')
FROM "User" u WHERE u."email" = 'troy@team.production.city';

INSERT OR IGNORE INTO "NotificationPreference" ("id", "userId", "channel", "enabled", "createdAt", "updatedAt")
SELECT 'notifpref-admin-eoi', u."id", 'admin:eoi', 1, datetime('now'), datetime('now')
FROM "User" u WHERE u."email" = 'troy@team.production.city';

INSERT OR IGNORE INTO "NotificationPreference" ("id", "userId", "channel", "enabled", "createdAt", "updatedAt")
SELECT 'notifpref-admin-approvals', u."id", 'admin:approvals', 1, datetime('now'), datetime('now')
FROM "User" u WHERE u."email" = 'troy@team.production.city';

INSERT OR IGNORE INTO "NotificationPreference" ("id", "userId", "channel", "enabled", "createdAt", "updatedAt")
SELECT 'notifpref-admin-audit', u."id", 'admin:audit', 1, datetime('now'), datetime('now')
FROM "User" u WHERE u."email" = 'troy@team.production.city';
