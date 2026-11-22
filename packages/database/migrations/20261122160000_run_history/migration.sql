-- AlterTable
ALTER TABLE "ZapRun" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'queued';

-- Runs that already left the outbox predate run history, so their outcome was never recorded.
UPDATE "ZapRun" SET "status" = 'unknown'
WHERE "id" NOT IN (SELECT "zapRunId" FROM "ZapRunOutbox");

-- AlterTable
ALTER TABLE "ZapRunOutbox" ADD COLUMN     "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stage" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ZapRunStep" (
    "id" TEXT NOT NULL,
    "zapRunId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "actionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "output" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZapRunStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZapRunStep_zapRunId_stage_key" ON "ZapRunStep"("zapRunId", "stage");

-- CreateIndex
CREATE INDEX "ZapRun_zapId_createdAt_idx" ON "ZapRun"("zapId", "createdAt");

-- CreateIndex
CREATE INDEX "ZapRunOutbox_availableAt_idx" ON "ZapRunOutbox"("availableAt");

-- AddForeignKey
ALTER TABLE "ZapRunStep" ADD CONSTRAINT "ZapRunStep_zapRunId_fkey" FOREIGN KEY ("zapRunId") REFERENCES "ZapRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

