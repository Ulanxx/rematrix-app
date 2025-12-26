import {
  defineSignal,
  defineQuery,
  setHandler,
  proxyActivities,
} from '@temporalio/workflow';
import type {
  StageRetryInput,
  StageRetryOutput,
} from '../activities/video-generation.activities';

// 定义信号用于外部控制重试过程
export const cancelRetrySignal = defineSignal('cancelRetry');
export const updateRetryReasonSignal = defineSignal('updateRetryReason');

// 定义查询用于获取重试状态
export const getRetryStatusQuery = defineQuery<{
  stage: string;
  retryCount: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  estimatedCompletion: Date;
}>('getRetryStatus');

export async function stageRetryWorkflow(
  input: StageRetryInput,
): Promise<StageRetryOutput> {
  const { jobId, stage, reason } = input;
  let retryCount = 0;
  let status: 'running' | 'completed' | 'failed' | 'cancelled' = 'running';
  const currentReason = reason;
  const startTime = new Date();

  // 设置查询处理器
  setHandler(getRetryStatusQuery, () => ({
    stage,
    retryCount,
    status,
    startTime,
    estimatedCompletion: new Date(startTime.getTime() + 5 * 60 * 1000), // 预估5分钟完成
  }));

  // 设置信号处理器
  setHandler(cancelRetrySignal, () => {
    status = 'cancelled';
  });

  setHandler(updateRetryReasonSignal, () => {
    // 信号处理逻辑，暂时为空
  });

  try {
    // 记录重试开始
    console.log(
      `开始重试阶段 ${stage}，任务ID: ${jobId}，原因: ${currentReason || '手动重试'}`,
    );
    // 这里调用现有的活动来执行重试
    // 我们需要创建一个专门的活动函数来处理单步重试
    const { executeStageRetry } = proxyActivities({
      startToCloseTimeout: '10 minutes',
    });

    // 执行重试活动
    const result = await executeStageRetry(jobId, stage, currentReason);

    status = 'completed';
    retryCount = result.retryCount || 1;

    console.log(
      `重试阶段 ${stage} 完成，任务ID: ${jobId}，重试次数: ${retryCount}`,
    );
    return {
      success: true,
      retryCount,
      artifactIds: result.artifactIds || [],
    };
  } catch (error) {
    status = 'failed';
    console.error(`重试阶段 ${stage} 失败，任务ID: ${jobId}，错误:`, error);

    return {
      success: false,
      retryCount,
      artifactIds: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
