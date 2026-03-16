-- CreateTable
CREATE TABLE "feature_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" DATETIME,
    CONSTRAINT "feature_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "feature_notifications_userId_featureId_key" ON "feature_notifications"("userId", "featureId");

-- CreateIndex
CREATE INDEX "feature_notifications_featureId_notifiedAt_idx" ON "feature_notifications"("featureId", "notifiedAt");

-- CreateIndex
CREATE INDEX "feature_notifications_userId_createdAt_idx" ON "feature_notifications"("userId", "createdAt");
