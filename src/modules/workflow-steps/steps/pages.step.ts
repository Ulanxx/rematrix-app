import {
  PptService,
  StoryboardSlide,
  GenerationContext,
  AiGenerationOptions,
  PptGenerationResult,
} from '../../ppt/ppt.service';
import { JobStage, ArtifactType } from '@prisma/client';
import { z } from 'zod';
import {
  StepDefinition,
  createStepDefinition,
  ExecutionContext,
} from '../step-definition.interface';
import { AiHtmlGeneratorService } from '../../ppt/ai-html-generator.service';
import { HtmlValidatorService } from '../../ppt/html-validator.service';

/**
 * PAGES 阶段的输出 Schema (增强版支持 PPT 生成和合并)
 */
export const pagesOutputSchema = z.object({
  // PPT HTML 内容
  htmlContent: z.string().min(1),
  cssContent: z.string().optional(),

  // PPT 幻灯片原始数据 (包含所有视觉元素)
  pptSlidesData: z
    .array(
      z.object({
        slideId: z.string(),
        design: z.object({
          theme: z.string(),
          colors: z.object({
            primary: z.string(),
            secondary: z.string(),
            accent: z.string(),
            background: z.string(),
            text: z.string(),
            textLight: z.string(),
          }),
          typography: z.object({
            fontFamily: z.string(),
            headingFont: z.string(),
            bodyFont: z.string(),
            baseSize: z.number(),
            headingScale: z.array(z.number()),
          }),
          background: z.object({
            type: z.enum(['solid', 'gradient', 'pattern', 'image']),
            value: z.string(),
            opacity: z.number().optional(),
          }),
        }),
        elements: z.array(
          z.object({
            id: z.string(),
            type: z.enum([
              'text',
              'shape',
              'image',
              'chart',
              'icon',
              'divider',
            ]),
            position: z.object({
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
            }),
            style: z.object({
              backgroundColor: z.string().optional(),
              color: z.string().optional(),
              fontSize: z.number().optional(),
              fontWeight: z.string().optional(),
              textAlign: z.enum(['left', 'center', 'right']).optional(),
              borderRadius: z.number().optional(),
              padding: z.number().optional(),
              margin: z.number().optional(),
              border: z.string().optional(),
              boxShadow: z.string().optional(),
              opacity: z.number().optional(),
              transform: z.string().optional(),
            }),
            content: z.any(),
            animation: z
              .object({
                type: z.enum(['fade', 'slide', 'zoom', 'bounce', 'rotate']),
                duration: z.number(),
                delay: z.number(),
                easing: z.string(),
              })
              .optional(),
            zIndex: z.number().optional(),
          }),
        ),
        metadata: z
          .object({
            slideNumber: z.number(),
            totalSlides: z.number(),
            title: z.string().optional(),
            section: z.string().optional(),
            notes: z.string().optional(),
          })
          .optional(),
      }),
    )
    .optional(),

  // PPT 云存储相关字段
  pptUrl: z.string().optional(),
  pptStoragePath: z.string().optional(),
  pptFileSize: z.number().optional(),
  pptUploadedAt: z.string().optional(),
  pptUploadStatus: z.enum(['pending', 'success', 'failed']).optional(),
  pptUploadError: z.string().optional(),

  // 元数据
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      pageCount: z.number().optional(),
      aspectRatio: z.enum(['16:9', 'A4']).default('16:9'),
      designStyle: z.string().optional(),
      pptTheme: z.string().optional(),
      totalSlides: z.number().optional(),
    })
    .optional(),
});

/**
 * PAGES 阶段的输入 Schema (重构版 - 基于 SCRIPT 和 STORYBOARD)
 */
export const pagesInputSchema = z.object({
  script: z.object({
    fullScript: z.string(),
    pages: z.array(
      z.object({
        pageNumber: z.number(),
        narration: z.string(),
        keyPoints: z.array(z.string()).optional(),
        visualSuggestions: z.array(z.string()).optional(),
        duration: z.number().optional(),
      }),
    ),
    metadata: z
      .object({
        title: z.string().optional(),
        language: z.string().optional(),
        style: z.string().optional(),
        totalDuration: z.number().optional(),
        style_desc: z.string().optional(),
        tone: z.string().optional(),
      })
      .optional(),
  }),
  // 幻灯片故事板数据 (对齐 StoryboardSlide 结构)
  slides: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.array(z.string()),
        type: z.string().optional(),
        visualSuggestions: z.string().optional(),
        narration: z.string().optional(),
        slideNumber: z.number().optional(),
      }),
    )
    .optional(),
  // 生成上下文
  context: z
    .object({
      courseTitle: z.string().optional(),
      outline: z.array(z.string()).optional(),
      totalSlides: z.number().optional(),
      language: z.string().optional(),
      style: z.string().optional(),
    })
    .optional(),
  // 主题设计配置
  themeDesign: z.object({
    designTheme: z.string(),
    colorScheme: z.union([z.string(), z.record(z.string(), z.any())]),
    typography: z.union([z.string(), z.record(z.string(), z.any())]),
    layoutStyle: z.union([z.string(), z.record(z.string(), z.any())]),
    visualEffects: z.union([z.array(z.string()), z.array(z.any())]),
    customizations: z.record(z.string(), z.any()),
  }),
  // 配置选项
  config: z
    .object({
      pptOptions: z
        .object({
          theme: z
            .enum([
              'modern',
              'classic',
              'minimal',
              'creative',
              'corporate',
              'tech',
            ])
            .default('modern'),
          colorScheme: z
            .enum(['blue', 'green', 'purple', 'orange', 'red', 'monochrome'])
            .default('blue'),
          enableAnimations: z.boolean().default(true),
          layoutComplexity: z
            .enum(['simple', 'medium', 'complex'])
            .default('medium'),
          designFreedom: z
            .enum(['conservative', 'balanced', 'creative', 'extreme'])
            .default('creative'),
          aspectRatio: z.enum(['16:9', '4:3', 'A4']).default('16:9'),
          useAiGeneration: z.boolean().default(true),
          aiConcurrency: z.number().min(1).max(5).default(3),
          aiMaxRetries: z.number().min(0).max(5).default(2),
          enableCache: z.boolean().default(true),
        })
        .optional(),
    })
    .optional(),
});

/**
 * PAGES 阶段的自定义输入准备函数
 */
async function preparePagesInput(
  jobId: string,
  context: ExecutionContext,
): Promise<Record<string, unknown>> {
  if (!context) {
    throw new Error('Context is required for pages input preparation');
  }

  const inputData: Record<string, unknown> = {};

  // 1. 获取 SCRIPT 阶段的输出（完整脚本和口播稿）
  const scriptArtifact = await context.prisma.artifact.findFirst({
    where: {
      jobId,
      stage: JobStage.SCRIPT,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { content: true },
  });

  const scriptData = scriptArtifact?.content as any;
  if (scriptData) {
    inputData.script = scriptData;
  }

  // 2. 获取 STORYBOARD 阶段的输出
  const storyboardArtifact = await context.prisma.artifact.findFirst({
    where: {
      jobId,
      stage: JobStage.STORYBOARD,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { content: true },
  });

  const storyboardData = storyboardArtifact?.content as any;

  // 3. 获取 THEME_DESIGN 阶段的输出
  const themeDesignArtifact = await context.prisma.artifact.findFirst({
    where: {
      jobId,
      stage: JobStage.THEME_DESIGN,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { content: true },
  });

  if (themeDesignArtifact?.content) {
    inputData.themeDesign = themeDesignArtifact.content;
  } else {
    // 如果没有找到 THEME_DESIGN 输出，提供默认的主题设计配置
    inputData.themeDesign = {
      designTheme: 'modern-tech',
      colorScheme: 'blue-gradient',
      typography: 'modern-sans',
      layoutStyle: 'glassmorphism',
      visualEffects: ['glass-effect', 'gradient-bg'],
      customizations: {},
    };
  }

  // 4. 合并数据生成 slides 数组 (对齐 StoryboardSlide)
  if (storyboardData?.pages && Array.isArray(storyboardData.pages)) {
    const slides: StoryboardSlide[] = storyboardData.pages.map(
      (p: any, i: number) => {
        // 尝试从 scriptData.pages 中获取对应的 narration
        const pageScript = scriptData?.pages?.find(
          (sp: any) => sp.pageNumber === p.page,
        );

        return {
          id: `slide-${p.page || i + 1}`,
          title: Array.isArray(p.visual)
            ? p.visual[0]
            : p.visual || `Slide ${p.page || i + 1}`,
          content: Array.isArray(p.narrationHints)
            ? p.narrationHints
            : [p.narrationHints || ''],
          type:
            i === 0
              ? 'title'
              : i === storyboardData.pages.length - 1
                ? 'closing'
                : 'content',
          visualSuggestions: Array.isArray(p.visual)
            ? p.visual.join('; ')
            : p.visual,
          narration: pageScript?.narration || p.narrationHints?.join(' '),
          slideNumber: p.page || i + 1,
        };
      },
    );
    inputData.slides = slides;

    // 构建 GenerationContext
    inputData.context = {
      courseTitle:
        storyboardData.metadata?.title ||
        scriptData?.metadata?.title ||
        '未命名课程',
      outline:
        scriptData?.pages?.map((p: any) => p.keyPoints?.[0]).filter(Boolean) ||
        [],
      totalSlides: slides.length,
      language: scriptData?.metadata?.language || '中文',
      style: inputData.themeDesign
        ? (inputData.themeDesign as any).designTheme
        : undefined,
    };
  }

  // 默认配置
  inputData.config = {
    pptOptions: {
      theme: 'modern',
      colorScheme: 'blue',
      enableAnimations: true,
      layoutComplexity: 'medium',
      designFreedom: 'creative',
      aspectRatio: '16:9',
      useAiGeneration: true,
    },
  };

  return inputData;
}

/**
 * PAGES 阶段的自定义执行函数 (增强版)
 * AI 生成 PPT -> HTML 转换
 */
async function customExecutePagesStep(
  inputData: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  // 获取输入数据
  const pagesData = inputData as {
    script: any;
    config?: {
      pptOptions?: AiGenerationOptions;
    };
    pptSlidesData: any[]; // 必须由 AI 生成
    slides?: StoryboardSlide[];
    context?: GenerationContext;
  };

  // 验证必要字段
  if (
    (!pagesData.pptSlidesData || pagesData.pptSlidesData.length === 0) &&
    (!pagesData.slides || pagesData.slides.length === 0)
  ) {
    throw new Error('PPT 幻灯片数据不能为空，请确保 AI 生成步骤已成功完成');
  }

  const config = pagesData.config || {};
  const pptOptions = config.pptOptions || {};

  // 初始化服务 (PptService 现在需要注入 AiHtmlGeneratorService)
  // 在非 NestJS DI 环境下手动初始化
  const htmlValidator = new HtmlValidatorService();
  const aiHtmlGenerator = new AiHtmlGeneratorService(htmlValidator);
  const pptService = new PptService(aiHtmlGenerator);

  // 1. 使用 AI 生成的幻灯片数据生成 HTML (简化后的 PptService 流程)
  // 如果有 slides 和 context，优先使用优化后的直接生成路径 generateDirectPpt
  let finalHtmlContent = '';
  let pageCount = 0;
  let pptResult: PptGenerationResult | undefined;

  if (pagesData.slides && pagesData.context) {
    // 检查是否应该使用优化路径（直接生成整体）
    // 默认在 PAGES 阶段使用优化路径以提升性能和一致性
    pptResult = await pptService.generateDirectPpt(
      pagesData.slides,
      pagesData.context,
      pptOptions,
    );
    finalHtmlContent = pptResult.htmlPages.join('\n');
    pageCount = pagesData.slides.length;
  } else if (
    pagesData.pptSlidesData &&
    Array.isArray(pagesData.pptSlidesData) &&
    pagesData.pptSlidesData.length > 0
  ) {
    // 如果是 AI 直接生成的 pptSlidesData，构造 context 进行生成
    const context: GenerationContext = {
      courseTitle: pagesData.script?.metadata?.title || '演示文档',
    };

    // 构造 slides 数组
    const slides: StoryboardSlide[] = pagesData.pptSlidesData.map((s: any) => ({
      id: s.slideId || `slide-${Math.random().toString(36).substr(2, 9)}`,
      title: s.metadata?.title || '',
      content: Array.isArray(s.elements)
        ? s.elements
            .map((el: any) =>
              typeof el.content === 'string'
                ? el.content
                : JSON.stringify(el.content),
            )
            .join(' ')
        : '',
      visualDescription: '',
      elements: s.elements,
      design: s.design,
      metadata: s.metadata,
    }));

    pptResult = await pptService.generateDirectPpt(slides, context, pptOptions);
    finalHtmlContent = pptResult.htmlPages.join('\n');
    pageCount = slides.length;
  } else if (
    (inputData.storyboard as any)?.pages &&
    Array.isArray((inputData.storyboard as any).pages)
  ) {
    // 兼容 Storyboard 直接作为输入的情况 (包含 visual/narrationHints)
    const storyboard = inputData.storyboard as any;
    const context: GenerationContext = {
      courseTitle:
        storyboard.metadata?.title ||
        pagesData.script?.metadata?.title ||
        '演示文档',
    };

    const slides: StoryboardSlide[] = storyboard.pages.map((p: any) => ({
      id: `slide-${p.page || Math.random().toString(36).substr(2, 9)}`,
      title: Array.isArray(p.visual) ? p.visual[0] : p.visual || '',
      content: Array.isArray(p.narrationHints)
        ? p.narrationHints.join(' ')
        : p.narrationHints || '',
      visualDescription: Array.isArray(p.visual)
        ? p.visual.join('\n')
        : p.visual || '',
      elements: [], // Storyboard 阶段通常还没有 elements，PptService 会处理 AI 生成
    }));

    pptResult = await pptService.generatePptWithAi(slides, context, pptOptions);
    finalHtmlContent = pptResult.htmlPages.join('\n');
    pageCount = slides.length;
  } else {
    // 降级处理或适配旧数据结构
    console.warn(
      '使用旧版 pptSlidesData 结构，建议迁移至 slides 和 context 结构',
    );
    // 针对没有 slides 和 context 也没有 pptSlidesData 的情况抛出更准确的错误
    throw new Error(
      'PptService 已简化，且未提供有效的幻灯片数据 (slides 或 pptSlidesData)',
    );
  }

  // 返回更新后的数据
  const result: Record<string, unknown> = {
    htmlContent: finalHtmlContent,
    metadata: {
      title: pagesData.script?.pages?.[0]?.keyPoints?.[0] || '演示文档',
      description: '基于 AI 生成的 PPT 增强演示文档',
      pageCount: pageCount,
      aspectRatio: (pptOptions as any).aspectRatio || '16:9',
      designStyle: (pptOptions as any).theme || 'modern',
      pptTheme: (pptOptions as any).theme,
      totalSlides: pageCount,
    },
  };

  // 添加 PPT 相关数据
  result.pptSlidesData = pagesData.pptSlidesData || pagesData.slides;
  result.pptResult = pptResult;

  return result;
}

/**
 * PAGES 阶段定义 (增强版)
 * 完全基于 AI 生成的 PPT 数据
 */
export const pagesStep: StepDefinition = createStepDefinition({
  stage: JobStage.PAGES,
  type: 'AI_GENERATION',
  name: 'Pages Generation (Enhanced)',
  description: '基于 AI 生成的 PPT 幻灯片数据',

  // AI 配置 (增强版 - 强调视觉丰富度和数据可视化)
  aiConfig: {
    model: 'google/gemini-2.0-flash-001',
    temperature: 0.8,
    prompt: `# role
你是世界顶级的视觉设计大师和创意总监，擅长创建视觉震撼、数据驱动且极具现代感的演示文稿。你精通信息可视化、版式设计和色彩心理学。

---

# context
你正在为视频的每一页设计独特的视觉呈现。你拥有完整的脚本、每页的详细口播稿以及上一阶段生成的视觉建议。

你的目标是：**拒绝平庸，创造惊艳**。每一页都应该是一件艺术品。

---

# instructions
基于 <script_json> 和 <theme_design_json>，为每一页创造独特的设计：

## 🚨 核心要求：必须使用 elements 数组构建页面

**重要**：你必须将所有视觉内容放入 \`elements\` 数组中。

- **所有视觉内容**（标题、文本、图表、图标等）都必须作为 \`elements\` 数组中的元素。
- \`metadata\` 中的 \`title\` 仅用于元数据参考。

## 设计步骤
   - 认真分析 SCRIPT 中的 \`visualSuggestions\`。
   - 如果建议包含"图表"、"数据"，必须生成 \`chart\` 类型的元素。
   - 如果建议包含"图标"、"卡片"，请使用相应的视觉元素。

2. **数据可视化 (Data Visualization)**：
   - **绝不**使用纯文本罗列数据。
   - 使用 **柱状图 (bar)** 对比数值。
   - 使用 **饼图 (pie)** 或 **环形图 (doughnut)** 展示占比。
   - 使用 **折线图 (line)** 展示趋势。
   - 使用 **数字卡片 (number-card)** 突出关键指标 (KPIs)。
   - 使用 **进度环 (progress-ring)** 展示达成率。

3. **视觉丰富度 (Visual Richness)**：
   - **图标 (Icon)**：为每个要点、标题或卡片添加匹配的图标（使用 lucide 图标库，如 \`lucide:rocket\`, \`lucide:users\`）。
   - **形状 (Shape)**：使用几何图形作为背景装饰、强调区域或视觉引导。
   - **图片 (Image)**：使用高质量的图片作为插图或背景（使用占位符 URL）。
   - **装饰 (Decoration)**：添加装饰性线条、圆点阵列、光晕效果等。

4. **现代布局 (Modern Layouts)**：
   - **卡片式 (Cards)**：将信息分组放入带有阴影和圆角的卡片中。
   - **分栏 (Columns)**：使用不对称分栏（如左图右文，或左侧大标题右侧详情）。
   - **网格 (Grid)**：使用网格系统排列图片或数据块。
   - **玻璃拟态 (Glassmorphism)**：在深色或渐变背景上使用半透明模糊的卡片。

5. **设计一致性**：
   - 严格遵循 <theme_design_json> 中的配色方案和字体设置。
   - 保持视觉语言的统一性。

---

# element_types_guide

请在 \`elements\` 数组中使用以下类型和结构：

## 1. 图表 (Chart)
\`\`\`json
{
  "type": "chart",
  "position": { "x": 50, "y": 200, "width": 500, "height": 400 },
  "content": {
    "type": "bar", // bar, line, pie, doughnut, radar, number-card
    "labels": ["Q1", "Q2", "Q3", "Q4"],
    "datasets": [
      {
        "label": "销售额",
        "data": [120, 150, 180, 220],
        "backgroundColor": "#3b82f6"
      }
    ],
    "options": { "title": "年度销售趋势" }
  }
}
\`\`\`

## 2. 图标 (Icon)
\`\`\`json
{
  "type": "icon",
  "content": {
    "iconName": "lucide:trending-up",
    "color": "#10b981",
    "size": 48
  }
}
\`\`\`

## 3. 形状/装饰 (Shape)
\`\`\`json
{
  "type": "shape",
  "content": {
    "type": "circle", // rectangle, circle, blob, line
    "fill": "rgba(59, 130, 246, 0.1)"
  }
}
\`\`\`

## 4. 文本 (Text) - 支持富文本样式
\`\`\`json
{
  "type": "text",
  "content": "<h1>大标题</h1><p>正文内容...</p>",
  "style": { "fontSize": 24, "color": "#333" }
}
\`\`\`

---

# output_format
请严格按照以下 JSON 格式输出：

\`\`\`json
{
"pptSlidesData": [
{
"slideId": "slide-1",
"design": {
"theme": "modern",
"colors": {
"primary": "#3b82f6",
"secondary": "#8b5cf6",
"accent": "#06b6d4",
"background": "#0f172a",
"text": "#f8fafc",
"textLight": "#94a3b8"
},
"typography": {
"fontFamily": "Inter, system-ui",
"headingFont": "Inter",
"bodyFont": "Inter",
"baseSize": 16,
"headingScale": [3.0, 2.0, 1.5, 1.25, 1.1, 1.0]
},
"background": {
"type": "gradient",
"value": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
"opacity": 1
}
},
"elements": [
{
"id": "el-1",
"type": "text",
"position": { "x": 50, "y": 50, "width": 800, "height": 100 },
"style": { "fontSize": 48, "fontWeight": "bold", "color": "#f8fafc" },
"content": "2024年市场迅猛增长",
"zIndex": 10
},
{
"id": "el-2",
"type": "chart",
"position": { "x": 50, "y": 200, "width": 500, "height": 400 },
"style": { "backgroundColor": "rgba(255,255,255,0.05)", "borderRadius": 16, "backdropFilter": "blur(10px)" },
"content": {
"type": "bar",
"labels": ["Jan", "Feb", "Mar", "Apr"],
"datasets": [{ "label": "用户数", "data": [100, 200, 400, 800], "backgroundColor": "#3b82f6" }]
},
"zIndex": 5
},
{
"id": "el-3",
"type": "icon",
"position": { "x": 600, "y": 200, "width": 64, "height": 64 },
"style": {},
"content": { "iconName": "lucide:users", "color": "#3b82f6", "size": 64 },
"zIndex": 6
},
{
"id": "el-4",
"type": "shape",
"position": { "x": 700, "y": 300, "width": 200, "height": 200 },
"style": { "opacity": 0.3 },
"content": { "type": "circle", "fill": "#3b82f6" },
"zIndex": 1
},
{
"id": "el-5",
"type": "text",
"position": { "x": 50, "y": 650, "width": 600, "height": 80 },
"style": { "fontSize": 24, "color": "#94a3b8" },
"content": "用户增长呈现指数级趋势，月增长率超过 100%",
"zIndex": 8
}
],
"metadata": {
"slideNumber": 1,
"totalSlides": 5,
"title": "市场增长分析"
}
}
],
"metadata": {
"title": "演示文档"
}
}
\`\`\`

---

# design_quality_standards

1. **不要** 生成空白或只有标题的页面。
2. **不要** 让页面元素重叠（除非是有意的层叠设计）。
3. **必须** 为每页生成至少 3-5 个视觉元素在 \`elements\` 数组中（不包括背景）。
4. **必须** 确保文字与背景有足够的对比度。
5. **必须** 响应 \`visualSuggestions\` 中的每一个建议。
6. **必须** 使用 \`elements\` 数组构建所有视觉内容。

---

# output_schema
请严格输出 JSON，结构必须符合本 stage 的 schema（由系统注入）。

---

# constraints
- 禁止使用 \`{{...}}\` 形式的变量占位符。
- 只输出最终产物 JSON。
- 严格遵守 schema。
`,
    tools: undefined,
    schema: pagesOutputSchema,
    meta: {
      category: 'ppt_design',
      complexity: 'high',
      estimatedTokens: 2000,
    },
  },

  // 输入配置
  input: {
    sources: [JobStage.SCRIPT, JobStage.THEME_DESIGN],
    schema: pagesInputSchema,
    description:
      'SCRIPT 阶段的完整脚本和口播稿，以及 THEME_DESIGN 阶段的主题配置',
  },

  // 输出配置
  output: {
    type: ArtifactType.JSON,
    schema: pagesOutputSchema,
    description: 'PPT 幻灯片数据，支持 AI 生成流程',
  },

  // 执行配置
  execution: {
    requiresApproval: true,
    retryPolicy: {
      maxAttempts: 3,
      backoffMs: 1000,
      maxBackoffMs: 5000,
    },
    timeoutMs: 300000, // 5 分钟超时
  },

  // 自定义执行函数
  customExecute: customExecutePagesStep,

  // 自定义输入准备函数
  customPrepareInput: preparePagesInput,

  // 验证函数
  validate() {
    const errors: string[] = [];

    // 验证输出结构的合理性
    const testOutput = {
      htmlContent: '<html><body>Test</body></html>',
      pptSlidesData: [
        {
          slideId: 'slide-1',
          design: {
            layout: 'title',
            theme: 'modern',
            colors: {
              primary: '#3b82f6',
              secondary: '#8b5cf6',
              accent: '#06b6d4',
              background: '#ffffff',
              text: '#1f2937',
              textLight: '#6b7280',
            },
            typography: {
              fontFamily: 'Inter',
              headingFont: 'Inter',
              bodyFont: 'Inter',
              baseSize: 16,
              headingScale: [3.5, 2.5, 2, 1.5, 1.25, 1],
            },
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
              opacity: 1,
            },
          },
          elements: [],
          metadata: {
            slideNumber: 1,
            totalSlides: 1,
            title: '第一页标题',
          },
        },
      ],
      metadata: {
        title: '测试文档',
        pptTheme: 'modern',
        totalSlides: 1,
      },
    };

    const validation = pagesOutputSchema.safeParse(testOutput);
    if (!validation.success) {
      errors.push(
        `Output schema validation failed: ${validation.error.message}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

export default pagesStep;
