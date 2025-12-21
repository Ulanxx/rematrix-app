import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PageGenerationService } from './page-generation.service';

export interface GenerateSlideRequest {
  title: string;
  bullets: string[];
  theme?: { primary?: string; background?: string; text?: string };
  context?: string;
}

export interface GenerateCustomLayoutRequest {
  content: string;
  layoutType: 'title' | 'content' | 'split' | 'image-text';
  theme?: { primary?: string; background?: string; text?: string };
  context?: string;
}

@Controller('page-generation')
export class PageGenerationController {
  constructor(private readonly pageGenerationService: PageGenerationService) {}

  @Post('generate-slide')
  async generateSlide(@Body() request: GenerateSlideRequest) {
    try {
      const result =
        await this.pageGenerationService.generateSlideHtml(request);
      return { success: true, ...result };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  @Post('generate-custom-layout')
  async generateCustomLayout(@Body() request: GenerateCustomLayoutRequest) {
    try {
      const result =
        await this.pageGenerationService.generateCustomLayout(request);
      return { success: true, ...result };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
