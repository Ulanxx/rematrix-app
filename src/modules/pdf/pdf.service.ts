import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser } from 'playwright';
import { uploadFileToBunny } from '../../utils/bunny-storage';
import { PptGenerationOptions, PptGenerationResult } from '../ppt/ppt.types';

/**
 * PDF 生成接口
 */
export interface PdfGenerationOptions {
  /** 页面格式 */
  format?: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | '16:9';
  /** 打印方向 */
  orientation?: 'portrait' | 'landscape';
  /** 页边距 (mm) */
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /** 是否显示页眉页脚 */
  displayHeaderFooter?: boolean;
  /** 页眉模板 */
  headerTemplate?: string;
  /** 页脚模板 */
  footerTemplate?: string;
  /** 是否打印背景 */
  printBackground?: boolean;
  /** 设计模板类型 */
  designTemplate?: 'modern' | 'classic' | 'minimal' | 'gradient';
  /** 是否启用AI内容扩充 */
  enableAiExpansion?: boolean;
  /** PDF 质量设置 */
  quality?: 'standard' | 'high' | 'print';
  /** 水印配置 */
  watermark?: {
    enabled: boolean;
    text?: string;
    opacity?: number;
  };
}

/**
 * PPT PDF 生成选项
 */
export interface PptPdfGenerationOptions {
  /** 基础 PDF 生成选项 */
  pdfOptions?: PdfGenerationOptions;
  /** PPT 特定选项 */
  pptOptions?: PptGenerationOptions;
  /** 是否包含动画效果 */
  includeAnimations?: boolean;
  /** 页面范围 */
  pageRange?: {
    start?: number;
    end?: number;
  };
  /** 是否生成目录书签 */
  generateBookmarks?: boolean;
}

/**
 * 页面数据接口
 */
export interface PagesData {
  theme: {
    primary: string;
    background: string;
    text: string;
    secondary?: string;
    accent?: string;
  };
  slides: Array<{
    title: string;
    bullets: string[];
    design?: string;
    icon?: string;
    expandedContent?: string;
    backgroundType?: 'solid' | 'gradient' | 'image';
    layout?: 'center' | 'left' | 'right' | 'two-column';
  }>;
  designConfig?: {
    template: 'modern' | 'classic' | 'minimal' | 'gradient';
    fontFamily?: string;
    fontSize?: 'small' | 'medium' | 'large';
    animations?: boolean;
  };
}

/**
 * PDF 生成结果接口
 */
export interface PdfGenerationResult {
  /** PDF 文件 URL */
  pdfUrl: string;
  /** 存储路径 */
  storagePath: string;
  /** 文件大小 (bytes) */
  fileSize: number;
  /** 生成时间戳 */
  generatedAt: string;
  /** 元数据信息 */
  metadata?: {
    generatedAt: string;
    format?: string;
    orientation?: string;
    source?: string;
  };
}

/**
 * PDF 生成服务
 *
 * 使用 Playwright 将页面数据转换为 PDF 文档
 */
@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private browser: Browser | null = null;

  /**
   * 初始化浏览器实例
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * 生成 HTML 模板
   */
  private generateHtmlTemplate(
    pagesData: PagesData,
    options: PdfGenerationOptions = {},
  ): string {
    const { theme, slides, designConfig } = pagesData;
    const template =
      designConfig?.template || options.designTemplate || 'modern';

    // 生成幻灯片 HTML
    const slidesHtml = slides
      .map((slide, index) =>
        this.generateSlideHtml(slide, index, theme, template),
      )
      .join('');

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rematrix 演示文档</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '${theme.primary}',
            background: '${theme.background}',
            text: '${theme.text}',
            secondary: '${theme.secondary || theme.primary}',
            accent: '${theme.accent || theme.primary}'
          },
          fontFamily: {
            'sans': ['Inter', 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', 'Arial', 'sans-serif'],
          },
        }
      }
    }
  </script>
  <style>
    /* 16:9 宽屏布局 */
    @page {
      size: ${options.format === '16:9' ? '16in 9in' : 'A4'} ${options.orientation || 'portrait'};
      margin: ${options.margin ? `${options.margin.top}mm ${options.margin.right}mm ${options.margin.bottom}mm ${options.margin.left}mm` : '20mm'};
    }
    
    body {
      font-family: 'Inter', 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
      background: ${theme.background};
      color: ${theme.text};
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    
    /* 现代化幻灯片样式 */
    .slide {
      width: 100%;
      min-height: ${options.format === '16:9' ? '100vh' : '100vh'};
      padding: ${options.format === '16:9' ? '40px 60px' : '60px 80px'};
      position: relative;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      overflow: hidden;
    }
    
    .slide:last-child {
      page-break-after: auto;
    }
    
    /* 渐变背景样式 */
    .gradient-bg {
      background: linear-gradient(135deg, ${theme.primary}20 0%, ${theme.background} 100%);
    }
    
    .gradient-modern {
      background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary || theme.primary}10 50%, ${theme.background} 100%);
    }
    
    .gradient-classic {
      background: linear-gradient(180deg, ${theme.primary}08 0%, ${theme.background} 100%);
    }
    
    .gradient-minimal {
      background: linear-gradient(45deg, ${theme.background} 0%, ${theme.primary}05 100%);
    }
    
    /* 现代化样式模板 */
    .modern-style {
      background: linear-gradient(135deg, ${theme.primary}12 0%, ${theme.background} 100%);
      border-radius: 8px;
      box-shadow: 0 4px 20px ${theme.primary}15;
    }
    
    .modern-style .slide-title {
      background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary || theme.primary});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .classic-style {
      background: ${theme.background};
      border: 2px solid ${theme.primary}20;
      border-radius: 4px;
    }
    
    .classic-style .slide-title {
      color: ${theme.primary};
      border-bottom: 3px solid ${theme.primary};
      padding-bottom: 10px;
    }
    
    .minimal-style {
      background: ${theme.background};
      color: ${theme.text};
    }
    
    .minimal-style .slide-title {
      color: ${theme.text};
      font-weight: 300;
      border-bottom: 1px solid ${theme.text}30;
    }
    
    /* 页面编号 */
    .slide-number {
      position: absolute;
      top: 20px;
      right: 30px;
      font-size: 12px;
      color: ${theme.primary};
      opacity: 0.7;
      font-weight: 500;
      background: ${theme.primary}10;
      padding: 4px 8px;
      border-radius: 12px;
    }
    
    /* 标题样式 */
    .slide-title {
      font-size: ${options.format === '16:9' ? '42px' : '36px'};
      font-weight: 700;
      color: ${theme.primary};
      margin-bottom: ${options.format === '16:9' ? '30px' : '40px'};
      text-align: center;
      line-height: 1.2;
      position: relative;
    }
    
    .slide-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background: ${theme.primary};
      border-radius: 2px;
    }
    
    /* 内容布局 */
    .slide-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      max-width: ${options.format === '16:9' ? '1200px' : '800px'};
      margin: 0 auto;
    }
    
    /* 现代化列表样式 */
    .modern-list {
      list-style: none;
      padding: 0;
    }
    
    .modern-item {
      font-size: ${options.format === '16:9' ? '22px' : '20px'};
      margin-bottom: ${options.format === '16:9' ? '16px' : '20px'};
      position: relative;
      padding-left: 40px;
      line-height: 1.6;
      display: flex;
      align-items: flex-start;
      background: ${theme.primary}05;
      border-radius: 8px;
      padding: 12px 12px 12px 40px;
      transition: all 0.3s ease;
    }
    
    .modern-item:hover {
      background: ${theme.primary}10;
      transform: translateX(5px);
    }
    
    .modern-item i {
      position: absolute;
      left: 12px;
      top: 14px;
      color: ${theme.primary};
      font-size: 18px;
      width: 20px;
      text-align: center;
    }
    
    /* 扩展内容样式 */
    .expanded-content {
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, ${theme.primary}08 0%, ${theme.secondary || theme.primary}05 100%);
      border-left: 4px solid ${theme.primary};
      border-radius: 0 8px 8px 0;
      font-size: 16px;
      line-height: 1.6;
      box-shadow: 0 2px 10px ${theme.primary}10;
    }
    
    /* 图标样式 */
    .slide-icon {
      font-size: 48px;
      color: ${theme.primary};
      margin-bottom: 20px;
      text-align: center;
      background: ${theme.primary}10;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
      box-shadow: 0 4px 15px ${theme.primary}20;
    }
    
    /* 两列布局 */
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: start;
    }
    
    /* 左对齐布局 */
    .left-align .slide-content {
      text-align: left;
      justify-content: flex-start;
      padding-top: 40px;
    }
    
    .left-align .slide-title {
      text-align: left;
    }
    
    .left-align .slide-title::after {
      left: 0;
      transform: none;
    }
    
    /* 右对齐布局 */
    .right-align .slide-content {
      text-align: right;
      justify-content: flex-start;
      padding-top: 40px;
    }
    
    .right-align .slide-title {
      text-align: right;
    }
    
    .right-align .slide-title::after {
      right: 0;
      left: auto;
      transform: none;
    }
    
    /* 打印优化 */
    @media print {
      .slide {
        page-break-after: always;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .slide:last-child {
        page-break-after: auto;
      }
      
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    /* 动画效果 */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .fade-in {
      animation: fadeIn 0.6s ease-out;
    }
  </style>
</head>
<body>
  ${slidesHtml}
  
  <div style="text-align: center; margin-top: 40px; padding: 20px; font-size: 10px; color: ${theme.primary}60;">
    生成时间: ${new Date().toLocaleString('zh-CN')} | Rematrix AI 智能生成
  </div>
</body>
</html>`;
  }

  /**
   * 生成单个幻灯片 HTML
   */
  private generateSlideHtml(
    slide: any,
    index: number,
    theme: any,
    template: string,
  ): string {
    const layout = slide.layout || 'center';
    const hasIcon = slide.icon;
    const hasExpandedContent = slide.expandedContent;
    const slideBackground = this.getSlideBackground(slide, theme);

    let bulletsHtml = '';
    if (slide.bullets && slide.bullets.length > 0) {
      bulletsHtml = slide.bullets
        .map((bullet: string, bulletIndex: number) => {
          const icon = this.getBulletIcon(bulletIndex, slide.icon);
          return `<li class="modern-item fade-in" style="animation-delay: ${
            bulletIndex * 0.1
          }s">
          <i class="${icon}"></i>
          <span>${this.escapeHtml(bullet)}</span>
        </li>`;
        })
        .join('');
    }

    let expandedHtml = '';
    if (hasExpandedContent) {
      expandedHtml = `<div class="expanded-content fade-in" style="animation-delay: ${
        slide.bullets.length * 0.1
      }s">
        ${this.escapeHtml(slide.expandedContent)}
      </div>`;
    }

    const iconHtml = hasIcon
      ? `<div class="slide-icon fade-in">
      <i class="${slide.icon}"></i>
    </div>`
      : '';

    const contentClass = layout === 'two-column' ? 'two-column' : '';
    const slideClass = `slide ${this.getSlideClass(
      slide,
      template,
    )} fade-in ${layout}-align`;

    return `
      <div class="${slideClass}" style="background: ${slideBackground};">
        <div class="slide-number">${index + 1}</div>
        <div class="slide-content">
          ${iconHtml}
          <h1 class="slide-title">${this.escapeHtml(slide.title)}</h1>
          <ul class="modern-list ${contentClass}">
            ${bulletsHtml}
          </ul>
          ${expandedHtml}
        </div>
      </div>
    `;
  }

  /**
   * 获取幻灯片背景
   */
  private getSlideBackground(slide: any, theme: any): string {
    const backgroundType = slide.backgroundType || 'solid';

    switch (backgroundType) {
      case 'gradient':
        return `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.background} 100%)`;
      case 'image':
        return `${theme.background} url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="${theme.primary}20" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`;
      default:
        return theme.background;
    }
  }

  /**
   * 获取幻灯片样式类
   */
  private getSlideClass(slide: any, template: string): string {
    const classes: string[] = [];

    if (slide.backgroundType === 'gradient') {
      classes.push('gradient-modern');
    }

    switch (template) {
      case 'gradient':
        classes.push('gradient-bg');
        break;
      case 'minimal':
        classes.push('minimal-style');
        break;
      case 'classic':
        classes.push('classic-style');
        break;
      default:
        classes.push('modern-style');
    }

    return classes.join(' ');
  }

  /**
   * 获取列表项图标
   */
  private getBulletIcon(index: number, slideIcon?: string): string {
    if (slideIcon) {
      return slideIcon;
    }

    const icons = [
      'fas fa-chevron-right',
      'fas fa-check-circle',
      'fas fa-arrow-right',
      'fas fa-angle-right',
      'fas fa-play-circle',
      'fas fa-star',
      'fas fa-circle',
      'fas fa-square',
    ];

    return icons[index % icons.length];
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 从 AI 生成的 HTML 内容生成 PDF
   */
  async generatePdfFromHtml(
    htmlContent: string,
    jobId: string,
    options: PdfGenerationOptions = {},
  ): Promise<PdfGenerationResult> {
    this.logger.log(
      `开始为任务 ${jobId} 使用 AI 生成的 HTML 生成 PDF，格式: ${
        options.format || '16:9'
      }`,
    );

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // 设置默认选项，支持16:9布局
      const defaultFormat = options.format || '16:9';
      const isLandscape =
        defaultFormat === '16:9' || options.orientation === 'landscape';

      const pdfOptions = {
        format: defaultFormat === '16:9' ? undefined : defaultFormat,
        orientation: isLandscape ? 'landscape' : 'portrait',
        width: defaultFormat === '16:9' ? '1600px' : undefined,
        height: defaultFormat === '16:9' ? '900px' : undefined,
        margin: {
          top: options.margin?.top || (defaultFormat === '16:9' ? 10 : 20),
          right: options.margin?.right || (defaultFormat === '16:9' ? 10 : 20),
          bottom:
            options.margin?.bottom || (defaultFormat === '16:9' ? 10 : 20),
          left: options.margin?.left || (defaultFormat === '16:9' ? 10 : 20),
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || '<div></div>',
        footerTemplate: options.footerTemplate || '<div></div>',
        printBackground: options.printBackground !== false,
        preferCSSPageSize: true,
      };

      // 设置页面内容
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle',
      });

      // 等待页面完全加载，包括字体和图片
      await page.waitForTimeout(3000);

      // 生成 PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      // 上传到云存储
      const timestamp = Date.now();
      const storagePath = `jobs/${jobId}/pdfs/course-${timestamp}.pdf`;

      const uploadResult = await uploadFileToBunny({
        path: storagePath,
        buffer: pdfBuffer,
        contentType: 'application/pdf',
      });

      const result: PdfGenerationResult = {
        pdfUrl: uploadResult.publicUrl || uploadResult.storageUrl,
        storagePath,
        fileSize: pdfBuffer.length,
        generatedAt: new Date().toISOString(),
        metadata: {
          generatedAt: new Date().toISOString(),
          format: defaultFormat,
          orientation: isLandscape ? 'landscape' : 'portrait',
          source: 'ai-generated',
        },
      };

      this.logger.log(
        `AI 生成 HTML 的 PDF 生成完成: ${result.pdfUrl}, 大小: ${result.fileSize} bytes`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `AI 生成 HTML 的 PDF 生成失败: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * 从页面数据生成 PDF
   */
  async generatePdfFromPages(
    pagesData: PagesData,
    jobId: string,
    options: PdfGenerationOptions = {},
  ): Promise<PdfGenerationResult> {
    this.logger.log(
      `开始为任务 ${jobId} 生成 PDF，格式: ${
        options.format || 'A4'
      }，模板: ${options.designTemplate || 'modern'}`,
    );

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // 设置默认选项，支持16:9布局
      const defaultFormat = options.format || '16:9'; // 默认使用16:9
      const isLandscape =
        defaultFormat === '16:9' || options.orientation === 'landscape';

      const pdfOptions = {
        format: defaultFormat === '16:9' ? undefined : defaultFormat, // Playwright不支持16:9，使用CSS控制
        orientation: isLandscape ? 'landscape' : 'portrait',
        width: defaultFormat === '16:9' ? '1600px' : undefined,
        height: defaultFormat === '16:9' ? '900px' : undefined,
        margin: {
          top: options.margin?.top || (defaultFormat === '16:9' ? 10 : 20),
          right: options.margin?.right || (defaultFormat === '16:9' ? 10 : 20),
          bottom:
            options.margin?.bottom || (defaultFormat === '16:9' ? 10 : 20),
          left: options.margin?.left || (defaultFormat === '16:9' ? 10 : 20),
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || '<div></div>',
        footerTemplate: options.footerTemplate || '<div></div>',
        printBackground: options.printBackground !== false,
        preferCSSPageSize: true,
      };

      // 生成增强的HTML模板
      const htmlContent = this.generateHtmlTemplate(pagesData, options);

      await page.setContent(htmlContent, {
        waitUntil: 'networkidle',
      });

      // 等待页面完全加载，包括字体和图标
      await page.waitForTimeout(3000);

      // 生成 PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      // 上传到云存储
      const timestamp = Date.now();
      const storagePath = `jobs/${jobId}/pdfs/course-${timestamp}.pdf`;

      const uploadResult = await uploadFileToBunny({
        path: storagePath,
        buffer: pdfBuffer,
        contentType: 'application/pdf',
      });

      this.logger.log(`PDF 生成完成: ${uploadResult.publicUrl}`);

      return {
        pdfUrl: uploadResult.publicUrl || uploadResult.storageUrl,
        storagePath,
        fileSize: pdfBuffer.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `PDF 生成失败: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw new Error(
        `PDF 生成失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await page.close();
    }
  }

  /**
   * 从 PPT HTML 生成 PDF
   */
  async generatePdfFromPptHtml(
    pptResult: PptGenerationResult,
    options: PptPdfGenerationOptions = {},
  ): Promise<PdfGenerationResult> {
    this.logger.log(
      `开始从 PPT HTML 生成 PDF，幻灯片数量: ${pptResult.metadata.slideCount}`,
    );

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // 合并 PDF 生成选项
      const pdfOptions = {
        format: options.pdfOptions?.format || 'A4',
        orientation: options.pdfOptions?.orientation || 'landscape',
        margin: {
          top: options.pdfOptions?.margin?.top || 10,
          right: options.pdfOptions?.margin?.right || 10,
          bottom: options.pdfOptions?.margin?.bottom || 10,
          left: options.pdfOptions?.margin?.left || 10,
        },
        displayHeaderFooter: options.pdfOptions?.displayHeaderFooter || false,
        headerTemplate: options.pdfOptions?.headerTemplate || '<div></div>',
        footerTemplate: options.pdfOptions?.footerTemplate || '<div></div>',
        printBackground: options.pdfOptions?.printBackground !== false,
        preferCSSPageSize: true,
      };

      // 设置视口大小以匹配 PPT 比例
      const aspectRatio = pptResult.options.aspectRatio || '16:9';
      if (aspectRatio === '16:9') {
        await page.setViewportSize({ width: 1600, height: 900 });
      } else if (aspectRatio === '4:3') {
        await page.setViewportSize({ width: 1200, height: 900 });
      }

      // 设置页面内容
      await page.setContent(pptResult.htmlContent, {
        waitUntil: 'networkidle',
      });

      // 等待页面完全加载，包括字体、图片和动画
      await page.waitForTimeout(5000);

      // 如果不需要动画，禁用动画以获得更好的 PDF 效果
      if (!options.includeAnimations) {
        await page.addStyleTag({
          content: `
            * {
              animation: none !important;
              transition: none !important;
              transform: none !important;
            }
          `,
        });
        await page.waitForTimeout(1000);
      }

      // 添加水印（如果启用）
      if (options.pdfOptions?.watermark?.enabled) {
        const watermarkText =
          options.pdfOptions.watermark.text || 'Confidential';
        const watermarkOpacity = options.pdfOptions.watermark.opacity || 0.1;

        await page.addStyleTag({
          content: `
            body::before {
              content: '${watermarkText}';
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: #000000;
              opacity: ${watermarkOpacity};
              z-index: 9999;
              pointer-events: none;
              white-space: nowrap;
            }
          `,
        });
        await page.waitForTimeout(500);
      }

      // 生成 PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      // 上传到云存储
      const timestamp = Date.now();
      const storagePath = `ppt/pdfs/ppt-${timestamp}-${pptResult.metadata.slideCount}slides.pdf`;

      const uploadResult = await uploadFileToBunny({
        path: storagePath,
        buffer: pdfBuffer,
        contentType: 'application/pdf',
      });

      const result: PdfGenerationResult = {
        pdfUrl: uploadResult.publicUrl || uploadResult.storageUrl,
        storagePath,
        fileSize: pdfBuffer.length,
        generatedAt: new Date().toISOString(),
        metadata: {
          generatedAt: new Date().toISOString(),
          format: pdfOptions.format || 'A4',
          orientation: pdfOptions.orientation || 'landscape',
          source: 'ppt-html',
        },
      };

      this.logger.log(
        `PPT HTML 的 PDF 生成完成: ${result.pdfUrl}, 大小: ${result.fileSize} bytes`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `PPT HTML 的 PDF 生成失败: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * 批量生成多个 PPT 的 PDF
   */
  async generateBatchPdfFromPpt(
    pptResults: PptGenerationResult[],
    options: PptPdfGenerationOptions = {},
  ): Promise<PdfGenerationResult[]> {
    this.logger.log(`开始批量生成 ${pptResults.length} 个 PPT 的 PDF`);

    const results: PdfGenerationResult[] = [];

    for (let i = 0; i < pptResults.length; i++) {
      try {
        const result = await this.generatePdfFromPptHtml(
          pptResults[i],
          options,
        );
        results.push(result);
        this.logger.log(`批量 PDF 生成进度: ${i + 1}/${pptResults.length}`);
      } catch (error) {
        this.logger.error(`批量 PDF 生成第 ${i + 1} 个失败: ${error.message}`);
        // 可以选择继续处理其他文件或抛出错误
        throw error;
      }
    }

    this.logger.log(`批量 PDF 生成完成，共生成 ${results.length} 个文件`);
    return results;
  }

  /**
   * 从 sliders 数组生成 PDF（逐页截图并拼接）
   */
  async generatePdfFromSliders(
    sliders: Array<{ htmlContent: string; slideNumber: number }>,
    jobId: string,
    options: PdfGenerationOptions = {},
  ): Promise<PdfGenerationResult> {
    this.logger.log(
      `开始从 ${sliders.length} 个 sliders 生成 PDF，任务: ${jobId}`,
    );

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const defaultFormat = options.format || '16:9';
      const isLandscape =
        defaultFormat === '16:9' || options.orientation === 'landscape';

      // 将所有 sliders 的 HTML 合并成一个完整文档
      const combinedHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentation</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { margin: 0; padding: 0; }
    .slide-page {
      width: ${defaultFormat === '16:9' ? '1280px' : '210mm'};
      height: ${defaultFormat === '16:9' ? '720px' : '297mm'};
      position: relative;
      page-break-after: always;
      break-after: page;
    }
    .slide-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    @media print {
      .slide-page {
        page-break-after: always;
        break-after: page;
      }
      .slide-page:last-child {
        page-break-after: auto;
        break-after: auto;
      }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  ${sliders
    .map(
      (slider) => `
  <div class="slide-page">
    ${slider.htmlContent}
  </div>`,
    )
    .join('\n')}
</body>
</html>`;

      const pdfOptions = {
        format: defaultFormat === '16:9' ? undefined : defaultFormat,
        orientation: isLandscape ? 'landscape' : 'portrait',
        width: defaultFormat === '16:9' ? '1280px' : undefined,
        height: defaultFormat === '16:9' ? '720px' : undefined,
        margin: {
          top: options.margin?.top || 0,
          right: options.margin?.right || 0,
          bottom: options.margin?.bottom || 0,
          left: options.margin?.left || 0,
        },
        printBackground: options.printBackground !== false,
        preferCSSPageSize: true,
      };

      await page.setContent(combinedHtml, {
        waitUntil: 'networkidle',
      });

      await page.waitForTimeout(2000);

      const pdfBuffer = await page.pdf(pdfOptions);

      const timestamp = Date.now();
      const storagePath = `jobs/${jobId}/pdfs/slides-${timestamp}.pdf`;

      const uploadResult = await uploadFileToBunny({
        path: storagePath,
        buffer: pdfBuffer,
        contentType: 'application/pdf',
      });

      const result: PdfGenerationResult = {
        pdfUrl: uploadResult.publicUrl || uploadResult.storageUrl,
        storagePath,
        fileSize: pdfBuffer.length,
        generatedAt: new Date().toISOString(),
        metadata: {
          generatedAt: new Date().toISOString(),
          format: defaultFormat,
          orientation: isLandscape ? 'landscape' : 'portrait',
          source: 'sliders',
        },
      };

      this.logger.log(
        `从 sliders 生成 PDF 完成: ${result.pdfUrl}, 大小: ${result.fileSize} bytes`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `从 sliders 生成 PDF 失败: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * 验证 PDF 生成结果
   */
  validatePdf(pdfResult: PdfGenerationResult): boolean {
    try {
      // 基本验证
      if (
        !pdfResult.pdfUrl ||
        !pdfResult.storagePath ||
        pdfResult.fileSize <= 0
      ) {
        return false;
      }

      // 可以添加更多验证逻辑，比如检查文件是否可访问
      return true;
    } catch (error) {
      this.logger.error(
        `PDF 验证失败: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 清理资源
   */
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
