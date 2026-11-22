-- AlterTable
ALTER TABLE "AvailableAction" ADD COLUMN     "secretFields" TEXT[] DEFAULT ARRAY[]::TEXT[];

