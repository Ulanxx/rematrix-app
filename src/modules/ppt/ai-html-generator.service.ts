import { Injectable, Logger } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { HtmlValidatorService } from './html-validator.service';

export interface StoryboardSlide {
  id: string;
  title: string;
  content: string[];
  visualSuggestions?: string;
  narration?: string;
  slideNumber?: number;
}

export interface GenerationContext {
  outline?: string[];
  courseTitle?: string;
  totalSlides?: number;
}

export interface ThemeConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  designStyle?: string;
  typography?: {
    fontFamily?: string;
    headingFont?: string;
    bodyFont?: string;
  };
  customCss?: string;
}

export interface AiGenerationOptions {
  themeConfig?: ThemeConfig;
  enableCache?: boolean;
  timeout?: number;
  concurrency?: number;
  maxRetries?: number;
  skipValidation?: boolean; // 新增：跳过HTML验证以提升速度
}

export interface AiGeneratedHtml {
  html: string;
  slideId: string;
  generatedAt: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  status: 'success' | 'failed' | 'invalid';
  error?: string;
  validationIssues?: any[];
  retryCount?: number;
}

@Injectable()
export class AiHtmlGeneratorService {
  private readonly logger = new Logger(AiHtmlGeneratorService.name);
  private openai: ReturnType<typeof createOpenAI>;

  constructor(private readonly htmlValidator: HtmlValidatorService) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENROUTER_API_KEY');
    }

    this.openai = createOpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  async generateSlideHtml(
    slide: StoryboardSlide,
    context: GenerationContext,
    options: AiGenerationOptions = {},
  ): Promise<AiGeneratedHtml> {
    const startTime = Date.now();
    const timeout = options.timeout || 600000;

    this.logger.log(`生成幻灯片 HTML: ${slide.id}`);

    try {
      const prompt = this.buildPrompt(slide, context, options.themeConfig);
      const model = this.openai('google/gemini-3-flash-preview');

      const result = await Promise.race([
        generateText({
          model,
          prompt,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('生成超时')), timeout),
        ),
      ]);

      const html = this.extractHtml(result.text);
      const duration = Date.now() - startTime;

      const usage = result.usage as any;
      this.logger.log(
        `幻灯片 ${slide.id} 生成成功，耗时 ${duration}ms，tokens: ${usage?.totalTokens || 0}`,
      );

      return {
        html,
        slideId: slide.id,
        generatedAt: new Date().toISOString(),
        status: 'success',
        tokenUsage: usage
          ? {
              prompt: usage.promptTokens || 0,
              completion: usage.completionTokens || 0,
              total: usage.totalTokens || 0,
            }
          : undefined,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `幻灯片 ${slide.id} 生成失败，耗时 ${duration}ms: ${error.message}`,
      );
      throw error;
    }
  }

  private buildPrompt(
    slide: StoryboardSlide,
    context: GenerationContext,
    themeConfig?: ThemeConfig,
  ): string {
    const theme = themeConfig || {};
    const colors = theme.colors || {};
    const outline = context.outline || [];
    const slideNumber = slide.slideNumber || 1;
    const totalSlides = context.totalSlides || 1;
    const designStyle = theme.designStyle || 'Google 风格';

    return `你是一位富有创意的 PPT 设计师。请为这页 PPT 设计一个视觉效果出色的页面。

# 📄 页面内容
**标题**: ${slide.title}
**页码**: 第 ${slideNumber} 页 / 共 ${totalSlides} 页

**内容要点**:
${slide.content.map((c, i) => `${i + 1}. ${c}`).join('\n')}
${slide.visualSuggestions ? `\n**视觉建议**: ${slide.visualSuggestions}` : ''}
${outline.length > 0 ? `\n**大纲**: ${outline.join('\n')}` : ''}

# 🎨 设计风格
- 风格: ${designStyle}
- 主色: ${colors.primary || '#4285F4'}
- 辅色: ${colors.secondary || '#34A853'}
- 强调色: ${colors.accent || '#FBBC0s5'}
${context.courseTitle ? `- 课程: ${context.courseTitle}` : ''}

# 🛠️ 技术要求
- 使用 Tailwind CSS 类名
- 使用 Font Awesome 图标 (fas/far/fab)
- 页面尺寸: 固定 1280x720px
- 使用现代设计元素

# 🎯 设计要点
1. **必须使用上面提供的实际标题和内容**，不要用占位符
2. 根据"${designStyle}"风格自由发挥创意
3. 可以使用渐变、玻璃拟态、阴影、动画等现代设计元素
4. 为内容添加合适的图标装饰
5. 确保文字清晰可读

# 📤 输出格式
只输出一个 <div> 容器,不要包含 <html>、<head>、<body> 等标签。

示例格式:
<div class="w-[1280px] h-[720px] relative overflow-hidden" style="background: ...">
  <!-- 页面内容 -->
  <h1>标题</h1>
  <div>内容</div>
</div>

直接输出 <div> 代码,不要添加任何解释。`;
  }

  private extractHtml(text: string): string {
    // 尝试提取代码块中的内容
    const codeBlockMatch = text.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // 尝试提取 <div> 标签
    const divMatch = text.match(/<div[\s\S]*<\/div>/i);
    if (divMatch) {
      return divMatch[0];
    }

    // 如果包含完整的 HTML 文档,也接受(向后兼容)
    const htmlMatch = text.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      return htmlMatch[0];
    }

    if (text.includes('<div')) {
      return text.trim();
    }

    throw new Error('无法从 AI 响应中提取有效的 HTML');
  }

  async generateAllSlides(
    slides: StoryboardSlide[],
    context: GenerationContext,
    options: AiGenerationOptions = {},
  ): Promise<AiGeneratedHtml[]> {
    const concurrency = options.concurrency || 3;
    const maxRetries = options.maxRetries || 2;

    this.logger.log(
      `开始生成 ${slides.length} 个幻灯片，并发数: ${concurrency}，最大重试: ${maxRetries}`,
    );

    const results: AiGeneratedHtml[] = [];
    const batches: StoryboardSlide[][] = [];

    for (let i = 0; i < slides.length; i += concurrency) {
      batches.push(slides.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map((slide) =>
          this.generateSlideWithRetry(slide, context, options, maxRetries),
        ),
      );
      results.push(...batchResults);
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;
    const invalidCount = results.filter((r) => r.status === 'invalid').length;

    this.logger.log(
      `生成完成: 成功 ${successCount}, 失败 ${failedCount}, 无效 ${invalidCount}`,
    );

    return results;
  }

  async generateSlideWithRetry(
    slide: StoryboardSlide,
    context: GenerationContext,
    options: AiGenerationOptions,
    maxRetries: number,
  ): Promise<AiGeneratedHtml> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          this.logger.debug(
            `幻灯片 ${slide.id} 重试第 ${attempt} 次，延迟 ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const result = await this.generateSlideHtml(slide, context, options);

        // 如果启用跳过验证，直接返回成功
        if (options.skipValidation) {
          return {
            ...result,
            status: 'success',
            retryCount: attempt,
          };
        }

        const validation = this.htmlValidator.validate(result.html, slide.id);

        if (validation.isValid) {
          return {
            ...result,
            status: 'success',
            retryCount: attempt,
          };
        }

        if (attempt < maxRetries) {
          this.logger.warn(
            `幻灯片 ${slide.id} 验证失败，将重试: ${validation.issues.map((i) => i.message).join(', ')}`,
          );
          continue;
        }

        return {
          ...result,
          status: 'invalid',
          validationIssues: validation.issues,
          retryCount: attempt,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          this.logger.warn(
            `幻灯片 ${slide.id} 生成失败 (尝试 ${attempt + 1}/${maxRetries + 1}): ${error.message}`,
          );
          continue;
        }
      }
    }

    return {
      html: '',
      slideId: slide.id,
      generatedAt: new Date().toISOString(),
      status: 'failed',
      error: lastError?.message || '未知错误',
      retryCount: maxRetries,
    };
  }

  async regenerateSlide(
    slide: StoryboardSlide,
    context: GenerationContext,
    options: AiGenerationOptions = {},
  ): Promise<AiGeneratedHtml> {
    this.logger.log(`重新生成幻灯片: ${slide.id}`);
    const maxRetries = options.maxRetries || 2;
    return this.generateSlideWithRetry(slide, context, options, maxRetries);
  }
}
