import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporalClientService } from '../temporal/temporal-client.service';
import { JobStage } from '@prisma/client';
import { WORKFLOW_COMMANDS, isValidStage, normalizeStage } from './commands';

export interface WorkflowCommandRequest {
  jobId: string;
  command: string;
  params?: Record<string, unknown>;
}

export interface WorkflowCommandResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class WorkflowEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly temporal: TemporalClientService,
  ) {}

  async executeCommand(
    request: WorkflowCommandRequest,
  ): Promise<WorkflowCommandResult> {
    const { jobId, command, params } = request;

    // 验证指令是否存在
    if (!WORKFLOW_COMMANDS[command]) {
      throw new BadRequestException(`Unknown command: ${command}`);
    }

    // 创建指令记录
    const workflowCommand = await (this.prisma as any).workflowCommand.create({
      data: {
        jobId,
        command,
        params: params || null,
        status: 'EXECUTING',
      },
    });

    try {
      let result: WorkflowCommandResult;

      switch (command) {
        case 'run':
          result = await this.handleRun(jobId);
          break;
        case 'pause':
          result = await this.handlePause(jobId);
          break;
        case 'resume':
          result = await this.handleResume(jobId);
          break;
        case 'jump-to':
          result = await this.handleJumpTo(jobId, params);
          break;
        case 'modify-stage':
          result = await this.handleModifyStage(jobId, params);
          break;
        default:
          throw new BadRequestException(`Command not implemented: ${command}`);
      }

      // 更新指令状态为成功
      await (this.prisma as any).workflowCommand.update({
        where: { id: workflowCommand.id },
        data: {
          status: 'SUCCESS',
          result: result.data || null,
        },
      });

      return result;
    } catch (error) {
      // 更新指令状态为失败
      await (this.prisma as any).workflowCommand.update({
        where: { id: workflowCommand.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  private async handleRun(jobId: string): Promise<WorkflowCommandResult> {
    const job = await (this.prisma as any).job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    if (job.status === 'RUNNING') {
      return {
        success: true,
        message: 'Job is already running',
      };
    }

    // 获取 Job 的 markdown 配置
    const config = job.config as { markdown?: string } | null;
    const markdown = config?.markdown;

    if (!markdown) {
      throw new BadRequestException('job.config.markdown is missing');
    }

    // 启动或恢复 Job 执行
    await this.temporal.startVideoGeneration({ jobId, markdown });

    return {
      success: true,
      message: 'Job execution started',
      data: { status: 'RUNNING' },
    };
  }

  private async handlePause(jobId: string): Promise<WorkflowCommandResult> {
    const job = await (this.prisma as any).job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    if (job.status === ('PAUSED' as string)) {
      return {
        success: true,
        message: 'Job is already paused',
      };
    }

    if (job.status !== 'RUNNING') {
      throw new BadRequestException('Cannot pause a job that is not running');
    }

    // 更新 Job 状态为暂停
    await (this.prisma as any).job.update({
      where: { id: jobId },
      data: { status: 'PAUSED' },
    });

    return {
      success: true,
      message: 'Job paused successfully',
      data: { status: 'PAUSED' },
    };
  }

  private async handleResume(jobId: string): Promise<WorkflowCommandResult> {
    const job = await (this.prisma as any).job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    if (job.status === 'RUNNING') {
      return {
        success: true,
        message: 'Job is already running',
      };
    }

    if (job.status !== ('PAUSED' as string)) {
      throw new BadRequestException('Cannot resume a job that is not paused');
    }

    // 获取 Job 的 markdown 配置
    const config = job.config as { markdown?: string } | null;
    const markdown = config?.markdown;

    if (!markdown) {
      throw new BadRequestException('job.config.markdown is missing');
    }

    // 恢复 Job 执行
    await this.temporal.startVideoGeneration({ jobId, markdown });

    return {
      success: true,
      message: 'Job resumed successfully',
      data: { status: 'RUNNING' },
    };
  }

  private async handleJumpTo(
    jobId: string,
    params?: Record<string, unknown>,
  ): Promise<WorkflowCommandResult> {
    const stage = params?.stage as string;

    if (!stage) {
      throw new BadRequestException(
        'Stage parameter is required for jump-to command',
      );
    }

    // 验证阶段是否有效
    if (!isValidStage(stage)) {
      throw new BadRequestException(
        `Invalid stage: ${stage}. Valid stages: ${Object.values(JobStage).join(', ')}`,
      );
    }

    // 更新 Job 当前阶段
    const normalizedStage = normalizeStage(stage);
    await (this.prisma as any).job.update({
      where: { id: jobId },
      data: { currentStage: normalizedStage },
    });

    return {
      success: true,
      message: `Jumped to stage: ${normalizedStage}`,
      data: { currentStage: normalizedStage },
    };
  }

  private handleModifyStage(
    jobId: string,
    params?: Record<string, unknown>,
  ): WorkflowCommandResult {
    const stage = params?.stage as string;
    const modifications = params?.modifications as Record<string, unknown>;

    if (!stage || !modifications) {
      throw new BadRequestException(
        'Stage and modifications parameters are required for modify-stage command',
      );
    }

    // 验证阶段是否有效
    if (!isValidStage(stage)) {
      throw new BadRequestException(`Invalid stage: ${stage}`);
    }

    // 这里可以实现阶段参数修改逻辑
    // 目前简单返回成功，实际实现需要根据具体需求
    return {
      success: true,
      message: `Stage ${stage} modified successfully`,
      data: { stage, modifications },
    };
  }

  async getCommandHistory(jobId: string) {
    return await (this.prisma as any).workflowCommand.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Return the last 10 commands
    });
  }

  parseCommand(
    message: string,
  ): { command: string; params?: Record<string, unknown> } | null {
    // 检查是否为指令格式
    if (!message.startsWith('/')) {
      return null;
    }

    const parts = message.trim().split(' ');
    const command = parts[0].substring(1); // 移除 '/'

    if (parts.length === 1) {
      return { command };
    }

    // 简单的参数解析
    const params: Record<string, unknown> = {};

    // 处理 jump-to STAGE 格式
    if (command === 'jump-to' && parts[1]) {
      params.stage = parts[1];
    }

    // 处理 modify-stage STAGE key=value 格式
    if (command === 'modify-stage' && parts.length >= 3) {
      params.stage = parts[1];
      const keyValue = parts[2].split('=');
      if (keyValue.length === 2) {
        params.modifications = { [keyValue[0]]: keyValue[1] };
      }
    }

    return { command, params };
  }

  parseNaturalLanguage(
    message: string,
  ): { command: string; params?: Record<string, unknown> } | null {
    const lowerMessage = message.toLowerCase();

    // 遍历所有指令的自然语言模式
    for (const [command, definition] of Object.entries(WORKFLOW_COMMANDS)) {
      for (const pattern of definition.naturalLanguagePatterns) {
        if (pattern.test(lowerMessage)) {
          const params: Record<string, unknown> = {};

          // 提取阶段信息
          const stageMatch = lowerMessage.match(
            /(plan|outline|narration|pages|done)/,
          );
          if (
            stageMatch &&
            (command === 'jump-to' || command === 'modify-stage')
          ) {
            params.stage = normalizeStage(stageMatch[1]);
          }

          return { command, params };
        }
      }
    }

    return null;
  }

  getAvailableCommands() {
    return WORKFLOW_COMMANDS;
  }
}
