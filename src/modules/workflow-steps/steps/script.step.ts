import { JobStage, ArtifactType } from '@prisma/client';
import { z } from 'zod';
import {
  StepDefinition,
  createStepDefinition,
  ExecutionContext,
} from '../step-definition.interface';

/**
 * SCRIPT 阶段的输出 Schema
 */
export const scriptOutputSchema = z.object({
  fullScript: z.string().min(1),
  pages: z.array(
    z.object({
      pageNumber: z.number().int().min(1),
      narration: z.string().min(1),
      keyPoints: z.array(z.string()).optional(),
      visualSuggestions: z.array(z.string()).optional(),
      duration: z.number().min(0).optional(),
    }),
  ),
  metadata: z
    .object({
      totalDuration: z.number().optional(),
      style: z.string().optional(),
      tone: z.string().optional(),
    })
    .optional(),
});

/**
 * SCRIPT 阶段的输入 Schema
 */
export const scriptInputSchema = z.object({
  storyboard: z.object({
    pages: z.array(
      z.object({
        page: z.number(),
        visual: z.array(z.string()),
        narrationHints: z.array(z.string()),
      }),
    ),
  }),
  outline: z
    .object({
      title: z.string(),
      sections: z.array(
        z.object({
          title: z.string(),
          bullets: z.array(z.string()),
        }),
      ),
    })
    .optional(),
});

/**
 * SCRIPT 阶段的自定义输入准备函数
 */
async function prepareScriptInput(
  jobId: string,
  context: ExecutionContext,
): Promise<Record<string, unknown>> {
  if (!context) {
    throw new Error('Context is required for script input preparation');
  }

  const inputData: Record<string, unknown> = {};

  // 获取 STORYBOARD 阶段的输出
  const storyboardArtifact = await context.prisma.artifact.findFirst({
    where: {
      jobId,
      stage: JobStage.STORYBOARD,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { content: true },
  });

  if (storyboardArtifact?.content) {
    inputData.storyboard = storyboardArtifact.content;
  }

  // 获取 OUTLINE 阶段的输出（可选，用于提供更多上下文）
  const outlineArtifact = await context.prisma.artifact.findFirst({
    where: {
      jobId,
      stage: JobStage.OUTLINE,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { content: true },
  });

  if (outlineArtifact?.content) {
    inputData.outline = outlineArtifact.content;
  }

  return inputData;
}

/**
 * SCRIPT 阶段定义
 * 根据 STORYBOARD 生成完整的视频脚本和每页的详细口播稿
 */
export const scriptStep: StepDefinition = createStepDefinition({
  stage: JobStage.SCRIPT,
  type: 'AI_GENERATION',
  name: 'Script Generation',
  description: '根据分镜脚本生成完整的视频脚本和每页的详细口播稿',

  // AI 配置
  aiConfig: {
    model: 'google/gemini-3-flash-preview',
    temperature: 0.7,
    prompt: `# role
你是一位专业的视频脚本撰稿人，擅长将分镜脚本扩展为完整、生动、适合口语播报的视频脚本。

---

# context
你正在执行视频生成流水线的 SCRIPT 阶段。你需要根据 <storyboard_json> 和 <outline_json>（可选）生成完整的视频脚本和每页的详细口播稿。

这些口播稿将用于：
1. TTS 阶段：转换为语音音频
2. PAGES 阶段：作为页面设计的内容理解基础

---

# instructions
根据 <storyboard_json> 生成完整的视频脚本：

1. **理解整体结构**：
   - 分析分镜中的所有页面和内容要点
   - 理解整体的叙事逻辑和内容流程
   - 确定合适的语气和风格

2. **生成完整脚本**：
   - 为整个视频撰写连贯的脚本
   - 确保内容流畅、逻辑清晰
   - 保持专业性和吸引力

3. **为每页生成详细口播稿**：
   - 基于该页的视觉要点和旁白提示
   - 充分展开内容，不要过于简略
   - 使用口语化表达，适合语音播报
   - 控制长度在 30-120 秒之间
   - 添加必要的过渡和连接

4. **提供专业的视觉建议 (Visual Suggestions)**：
   - **数据可视化**：如果内容包含数字、统计、对比，请明确建议使用图表（如："使用柱状图展示增长趋势"、"使用饼图展示占比"）。
   - **布局建议**：根据内容逻辑建议布局（如："使用左右分栏对比"、"使用卡片网格展示多个特性"）。
   - **视觉元素**：建议使用的图标、插图或装饰元素（如："添加齿轮图标代表设置"）。
   - **关键信息强调**：指出需要通过字体大小、颜色或动画强调的关键词或数字。

5. **辅助信息**：
   - 提取关键要点（Key Points）
   - 估算每页的播报时长

---

# output_format
请严格按照以下 JSON 格式输出：

\`\`\`json
{
  "fullScript": "完整的视频脚本，包含所有页面的内容...",
  "pages": [
    {
      "pageNumber": 1,
      "narration": "第一页的完整口播稿...",
      "keyPoints": ["关键要点1", "关键要点2"],
      "visualSuggestions": [
        "使用柱状图展示2023年与2024年的销售对比",
        "左侧放置图表，右侧放置关键数据总结",
        "重点强调'增长50%'这个数字"
      ],
      "duration": 45
    }
  ],
  "metadata": {
    "totalDuration": 300,
    "style": "专业讲解",
    "tone": "友好亲切"
  }
}
\`\`\`

---

# quality_standards

**口播稿质量标准**：
1. **语言流畅自然**：使用口语化表达，避免书面语
2. **内容完整充分**：充分展开分镜中的要点，不要过于简略
3. **长度适中**：单页口播稿通常在 30-120 秒
4. **逻辑清晰**：前后连贯，过渡自然

**视觉建议质量标准**：
1. **具体明确**：不要只说"展示图片"，要说"展示服务器架构图"
2. **数据敏感**：敏锐捕捉数据内容，建议合适的可视化图表
3. **布局导向**：提供页面结构的建议，不仅仅是元素堆砌

---

# variables
- <storyboard_json> 上游 STORYBOARD 阶段 JSON
- <outline_json> 上游 OUTLINE 阶段 JSON（可选）

---

# output_schema
请严格输出 JSON，结构必须符合本 stage 的 schema（由系统注入）。

---

# constraints
- 禁止使用 \`{{...}}\` 形式的变量占位符；所有变量必须使用尖括号（例如 \`<storyboard>\`）。
- 只输出最终产物，禁止输出解释性文字。
- 严格遵守输出 schema；字段缺失时优先给出空数组/空字符串等安全默认值（除非 schema 禁止）。
- 页面编号必须与分镜保持一致。
- 每页的口播稿必须充分展开，不能过于简略。
- 使用口语化表达，避免书面语。
- 确保整体脚本的连贯性和逻辑性。

---

# self_checklist
- 输出是否为合法 JSON？
- 是否包含 schema 规定的所有必需字段？
- 是否没有出现 \`{{...}}\`？
- 页面数量是否与分镜一致？
- 每页口播稿是否充分展开？
- 口播稿是否使用口语化表达？
- 整体脚本是否连贯？`,
    tools: undefined,
    schema: scriptOutputSchema,
    meta: {
      category: 'script_writing',
      complexity: 'medium',
      estimatedTokens: 1500,
    },
  },

  // 输入配置
  input: {
    sources: [JobStage.STORYBOARD, JobStage.OUTLINE],
    schema: scriptInputSchema,
    description: 'STORYBOARD 阶段的分镜脚本和 OUTLINE 阶段的大纲',
  },

  // 输出配置
  output: {
    type: ArtifactType.JSON,
    schema: scriptOutputSchema,
    description: '完整的视频脚本和每页的详细口播稿',
  },

  // 执行配置
  execution: {
    requiresApproval: false, // SCRIPT 不需要用户审批，保持流程流畅
    retryPolicy: {
      maxAttempts: 3,
      backoffMs: 1000,
      maxBackoffMs: 5000,
    },
    timeoutMs: 180000, // 3 分钟超时
  },

  // 自定义输入准备函数
  customPrepareInput: prepareScriptInput,

  // 验证函数
  validate() {
    const errors: string[] = [];

    // 验证输出结构的合理性
    const testOutput = {
      fullScript: '这是一个完整的视频脚本示例...',
      pages: [
        {
          pageNumber: 1,
          narration:
            '欢迎来到本次课程。今天我们将深入探讨一个非常重要的主题...',
          keyPoints: ['要点1', '要点2'],
          visualSuggestions: ['建议1'],
          duration: 45,
        },
        {
          pageNumber: 2,
          narration: '接下来，让我们看看第二个重要的概念...',
          keyPoints: ['要点3'],
          duration: 50,
        },
      ],
      metadata: {
        totalDuration: 95,
        style: '专业讲解',
        tone: '友好',
      },
    };

    const validation = scriptOutputSchema.safeParse(testOutput);
    if (!validation.success) {
      errors.push(
        `Output schema validation failed: ${validation.error.message}`,
      );
    }

    // 验证页面编号连续性
    const pages = testOutput.pages;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].pageNumber !== i + 1) {
        errors.push(`Page numbers must be consecutive starting from 1`);
        break;
      }
    }

    // 验证口播稿长度
    for (const page of pages) {
      if (page.narration.length < 10) {
        errors.push(
          `Narration for page ${page.pageNumber} is too short (minimum 10 characters)`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

export default scriptStep;
