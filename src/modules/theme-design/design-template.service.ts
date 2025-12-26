import { Injectable } from '@nestjs/common';

export interface DesignTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  cssStyles: string;
  htmlTemplate: string;
  previewImage?: string;
  complexity: 'simple' | 'medium' | 'complex';
  responsive: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

@Injectable()
export class DesignTemplateService {
  private readonly categories: TemplateCategory[] = [
    {
      id: 'modern',
      name: '现代风格',
      description: '玻璃拟态、渐变效果等现代设计',
      icon: 'modern',
    },
    {
      id: 'classic',
      name: '经典风格',
      description: '传统商务和专业设计',
      icon: 'classic',
    },
    {
      id: 'creative',
      name: '创意风格',
      description: '充满活力和创新的设计',
      icon: 'creative',
    },
    {
      id: 'minimal',
      name: '极简风格',
      description: '简洁明了的设计风格',
      icon: 'minimal',
    },
  ];

  private readonly templates: DesignTemplate[] = [
    // 现代风格模板
    {
      id: 'glassmorphism-card',
      name: '玻璃拟态卡片',
      category: 'modern',
      description: '半透明背景配合模糊效果的现代卡片设计',
      tags: ['glassmorphism', 'modern', 'blur', 'transparent'],
      cssStyles: `
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .glass-card h1 {
          color: #ffffff;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .glass-card p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          line-height: 1.6;
        }
      `,
      htmlTemplate: `
        <div class="glass-card">
          <h1>标题内容</h1>
          <p>这是玻璃拟态卡片的内容展示区域，具有半透明背景和模糊效果。</p>
        </div>
      `,
      complexity: 'medium',
      responsive: true,
    },
    {
      id: 'gradient-hero',
      name: '渐变英雄区',
      category: 'modern',
      description: '动态渐变背景的英雄区域设计',
      tags: ['gradient', 'hero', 'dynamic', 'colorful'],
      cssStyles: `
        .gradient-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }
        .gradient-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .gradient-hero h1 {
          color: #ffffff;
          font-size: 3rem;
          font-weight: 800;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .gradient-hero p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }
      `,
      htmlTemplate: `
        <div class="gradient-hero">
          <h1>渐变英雄标题</h1>
          <p>这是一个具有动态渐变背景的英雄区域设计</p>
        </div>
      `,
      complexity: 'complex',
      responsive: true,
    },
    // 经典风格模板
    {
      id: 'professional-layout',
      name: '专业布局',
      category: 'classic',
      description: '传统商务演示的专业布局设计',
      tags: ['professional', 'business', 'clean', 'structured'],
      cssStyles: `
        .professional-layout {
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .professional-layout .header {
          border-bottom: 3px solid #1e40af;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .professional-layout h1 {
          color: #1e40af;
          font-size: 2.2rem;
          font-weight: 600;
          margin: 0;
        }
        .professional-layout .content {
          color: #374151;
          font-size: 1rem;
          line-height: 1.7;
        }
        .professional-layout .highlight {
          background: #f3f4f6;
          border-left: 4px solid #1e40af;
          padding: 15px;
          margin: 20px 0;
        }
      `,
      htmlTemplate: `
        <div class="professional-layout">
          <div class="header">
            <h1>专业标题</h1>
          </div>
          <div class="content">
            <p>这是专业布局的内容区域，适合商务演示。</p>
            <div class="highlight">
              重点内容突出显示
            </div>
          </div>
        </div>
      `,
      complexity: 'simple',
      responsive: true,
    },
    // 创意风格模板
    {
      id: 'creative-bubble',
      name: '创意泡泡',
      category: 'creative',
      description: '充满活力的泡泡创意设计',
      tags: ['creative', 'bubble', 'colorful', 'playful'],
      cssStyles: `
        .creative-bubble {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          border-radius: 30px;
          padding: 50px;
          position: relative;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          animation: float 6s ease-in-out infinite;
        }
        .bubble:nth-child(1) { width: 80px; height: 80px; top: 10%; left: 10%; animation-delay: 0s; }
        .bubble:nth-child(2) { width: 60px; height: 60px; top: 70%; left: 80%; animation-delay: 2s; }
        .bubble:nth-child(3) { width: 100px; height: 100px; top: 60%; left: 20%; animation-delay: 4s; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .creative-bubble h1 {
          color: #ffffff;
          font-size: 2.8rem;
          font-weight: 800;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 10;
        }
        .creative-bubble p {
          color: #ffffff;
          font-size: 1.3rem;
          text-align: center;
          position: relative;
          z-index: 10;
        }
      `,
      htmlTemplate: `
        <div class="creative-bubble">
          <div class="bubble"></div>
          <div class="bubble"></div>
          <div class="bubble"></div>
          <h1>创意标题</h1>
          <p>充满活力的创意设计展示</p>
        </div>
      `,
      complexity: 'complex',
      responsive: true,
    },
    // 极简风格模板
    {
      id: 'minimal-clean',
      name: '极简清爽',
      category: 'minimal',
      description: '简洁明了的极简设计风格',
      tags: ['minimal', 'clean', 'simple', 'elegant'],
      cssStyles: `
        .minimal-clean {
          background: #ffffff;
          border: 1px solid #f3f4f6;
          border-radius: 4px;
          padding: 60px;
          text-align: center;
        }
        .minimal-clean h1 {
          color: #000000;
          font-size: 2rem;
          font-weight: 300;
          margin-bottom: 30px;
          letter-spacing: 0.05em;
        }
        .minimal-clean p {
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto;
        }
        .minimal-clean .divider {
          width: 40px;
          height: 2px;
          background: #000000;
          margin: 40px auto;
        }
      `,
      htmlTemplate: `
        <div class="minimal-clean">
          <h1>极简标题</h1>
          <div class="divider"></div>
          <p>这是极简风格的内容展示，突出简洁和优雅。</p>
        </div>
      `,
      complexity: 'simple',
      responsive: true,
    },
  ];

  /**
   * 获取所有模板分类
   */
  getCategories(): TemplateCategory[] {
    return this.categories;
  }

  /**
   * 获取所有设计模板
   */
  getAllTemplates(): DesignTemplate[] {
    return this.templates;
  }

  /**
   * 根据分类获取模板
   */
  getTemplatesByCategory(category: string): DesignTemplate[] {
    return this.templates.filter((template) => template.category === category);
  }

  /**
   * 根据ID获取模板
   */
  getTemplateById(id: string): DesignTemplate | undefined {
    return this.templates.find((template) => template.id === id);
  }

  /**
   * 搜索模板
   */
  searchTemplates(query: string): DesignTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return this.templates.filter(
      (template) =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    );
  }

  /**
   * 根据复杂度获取模板
   */
  getTemplatesByComplexity(
    complexity: 'simple' | 'medium' | 'complex',
  ): DesignTemplate[] {
    return this.templates.filter(
      (template) => template.complexity === complexity,
    );
  }

  /**
   * 获取模板的完整HTML（包含样式）
   */
  getTemplateFullHtml(templateId: string): string {
    const template = this.getTemplateById(templateId);
    if (!template) return '';

    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.name}</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
          background: #f8f9fa;
        }
        ${template.cssStyles}
      </style>
    </head>
    <body>
      ${template.htmlTemplate}
    </body>
    </html>
    `;
  }

  /**
   * 获取推荐模板
   */
  getRecommendedTemplates(
    preferences: {
      style?: string;
      complexity?: 'simple' | 'medium' | 'complex';
      responsive?: boolean;
    } = {},
  ): DesignTemplate[] {
    let filtered = [...this.templates];

    if (preferences.style) {
      filtered = filtered.filter(
        (template) => template.category === preferences.style,
      );
    }

    if (preferences.complexity) {
      filtered = filtered.filter(
        (template) => template.complexity === preferences.complexity,
      );
    }

    if (preferences.responsive !== undefined) {
      filtered = filtered.filter(
        (template) => template.responsive === preferences.responsive,
      );
    }

    // 如果没有匹配的结果，返回所有模板
    if (filtered.length === 0) {
      return this.templates.slice(0, 3);
    }

    return filtered.slice(0, 6); // 返回最多6个推荐模板
  }
}
