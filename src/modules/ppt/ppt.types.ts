import {
  StoryboardSlide,
  GenerationContext,
  ThemeConfig,
  AiGenerationOptions,
  AiGeneratedHtml,
} from './ai-html-generator.service';

/**
 * 幻灯片类型
 */
export type SlideType = 'title' | 'content' | 'closing';

/**
 * PPT 母版配置
 */
export interface PptMasterSlideConfig {
  /** 是否显示页码 */
  showPageNumber?: boolean;
  /** 是否显示页眉 */
  showHeader?: boolean;
  /** 页眉左侧文本 (默认为课程标题) */
  headerLeftText?: string;
  /** 页眉右侧文本 (如 "LIVE", "DRAFT") */
  headerRightText?: string;
  /** 是否显示 Logo */
  showLogo?: boolean;
  /** 自定义母版 CSS */
  customCss?: string;
  /** 针对不同类型的特殊配置 */
  typeConfigs?: {
    [key in SlideType]?: {
      showHeader?: boolean;
      showPageNumber?: boolean;
      customCss?: string;
    };
  };
}

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
