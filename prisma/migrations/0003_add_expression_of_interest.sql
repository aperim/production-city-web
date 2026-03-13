-- CreateTable
CREATE TABLE "ExpressionOfInterest" (
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
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" DATETIME,
    "archivedBy" TEXT
);

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_email_idx" ON "ExpressionOfInterest"("email");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_category_idx" ON "ExpressionOfInterest"("category");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_status_idx" ON "ExpressionOfInterest"("status");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_createdAt_idx" ON "ExpressionOfInterest"("createdAt");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_sourcePage_idx" ON "ExpressionOfInterest"("sourcePage");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_locale_idx" ON "ExpressionOfInterest"("locale");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_confirmationSentAt_idx" ON "ExpressionOfInterest"("confirmationSentAt");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_category_status_createdAt_idx" ON "ExpressionOfInterest"("category", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_email_createdAt_idx" ON "ExpressionOfInterest"("email", "createdAt");

-- CreateIndex
CREATE INDEX "ExpressionOfInterest_status_createdAt_idx" ON "ExpressionOfInterest"("status", "createdAt");
