-- AlterTable
ALTER TABLE "Zap" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ZapRun" ADD COLUMN     "actions" JSONB;

