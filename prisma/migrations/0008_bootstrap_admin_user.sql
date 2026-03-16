-- Bootstrap platform admin user for production.
-- Solves chicken-and-egg: magic link login requires a user record
-- to exist before it sends an email (anti-enumeration).
-- This migration is idempotent (INSERT OR IGNORE).

-- Ensure super_admin role exists
INSERT OR IGNORE INTO "Role" ("id", "name", "description", "isSystem", "createdAt", "updatedAt")
VALUES (
  'bootstrap-super-admin-role',
  'super_admin',
  'Full platform access, can manage all resources and users',
  1,
  datetime('now'),
  datetime('now')
);

-- Create bootstrap admin user
INSERT OR IGNORE INTO "User" ("id", "email", "name", "status", "emailVerified", "createdAt", "updatedAt")
VALUES (
  'bootstrap-admin-user',
  'troy@team.production.city',
  'Platform Admin',
  'active',
  1,
  datetime('now'),
  datetime('now')
);

-- Assign super_admin role to bootstrap admin
-- Use subselects to handle case where role was created by seed (different id)
INSERT OR IGNORE INTO "UserRole" ("id", "userId", "roleId", "createdAt")
SELECT
  'bootstrap-admin-role-assignment',
  u.id,
  r.id,
  datetime('now')
FROM "User" u, "Role" r
WHERE u.email = 'troy@team.production.city'
  AND r.name = 'super_admin';
