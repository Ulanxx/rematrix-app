import { Module } from '@nestjs/common';
import { PageGenerationService } from './page-generation.service';
import { PageGenerationController } from './page-generation.controller';

@Module({
  controllers: [PageGenerationController],
  providers: [PageGenerationService],
  exports: [PageGenerationService],
})
export class PageGenerationModule {}
