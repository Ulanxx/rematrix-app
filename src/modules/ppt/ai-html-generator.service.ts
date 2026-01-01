import { Injectable, Logger } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { HtmlValidatorService } from './html-validator.service';

import { SlideType } from './ppt.types';

export interface StoryboardSlide {
  id: string;
  title: string;
  content: string[];
  type?: SlideType;
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
  enableMasterSlide?: boolean; // 新增：是否启用母版
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
      const model = this.openai('google/gemini-2.0-flash-001');

      const systemPrompt = `你是一个专业的 PPT 设计师。请根据用户的要求生成高质量的幻灯片 HTML 片段。
当前幻灯片类型: ${slide.type || 'content'}
页面尺寸: 1280x720px
核心要求:
1. 风格一致性: 必须符合整体设计风格。
2. 布局差异化: 
   - 'title' 类型: 首页，应具有强烈的视觉冲击力，大标题居中或采用非对称布局。
   - 'content' 类型: 详情页，内容排版应清晰，利用好 1280x720 的空间。
   - 'closing' 类型: 结尾页，应简洁大方，通常包含致谢、联系方式或 Q&A。`;

      const result = await Promise.race([
        generateText({
          model,
          prompt,
          system: systemPrompt,
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
- 强调色: ${colors.accent || '#FBBC05'}
${context.courseTitle ? `- 课程: ${context.courseTitle}` : ''}

# 🛠️ 技术要求
- 使用 Tailwind CSS 类名
- 使用 Font Awesome 图标 (fas/far/fab)
- 页面尺寸: 固定 1280x720px
- 使用现代设计元素

# 🎯 设计要点
1. **必须使用上面提供的实际标题和内容**，不要用占位符
2. **禁止生成页码、总页数或页眉/课程标题**，这些将由系统母版统一处理
3. **内容区域限制**: 顶部保留 80px，底部保留 80px，左右各保留 60px 的安全距离，确保不被母版元素遮挡
4. 根据"${designStyle}"风格自由发挥创意
5. 可以使用渐变、玻璃拟态、阴影、动画等现代设计元素
6. 为内容添加合适的图标装饰
7. 确保文字清晰可读

# 📤 输出格式
只输出一个 <div> 容器,不要包含 <html>、<head>、<body> 等标签。

示例格式:
<div class="w-[1280px] h-[720px] relative overflow-hidden" style="background: ...">
  <!-- 页面内容 -->
  <div class="px-[60px] py-[80px] h-full">
    <h1>标题</h1>
    <div>内容</div>
  </div>
</div>

直接输出 <div> 代码,不要添加任何解释。`;
  }

  private extractHtml(text: string): string {
    // 1. 尝试提取所有代码块中的内容并合并
    const codeBlocks = [...text.matchAll(/```(?:html)?\s*([\s\S]*?)\s*```/gi)];
    if (codeBlocks.length > 0) {
      this.logger.log(`提取到 ${codeBlocks.length} 个代码块`);
      return codeBlocks.map((match) => match[1].trim()).join('\n');
    }

    // 2. 优先尝试提取完整的 HTML 文档 (包含 DOCTYPE)
    // 使用非贪婪匹配捕获所有完整文档片段
    const fullHtmlMatches = [
      ...text.matchAll(/<!DOCTYPE html>[\s\S]*?<\/html>/gi),
    ];
    if (fullHtmlMatches.length > 0) {
      this.logger.log(`提取到 ${fullHtmlMatches.length} 个完整 HTML 文档`);
      return fullHtmlMatches.map((match) => match[0]).join('\n');
    }

    const simpleHtmlMatches = [...text.matchAll(/<html[\s\S]*?<\/html>/gi)];
    if (simpleHtmlMatches.length > 0) {
      this.logger.log(`提取到 ${simpleHtmlMatches.length} 个 <html> 文档`);
      return simpleHtmlMatches.map((match) => match[0]).join('\n');
    }

    // 3. 尝试提取所有 <div> 标签片段
    // 注意：这里需要区分是独立的 <div> 块还是嵌套的。
    // 对于 PPT 场景，我们通常寻找 class="ppt-page-wrapper" 的 div
    const pageMatches = [
      ...text.matchAll(
        /<div[^>]*class="[^"]*ppt-page-wrapper[^"]*"[\s\S]*?<\/div>\s*(?=<div|$)/gi,
      ),
    ];
    if (pageMatches.length > 0) {
      this.logger.log(
        `提取到 ${pageMatches.length} 个 ppt-page-wrapper 幻灯片页面`,
      );
      return pageMatches.map((match) => match[0]).join('\n');
    }

    // 最后的回退方案：贪婪匹配第一个和最后一个 div 之间的所有内容
    const divMatch = text.match(/<div[\s\S]*<\/div>/i);
    if (divMatch) {
      return divMatch[0];
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

  /**
   * 直接生成完整的 PPT HTML（优化路径）
   * 实现分批生成机制以应对 Token 限制
   */
  async generateDirectHtml(
    slides: StoryboardSlide[],
    context: GenerationContext,
    options: AiGenerationOptions = {},
  ): Promise<string> {
    const CHUNK_SIZE = 4; // 每批生成的最大页数
    const startTime = Date.now();

    if (slides.length <= CHUNK_SIZE) {
      this.logger.log(`开始直接生成 ${slides.length} 页 PPT 的完整 HTML`);
      return this.generateHtmlChunk(slides, context, options, true);
    }

    this.logger.log(
      `幻灯片数量 (${slides.length}) 超过批次大小 (${CHUNK_SIZE})，将分批生成`,
    );

    const chunks: StoryboardSlide[][] = [];
    for (let i = 0; i < slides.length; i += CHUNK_SIZE) {
      chunks.push(slides.slice(i, i + CHUNK_SIZE));
    }

    const chunkResults: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const isFirst = i === 0;
      this.logger.log(`正在生成第 ${i + 1}/${chunks.length} 批幻灯片...`);
      const html = await this.generateHtmlChunk(
        chunks[i],
        context,
        options,
        isFirst,
      );
      chunkResults.push(html);
    }

    // 合并结果：如果第一批包含了完整的 HTML 结构，我们需要将后续批次的 <div> 片段插入到 </body> 之前
    let finalHtml = chunkResults[0];
    if (finalHtml.includes('</body>')) {
      const parts = finalHtml.split('</body>');
      finalHtml =
        parts[0] + '\n' + chunkResults.slice(1).join('\n') + '\n</body>' + (parts[1] || '');
    } else {
      finalHtml = chunkResults.join('\n');
    }

    this.logger.log(`分批生成完成，总耗时 ${Date.now() - startTime}ms`);
    return finalHtml;
  }

  /**
   * 生成一页或多页幻灯片的 HTML 片段
   */
  private async generateHtmlChunk(
    slides: StoryboardSlide[],
    context: GenerationContext,
    options: AiGenerationOptions,
    isFirstBatch: boolean,
  ): Promise<string> {
    try {
      const model = this.openai('google/gemini-2.0-flash-001');
      const systemPrompt = `你是一个顶尖的 PPT 设计师和前端开发专家。
你的任务是根据提供的幻灯片内容，生成视觉效果统一且极具冲击力的 HTML 代码。

页面规范:
1. 页面尺寸: 每个幻灯片容器必须固定为 1280x720px。
2. 布局要求: 
   - 'title': 首页，强冲击力，大标题，非对称或居中布局。
   - 'content': 详情页，清晰的层级，丰富的图标，良好的留白。
   - 'closing': 结尾页，致谢，联系方式。
3. 技术栈: 使用 Tailwind CSS 和 Font Awesome (fas/far/fab)。
4. 视觉丰富度: 使用渐变背景、装饰性形状、高质量图标和合理的排版。`;

      const userPrompt = `请为以下内容生成 PPT HTML。

# 📄 课程信息
课程标题: ${context.courseTitle || '未命名课程'}

# 📝 幻灯片内容 (共 ${slides.length} 页)
${slides
  .map(
    (s) => `
## 幻灯片 (序号: ${s.slideNumber || '?'}, 类型: ${s.type || 'content'})
标题: ${s.title}
内容: ${Array.isArray(s.content) ? s.content.join('; ') : (s.content || '')}
${s.visualSuggestions ? `视觉建议: ${s.visualSuggestions}` : ''}
`,
  )
  .join('\n')}

# 🎨 设计要求
风格: ${options.themeConfig?.designStyle || '现代科技风格'}
主色: ${options.themeConfig?.colors?.primary || '#4285F4'}
辅色: ${options.themeConfig?.colors?.secondary || '#34A853'}

# 📤 输出要求 (严格遵守)
${
  isFirstBatch
    ? `1. 输出一个**完整的** HTML 文档，包含 <!DOCTYPE html>、<html>、<head> (包含 Tailwind/FontAwesome CDN) 和 <body>。`
    : `1. **只输出 <div> 片段**，不要包含 <html>、<head> 或 <body> 标签。`
}
2. **必须包含所有 ${slides.length} 页幻灯片**，每一页都使用 <div class="ppt-page-wrapper"> 包装。
3. 每个幻灯片使用 <div class="ppt-page-wrapper"> 包装，尺寸 1280x720px，设置 overflow: hidden 和 position: relative。
4. 包含所有必要的母版元素：
   - 页眉：左侧显示课程标题 "${context.courseTitle || '未命名课程'}"。
   - 页脚：右侧显示当前页码。
5. 直接输出 HTML 代码，不要任何 Markdown 标记或解释文字。`;

      const result = await generateText({
        model,
        prompt: userPrompt,
        system: systemPrompt,
      });

      this.logger.log(`AI 原始响应长度: ${result.text.length} 字符`);
      if (result.finishReason === 'length') {
        this.logger.warn('AI 响应因长度限制而被截断！');
      }

      const html = this.extractHtml(result.text);
      const slideCount = (html.match(/class="[^"]*ppt-page-wrapper/g) || []).length;
      this.logger.log(`提取后的 HTML 包含 ${slideCount} 页幻灯片`);

      return html;
    } catch (error) {
      this.logger.error(`生成批次失败: ${error.message}`);
      throw error;
    }
  }
}
