-- CreateTable
CREATE TABLE "TravelPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "japaneseTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "heroImage" TEXT NOT NULL,
    "priceBaseUsd" REAL NOT NULL,
    "seasonTag" TEXT NOT NULL,
    "seasonLabel" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "rating" REAL NOT NULL DEFAULT 4.9,
    "reviewsCount" INTEGER NOT NULL DEFAULT 120,
    "highlights" TEXT NOT NULL,
    "itinerarySummary" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BookingOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingCode" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "packTitle" TEXT NOT NULL,
    "travelerName" TEXT NOT NULL,
    "travelerEmail" TEXT NOT NULL,
    "travelersCount" INTEGER NOT NULL,
    "travelDate" TEXT NOT NULL,
    "seasonSelected" TEXT NOT NULL,
    "totalPriceUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "qrData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingOrder_packId_fkey" FOREIGN KEY ("packId") REFERENCES "TravelPack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AgentMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TravelerPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "budgetTier" TEXT,
    "preferredSeason" TEXT,
    "interests" TEXT,
    "groupSize" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TravelerPreference_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AgentSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TravelerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT 'Hana Yamamoto',
    "passportNumberMasked" TEXT NOT NULL DEFAULT 'ES · A4829311',
    "passportExpiry" TEXT NOT NULL DEFAULT 'Jun 2030',
    "nationality" TEXT NOT NULL DEFAULT 'España',
    "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ES',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentMethodToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "vaultToken" TEXT NOT NULL,
    "cardBrand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL DEFAULT 'Mensual',
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentMethodToken_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TravelerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "QuizResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "travelStyle" TEXT NOT NULL,
    "personalizedCard" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuizSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BucketListItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "refId" TEXT,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CustomPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "groupType" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "itineraryJson" TEXT NOT NULL,
    "budgetPerPersonUsd" REAL NOT NULL,
    "totalBudgetUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "TravelPack_slug_key" ON "TravelPack"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BookingOrder_bookingCode_key" ON "BookingOrder"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "AgentSession_sessionToken_key" ON "AgentSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "TravelerPreference_sessionId_key" ON "TravelerPreference"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TravelerProfile_sessionToken_key" ON "TravelerProfile"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethodToken_vaultToken_key" ON "PaymentMethodToken"("vaultToken");

-- CreateIndex
CREATE UNIQUE INDEX "QuizSession_sessionToken_key" ON "QuizSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResult_sessionId_key" ON "QuizResult"("sessionId");
