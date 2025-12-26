-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "autoMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- DropIndex
DROP INDEX IF EXISTS "Job_userId_index";

-- DropIndex
DROP INDEX IF EXISTS "Job_status_index";

-- DropIndex
DROP INDEX IF EXISTS "Job_currentStage_index";

-- CreateIndex
CREATE INDEX "Job_userId_index" ON "Job"("userId");

-- CreateIndex
CREATE INDEX "Job_status_index" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_currentStage_index" ON "Job"("currentStage");

-- CreateIndex
CREATE INDEX "Job_autoMode_index" ON "Job"("autoMode");
