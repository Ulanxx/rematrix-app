import { Injectable, Logger } from '@nestjs/common';
import { PromptopsService } from './promptops.service';
import { JobStage } from '@prisma/client';

@Injectable()
export class PromptopsInitService {
  private readonly logger = new Logger(PromptopsInitService.name);

  constructor(private readonly promptopsService: PromptopsService) {}

  /**
   * 初始化所有阶段的默认配置
   * 这个方法应该在应用启动时调用，确保所有阶段都有可用的配置
   */
  async initializeAllStages(): Promise<void> {
    this.logger.log('开始初始化所有 PromptOps 阶段配置...');

    const stages = Object.values(JobStage);
    const results: { stage: JobStage; success: boolean; error?: string }[] = [];

    for (const stage of stages) {
      try {
        // 检查是否已有活跃配置
        const existingConfig =
          await this.promptopsService.getActiveConfig(stage);

        if (existingConfig) {
          this.logger.log(`阶段 ${stage} 已有活跃配置: ${existingConfig.id}`);
          results.push({ stage, success: true });
          continue;
        }

        // 如果没有配置，则初始化默认配置
        this.logger.log(`为阶段 ${stage} 初始化默认配置...`);
        const bootstrapped = await this.promptopsService.bootstrap(stage);

        if (bootstrapped.activeConfig) {
          this.logger.log(
            `阶段 ${stage} 初始化成功: ${bootstrapped.activeConfig.id}`,
          );
          results.push({ stage, success: true });
        } else {
          throw new Error('Bootstrap 返回的 activeConfig 为空');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`阶段 ${stage} 初始化失败: ${errorMsg}`);
        results.push({ stage, success: false, error: errorMsg });
      }
    }

    // 输出初始化结果摘要
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    this.logger.log(
      `PromptOps 初始化完成: ${successCount} 成功, ${failureCount} 失败`,
    );

    if (failureCount > 0) {
      const failures = results.filter((r) => !r.success);
      this.logger.error(
        '失败的阶段:',
        failures.map((f) => `${f.stage}: ${f.error}`).join(', '),
      );
    }
  }

  /**
   * 获取初始化状态
   */
  async getInitializationStatus(): Promise<{
    total: number;
    initialized: number;
    pending: number;
    stages: { stage: JobStage; hasConfig: boolean; configId?: string }[];
  }> {
    const stages = Object.values(JobStage);
    const stageStatuses: {
      stage: JobStage;
      hasConfig: boolean;
      configId?: string;
    }[] = [];

    for (const stage of stages) {
      const config = await this.promptopsService.getActiveConfig(stage);
      stageStatuses.push({
        stage,
        hasConfig: !!config,
        configId: config?.id,
      });
    }

    const initialized = stageStatuses.filter((s) => s.hasConfig).length;
    const pending = stageStatuses.length - initialized;

    return {
      total: stageStatuses.length,
      initialized,
      pending,
      stages: stageStatuses,
    };
  }
}
