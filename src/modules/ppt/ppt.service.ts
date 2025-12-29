import { Injectable, Logger } from '@nestjs/common';
import {
  AiHtmlGeneratorService,
  StoryboardSlide,
  GenerationContext,
  AiGenerationOptions,
} from './ai-html-generator.service';
import { PptGenerationResult } from './ppt.types';

// 重新导出核心类型以供其他模块使用
export type {
  StoryboardSlide,
  GenerationContext,
  AiGenerationOptions,
  PptGenerationResult,
} from './ppt.types';

/**
 * PPT 生成服务 - 简化版
 *
 * 专注于使用AI生成HTML幻灯片，移除了复杂的设计模板和布局系统
 */
@Injectable()
export class PptService {
  private readonly logger = new Logger(PptService.name);

  constructor(private readonly aiHtmlGenerator: AiHtmlGeneratorService) {}

  /**
   * 使用AI生成PPT幻灯片
   *
   * @param slides 幻灯片故事板数据
   * @param context 生成上下文
   * @param options 生成选项
   * @returns 生成的HTML页面和统计信息
   */
  async generatePptWithAi(
    slides: StoryboardSlide[],
    context: GenerationContext,
    options: AiGenerationOptions = {},
  ): Promise<PptGenerationResult> {
    if (!this.aiHtmlGenerator) {
      throw new Error('AI HTML Generator 未初始化');
    }

    this.logger.log(`开始使用 AI 生成 ${slides.length} 页 PPT`);

    const results = await this.aiHtmlGenerator.generateAllSlides(
      slides,
      context,
      {
        themeConfig: options.themeConfig,
        concurrency: options.concurrency || 3,
        maxRetries: options.maxRetries || 2,
        enableCache: options.enableCache !== false,
        skipValidation: options.skipValidation,
      },
    );

    const htmlPages = results
      .filter((r) => r.status === 'success')
      .map((r) => r.html);

    const stats = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      invalid: results.filter((r) => r.status === 'invalid').length,
    };

    this.logger.log(
      `AI 生成完成: 成功 ${stats.success}/${stats.total}, 失败 ${stats.failed}, 无效 ${stats.invalid}`,
    );

    const mergedHtml = this.wrapAllSlides(htmlPages);

    return {
      htmlPages: [mergedHtml],
      results,
      stats,
    };
  }

  /**
   * 将多页幻灯片 HTML 片段包装成完整的文档结构
   */
  private wrapAllSlides(slides: string[]): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      background-color: #f3f4f6;
    }
    
    /* PPT 页面容器 */
    .ppt-page-wrapper {
      width: 1280px;
      height: 720px;
      margin: 20px auto;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      background: white;
      position: relative;
      overflow: hidden;
      page-break-after: always;
    }

    @media print {
      body {
        background: none;
      }
      .ppt-page-wrapper {
        margin: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  ${slides
    .map((slide) =>
      slide.trim() ? `<div class="ppt-page-wrapper">${slide}</div>` : '',
    )
    .join('\n')}
</body>
</html>
    `.trim();
  }
}
