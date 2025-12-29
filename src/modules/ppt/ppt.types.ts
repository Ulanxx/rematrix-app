import {
  StoryboardSlide,
  GenerationContext,
  ThemeConfig,
  AiGenerationOptions,
  AiGeneratedHtml,
} from './ai-html-generator.service';

// 重新导出AI生成器中的核心类型
export type {
  StoryboardSlide,
  GenerationContext,
  ThemeConfig,
  AiGenerationOptions,
  AiGeneratedHtml,
};

// PPT生成结果类型
export interface PptGenerationResult {
  htmlPages: string[];
  results: AiGeneratedHtml[];
  stats: {
    total: number;
    success: number;
    failed: number;
    invalid: number;
  };
}
