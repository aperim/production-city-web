-- Extend Notification model with inbox-specific fields
ALTER TABLE "Notification" ADD COLUMN "workspace" TEXT;
ALTER TABLE "Notification" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'info';
ALTER TABLE "Notification" ADD COLUMN "dismissed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Notification" ADD COLUMN "actionable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Notification" ADD COLUMN "summary" TEXT;

-- Add indexes for inbox queries
CREATE INDEX IF NOT EXISTS "Notification_userId_dismissed_idx" ON "Notification"("userId", "dismissed");
CREATE INDEX IF NOT EXISTS "Notification_userId_type_idx" ON "Notification"("userId", "type");
