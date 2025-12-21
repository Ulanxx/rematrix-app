-- CreateTable
CREATE TABLE "WorkflowCommand" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "params" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowCommand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowCommand_jobId_createdAt_idx" ON "WorkflowCommand"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowCommand_jobId_status_idx" ON "WorkflowCommand"("jobId", "status");

-- AddForeignKey
ALTER TABLE "WorkflowCommand" ADD CONSTRAINT "WorkflowCommand_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
