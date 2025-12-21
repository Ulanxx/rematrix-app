import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import type { WorkflowCommandRequest } from './workflow-engine.service';

@Controller('workflow-engine')
export class WorkflowEngineController {
  constructor(private readonly workflowEngine: WorkflowEngineService) {}

  @Post('execute')
  async executeCommand(@Body() request: WorkflowCommandRequest) {
    try {
      const result = await this.workflowEngine.executeCommand(request);
      return { success: true, result };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  @Get('commands/:jobId')
  async getCommandHistory(@Param('jobId') jobId: string) {
    const commands = await this.workflowEngine.getCommandHistory(jobId);
    return { commands };
  }

  @Post('parse')
  parseCommand(@Body() body: { message: string }) {
    const { message } = body;

    // 先尝试解析指令格式
    const commandResult = this.workflowEngine.parseCommand(message);
    if (commandResult) {
      return { type: 'command', ...commandResult };
    }

    // 再尝试解析自然语言
    const naturalResult = this.workflowEngine.parseNaturalLanguage(message);
    if (naturalResult) {
      return { type: 'natural', ...naturalResult };
    }

    return { type: 'unknown', message: 'Unable to parse command' };
  }
}
