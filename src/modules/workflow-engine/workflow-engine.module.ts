import { Module } from '@nestjs/common';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowEngineController } from './workflow-engine.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TemporalModule } from '../temporal/temporal.module';

@Module({
  imports: [PrismaModule, TemporalModule],
  controllers: [WorkflowEngineController],
  providers: [WorkflowEngineService],
  exports: [WorkflowEngineService],
})
export class WorkflowEngineModule {}
