import { ApprovalStatus, JobStage, JobStatus } from '@prisma/client';
import { StepExecutorService } from '../../modules/workflow-steps/step-executor.service';
import { StepRegistryService } from '../../modules/workflow-steps/step-registry.service';
import { PromptopsService } from '../../modules/promptops/promptops.service';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { allStepDefinitions } from '../../modules/workflow-steps';
import { CreateJobDto } from '../../modules/jobs/dto/create-job.dto';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL');
}

// 创建服务实例
const prismaService = new PrismaService();
const prisma = prismaService;
const promptopsService = new PromptopsService(prismaService);
const stepRegistryService = new StepRegistryService();

// 注册所有步骤定义
stepRegistryService.registerBatch(allStepDefinitions);

const stepExecutorService = new StepExecutorService(
  stepRegistryService,
  prismaService,
  promptopsService,
);

export type VideoGenerationInput = {
  jobId: string;
  config: CreateJobDto;
};

export type StageRetryInput = {
  jobId: string;
  stage: string;
  reason?: string;
};

export type StageRetryOutput = {
  success: boolean;
  retryCount: number;
  artifactIds: string[];
  error?: string;
};

export async function ensureJob(jobId: string) {
  await prisma.job.upsert({
    where: { id: jobId },
    update: {},
    create: {
      id: jobId,
      status: JobStatus.DRAFT,
      currentStage: JobStage.PLAN,
    },
  });
}

/**
 * 使用新的 Step 架构执行指定阶段
 */
async function executeStageWithNewArchitecture(
  stage: JobStage,
  input: VideoGenerationInput,
): Promise<unknown> {
  try {
    console.log(
      `[Activities] Executing stage ${stage} with new Step architecture`,
    );
    console.log(`[Activities] Input for stage ${stage}:`, {
      jobId: input.jobId,
      config: input.config,
    });

    const result = await stepExecutorService.execute(
      stage,
      input.jobId,
      input.config,
    );

    console.log(`[Activities] Result for stage ${stage}:`, {
      success: result.success,
      error: result.error,
      output: result.output,
      metadata: result.metadata,
    });

    if (!result.success) {
      // 打印更详细的错误信息，包括可能的 AI 模型返回值
      console.error(`[Activities] Stage ${stage} failed:`, {
        error: result.error,
        output: result.output,
        metadata: result.metadata,
      });
      throw new Error(result.error || 'Stage execution failed');
    }

    return result.output;
  } catch (error) {
    console.error(`[StepExecutor] Failed to execute stage ${stage}`, error);

    // 如果错误包含 AI 模型的返回信息，打印出来
    if (
      error instanceof Error &&
      error.message.includes('response did not match schema')
    ) {
      console.error(
        `[Activities] Schema mismatch error details:`,
        error.message,
      );
      console.error(`[Activities] Full error stack:`, error.stack);
    }

    throw error;
  }
}

// 重构后的阶段执行函数，委托给新的 Step 架构

export async function runPlanStage(
  input: VideoGenerationInput,
): Promise<unknown> {
  console.log('[Activities] Running PLAN stage with new Step architecture');
  return await executeStageWithNewArchitecture(JobStage.PLAN, input);
}

export async function runThemeDesignStage(
  input: VideoGenerationInput,
): Promise<unknown> {
  console.log(
    '[Activities] Running THEME_DESIGN stage with new Step architecture',
  );
  return await executeStageWithNewArchitecture(JobStage.THEME_DESIGN, input);
}

export async function runOutlineStage(
  input: VideoGenerationInput,
): Promise<unknown> {
  console.log('[Activities] Running OUTLINE stage with new Step architecture');
  return await executeStageWithNewArchitecture(JobStage.OUTLINE, input);
}

export async function runStoryboardStage(
  input: VideoGenerationInput,
): Promise<unknown> {
  console.log(
    '[Activities] Running STORYBOARD stage with new Step architecture',
  );
  return await executeStageWithNewArchitecture(JobStage.STORYBOARD, input);
}

export async function runScriptStage(
  input: VideoGenerationInput,
): Promise<unknown> {
  console.log('[Activities] Running SCRIPT stage with new Step architecture');
  return await executeStageWithNewArchitecture(JobStage.SCRIPT, input);
}

export async function runPagesStage(
  input: VideoGenerationInput,
): Promise<unknown> {
  console.log('[Activities] Running PAGES stage with new Step architecture');
  return await executeStageWithNewArchitecture(JobStage.PAGES, input);
}

export async function runDoneStage(
  input: VideoGenerationInput,
): Promise<unknown> {
  console.log('[Activities] Running DONE stage with new Step architecture');
  return await executeStageWithNewArchitecture(JobStage.DONE, input);
}

// 辅助函数，保持向后兼容（暂时保留，可能在未来版本中移除）

// 审批相关函数保持不变

export async function approveStage(params: { jobId: string; stage: JobStage }) {
  await prisma.approval.upsert({
    where: { jobId_stage: { jobId: params.jobId, stage: params.stage } },
    update: { status: ApprovalStatus.APPROVED, comment: null },
    create: {
      jobId: params.jobId,
      stage: params.stage,
      status: ApprovalStatus.APPROVED,
    },
  });

  await prisma.job.update({
    where: { id: params.jobId },
    data: { status: JobStatus.RUNNING },
  });
}

export async function markStageApproved(jobId: string, stage: string) {
  await prisma.approval.upsert({
    where: { jobId_stage: { jobId, stage: stage as JobStage } },
    update: { status: ApprovalStatus.APPROVED, comment: null },
    create: {
      jobId,
      stage: stage as JobStage,
      status: ApprovalStatus.APPROVED,
    },
  });

  await prisma.job.update({
    where: { id: jobId },
    data: { status: JobStatus.RUNNING },
  });
}

export async function rejectStage(params: {
  jobId: string;
  stage: JobStage;
  reason?: string;
}) {
  await prisma.approval.upsert({
    where: { jobId_stage: { jobId: params.jobId, stage: params.stage } },
    update: {
      status: ApprovalStatus.REJECTED,
      comment: params.reason ?? 'Rejected by user',
    },
    create: {
      jobId: params.jobId,
      stage: params.stage,
      status: ApprovalStatus.REJECTED,
      comment: params.reason ?? 'Rejected by user',
    },
  });

  await prisma.job.update({
    where: { id: params.jobId },
    data: {
      status: JobStatus.FAILED,
      error: params.reason ?? 'Stage rejected by user',
    },
  });
}

// 工作流辅助函数

export async function markJobCompleted(jobId: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.COMPLETED,
      currentStage: JobStage.DONE,
    },
  });
}

export function advanceAfterPlan() {
  // 这个函数在原始实现中有特定的业务逻辑
  // 在新架构中，这些逻辑已经集成到 StepExecutor 中
  console.log('[Activities] Advancing after PLAN stage');
}

export function advanceAfterNarration() {
  console.log('[Activities] Advancing after NARRATION stage');
}

export function advanceAfterPages() {
  console.log('[Activities] Advancing after PAGES stage');
}

// 自动模式支持函数
export async function checkJobAutoMode(jobId: string): Promise<boolean> {
  console.log(`[Activities] Checking auto mode for job ${jobId}`);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { autoMode: true },
  });

  if (!job) {
    console.warn(`[Activities] Job ${jobId} not found when checking auto mode`);
    return false;
  }

  console.log(`[Activities] Job ${jobId} auto mode: ${job.autoMode}`);
  return job.autoMode || false;
}

export async function incrementJobRetryCount(jobId: string): Promise<number> {
  console.log(`[Activities] Incrementing retry count for job ${jobId}`);

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { retryCount: true },
  });

  if (!job) {
    console.warn(
      `[Activities] Job ${jobId} not found when incrementing retry count`,
    );
    return 0;
  }

  const newRetryCount = job.retryCount + 1;

  await prisma.job.update({
    where: { id: jobId },
    data: { retryCount: newRetryCount },
  });

  console.log(
    `[Activities] Job ${jobId} retry count updated to ${newRetryCount}`,
  );
  return newRetryCount;
}

/**
 * 执行单步重试活动
 */
export async function executeStageRetry(
  jobId: string,
  stage: string,
  reason?: string,
): Promise<StageRetryOutput> {
  console.log(
    `[Activities] Starting stage retry for job ${jobId}, stage: ${stage}, reason: ${reason || 'manual retry'}`,
  );
  try {
    // 获取当前任务信息
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        status: true,
        currentStage: true,
        retryCount: true,
        autoMode: true,
      },
    });

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // 更新任务状态为进行中（如果当前是失败状态）
    if (job.status === JobStatus.FAILED) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: JobStatus.RUNNING },
      });
    }

    // 增加重试计数
    const retryCount = await incrementJobRetryCount(jobId);

    // 使用 StepExecutorService 执行重试
    await stepExecutorService.execute(stage as JobStage, jobId, undefined, {
      forceRerun: true,
    });

    // 获取生成的 artifacts
    const artifacts = await prisma.artifact.findMany({
      where: {
        jobId,
        stage: stage as JobStage,
      },
      select: { id: true },
      orderBy: { version: 'desc' },
      take: 10,
    });

    const artifactIds = artifacts.map((a) => a.id);

    console.log(
      `[Activities] Stage retry completed for job ${jobId}, stage: ${stage}, artifacts: ${artifactIds.length}`,
    );
    return {
      success: true,
      retryCount,
      artifactIds,
    };
  } catch (error) {
    console.error(
      `[Activities] Stage retry failed for job ${jobId}, stage: ${stage}:`,
      error,
    );

    // 更新任务状态为失败
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        currentStage: stage as JobStage,
      },
    });

    return {
      success: false,
      retryCount: 0,
      artifactIds: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 导出服务实例供其他模块使用
export {
  stepRegistryService,
  stepExecutorService,
  promptopsService,
  prismaService,
};
