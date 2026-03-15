-- AlterTable
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "contentBlocks" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnouncementCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnnouncementTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnnouncementCategoryLink" (
    "announcementId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    PRIMARY KEY ("announcementId", "categoryId"),
    CONSTRAINT "AnnouncementCategoryLink_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnnouncementCategoryLink_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AnnouncementCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnouncementTagLink" (
    "announcementId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("announcementId", "tagId"),
    CONSTRAINT "AnnouncementTagLink_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnnouncementTagLink_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "AnnouncementTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnouncementRoleVisibility" (
    "announcementId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("announcementId", "roleId"),
    CONSTRAINT "AnnouncementRoleVisibility_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnnouncementRoleVisibility_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategorySubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmationTokenHash" TEXT,
    "confirmedAt" DATETIME,
    "declinedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "subscribedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CategorySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CategorySubscription_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AnnouncementCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CategorySubscription_subscribedById_fkey" FOREIGN KEY ("subscribedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnouncementDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "announcementId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "externalMessageId" TEXT,
    "errorMessage" TEXT,
    "bounceType" TEXT,
    "twilioErrorCode" TEXT,
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "lastEventAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AnnouncementDelivery_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnnouncementDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CategorySubscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnnouncementDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliveryEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deliveryId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "providerEventId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryEvent_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "AnnouncementDelivery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SmsSuppression" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "providerEventId" TEXT,
    "removedAt" DATETIME,
    "removedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SmsSuppression_removedBy_fkey" FOREIGN KEY ("removedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TwilioSenderRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "prefixes" TEXT NOT NULL,
    "isDefault" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExpressionOfInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT,
    "metadata" TEXT,
    "sourcePage" TEXT NOT NULL,
    "sourceCategory" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "consentVersion" TEXT NOT NULL,
    "privacyAcceptedAt" DATETIME NOT NULL,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "confirmationSentAt" DATETIME,
    "postmarkMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    "archivedBy" TEXT
);
INSERT INTO "new_ExpressionOfInterest" ("archivedAt", "archivedBy", "category", "confirmationSentAt", "consentVersion", "createdAt", "email", "id", "locale", "marketingOptIn", "message", "metadata", "name", "postmarkMessageId", "privacyAcceptedAt", "sourceCategory", "sourcePage", "status", "updatedAt", "utmCampaign", "utmMedium", "utmSource") SELECT "archivedAt", "archivedBy", "category", "confirmationSentAt", "consentVersion", "createdAt", "email", "id", "locale", "marketingOptIn", "message", "metadata", "name", "postmarkMessageId", "privacyAcceptedAt", "sourceCategory", "sourcePage", "status", "updatedAt", "utmCampaign", "utmMedium", "utmSource" FROM "ExpressionOfInterest";
DROP TABLE "ExpressionOfInterest";
ALTER TABLE "new_ExpressionOfInterest" RENAME TO "ExpressionOfInterest";
CREATE INDEX "ExpressionOfInterest_email_idx" ON "ExpressionOfInterest"("email");
CREATE INDEX "ExpressionOfInterest_category_idx" ON "ExpressionOfInterest"("category");
CREATE INDEX "ExpressionOfInterest_status_idx" ON "ExpressionOfInterest"("status");
CREATE INDEX "ExpressionOfInterest_createdAt_idx" ON "ExpressionOfInterest"("createdAt");
CREATE INDEX "ExpressionOfInterest_sourcePage_idx" ON "ExpressionOfInterest"("sourcePage");
CREATE INDEX "ExpressionOfInterest_locale_idx" ON "ExpressionOfInterest"("locale");
CREATE INDEX "ExpressionOfInterest_confirmationSentAt_idx" ON "ExpressionOfInterest"("confirmationSentAt");
CREATE INDEX "ExpressionOfInterest_category_status_createdAt_idx" ON "ExpressionOfInterest"("category", "status", "createdAt");
CREATE INDEX "ExpressionOfInterest_email_createdAt_idx" ON "ExpressionOfInterest"("email", "createdAt");
CREATE INDEX "ExpressionOfInterest_status_createdAt_idx" ON "ExpressionOfInterest"("status", "createdAt");
CREATE TABLE "new_MediaAsset" (
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
    "attributionRequired" BOOLEAN NOT NULL DEFAULT true,
    "attributionText" TEXT,
    "aiAssisted" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "hasFirstNationsPermission" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_MediaAsset" ("aiAssisted", "aiGenerated", "alt", "archivedAt", "archivedBy", "attributionRequired", "attributionText", "averageColor", "checksum", "contentContext", "createdAt", "culturalNotes", "downloadUrl", "downloadedAt", "externalId", "externalUrl", "fileSize", "hasFirstNationsPermission", "id", "license", "localPath", "mimeType", "originalAlt", "originalHeight", "originalWidth", "photographer", "photographerId", "photographerUrl", "publicPath", "reviewNotes", "reviewStatus", "reviewedAt", "source", "sourcingAgent", "sourcingPrompt", "themeVariant", "updatedAt") SELECT "aiAssisted", "aiGenerated", "alt", "archivedAt", "archivedBy", "attributionRequired", "attributionText", "averageColor", "checksum", "contentContext", "createdAt", "culturalNotes", "downloadUrl", "downloadedAt", "externalId", "externalUrl", "fileSize", "hasFirstNationsPermission", "id", "license", "localPath", "mimeType", "originalAlt", "originalHeight", "originalWidth", "photographer", "photographerId", "photographerUrl", "publicPath", "reviewNotes", "reviewStatus", "reviewedAt", "source", "sourcingAgent", "sourcingPrompt", "themeVariant", "updatedAt" FROM "MediaAsset";
DROP TABLE "MediaAsset";
ALTER TABLE "new_MediaAsset" RENAME TO "MediaAsset";
CREATE INDEX "MediaAsset_contentContext_idx" ON "MediaAsset"("contentContext");
CREATE INDEX "MediaAsset_themeVariant_idx" ON "MediaAsset"("themeVariant");
CREATE INDEX "MediaAsset_reviewStatus_idx" ON "MediaAsset"("reviewStatus");
CREATE INDEX "MediaAsset_archivedAt_idx" ON "MediaAsset"("archivedAt");
CREATE UNIQUE INDEX "MediaAsset_source_externalId_key" ON "MediaAsset"("source", "externalId");
CREATE TABLE "new_NotificationPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NotificationPreference" ("channel", "createdAt", "enabled", "id", "updatedAt", "userId") SELECT "channel", "createdAt", "enabled", "id", "updatedAt", "userId" FROM "NotificationPreference";
DROP TABLE "NotificationPreference";
ALTER TABLE "new_NotificationPreference" RENAME TO "NotificationPreference";
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");
CREATE INDEX "NotificationPreference_channel_idx" ON "NotificationPreference"("channel");
CREATE UNIQUE INDEX "NotificationPreference_userId_channel_key" ON "NotificationPreference"("userId", "channel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Announcement_slug_key" ON "Announcement"("slug");

-- CreateIndex
CREATE INDEX "Announcement_status_idx" ON "Announcement"("status");

-- CreateIndex
CREATE INDEX "Announcement_visibility_idx" ON "Announcement"("visibility");

-- CreateIndex
CREATE INDEX "Announcement_publishedAt_idx" ON "Announcement"("publishedAt");

-- CreateIndex
CREATE INDEX "Announcement_authorId_idx" ON "Announcement"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementCategory_name_key" ON "AnnouncementCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementCategory_slug_key" ON "AnnouncementCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementTag_name_key" ON "AnnouncementTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementTag_slug_key" ON "AnnouncementTag"("slug");

-- CreateIndex
CREATE INDEX "CategorySubscription_userId_idx" ON "CategorySubscription"("userId");

-- CreateIndex
CREATE INDEX "CategorySubscription_categoryId_idx" ON "CategorySubscription"("categoryId");

-- CreateIndex
CREATE INDEX "CategorySubscription_status_idx" ON "CategorySubscription"("status");

-- CreateIndex
CREATE INDEX "CategorySubscription_expiresAt_idx" ON "CategorySubscription"("expiresAt");

-- CreateIndex
CREATE INDEX "CategorySubscription_confirmationTokenHash_idx" ON "CategorySubscription"("confirmationTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "CategorySubscription_userId_categoryId_channel_key" ON "CategorySubscription"("userId", "categoryId", "channel");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_announcementId_idx" ON "AnnouncementDelivery"("announcementId");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_userId_idx" ON "AnnouncementDelivery"("userId");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_status_idx" ON "AnnouncementDelivery"("status");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_subscriptionId_idx" ON "AnnouncementDelivery"("subscriptionId");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_externalMessageId_channel_idx" ON "AnnouncementDelivery"("externalMessageId", "channel");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_announcementId_status_idx" ON "AnnouncementDelivery"("announcementId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementDelivery_announcementId_userId_channel_key" ON "AnnouncementDelivery"("announcementId", "userId", "channel");

-- CreateIndex
CREATE INDEX "DeliveryEvent_deliveryId_idx" ON "DeliveryEvent"("deliveryId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryEvent_deliveryId_providerEventId_key" ON "DeliveryEvent"("deliveryId", "providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "SmsSuppression_phoneNumber_key" ON "SmsSuppression"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TwilioSenderRoute_phoneNumber_key" ON "TwilioSenderRoute"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
