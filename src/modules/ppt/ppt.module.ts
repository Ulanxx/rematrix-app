import { Module } from '@nestjs/common';
import { PptService } from './ppt.service';
import { AiHtmlGeneratorService } from './ai-html-generator.service';
import { HtmlValidatorService } from './html-validator.service';
import { PptCacheService } from './ppt-cache.service';

@Module({
  providers: [
    PptService,
    AiHtmlGeneratorService,
    HtmlValidatorService,
    PptCacheService,
  ],
  exports: [PptService],
})
export class PptModule {}
