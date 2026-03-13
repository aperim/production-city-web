-- Migration: Add MediaAsset and MediaPair tables
-- Supports image sourcing with full provenance tracking

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalUrl" TEXT,
    "photographer" TEXT NOT NULL,
    "photographerUrl" TEXT,
    "photographerId" TEXT,
    "originalWidth" INTEGER NOT NULL,
    "originalHeight" INTEGER NOT NULL,
    "averageColor" TEXT,
    "alt" TEXT NOT NULL,
    "originalAlt" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "checksum" TEXT,
    "localPath" TEXT NOT NULL,
    "publicPath" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "license" TEXT NOT NULL,
    "attributionRequired" INTEGER NOT NULL DEFAULT 1,
    "attributionText" TEXT,
    "aiAssisted" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" INTEGER NOT NULL DEFAULT 0,
    "hasFirstNationsPermission" INTEGER NOT NULL DEFAULT 0,
    "culturalNotes" TEXT,
    "themeVariant" TEXT NOT NULL DEFAULT 'universal',
    "contentContext" TEXT,
    "sourcingAgent" TEXT,
    "sourcingPrompt" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewNotes" TEXT,
    "reviewedAt" DATETIME,
    "archivedAt" DATETIME,
    "archivedBy" TEXT,
    "downloadedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "MediaPair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentContext" TEXT NOT NULL,
    "lightAssetId" TEXT NOT NULL,
    "darkAssetId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MediaPair_lightAssetId_fkey" FOREIGN KEY ("lightAssetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MediaPair_darkAssetId_fkey" FOREIGN KEY ("darkAssetId") REFERENCES "MediaAsset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Unique constraints
CREATE UNIQUE INDEX "MediaAsset_source_externalId_key" ON "MediaAsset"("source", "externalId");
CREATE UNIQUE INDEX "MediaPair_contentContext_key" ON "MediaPair"("contentContext");

-- Performance indexes
CREATE INDEX "MediaAsset_contentContext_idx" ON "MediaAsset"("contentContext");
CREATE INDEX "MediaAsset_themeVariant_idx" ON "MediaAsset"("themeVariant");
CREATE INDEX "MediaAsset_reviewStatus_idx" ON "MediaAsset"("reviewStatus");
CREATE INDEX "MediaAsset_archivedAt_idx" ON "MediaAsset"("archivedAt");
CREATE INDEX "MediaPair_lightAssetId_idx" ON "MediaPair"("lightAssetId");
CREATE INDEX "MediaPair_darkAssetId_idx" ON "MediaPair"("darkAssetId");
