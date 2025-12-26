import { z } from 'zod';
import { JobStage } from '@prisma/client';

/**
 * Schema示例生成器
 * 为Zod schema生成符合类型约束的示例数据
 */

/**
 * 生成Zod schema的示例数据
 */
export function generateSchemaExample(schema: z.ZodType): any {
  return generateExampleForType(schema);
}

/**
 * 递归生成不同类型的示例数据
 */
function generateExampleForType(schema: z.ZodType): any {
  if (schema instanceof z.ZodObject) {
    const result: Record<string, any> = {};
    const shape = schema.shape;

    for (const [key, value] of Object.entries(shape)) {
      result[key] = generateExampleForType(value as z.ZodType);
    }

    return result;
  }

  if (schema instanceof z.ZodArray) {
    const elementType = schema._def.type;
    // 生成1-3个元素的数组示例
    const length = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length }, () =>
      generateExampleForType(elementType as unknown as z.ZodType),
    );
  }

  if (schema instanceof z.ZodString) {
    return generateStringExample(schema);
  }

  if (schema instanceof z.ZodNumber) {
    return generateNumberExample(schema);
  }

  if (schema instanceof z.ZodBoolean) {
    return true;
  }

  if (schema instanceof z.ZodOptional) {
    return undefined;
  }

  if (schema instanceof z.ZodDefault) {
    return schema._def.defaultValue;
  }

  // 默认返回基本示例
  return '示例数据';
}

/**
 * 生成字符串示例
 */
function generateStringExample(schema: z.ZodString): string {
  const constraints = schema._def;

  if (constraints.checks) {
    for (const check of constraints.checks) {
      if ((check as any).kind === 'min') {
        const min = Number((check as any).value);
        return 'a'.repeat(Number.isFinite(min) && min > 0 ? min : 1);
      }
      if ((check as any).kind === 'max') {
        const max = Number((check as any).value);
        return '示例文本'.substring(
          0,
          Number.isFinite(max) && max > 0 ? max : 4,
        );
      }
    }
  }

  return '示例文本';
}

/**
 * 生成数字示例
 */
function generateNumberExample(schema: z.ZodNumber): number {
  const constraints = schema._def;

  let min = 1;
  let max = 10;

  if (constraints.checks) {
    for (const check of constraints.checks) {
      if ((check as any).kind === 'min') {
        min = (check as any).value || 1;
      }
      if ((check as any).kind === 'max') {
        max = (check as any).value || 10;
      }
    }
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 为特定工作流阶段生成示例数据
 */
export function generateExampleForStage(stage: JobStage): any {
  switch (stage) {
    case JobStage.PLAN:
      return {
        estimatedPages: 8,
        estimatedDurationSec: 120,
        style: '现代简约风格',
        questions: ['需要添加更多实例吗？', '是否包含互动环节？'],
      };

    case JobStage.THEME_DESIGN:
      return {
        designTheme: 'modern-tech',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: ['glass-effect', 'gradient-bg'],
        customizations: {},
      };

    case JobStage.OUTLINE:
      return {
        title: '示例课程大纲',
        sections: [
          {
            title: '第一部分：基础知识',
            bullets: ['概念介绍', '基本原理', '应用场景'],
          },
          {
            title: '第二部分：实践应用',
            bullets: ['实际操作', '案例分析', '总结反思'],
          },
        ],
      };

    case JobStage.STORYBOARD:
      return {
        pages: [
          {
            page: 1,
            visual: ['展示课程标题和讲师信息', '使用简洁的背景设计'],
            narrationHints: ['友好地介绍课程内容', '说明课程目标和价值'],
          },
          {
            page: 2,
            visual: ['使用图标展示学习目标', '清晰的步骤图示'],
            narrationHints: ['清晰说明学习目标', '强调课程实用性'],
          },
        ],
      };

    case JobStage.PAGES:
      return {
        htmlContent:
          '<div class="slide"><h1>课程介绍</h1><ul><li>欢迎来到本课程</li><li>课程目标</li><li>学习路径</li></ul></div>',
        pdfUrl: '',
        pdfGenerated: false,
      };

    case JobStage.DONE:
      return {
        jobId: 'job_123456',
        status: 'completed',
        completedAt: new Date().toISOString(),
        summary: '工作流已成功完成',
      };

    default:
      return {};
  }
}

/**
 * 生成格式化的JSON示例字符串
 */
export function generateFormattedExample(stage: JobStage): string {
  const example = generateExampleForStage(stage);
  return JSON.stringify(example, null, 2);
}
