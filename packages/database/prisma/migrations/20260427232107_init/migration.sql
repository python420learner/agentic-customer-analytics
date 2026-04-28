-- CreateTable
CREATE TABLE "CustomerEvent" (
    "id" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "eventName" TEXT NOT NULL,
    "pageUrl" TEXT,
    "productId" TEXT,
    "category" TEXT,
    "value" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "userId" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "totalCartAdds" INTEGER NOT NULL DEFAULT 0,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerEvent_anonymousId_idx" ON "CustomerEvent"("anonymousId");

-- CreateIndex
CREATE INDEX "CustomerEvent_userId_idx" ON "CustomerEvent"("userId");

-- CreateIndex
CREATE INDEX "CustomerEvent_sessionId_idx" ON "CustomerEvent"("sessionId");

-- CreateIndex
CREATE INDEX "CustomerEvent_eventName_idx" ON "CustomerEvent"("eventName");

-- CreateIndex
CREATE INDEX "CustomerEvent_createdAt_idx" ON "CustomerEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_anonymousId_key" ON "CustomerProfile"("anonymousId");
