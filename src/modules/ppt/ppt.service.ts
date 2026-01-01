import { Injectable, Logger } from '@nestjs/common';
import {
  AiHtmlGeneratorService,
  StoryboardSlide,
  GenerationContext,
  AiGenerationOptions,
} from './ai-html-generator.service';
import { PptGenerationResult, PptMasterSlideConfig } from './ppt.types';

// 重新导出核心类型以供其他模块使用
export type {
  StoryboardSlide,
  GenerationContext,
  AiGenerationOptions,
  PptGenerationResult,
  PptMasterSlideConfig,
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

    const stats = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      invalid: results.filter((r) => r.status === 'invalid').length,
    };

    this.logger.log(
      `AI 生成完成: 成功 ${stats.success}/${stats.total}, 失败 ${stats.failed}, 无效 ${stats.invalid}`,
    );

    const mergedHtml = this.wrapAllSlides(results, context, options);

    return {
      htmlPages: [mergedHtml],
      results,
      stats,
    };
  }

  /**
   * 直接生成完整的 PPT HTML（优化路径）
   */
  async generateDirectPpt(
    slides: StoryboardSlide[],
    context: GenerationContext,
    options: AiGenerationOptions = {},
  ): Promise<PptGenerationResult> {
    this.logger.log(`使用优化路径直接生成 ${slides.length} 页 PPT`);

    const htmlContent = await this.aiHtmlGenerator.generateDirectHtml(
      slides,
      context,
      options,
    );

    return {
      htmlPages: [htmlContent],
      results: slides.map((s) => ({
        slideId: s.id,
        status: 'success' as const,
        generatedAt: new Date().toISOString(),
        html: '', // 完整内容已在 htmlPages 中
      })),
      stats: {
        total: slides.length,
        success: slides.length,
        failed: 0,
        invalid: 0,
      },
    };
  }

  /**
   * 将多页幻灯片 HTML 片段包装成完整的文档结构
   */
  private wrapAllSlides(
    results: any[],
    context: GenerationContext,
    options: AiGenerationOptions,
  ): string {
    const enableMaster = options.enableMasterSlide !== false;
    const masterConfig: PptMasterSlideConfig = {
      showHeader: true,
      showPageNumber: true,
      headerLeftText: context.courseTitle || '演示文档',
      headerRightText: 'LIVE',
      ...((options as any).masterConfig || {}),
    };

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

    /* 页面类型基础样式 */
    .slide-type-title .master-header, .slide-type-closing .master-header { display: none !important; }
    .slide-type-title .master-footer, .slide-type-closing .master-footer { display: none !important; }

    /* 母版装饰层 */
    .master-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 1280px;
      height: 720px;
      pointer-events: none;
      z-index: 50; /* 确保在 AI 内容之上 */
    }

    .master-header {
      position: absolute;
      top: 24px;
      left: 40px;
      right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      mix-blend-mode: difference;
    }

    .master-footer {
      position: absolute;
      bottom: 24px;
      left: 40px;
      right: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      mix-blend-mode: difference;
    }

    .page-number-box {
      font-weight: 500;
      letter-spacing: 0.05em;
    }

    .live-badge {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    /* 首页和结尾页的特殊装饰 */
    .slide-type-title .master-overlay::before, .slide-type-closing .master-overlay::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 8px;
      background: linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335);
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

    ${masterConfig.customCss || ''}
  </style>
</head>
<body>
  ${results
    .map((result, index) => {
      const slideType = (result.type || 'content') as string;
      const content = result.html || '';

      if (!content.trim()) return '';

      const pageNum = (index + 1).toString().padStart(2, '0');
      const totalNum = results.length.toString().padStart(2, '0');

      let masterHtml = '';
      if (enableMaster) {
        // 合并通用配置和类型特定配置
        const typeConfig = masterConfig.typeConfigs?.[slideType as any] || {};
        const showHeader =
          typeConfig.showHeader !== undefined
            ? typeConfig.showHeader
            : masterConfig.showHeader;
        const showPageNumber =
          typeConfig.showPageNumber !== undefined
            ? typeConfig.showPageNumber
            : masterConfig.showPageNumber;

        const headerHtml = showHeader
          ? `
              <div class="master-header">
                <div class="flex items-center gap-3">
                  <div class="w-1 h-4 bg-blue-500"></div>
                  <span class="font-semibold uppercase tracking-wider">${masterConfig.headerLeftText}</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="live-badge">${masterConfig.headerRightText}</span>
                </div>
              </div>
            `
          : '';

        const footerHtml = showPageNumber
          ? `
              <div class="master-footer">
                <div class="text-[10px] uppercase tracking-widest opacity-50">System Status: Ready for Testing</div>
                <div class="page-number-box">PAGE ${pageNum} / ${totalNum}</div>
              </div>
            `
          : '';

        masterHtml = `
          <div class="master-overlay">
            ${headerHtml}
            ${footerHtml}
          </div>
        `;
      }

      return `<div class="ppt-page-wrapper slide-type-${slideType}">
${content}
${masterHtml}
</div>`;
    })
    .join('\n')}
</body>
</html>
    `.trim();
  }
}
