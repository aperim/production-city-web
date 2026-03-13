/**
 * Test helpers for setting up D1 database in vitest-pool-workers tests.
 * Applies migrations directly via the D1 binding since vitest-pool-workers
 * uses an in-memory D1 instance that doesn't automatically run migrations.
 */
import { env } from "cloudflare:test";

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "name" TEXT, "status" TEXT NOT NULL DEFAULT 'pending_approval', "emailVerified" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastLoginAt" DATETIME, "deactivatedAt" DATETIME)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status")`,
  `CREATE TABLE IF NOT EXISTS "Role" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "isSystem" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name")`,
  `CREATE TABLE IF NOT EXISTS "Permission" ("id" TEXT NOT NULL PRIMARY KEY, "resource" TEXT NOT NULL, "action" TEXT NOT NULL, "description" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Permission_resource_action_key" ON "Permission"("resource", "action")`,
  `CREATE INDEX IF NOT EXISTS "Permission_resource_idx" ON "Permission"("resource")`,
  `CREATE TABLE IF NOT EXISTS "RolePermission" ("id" TEXT NOT NULL PRIMARY KEY, "roleId" TEXT NOT NULL, "permissionId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId")`,
  `CREATE TABLE IF NOT EXISTS "UserRole" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "roleId" TEXT NOT NULL, "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "grantedBy" TEXT, CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "UserRole_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId")`,
  `CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "token" TEXT NOT NULL, "ipAddress" TEXT, "userAgent" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" DATETIME NOT NULL, "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "revokedAt" DATETIME, CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token")`,
  `CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt")`,
  `CREATE TABLE IF NOT EXISTS "MagicLink" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT, "email" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "codeHash" TEXT NOT NULL, "purpose" TEXT NOT NULL, "postmarkMessageId" TEXT, "deliveryStatus" TEXT NOT NULL DEFAULT 'pending', "attempts" INTEGER NOT NULL DEFAULT 0, "maxAttempts" INTEGER NOT NULL DEFAULT 5, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" DATETIME NOT NULL, "usedAt" DATETIME, CONSTRAINT "MagicLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MagicLink_tokenHash_key" ON "MagicLink"("tokenHash")`,
  `CREATE INDEX IF NOT EXISTS "MagicLink_email_createdAt_idx" ON "MagicLink"("email", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "MagicLink_expiresAt_idx" ON "MagicLink"("expiresAt")`,
  `CREATE INDEX IF NOT EXISTS "MagicLink_postmarkMessageId_idx" ON "MagicLink"("postmarkMessageId")`,
  `CREATE TABLE IF NOT EXISTS "Invitation" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "invitedById" TEXT NOT NULL, "userId" TEXT, "status" TEXT NOT NULL DEFAULT 'pending', "activeEmail" TEXT, "message" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" DATETIME NOT NULL, "acceptedAt" DATETIME, "revokedAt" DATETIME, CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_userId_key" ON "Invitation"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_activeEmail_key" ON "Invitation"("activeEmail")`,
  `CREATE INDEX IF NOT EXISTS "Invitation_email_idx" ON "Invitation"("email")`,
  `CREATE INDEX IF NOT EXISTS "Invitation_status_idx" ON "Invitation"("status")`,
  `CREATE TABLE IF NOT EXISTS "InvitationRole" ("id" TEXT NOT NULL PRIMARY KEY, "invitationId" TEXT NOT NULL, "roleId" TEXT NOT NULL, CONSTRAINT "InvitationRole_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "InvitationRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "InvitationRole_invitationId_roleId_key" ON "InvitationRole"("invitationId", "roleId")`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL PRIMARY KEY, "actorId" TEXT, "subjectId" TEXT, "action" TEXT NOT NULL, "resource" TEXT NOT NULL, "details" TEXT, "ipAddress" TEXT, "userAgent" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT "AuditLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx" ON "AuditLog"("actorId")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_subjectId_idx" ON "AuditLog"("subjectId")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action")`,
  `CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt")`,
  `CREATE TABLE IF NOT EXISTS "EmailSuppression" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "reason" TEXT NOT NULL, "details" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "removedAt" DATETIME, "removedBy" TEXT, CONSTRAINT "EmailSuppression_removedBy_fkey" FOREIGN KEY ("removedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "EmailSuppression_email_key" ON "EmailSuppression"("email")`,
  `CREATE TABLE IF NOT EXISTS "MediaAsset" ("id" TEXT NOT NULL PRIMARY KEY, "source" TEXT NOT NULL, "externalId" TEXT NOT NULL, "externalUrl" TEXT, "photographer" TEXT NOT NULL, "photographerUrl" TEXT, "photographerId" TEXT, "originalWidth" INTEGER NOT NULL, "originalHeight" INTEGER NOT NULL, "averageColor" TEXT, "alt" TEXT NOT NULL, "originalAlt" TEXT, "mimeType" TEXT NOT NULL, "fileSize" INTEGER, "checksum" TEXT, "localPath" TEXT NOT NULL, "publicPath" TEXT NOT NULL, "downloadUrl" TEXT, "license" TEXT NOT NULL, "attributionRequired" BOOLEAN NOT NULL DEFAULT true, "attributionText" TEXT, "aiAssisted" BOOLEAN NOT NULL DEFAULT false, "aiGenerated" BOOLEAN NOT NULL DEFAULT false, "hasFirstNationsPermission" BOOLEAN NOT NULL DEFAULT false, "culturalNotes" TEXT, "themeVariant" TEXT NOT NULL DEFAULT 'universal', "contentContext" TEXT, "sourcingAgent" TEXT, "sourcingPrompt" TEXT, "reviewStatus" TEXT NOT NULL DEFAULT 'pending', "reviewNotes" TEXT, "reviewedAt" DATETIME, "archivedAt" DATETIME, "archivedBy" TEXT, "downloadedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_source_externalId_key" ON "MediaAsset"("source", "externalId")`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_contentContext_idx" ON "MediaAsset"("contentContext")`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_themeVariant_idx" ON "MediaAsset"("themeVariant")`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_reviewStatus_idx" ON "MediaAsset"("reviewStatus")`,
  `CREATE INDEX IF NOT EXISTS "MediaAsset_archivedAt_idx" ON "MediaAsset"("archivedAt")`,
  `CREATE TABLE IF NOT EXISTS "MediaPair" ("id" TEXT NOT NULL PRIMARY KEY, "contentContext" TEXT NOT NULL, "lightAssetId" TEXT NOT NULL, "darkAssetId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "MediaPair_lightAssetId_fkey" FOREIGN KEY ("lightAssetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "MediaPair_darkAssetId_fkey" FOREIGN KEY ("darkAssetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "MediaPair_contentContext_key" ON "MediaPair"("contentContext")`,
  `CREATE INDEX IF NOT EXISTS "MediaPair_lightAssetId_idx" ON "MediaPair"("lightAssetId")`,
  `CREATE INDEX IF NOT EXISTS "MediaPair_darkAssetId_idx" ON "MediaPair"("darkAssetId")`,
  `CREATE TABLE IF NOT EXISTS "ExpressionOfInterest" ("id" TEXT NOT NULL PRIMARY KEY, "category" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'new', "locale" TEXT NOT NULL DEFAULT 'en', "name" TEXT NOT NULL, "email" TEXT NOT NULL, "message" TEXT, "metadata" TEXT, "sourcePage" TEXT NOT NULL, "sourceCategory" TEXT, "utmSource" TEXT, "utmMedium" TEXT, "utmCampaign" TEXT, "consentVersion" TEXT NOT NULL, "privacyAcceptedAt" DATETIME NOT NULL, "marketingOptIn" BOOLEAN NOT NULL DEFAULT false, "confirmationSentAt" DATETIME, "postmarkMessageId" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "archivedAt" DATETIME, "archivedBy" TEXT)`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_email_idx" ON "ExpressionOfInterest"("email")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_category_idx" ON "ExpressionOfInterest"("category")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_status_idx" ON "ExpressionOfInterest"("status")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_createdAt_idx" ON "ExpressionOfInterest"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_sourcePage_idx" ON "ExpressionOfInterest"("sourcePage")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_locale_idx" ON "ExpressionOfInterest"("locale")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_confirmationSentAt_idx" ON "ExpressionOfInterest"("confirmationSentAt")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_category_status_createdAt_idx" ON "ExpressionOfInterest"("category", "status", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_email_createdAt_idx" ON "ExpressionOfInterest"("email", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "ExpressionOfInterest_status_createdAt_idx" ON "ExpressionOfInterest"("status", "createdAt")`,
];

let _initialized = false;

/**
 * Ensures D1 tables exist in the test environment.
 * Safe to call multiple times (idempotent due to IF NOT EXISTS).
 */
export async function setupTestDatabase(): Promise<void> {
  if (_initialized) return;
  const db = env.DB;
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.prepare(stmt).run();
  }
  _initialized = true;
}
