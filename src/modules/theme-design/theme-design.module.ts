import { Module } from '@nestjs/common';
import { ThemeDesignService } from './theme-design.service';
import { DesignTemplateService } from './design-template.service';
import { DesignPreviewService } from './design-preview.service';

@Module({
  providers: [ThemeDesignService, DesignTemplateService, DesignPreviewService],
  exports: [ThemeDesignService, DesignTemplateService, DesignPreviewService],
})
export class ThemeDesignModule {}
