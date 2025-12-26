import { Injectable } from '@nestjs/common';
import { ThemeDesignService, ThemeDesignOptions } from './theme-design.service';
import {
  DesignTemplateService,
  DesignTemplate,
} from './design-template.service';

export interface DesignPreview {
  id: string;
  themeConfig: ThemeDesignOptions;
  template: DesignTemplate;
  htmlContent: string;
  cssStyles: string;
  previewUrl?: string;
  generatedAt: string;
}

export interface DesignQualityScore {
  overall: number; // 0-100
  visualAppeal: number; // 视觉吸引力
  readability: number; // 可读性
  accessibility: number; // 可访问性
  performance: number; // 性能
  responsiveness: number; // 响应式
  issues: DesignIssue[];
}

export interface DesignIssue {
  type: 'error' | 'warning' | 'suggestion';
  category: 'visual' | 'accessibility' | 'performance' | 'usability';
  message: string;
  suggestion?: string;
  severity: 'high' | 'medium' | 'low';
}

@Injectable()
export class DesignPreviewService {
  constructor(
    private readonly themeDesignService: ThemeDesignService,
    private readonly designTemplateService: DesignTemplateService,
  ) {}

  /**
   * 生成实时设计预览
   */
  async generatePreview(
    themeConfig: ThemeDesignOptions,
    templateId: string,
  ): Promise<DesignPreview> {
    const template = this.designTemplateService.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    // 验证主题配置
    const validation = this.themeDesignService.validateThemeConfig(themeConfig);
    if (!validation.isValid) {
      throw new Error(`Invalid theme config: ${validation.errors.join(', ')}`);
    }

    // 生成主题样式
    const themeStyles = this.themeDesignService.getThemeStyles(
      themeConfig.designTheme,
    );

    // 合并模板样式和主题样式
    const combinedStyles = this.combineStyles(template.cssStyles, themeStyles);

    // 生成HTML内容
    const htmlContent = this.generatePreviewHtml(
      template,
      themeConfig,
      combinedStyles,
    );

    return {
      id: this.generatePreviewId(),
      themeConfig,
      template,
      htmlContent,
      cssStyles: combinedStyles,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 评估设计质量
   */
  async evaluateDesignQuality(
    themeConfig: ThemeDesignOptions,
    templateId: string,
  ): Promise<DesignQualityScore> {
    const template = this.designTemplateService.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    const issues: DesignIssue[] = [];
    let visualAppeal = 100;
    let readability = 100;
    let accessibility = 100;
    let performance = 100;
    let responsiveness = 100;

    // 视觉吸引力评估
    const visualIssues = this.evaluateVisualAppeal(themeConfig, template);
    issues.push(...visualIssues);
    visualAppeal = Math.max(
      0,
      100 -
        visualIssues.reduce((sum, issue) => {
          return (
            sum +
            (issue.severity === 'high'
              ? 20
              : issue.severity === 'medium'
                ? 10
                : 5)
          );
        }, 0),
    );

    // 可读性评估
    const readabilityIssues = this.evaluateReadability(themeConfig, template);
    issues.push(...readabilityIssues);
    readability = Math.max(
      0,
      100 -
        readabilityIssues.reduce((sum, issue) => {
          return (
            sum +
            (issue.severity === 'high'
              ? 25
              : issue.severity === 'medium'
                ? 15
                : 5)
          );
        }, 0),
    );

    // 可访问性评估
    const accessibilityIssues = this.evaluateAccessibility(
      themeConfig,
      template,
    );
    issues.push(...accessibilityIssues);
    accessibility = Math.max(
      0,
      100 -
        accessibilityIssues.reduce((sum, issue) => {
          return (
            sum +
            (issue.severity === 'high'
              ? 30
              : issue.severity === 'medium'
                ? 15
                : 5)
          );
        }, 0),
    );

    // 性能评估
    const performanceIssues = this.evaluatePerformance(themeConfig, template);
    issues.push(...performanceIssues);
    performance = Math.max(
      0,
      100 -
        performanceIssues.reduce((sum, issue) => {
          return (
            sum +
            (issue.severity === 'high'
              ? 20
              : issue.severity === 'medium'
                ? 10
                : 5)
          );
        }, 0),
    );

    // 响应式评估
    const responsivenessIssues = this.evaluateResponsiveness(template);
    issues.push(...responsivenessIssues);
    responsiveness = Math.max(
      0,
      100 -
        responsivenessIssues.reduce((sum, issue) => {
          return (
            sum +
            (issue.severity === 'high'
              ? 25
              : issue.severity === 'medium'
                ? 15
                : 5)
          );
        }, 0),
    );

    const overall = Math.round(
      (visualAppeal +
        readability +
        accessibility +
        performance +
        responsiveness) /
        5,
    );

    return {
      overall,
      visualAppeal,
      readability,
      accessibility,
      performance,
      responsiveness,
      issues,
    };
  }

  /**
   * 获取设计改进建议
   */
  getImprovementSuggestions(qualityScore: DesignQualityScore): string[] {
    const suggestions: string[] = [];

    // 基于问题生成建议
    qualityScore.issues.forEach((issue) => {
      if (issue.suggestion) {
        suggestions.push(issue.suggestion);
      }
    });

    // 基于分数生成通用建议
    if (qualityScore.visualAppeal < 70) {
      suggestions.push('考虑添加更多视觉元素，如图标、渐变或阴影效果');
    }

    if (qualityScore.readability < 70) {
      suggestions.push('增加字体大小或调整颜色对比度以提高可读性');
    }

    if (qualityScore.accessibility < 70) {
      suggestions.push('确保所有交互元素都有足够的对比度和焦点状态');
    }

    if (qualityScore.performance < 70) {
      suggestions.push('简化CSS动画效果，减少复杂的选择器');
    }

    if (qualityScore.responsiveness < 70) {
      suggestions.push('添加媒体查询以支持不同屏幕尺寸');
    }

    return [...new Set(suggestions)]; // 去重
  }

  /**
   * 合并样式
   */
  private combineStyles(templateStyles: string, themeStyles: string): string {
    return `
    /* Template Styles */
    ${templateStyles}
    
    /* Theme Styles */
    ${themeStyles}
    
    /* Combined Overrides */
    .slide {
      position: relative;
      overflow: hidden;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .slide {
        padding: 20px;
        font-size: 14px;
      }
      .slide h1 {
        font-size: 24px;
      }
    }
    `;
  }

  /**
   * 生成预览HTML
   */
  private generatePreviewHtml(
    template: DesignTemplate,
    themeConfig: ThemeDesignOptions,
    styles: string,
  ): string {
    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>设计预览 - ${template.name}</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
          background: #f8f9fa;
          min-height: 100vh;
        }
        .preview-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .preview-header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .preview-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .theme-badge {
          background: #e3f2fd;
          color: #1976d2;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }
        ${styles}
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="preview-header">
          <div class="preview-info">
            <div>
              <h2 style="margin: 0; color: #333;">设计预览</h2>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">
                模板: ${template.name} | 主题: ${themeConfig.designTheme}
              </p>
            </div>
            <div class="theme-badge">
              ${themeConfig.layoutStyle} 风格
            </div>
          </div>
        </div>
        ${template.htmlTemplate}
      </div>
    </body>
    </html>
    `;
  }

  /**
   * 评估视觉吸引力
   */
  private evaluateVisualAppeal(
    themeConfig: ThemeDesignOptions,
    template: DesignTemplate,
  ): DesignIssue[] {
    const issues: DesignIssue[] = [];

    // 检查是否有现代视觉效果
    if (
      !themeConfig.visualEffects.includes('glass-effect') &&
      !themeConfig.visualEffects.includes('gradient-bg') &&
      template.category !== 'classic'
    ) {
      issues.push({
        type: 'suggestion',
        category: 'visual',
        message: '设计缺少现代视觉效果',
        suggestion: '考虑添加玻璃拟态效果或渐变背景以提升视觉吸引力',
        severity: 'low',
      });
    }

    // 检查颜色搭配
    if (
      themeConfig.visualEffects.length === 0 &&
      template.complexity === 'simple'
    ) {
      issues.push({
        type: 'suggestion',
        category: 'visual',
        message: '设计较为简单',
        suggestion: '可以添加更多视觉元素来增强设计感',
        severity: 'low',
      });
    }

    return issues;
  }

  /**
   * 评估可读性
   */
  private evaluateReadability(
    themeConfig: ThemeDesignOptions,
    template: DesignTemplate,
  ): DesignIssue[] {
    const issues: DesignIssue[] = [];

    // 检查主题是否影响可读性
    if (
      themeConfig.designTheme === 'modern-tech' &&
      !themeConfig.customizations.backdropFilter
    ) {
      issues.push({
        type: 'warning',
        category: 'accessibility',
        message: '玻璃拟态效果可能影响文字可读性',
        suggestion: '确保背景模糊效果不会降低文字对比度',
        severity: 'medium',
      });
    }

    return issues;
  }

  /**
   * 评估可访问性
   */
  private evaluateAccessibility(
    themeConfig: ThemeDesignOptions,
    template: DesignTemplate,
  ): DesignIssue[] {
    const issues: DesignIssue[] = [];

    // 检查颜色对比度
    if (themeConfig.customizations.backgroundColor?.includes('rgba')) {
      issues.push({
        type: 'warning',
        category: 'accessibility',
        message: '透明背景可能影响可访问性',
        suggestion: '确保文字与背景有足够的对比度',
        severity: 'medium',
      });
    }

    return issues;
  }

  /**
   * 评估性能
   */
  private evaluatePerformance(
    themeConfig: ThemeDesignOptions,
    template: DesignTemplate,
  ): DesignIssue[] {
    const issues: DesignIssue[] = [];

    // 检查复杂动画
    if (
      themeConfig.visualEffects.includes('animated-elements') ||
      template.complexity === 'complex'
    ) {
      issues.push({
        type: 'suggestion',
        category: 'performance',
        message: '复杂动画可能影响性能',
        suggestion: '考虑简化动画效果以提高加载性能',
        severity: 'low',
      });
    }

    return issues;
  }

  /**
   * 评估响应式
   */
  private evaluateResponsiveness(template: DesignTemplate): DesignIssue[] {
    const issues: DesignIssue[] = [];

    if (!template.responsive) {
      issues.push({
        type: 'error',
        category: 'usability',
        message: '模板不支持响应式设计',
        suggestion: '添加媒体查询以支持移动设备',
        severity: 'high',
      });
    }

    return issues;
  }

  /**
   * 生成预览ID
   */
  private generatePreviewId(): string {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
