-- Migration: Update Notification.actionUrl values from old flat dashboard paths
-- to new workspace-based paths.
-- @see Issue #447

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/communications'
  WHERE "actionUrl" = '/dashboard/announcements';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/communications/new'
  WHERE "actionUrl" = '/dashboard/announcements/new';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/users'
  WHERE "actionUrl" = '/dashboard/users';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/users?view=invitations'
  WHERE "actionUrl" = '/dashboard/invitations';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/users?view=approvals'
  WHERE "actionUrl" = '/dashboard/approvals';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/security'
  WHERE "actionUrl" = '/dashboard/audit-log';

UPDATE "Notification" SET "actionUrl" = '/dashboard/partnerships/eoi'
  WHERE "actionUrl" = '/dashboard/eoi';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/communications?view=categories'
  WHERE "actionUrl" = '/dashboard/categories';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/communications?view=tags'
  WHERE "actionUrl" = '/dashboard/tags';

UPDATE "Notification" SET "actionUrl" = '/dashboard/administration/communications?view=subscriptions'
  WHERE "actionUrl" = '/dashboard/subscriptions-admin';

-- Dynamic announcement paths: /dashboard/announcements/{id} -> /dashboard/administration/communications/{id}
-- and /dashboard/announcements/{id}/edit -> /dashboard/administration/communications/{id}/edit
-- SQLite does not support regex replace, so we use REPLACE for the prefix.
UPDATE "Notification" SET "actionUrl" = REPLACE("actionUrl", '/dashboard/announcements/', '/dashboard/administration/communications/')
  WHERE "actionUrl" LIKE '/dashboard/announcements/%';
