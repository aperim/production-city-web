-- Migration: Add WebSocket models for Epic #182
-- Adds deliveryToken/deliveryTokenUsed to MagicLink
-- Adds NotificationPreference model

-- MagicLink: add delivery token columns
ALTER TABLE "MagicLink" ADD COLUMN "deliveryToken" TEXT;
ALTER TABLE "MagicLink" ADD COLUMN "deliveryTokenUsed" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "MagicLink_deliveryToken_key" ON "MagicLink"("deliveryToken");

-- NotificationPreference table
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreference_userId_channel_key" ON "NotificationPreference"("userId", "channel");
CREATE INDEX IF NOT EXISTS "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");
CREATE INDEX IF NOT EXISTS "NotificationPreference_channel_idx" ON "NotificationPreference"("channel");
