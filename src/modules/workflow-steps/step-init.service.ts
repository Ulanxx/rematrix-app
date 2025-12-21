import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { StepRegistryService } from './step-registry.service';
import { allStepDefinitions } from './index';

/**
 * Step 初始化服务
 * 负责在模块启动时自动注册所有的工作流步骤
 */
@Injectable()
export class StepInitService implements OnModuleInit {
  private readonly logger = new Logger(StepInitService.name);

  constructor(private readonly stepRegistry: StepRegistryService) {}

  /**
   * 模块初始化时自动注册所有步骤
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing workflow steps...');

    try {
      // 批量注册所有步骤定义
      this.stepRegistry.registerBatch(allStepDefinitions);

      // 验证注册结果
      const stats = this.stepRegistry.getStats();
      this.logger.log(`Successfully registered ${stats.total} steps`);

      // 按类型统计
      for (const [type, count] of Object.entries(stats.byType)) {
        this.logger.log(`  ${type}: ${count} steps`);
      }

      // 验证依赖关系
      const dependencyValidation = this.stepRegistry.validateDependencies();
      if (!dependencyValidation.isValid) {
        this.logger.error(
          'Step dependency validation failed:',
          dependencyValidation.errors,
        );
        throw new Error(
          `Step dependency validation failed: ${dependencyValidation.errors.join(', ')}`,
        );
      }

      // 验证所有步骤
      const allValidation = this.stepRegistry.validateAll();
      const invalidSteps = allValidation.filter((result) => !result.isValid);
      if (invalidSteps.length > 0) {
        this.logger.error('Some steps failed validation:');
        for (const result of invalidSteps) {
          this.logger.error(`  ${result.stage}: ${result.errors.join(', ')}`);
        }
        throw new Error('Step validation failed');
      }

      this.logger.log('Workflow steps initialization completed successfully');

      // 输出执行顺序
      const stepsInOrder = this.stepRegistry.getStepsInExecutionOrder();
      this.logger.log(
        `Execution order: ${stepsInOrder.map((step) => step.stage).join(' → ')}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize workflow steps', error);
      throw error;
    }
  }

  /**
   * 重新初始化所有步骤（用于开发时的热重载）
   */
  async reinitialize(): Promise<void> {
    this.logger.log('Reinitializing workflow steps...');

    // 清空现有注册
    this.stepRegistry.clear();

    // 重新初始化
    await this.onModuleInit();
  }

  /**
   * 获取初始化状态信息
   */
  getInitializationStatus(): {
    isInitialized: boolean;
    registeredSteps: string[];
    stats: any;
  } {
    const steps = this.stepRegistry.getAll();
    const stats = this.stepRegistry.getStats();

    return {
      isInitialized: steps.length > 0,
      registeredSteps: steps.map((step) => step.stage),
      stats,
    };
  }
}
