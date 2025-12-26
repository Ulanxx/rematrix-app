import {
  condition,
  defineSignal,
  proxyActivities,
  setHandler,
  log,
  defineQuery,
} from '@temporalio/workflow';
import type { VideoGenerationInput } from '../activities/video-generation.activities';

const approveStage = defineSignal<[payload: { stage: string }]>('approveStage');
const rejectStage =
  defineSignal<[payload: { stage: string; reason?: string }]>('rejectStage');

// 定义查询接口用于调试
const getStatusQuery = defineQuery<{
  jobId: string;
  approved: Record<string, boolean>;
  rejected: Record<string, boolean>;
  rejectedReason: Record<string, string | undefined>;
  timestamp: string;
}>('getStatus');

const getApprovalStatusQuery = defineQuery<{
  plan: { approved: boolean; rejected: boolean; reason: string | undefined };
  pages: { approved: boolean; rejected: boolean; reason: string | undefined };
}>('getApprovalStatus');

const {
  runPlanStage,
  runThemeDesignStage,
  runOutlineStage,
  runStoryboardStage,
  runScriptStage,
  runPagesStage,
  markStageApproved,
  markStageRejected,
  advanceAfterPlan,
  markJobCompleted,
  checkJobAutoMode,
  incrementJobRetryCount,
} = proxyActivities<{
  runPlanStage: (input: VideoGenerationInput) => Promise<unknown>;
  runThemeDesignStage: (input: VideoGenerationInput) => Promise<unknown>;
  runOutlineStage: (input: VideoGenerationInput) => Promise<unknown>;
  runStoryboardStage: (input: VideoGenerationInput) => Promise<unknown>;
  runScriptStage: (input: VideoGenerationInput) => Promise<unknown>;
  runPagesStage: (input: VideoGenerationInput) => Promise<unknown>;
  markStageApproved: (jobId: string, stage: string) => Promise<void>;
  markStageRejected: (
    jobId: string,
    stage: string,
    reason?: string,
  ) => Promise<void>;
  advanceAfterPlan: (jobId: string) => Promise<void>;
  markJobCompleted: (jobId: string) => Promise<void>;
  checkJobAutoMode: (jobId: string) => Promise<boolean>;
  incrementJobRetryCount: (jobId: string) => Promise<number>;
}>({
  startToCloseTimeout: '10 minutes',
  retry: {
    maximumAttempts: 3,
  },
});

export async function videoGenerationWorkflow(input: VideoGenerationInput) {
  log.info('Starting video generation workflow', { jobId: input.jobId });

  const approved: Record<string, boolean> = {
    PLAN: false,
    THEME_DESIGN: false,
    OUTLINE: false,
    STORYBOARD: false,
    SCRIPT: false,
    PAGES: false,
  };
  const rejected: Record<string, boolean> = {
    PLAN: false,
    THEME_DESIGN: false,
    OUTLINE: false,
    STORYBOARD: false,
    SCRIPT: false,
    PAGES: false,
  };
  const rejectedReason: Record<string, string | undefined> = {
    PLAN: undefined,
    THEME_DESIGN: undefined,
    OUTLINE: undefined,
    STORYBOARD: undefined,
    SCRIPT: undefined,
    PAGES: undefined,
  };

  setHandler(approveStage, (payload) => {
    log.info('Received approval signal', {
      stage: payload.stage,
      jobId: input.jobId,
    });
    if (payload.stage in approved) {
      approved[payload.stage] = true;
      rejected[payload.stage] = false;
      rejectedReason[payload.stage] = undefined;
    }
  });

  setHandler(rejectStage, (payload) => {
    log.info('Received rejection signal', {
      stage: payload.stage,
      reason: payload.reason,
      jobId: input.jobId,
    });
    if (payload.stage in rejected) {
      approved[payload.stage] = false;
      rejected[payload.stage] = true;
      rejectedReason[payload.stage] = payload.reason;
    }
  });

  // 查询处理器 - 用于调试
  setHandler(getStatusQuery, () => {
    return {
      jobId: input.jobId,
      approved,
      rejected,
      rejectedReason,
      timestamp: new Date().toISOString(),
    };
  });

  setHandler(getApprovalStatusQuery, () => {
    return {
      plan: {
        approved: approved.PLAN,
        rejected: rejected.PLAN,
        reason: rejectedReason.PLAN,
      },
      themeDesign: {
        approved: approved.THEME_DESIGN,
        rejected: rejected.THEME_DESIGN,
        reason: rejectedReason.THEME_DESIGN,
      },
      outline: {
        approved: approved.OUTLINE,
        rejected: rejected.OUTLINE,
        reason: rejectedReason.OUTLINE,
      },
      storyboard: {
        approved: approved.STORYBOARD,
        rejected: rejected.STORYBOARD,
        reason: rejectedReason.STORYBOARD,
      },
      pages: {
        approved: approved.PAGES,
        rejected: rejected.PAGES,
        reason: rejectedReason.PAGES,
      },
    };
  });

  async function waitForStageApproval(
    stage:
      | 'PLAN'
      | 'THEME_DESIGN'
      | 'OUTLINE'
      | 'STORYBOARD'
      | 'SCRIPT'
      | 'PAGES',
  ) {
    log.info(`Waiting for ${stage} approval`, { jobId: input.jobId });

    // 检查是否为自动模式
    const isAutoMode = await checkJobAutoMode(input.jobId);

    if (isAutoMode) {
      log.info(`Auto-mode detected, auto-approving ${stage}`, {
        jobId: input.jobId,
      });
      approved[stage] = true;
      await markStageApproved(input.jobId, stage);
      return;
    }

    while (true) {
      await condition(
        () => approved[stage] === true || rejected[stage] === true,
      );

      if (rejected[stage]) {
        log.warn(`${stage} was rejected`, {
          jobId: input.jobId,
          reason: rejectedReason[stage],
        });
        await markStageRejected(input.jobId, stage, rejectedReason[stage]);
        rejected[stage] = false;
        rejectedReason[stage] = undefined;
        continue;
      }

      if (approved[stage]) {
        log.info(`${stage} was approved`, { jobId: input.jobId });
        break;
      }
    }

    await markStageApproved(input.jobId, stage);
  }

  // 自动重试辅助函数
  async function executeStageWithRetry<T>(
    stageName: string,
    stageFunction: () => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          log.info(`Retrying ${stageName} stage`, {
            jobId: input.jobId,
            attempt: attempt + 1,
          });
        }

        const result = await stageFunction();

        // 成功执行，重置重试计数
        if (attempt > 0) {
          log.info(`${stageName} stage succeeded on retry ${attempt + 1}`, {
            jobId: input.jobId,
          });
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // 检查是否为自动模式且可以重试
        const isAutoMode = await checkJobAutoMode(input.jobId);
        const retryCount = await incrementJobRetryCount(input.jobId);

        if (isAutoMode && attempt < maxRetries) {
          log.warn(`${stageName} stage failed, will retry`, {
            jobId: input.jobId,
            attempt: attempt + 1,
            error: lastError.message,
            retryCount,
          });
          continue;
        } else if (!isAutoMode) {
          log.error(`${stageName} stage failed in manual mode`, {
            jobId: input.jobId,
            error: lastError.message,
          });
          throw lastError;
        } else {
          log.error(`${stageName} stage failed, max retries reached`, {
            jobId: input.jobId,
            attempt: attempt + 1,
            error: lastError.message,
          });
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Unknown error occurred');
  }

  try {
    log.info('Starting PLAN stage', { jobId: input.jobId });
    await executeStageWithRetry('PLAN', () => runPlanStage(input));

    log.info('Waiting for PLAN approval', { jobId: input.jobId });
    await waitForStageApproval('PLAN');

    log.info('Advancing after PLAN', { jobId: input.jobId });
    await advanceAfterPlan(input.jobId);

    log.info('Starting THEME_DESIGN stage', { jobId: input.jobId });
    await executeStageWithRetry('THEME_DESIGN', () =>
      runThemeDesignStage(input),
    );

    log.info('Waiting for THEME_DESIGN approval', { jobId: input.jobId });
    await waitForStageApproval('THEME_DESIGN');

    log.info('Starting OUTLINE stage', { jobId: input.jobId });
    await executeStageWithRetry('OUTLINE', () => runOutlineStage(input));

    log.info('Waiting for OUTLINE approval', { jobId: input.jobId });
    await waitForStageApproval('OUTLINE');

    log.info('Starting STORYBOARD stage', { jobId: input.jobId });
    await executeStageWithRetry('STORYBOARD', () => runStoryboardStage(input));

    log.info('Waiting for STORYBOARD approval', { jobId: input.jobId });
    await waitForStageApproval('STORYBOARD');

    log.info('Starting SCRIPT stage', { jobId: input.jobId });
    await executeStageWithRetry('SCRIPT', () => runScriptStage(input));

    log.info('Waiting for SCRIPT approval', { jobId: input.jobId });
    await waitForStageApproval('SCRIPT');

    log.info('Starting PAGES stage', { jobId: input.jobId });
    await executeStageWithRetry('PAGES', () => runPagesStage(input));
    await waitForStageApproval('PAGES');

    log.info('Marking job as completed', { jobId: input.jobId });
    await markJobCompleted(input.jobId);

    log.info('Video generation workflow completed successfully', {
      jobId: input.jobId,
    });
    return {
      jobId: input.jobId,
      nextStage: 'DONE',
    };
  } catch (error) {
    log.error('Video generation workflow failed', {
      jobId: input.jobId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error instanceof Error ? error : new Error(String(error));
  }
}
