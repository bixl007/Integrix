-- AlterTable
ALTER TABLE "OtpCode" ADD COLUMN     "email" TEXT,
ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'auth';

