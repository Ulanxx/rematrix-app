import { JobStage, ArtifactType } from '@prisma/client';
import { z } from 'zod';
import {
  StepDefinition,
  createStepDefinition,
} from '../step-definition.interface';

/**
 * NARRATION 阶段的输出 Schema
 */
export const narrationOutputSchema = z.object({
  pages: z.array(
    z.object({
      page: z.number().int().min(1),
      text: z.string().min(1),
    }),
  ),
});

/**
 * NARRATION 阶段的输入 Schema
 */
export const narrationInputSchema = z.object({
  storyboard: z.object({
    pages: z.array(
      z.object({
        page: z.number(),
        visual: z.array(z.string()),
        narrationHints: z.array(z.string()),
      }),
    ),
  }),
  markdown: z.string().min(1),
});

/**
 * NARRATION 阶段定义
 * 根据 STORYBOARD 和原始 Markdown 生成逐页旁白文稿
 */
export const narrationStep: StepDefinition = createStepDefinition({
  stage: JobStage.NARRATION,
  type: 'AI_GENERATION',
  name: 'Narration Generation',
  description: '根据分镜脚本与原始文档生成逐页旁白文稿，用于语音合成',

  // AI 配置
  aiConfig: {
    model: 'google/gemini-3.0-flash',
    temperature: 0.6,
    prompt: `# role
你是一名旁白撰稿与配音导演，擅长写口播稿。

---

# context
你正在执行视频生成流水线的 NARRATION 阶段。

---

# instructions
根据 <storyboard_json> 与 <markdown> 生成逐页 NARRATION 文本。

---

# variables
- <storyboard_json> 上游 STORYBOARD 阶段 JSON
- <markdown> 用户输入的 Markdown 原文

---

# output_schema
请严格输出 JSON，结构必须符合本 stage 的 schema（由系统注入）。

---

# constraints
- 禁止使用 \`{{...}}\` 形式的变量占位符；所有变量必须使用尖括号（例如 \`<markdown>\`）。
- 只输出最终产物，禁止输出解释性文字。
- 严格遵守输出 schema；字段缺失时优先给出空数组/空字符串等安全默认值（除非 schema 禁止）。
- 旁白文本要口语化，适合朗读。
- 每页的旁白要与画面内容匹配。
- 控制每页旁白的长度，避免过长或过短。
- 保持整体风格的一致性。

---

# self_checklist
- 输出是否为合法 JSON？
- 是否包含 schema 规定的所有必需字段？
- 是否没有出现 \`{{...}}\`？
- 旁白文本是否口语化？
- 页面编号是否与分镜一致？`,
    tools: undefined,
    schema: narrationOutputSchema,
    meta: {
      category: 'content_writing',
      complexity: 'medium',
      estimatedTokens: 1000,
    },
  },

  // 输入配置
  input: {
    sources: [JobStage.STORYBOARD], // 主要依赖 STORYBOARD 阶段
    schema: narrationInputSchema,
    description: 'STORYBOARD 阶段的分镜脚本和原始 Markdown 文档',
  },

  // 输出配置
  output: {
    type: ArtifactType.JSON,
    schema: narrationOutputSchema,
    description: '逐页旁白文稿，包含每页的具体口播文本',
  },

  // 执行配置
  execution: {
    requiresApproval: true, // NARRATION 需要用户审批
    retryPolicy: {
      maxAttempts: 3,
      backoffMs: 1000,
      maxBackoffMs: 5000,
    },
    timeoutMs: 150000, // 2.5 分钟超时
  },

  // 验证函数
  validate() {
    const errors: string[] = [];

    // 验证输出结构的合理性
    const testOutput = {
      pages: [
        {
          page: 1,
          text: '这是第一页的旁白文稿，内容要简洁明了，适合朗读。',
        },
        {
          page: 2,
          text: '这是第二页的旁白文稿，与画面内容相匹配。',
        },
      ],
    };

    const validation = narrationOutputSchema.safeParse(testOutput);
    if (!validation.success) {
      errors.push(
        `Output schema validation failed: ${validation.error.message}`,
      );
    }

    // 验证页面编号连续性
    const pages = testOutput.pages;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].page !== i + 1) {
        errors.push(`Page numbers must be consecutive starting from 1`);
        break;
      }
    }

    // 验证文本长度合理性
    for (const page of pages) {
      if (page.text.length < 10) {
        errors.push(`Narration text too short for page ${page.page}`);
      }
      if (page.text.length > 500) {
        errors.push(`Narration text too long for page ${page.page}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

export default narrationStep;
