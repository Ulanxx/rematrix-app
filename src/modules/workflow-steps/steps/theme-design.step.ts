import { JobStage, ArtifactType } from '@prisma/client';
import { z } from 'zod';
import {
  StepDefinition,
  createStepDefinition,
} from '../step-definition.interface';

/**
 * THEME-DESIGN 阶段的输出 Schema
 */
export const themeDesignOutputSchema = z.object({
  designTheme: z.string().min(1),
  colorScheme: z.union([z.string().min(1), z.record(z.string(), z.any())]),
  typography: z.union([z.string().min(1), z.record(z.string(), z.any())]),
  layoutStyle: z.union([z.string().min(1), z.record(z.string(), z.any())]),
  visualEffects: z.union([z.array(z.string()), z.array(z.any())]).default([]),
  customizations: z.record(z.string(), z.any()).default({}),
  previewHtml: z.string().optional(),
});

/**
 * THEME-DESIGN 阶段的输入 Schema
 */
export const themeDesignInputSchema = z.object({
  planOutput: z.string().optional(),
  userPreferences: z.record(z.string(), z.any()).optional(),
});

/**
 * THEME-DESIGN 阶段定义
 * 在 PPT 生成前让用户选择和确认设计风格
 */
export const themeDesignStep: StepDefinition = createStepDefinition({
  stage: JobStage.THEME_DESIGN,
  type: 'AI_GENERATION',
  name: 'Theme Design Selection',
  description: '在 PPT 生成前提供主题设计选择和配置，让用户选择和确认设计风格',

  // AI 配置
  aiConfig: {
    model: 'z-ai/glm-4.7',

    prompt: `# role
你是一名专业的演示设计专家，擅长现代视觉设计和用户体验。

---

# context
你正在执行视频生成流水线的 THEME-DESIGN 阶段，为后续的 PPT 生成提供设计指导。

---

# instructions
根据用户偏好和计划内容，生成一份完整的设计主题配置，包含现代视觉元素如玻璃拟态、渐变效果等。

---

# variables
- <planOutput> 来自 PLAN 阶段的输出内容
- <userPreferences> 用户的设计偏好设置

---

# output_schema
必须输出符合以下结构的 JSON：
{
  "designTheme": "设计主题名称，如 'modern-tech' 或 'minimal-elegant'",
  "colorScheme": "配色方案，如 'blue-gradient' 或 'warm-orange'",
  "typography": "字体风格，如 'modern-sans' 或 'classic-serif'",
  "layoutStyle": "布局风格，如 'glassmorphism' 或 'minimal-clean'",
  "visualEffects": ["视觉效果数组，如 'glass-effect', 'gradient-bg'"],
  "customizations": {},
  "previewHtml": "可选的HTML预览代码"
}

---

# constraints
- 禁止使用 \`{{...}}\` 形式的变量占位符；所有变量必须使用尖括号（例如 \`<planOutput>\`）。
- 只输出最终的 JSON 对象，禁止输出解释性文字或 API 响应格式。
- 严格按照上面的 schema 结构输出，不要添加 message、status 等其他字段。
- 所有字符串字段必须有值，数组字段至少包含一个元素。

---

# self_checklist
- 输出是否为合法 JSON？
- 是否包含 designTheme、colorScheme、typography、layoutStyle 等必需字段？
- 是否没有出现 message、status 等 schema 外的字段？
- 设计主题是否具有现代视觉冲击力？
- 是否包含了玻璃拟态、渐变效果等现代设计元素？`,
    tools: undefined,
    schema: themeDesignOutputSchema,
    meta: {
      category: 'design',
      complexity: 'medium',
      estimatedTokens: 800,
    },
  },

  // 输入配置
  input: {
    sources: [JobStage.PLAN], // 依赖 PLAN 阶段
    schema: themeDesignInputSchema,
    description: '来自 PLAN 阶段的输出和用户偏好',
  },

  // 输出配置
  output: {
    type: ArtifactType.JSON,
    schema: themeDesignOutputSchema,
    description: '设计主题配置，包含主题、色彩、排版和视觉效果',
  },

  // 执行配置
  execution: {
    requiresApproval: true, // THEME-DESIGN 需要用户审批
    retryPolicy: {
      maxAttempts: 3,
      backoffMs: 1000,
      maxBackoffMs: 5000,
    },
    timeoutMs: 180000, // 3 分钟超时
  },

  // 验证函数
  validate() {
    const errors: string[] = [];

    // 验证输出的合理性
    const testOutput = {
      designTheme: 'modern-tech',
      colorScheme: 'blue-gradient',
      typography: 'modern-sans',
      layoutStyle: 'glassmorphism',
      visualEffects: ['glass-effect', 'gradient-bg', 'glow-effect'],
      customizations: {
        primaryColor: '#4A48E2',
        secondaryColor: '#6366F1',
      },
      previewHtml: '<div>Preview content</div>',
    };

    const validation = themeDesignOutputSchema.safeParse(testOutput);
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

export default themeDesignStep;
