import { Injectable } from '@nestjs/common';

export interface DesignTheme {
  id: string;
  name: string;
  description: string;
  colorScheme: string;
  typography: string;
  layoutStyle: string;
  visualEffects: string[];
  previewHtml: string;
  customizations: Record<string, any>;
}

export interface ThemeDesignOptions {
  designTheme: string;
  colorScheme: string;
  typography: string;
  layoutStyle: string;
  visualEffects: string[];
  customizations: Record<string, any>;
}

@Injectable()
export class ThemeDesignService {
  private readonly designThemes: DesignTheme[] = [
    {
      id: 'modern-tech',
      name: '现代科技',
      description: '融合玻璃拟态和渐变效果的现代科技风格',
      colorScheme: 'blue-gradient',
      typography: 'modern-sans',
      layoutStyle: 'glassmorphism',
      visualEffects: [
        'glass-effect',
        'gradient-bg',
        'glow-effect',
        'tech-grid',
      ],
      previewHtml: this.generatePreviewHtml('modern-tech'),
      customizations: {
        primaryColor: '#4A48E2',
        secondaryColor: '#6366F1',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    },
    {
      id: 'classic-professional',
      name: '经典商务',
      description: '传统商务风格，适合正式演示',
      colorScheme: 'professional-blue',
      typography: 'classic-serif',
      layoutStyle: 'traditional',
      visualEffects: ['subtle-shadow', 'clean-lines'],
      previewHtml: this.generatePreviewHtml('classic-professional'),
      customizations: {
        primaryColor: '#1E40AF',
        secondaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        border: '2px solid #E5E7EB',
      },
    },
    {
      id: 'creative-vibrant',
      name: '创意活力',
      description: '充满活力的创意设计，适合创新主题',
      colorScheme: 'vibrant-rainbow',
      typography: 'playful-sans',
      layoutStyle: 'dynamic',
      visualEffects: [
        'color-transitions',
        'animated-elements',
        'gradient-text',
      ],
      previewHtml: this.generatePreviewHtml('creative-vibrant'),
      customizations: {
        primaryColor: '#EC4899',
        secondaryColor: '#8B5CF6',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        animation: 'ease-in-out',
      },
    },
    {
      id: 'minimal-clean',
      name: '极简主义',
      description: '简洁明了的极简风格，突出内容本身',
      colorScheme: 'monochrome',
      typography: 'minimal-sans',
      layoutStyle: 'minimal',
      visualEffects: ['subtle-gradients', 'clean-typography'],
      previewHtml: this.generatePreviewHtml('minimal-clean'),
      customizations: {
        primaryColor: '#000000',
        secondaryColor: '#666666',
        backgroundColor: '#FFFFFF',
        border: '1px solid #F3F4F6',
      },
    },
  ];

  /**
   * 获取所有可用的设计主题
   */
  getAllThemes(): DesignTheme[] {
    return this.designThemes;
  }

  /**
   * 根据ID获取特定主题
   */
  getThemeById(id: string): DesignTheme | undefined {
    return this.designThemes.find((theme) => theme.id === id);
  }

  /**
   * 根据用户偏好推荐主题
   */
  recommendTheme(preferences: Record<string, any>): DesignTheme {
    // 简单的推荐逻辑，可以根据需要扩展
    const { style, complexity, colorPreference } = preferences;

    if (style === 'professional') {
      return this.getThemeById('classic-professional')!;
    }
    if (style === 'modern') {
      return this.getThemeById('modern-tech')!;
    }
    if (style === 'creative') {
      return this.getThemeById('creative-vibrant')!;
    }

    // 默认返回现代科技主题
    return this.getThemeById('modern-tech')!;
  }

  /**
   * 生成主题配置
   */
  generateThemeConfig(
    themeId: string,
    customizations: Record<string, any> = {},
  ): ThemeDesignOptions {
    const theme = this.getThemeById(themeId);
    if (!theme) {
      throw new Error(`Theme with id ${themeId} not found`);
    }

    return {
      designTheme: theme.id,
      colorScheme: theme.colorScheme,
      typography: theme.typography,
      layoutStyle: theme.layoutStyle,
      visualEffects: theme.visualEffects,
      customizations: { ...theme.customizations, ...customizations },
    };
  }

  /**
   * 验证主题配置
   */
  validateThemeConfig(config: ThemeDesignOptions): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.designTheme) {
      errors.push('Design theme is required');
    }

    if (!config.colorScheme) {
      errors.push('Color scheme is required');
    }

    if (!config.typography) {
      errors.push('Typography is required');
    }

    if (!config.layoutStyle) {
      errors.push('Layout style is required');
    }

    const theme = this.getThemeById(config.designTheme);
    if (!theme) {
      errors.push(`Invalid design theme: ${config.designTheme}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 生成预览HTML
   */
  private generatePreviewHtml(themeId: string): string {
    const theme = this.getThemeById(themeId);
    if (!theme) return '';

    const { customizations } = theme;

    return `
    <div style="
      background: ${customizations.backgroundColor};
      border: ${customizations.border};
      border-radius: 12px;
      padding: 24px;
      backdrop-filter: ${customizations.backdropFilter || 'none'};
      font-family: ${customizations.fontFamily || 'system-ui, -apple-system, sans-serif'};
    ">
      <h1 style="
        color: ${customizations.primaryColor};
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 16px;
      ">示例标题</h1>
      <p style="
        color: ${customizations.secondaryColor};
        font-size: 18px;
        line-height: 1.6;
        margin-bottom: 12px;
      ">这是示例内容，展示主题的视觉效果。</p>
      <div style="
        background: ${customizations.primaryColor}20;
        border-left: 4px solid ${customizations.primaryColor};
        padding: 12px;
        margin: 16px 0;
      ">重点内容突出显示</div>
    </div>
    `;
  }

  /**
   * 获取主题的CSS样式
   */
  getThemeStyles(themeId: string): string {
    const theme = this.getThemeById(themeId);
    if (!theme) return '';

    const { customizations } = theme;

    return `
    :root {
      --primary-color: ${customizations.primaryColor};
      --secondary-color: ${customizations.secondaryColor};
      --background-color: ${customizations.backgroundColor};
      --border-color: ${customizations.border};
      --backdrop-filter: ${customizations.backdropFilter || 'none'};
    }
    
    .slide {
      background: var(--background-color);
      border: var(--border-color);
      border-radius: 12px;
      backdrop-filter: var(--backdrop-filter);
    }
    
    .slide h1 {
      color: var(--primary-color);
      font-size: 32px;
      font-weight: bold;
    }
    
    .slide p {
      color: var(--secondary-color);
      font-size: 18px;
      line-height: 1.6;
    }
    
    .slide .highlight {
      background: var(--primary-color)20;
      border-left: 4px solid var(--primary-color);
      padding: 12px;
      margin: 16px 0;
    }
    `;
  }
}
