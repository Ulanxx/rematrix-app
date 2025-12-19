import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TemporalModule } from '../temporal/temporal.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [PrismaModule, TemporalModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
