import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { JobStage } from '@prisma/client';
import { CreatePromptStageConfigDto } from './dto/create-prompt-stage-config.dto';
import { PublishPromptStageConfigDto } from './dto/publish-prompt-stage-config.dto';
import { UpdatePromptStageConfigDto } from './dto/update-prompt-stage-config.dto';
import { PromptopsService } from './promptops.service';
import { PromptopsInitService } from './promptops-init.service';
import {
  PromptopsValidationService,
  ValidationReport,
} from './promptops-validation.service';

type BootstrapResponse = {
  active: unknown;
};

type InitializeAllResponse = {
  message: string;
  status?: {
    total: number;
    initialized: number;
    pending: number;
    stages: { stage: string; hasConfig: boolean; configId?: string }[];
  };
};

@Controller('admin/promptops')
export class PromptopsAdminController {
  constructor(
    private readonly promptops: PromptopsService,
    private readonly promptopsInit: PromptopsInitService,
    private readonly promptopsValidation: PromptopsValidationService,
  ) {}

  @Get('stages')
  listStages() {
    return { stages: this.promptops.listStages() };
  }

  @Get('stages/:stage/configs')
  async listConfigs(@Param('stage') stage: string) {
    return { configs: await this.promptops.listConfigs(stage) };
  }

  @Get('stages/:stage/active')
  async getActive(@Param('stage') stage: string) {
    return { config: await this.promptops.getActiveConfig(stage) };
  }

  @Post('configs')
  async createConfig(@Body() dto: CreatePromptStageConfigDto) {
    return { config: await this.promptops.createConfig(dto) };
  }

  @Patch('configs/:id')
  async updateConfig(
    @Param('id') id: string,
    @Body() dto: UpdatePromptStageConfigDto,
  ) {
    return { config: await this.promptops.updateConfig(id, dto) };
  }

  @Delete('configs/:id')
  async deleteConfig(@Param('id') id: string) {
    return { config: await this.promptops.deleteConfig(id) };
  }

  @Post('stages/:stage/publish')
  async publish(
    @Param('stage') stage: string,
    @Body() dto: PublishPromptStageConfigDto,
  ) {
    return {
      active: await this.promptops.publish(stage, dto.configId),
    };
  }

  @Post('stages/:stage/bootstrap')
  async bootstrap(@Param('stage') stage: string): Promise<BootstrapResponse> {
    return {
      active: await this.promptops.bootstrap(stage),
    };
  }

  @Post('initialize-all')
  async initializeAll(): Promise<InitializeAllResponse> {
    await this.promptopsInit.initializeAllStages();
    const status = await this.promptopsInit.getInitializationStatus();
    return {
      message: '所有阶段配置初始化完成',
      status,
    };
  }

  @Get('initialization-status')
  async getInitializationStatus() {
    return await this.promptopsInit.getInitializationStatus();
  }

  @Get('validate/:stage')
  async validateStage(@Param('stage') stage: string) {
    return await this.promptopsValidation.validateStage(stage as JobStage);
  }

  @Get('validate-all')
  async validateAllStages(): Promise<{ report: ValidationReport }> {
    const report = await this.promptopsValidation.validateAllStages();
    return { report };
  }

  @Post('auto-fix/:stage')
  async autoFixStage(@Param('stage') stage: string) {
    const success = await this.promptopsValidation.autoFixStage(
      stage as JobStage,
    );
    return { stage, fixed: success };
  }

  @Post('auto-fix-all')
  async autoFixAllStages() {
    const stages = this.promptops.listStages();
    const results: { stage: JobStage; fixed: boolean }[] = [];

    for (const stage of stages) {
      const success = await this.promptopsValidation.autoFixStage(
        stage as JobStage,
      );
      results.push({ stage, fixed: success });
    }

    return { results };
  }

  @Get('quality-score/:stage')
  async getQualityScore(@Param('stage') stage: string) {
    const score = await this.promptopsValidation.getQualityScore(
      stage as JobStage,
    );
    return { stage, score };
  }
}
