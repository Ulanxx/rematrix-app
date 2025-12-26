/**
 * PPT 生成配置
 */

export interface PptConfig {
  /** 默认主题配置 */
  defaultTheme: PptThemeConfig;
  /** 色彩方案配置 */
  colorSchemes: Record<string, PptColorScheme>;
  /** 动画配置 */
  animations: PptAnimationConfig;
  /** 布局配置 */
  layouts: PptLayoutConfig;
  /** 字体配置 */
  typography: PptTypographyConfig;
}

export interface PptThemeConfig {
  /** 主题名称 */
  name: string;
  /** 主题描述 */
  description: string;
  /** 默认色彩方案 */
  defaultColorScheme: string;
  /** 支持的布局 */
  supportedLayouts: string[];
  /** 默认动画设置 */
  enableAnimations: boolean;
  /** 设计自由度 */
  designFreedom: 'conservative' | 'balanced' | 'creative' | 'extreme';
}

export interface PptColorScheme {
  /** 方案名称 */
  name: string;
  /** 主色调 */
  primary: string;
  /** 次要色 */
  secondary: string;
  /** 强调色 */
  accent: string;
  /** 背景色 */
  background: string;
  /** 文本色 */
  text: string;
  /** 浅色文本 */
  textLight: string;
  /** 渐变色 */
  gradients: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export interface PptAnimationConfig {
  /** 启用动画 */
  enabled: boolean;
  /** 默认动画类型 */
  defaultType: 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate';
  /** 默认持续时间 */
  defaultDuration: number;
  /** 默认延迟 */
  defaultDelay: number;
  /** 默认缓动函数 */
  defaultEasing: string;
  /** 支持的动画类型 */
  supportedTypes: Array<'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate'>;
}

export interface PptLayoutConfig {
  /** 默认布局 */
  defaultLayout:
    | 'title'
    | 'content'
    | 'two-column'
    | 'image-text'
    | 'comparison'
    | 'custom';
  /** 支持的布局 */
  supportedLayouts: Array<
    'title' | 'content' | 'two-column' | 'image-text' | 'comparison' | 'custom'
  >;
  /** 页面比例 */
  aspectRatio: '16:9' | '4:3' | 'A4';
  /** 间距配置 */
  spacing: {
    horizontal: number;
    vertical: number;
    margin: number;
  };
}

export interface PptTypographyConfig {
  /** 默认字体族 */
  fontFamily: string;
  /** 标题字体 */
  headingFont: string;
  /** 正文字体 */
  bodyFont: string;
  /** 基础字号 */
  baseSize: number;
  /** 标题字号比例 */
  headingScale: number[];
  /** 行高 */
  lineHeight: number;
  /** 字重 */
  fontWeights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
}

/**
 * 默认 PPT 配置
 */
export const defaultPptConfig: PptConfig = {
  defaultTheme: {
    name: 'modern',
    description: '现代专业风格，适合商务演示',
    defaultColorScheme: 'blue',
    supportedLayouts: [
      'title',
      'content',
      'two-column',
      'image-text',
      'comparison',
    ],
    enableAnimations: true,
    designFreedom: 'creative',
  },
  colorSchemes: {
    blue: {
      name: '蓝色系',
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      text: '#1f2937',
      textLight: '#6b7280',
      gradients: {
        primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        secondary: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        background:
          'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)',
      },
    },
    green: {
      name: '绿色系',
      primary: '#10b981',
      secondary: '#059669',
      accent: '#14b8a6',
      background: '#ffffff',
      text: '#064e3b',
      textLight: '#047857',
      gradients: {
        primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        secondary: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
        background:
          'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #ffffff 100%)',
      },
    },
    purple: {
      name: '紫色系',
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a855f7',
      background: '#ffffff',
      text: '#4c1d95',
      textLight: '#6d28d9',
      gradients: {
        primary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        secondary: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        background:
          'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 50%, #ffffff 100%)',
      },
    },
    orange: {
      name: '橙色系',
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#ffffff',
      text: '#9a3412',
      textLight: '#c2410c',
      gradients: {
        primary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        secondary: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
        background:
          'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #ffffff 100%)',
      },
    },
    red: {
      name: '红色系',
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171',
      background: '#ffffff',
      text: '#991b1b',
      textLight: '#b91c1c',
      gradients: {
        primary: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        secondary: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
        background:
          'linear-gradient(135deg, #fef2f2 0%, #fecaca 50%, #ffffff 100%)',
      },
    },
    monochrome: {
      name: '黑白系',
      primary: '#374151',
      secondary: '#1f2937',
      accent: '#6b7280',
      background: '#ffffff',
      text: '#111827',
      textLight: '#4b5563',
      gradients: {
        primary: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        secondary: 'linear-gradient(135deg, #1f2937 0%, #6b7280 100%)',
        background:
          'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #ffffff 100%)',
      },
    },
  },
  animations: {
    enabled: true,
    defaultType: 'fade',
    defaultDuration: 0.8,
    defaultDelay: 0.1,
    defaultEasing: 'ease-out',
    supportedTypes: ['fade', 'slide', 'zoom', 'bounce', 'rotate'],
  },
  layouts: {
    defaultLayout: 'content',
    supportedLayouts: [
      'title',
      'content',
      'two-column',
      'image-text',
      'comparison',
      'custom',
    ],
    aspectRatio: '16:9',
    spacing: {
      horizontal: 20,
      vertical: 20,
      margin: 40,
    },
  },
  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseSize: 16,
    headingScale: [3.5, 2.5, 2, 1.5, 1.25, 1],
    lineHeight: 1.5,
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },
};

/**
 * 主题预设配置
 */
export const themePresets: Record<string, Partial<PptConfig>> = {
  modern: {
    defaultTheme: {
      name: 'modern',
      description: '现代专业风格，适合商务演示',
      defaultColorScheme: 'blue',
      supportedLayouts: [
        'title',
        'content',
        'two-column',
        'image-text',
        'comparison',
      ],
      enableAnimations: true,
      designFreedom: 'creative',
    },
  },
  classic: {
    defaultTheme: {
      name: 'classic',
      description: '经典传统风格，适合正式场合',
      defaultColorScheme: 'monochrome',
      supportedLayouts: ['title', 'content'],
      enableAnimations: false,
      designFreedom: 'conservative',
    },
  },
  minimal: {
    defaultTheme: {
      name: 'minimal',
      description: '极简风格，突出内容本身',
      defaultColorScheme: 'monochrome',
      supportedLayouts: ['title', 'content'],
      enableAnimations: false,
      designFreedom: 'balanced',
    },
  },
  creative: {
    defaultTheme: {
      name: 'creative',
      description: '创意风格，适合创新主题',
      defaultColorScheme: 'purple',
      supportedLayouts: [
        'title',
        'content',
        'two-column',
        'image-text',
        'comparison',
        'custom',
      ],
      enableAnimations: true,
      designFreedom: 'extreme',
    },
  },
  corporate: {
    defaultTheme: {
      name: 'corporate',
      description: '企业风格，适合公司演示',
      defaultColorScheme: 'blue',
      supportedLayouts: ['title', 'content', 'two-column'],
      enableAnimations: true,
      designFreedom: 'balanced',
    },
  },
  tech: {
    defaultTheme: {
      name: 'tech',
      description: '科技风格，适合技术主题',
      defaultColorScheme: 'green',
      supportedLayouts: ['title', 'content', 'two-column', 'image-text'],
      enableAnimations: true,
      designFreedom: 'creative',
    },
  },
};

/**
 * 获取主题配置
 */
export function getThemeConfig(theme: string): Partial<PptConfig> {
  return themePresets[theme] || themePresets.modern;
}

/**
 * 获取色彩方案
 */
export function getColorScheme(scheme: string): PptColorScheme {
  return (
    defaultPptConfig.colorSchemes[scheme] || defaultPptConfig.colorSchemes.blue
  );
}
