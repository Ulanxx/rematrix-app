import { Module } from '@nestjs/common';
import { StepRegistryService } from './step-registry.service';
import { StepExecutorService } from './step-executor.service';
import { StepInitService } from './step-init.service';
import { PrismaService } from '../prisma/prisma.service';
import { PromptopsService } from '../promptops/promptops.service';

@Module({
  providers: [
    StepRegistryService,
    StepExecutorService,
    StepInitService,
    PrismaService,
    PromptopsService,
  ],
  exports: [StepRegistryService, StepExecutorService],
})
export class WorkflowStepsModule {}
