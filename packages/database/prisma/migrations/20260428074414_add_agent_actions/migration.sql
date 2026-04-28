-- CreateTable
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentAction_agentName_idx" ON "AgentAction"("agentName");

-- CreateIndex
CREATE INDEX "AgentAction_actionType_idx" ON "AgentAction"("actionType");

-- CreateIndex
CREATE INDEX "AgentAction_anonymousId_idx" ON "AgentAction"("anonymousId");

-- CreateIndex
CREATE INDEX "AgentAction_status_idx" ON "AgentAction"("status");
