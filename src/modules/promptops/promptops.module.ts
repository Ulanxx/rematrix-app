import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PromptopsAdminController } from './promptops-admin.controller';
import { PromptopsService } from './promptops.service';
import { PromptopsInitService } from './promptops-init.service';
import { PromptopsValidationService } from './promptops-validation.service';

@Module({
  imports: [PrismaModule],
  controllers: [PromptopsAdminController],
  providers: [
    PromptopsService,
    PromptopsInitService,
    PromptopsValidationService,
  ],
  exports: [PromptopsService, PromptopsInitService, PromptopsValidationService],
})
export class PromptopsModule {}
