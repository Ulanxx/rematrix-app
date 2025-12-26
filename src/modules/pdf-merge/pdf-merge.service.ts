import { Injectable, Logger } from '@nestjs/common';
import { PptSlideData } from '../ppt/ppt.types';
import {
  MergeConfig,
  MergedDocument,
  MergeLayout,
  SlideMetrics,
  MergeAnalysis,
} from './pdf-merge.types';

// 重新导出类型以供其他模块使用
export type {
  MergeConfig,
  MergedDocument,
  MergeLayout,
  SlideMetrics,
  MergeAnalysis,
};

/**
 * PDF 合并服务
 *
 * 负责将多页 PPT 内容智能合并为单页或多页 PDF
 */
@Injectable()
export class PdfMergeService {
  private readonly logger = new Logger(PdfMergeService.name);

  /**
   * 合并 PPT 幻灯片
   */
  mergeSlides(
    slidesData: PptSlideData[],
    config: Partial<MergeConfig> = {},
  ): MergedDocument {
    this.logger.log(
      `开始合并 ${slidesData.length} 页幻灯片，策略: ${config.mergeStrategy || 'smart-fit'}`,
    );

    try {
      // 使用默认配置
      const mergeConfig: MergeConfig = {
        targetLayout: 'single-page',
        pageSize: 'A4',
        mergeStrategy: 'smart-fit',
        preserveAspectRatio: true,
        maxSlidesPerPage: 6,
        spacing: {
          horizontal: 20,
          vertical: 20,
          margin: 40,
        },
        scaling: {
          autoScale: true,
          maxScale: 0.8,
          minScale: 0.3,
        },
        ...config,
      };

      // 分析幻灯片
      const analysis = this.analyzeSlides(slidesData, mergeConfig);

      // 计算最优布局
      const layout = this.calculateOptimalLayout(
        slidesData,
        mergeConfig,
        analysis,
      );

      // 生成合并后的 HTML
      const htmlContent = this.generateMergedHtml(
        slidesData,
        layout,
        mergeConfig,
      );

      // 计算页面信息
      const pages = this.calculatePages(slidesData, layout);

      const result: MergedDocument = {
        htmlContent,
        layout,
        config: mergeConfig,
        pages,
        metadata: {
          totalSlides: slidesData.length,
          totalPages: pages.length,
          slidesPerPage: Math.ceil(slidesData.length / pages.length),
          generatedAt: new Date().toISOString(),
        },
      };

      this.logger.log(
        `幻灯片合并完成，生成 ${result.metadata.totalPages} 页，每页平均 ${result.metadata.slidesPerPage} 个幻灯片`,
      );

      return result;
    } catch (error) {
      this.logger.error(`幻灯片合并失败: ${error.message}`, error.stack);
      throw new Error(`幻灯片合并失败: ${error.message}`);
    }
  }

  /**
   * 分析幻灯片特征
   */
  private analyzeSlides(
    slidesData: PptSlideData[],
    config: MergeConfig,
  ): MergeAnalysis {
    const slideMetrics: SlideMetrics[] = slidesData.map((slide) => {
      // 计算内容密度
      const textLength =
        slide.content.join('').length + (slide.bullets?.join('').length || 0);
      const contentDensity = Math.min(textLength / 1000, 1);

      // 计算视觉复杂度
      const elementCount = slide.elements.length;
      const hasComplexBackground = slide.design.background.type !== 'solid';
      const visualComplexity = Math.min(
        elementCount * 0.1 + (hasComplexBackground ? 0.3 : 0),
        1,
      );

      // 获取主要颜色
      const primaryColor = slide.design.colors.primary;

      return {
        width: 1600, // 默认 16:9 宽度
        height: 900, // 默认 16:9 高度
        contentDensity,
        visualComplexity,
        primaryColor,
        hasBackgroundImage: slide.design.background.type === 'image',
        textLines: slide.content.length + (slide.bullets?.length || 0),
        elementCount,
      };
    });

    // 计算平均复杂度
    const avgComplexity =
      slideMetrics.reduce((sum, metric) => sum + metric.visualComplexity, 0) /
      slideMetrics.length;

    // 推荐合并策略
    let recommendedStrategy: MergeConfig['mergeStrategy'] = 'smart-fit';
    if (avgComplexity > 0.7) {
      recommendedStrategy = 'compact';
    } else if (avgComplexity < 0.3) {
      recommendedStrategy = 'grid';
    }

    // 推荐网格尺寸
    const recommendedGrid = this.recommendGridSize(slideMetrics.length, config);

    // 估算页面数量
    const estimatedPages = Math.ceil(
      slideMetrics.length / config.maxSlidesPerPage,
    );

    return {
      slideMetrics,
      recommendedStrategy,
      recommendedGrid,
      complexityScore: avgComplexity,
      estimatedPages,
    };
  }

  /**
   * 计算最优布局
   */
  private calculateOptimalLayout(
    slidesData: PptSlideData[],
    config: MergeConfig,
    analysis: MergeAnalysis,
  ): MergeLayout {
    const { pageSize } = config;

    // 获取目标页面尺寸
    const targetSize = this.getPageSize(pageSize);

    // 使用推荐策略或指定策略
    const strategy = config.mergeStrategy || analysis.recommendedStrategy;

    let grid: { rows: number; cols: number };
    let positions: MergeLayout['positions'];

    switch (strategy) {
      case 'grid':
        grid = this.calculateGridLayout(slidesData.length, config);
        positions = this.generateGridPositions(grid, targetSize, config);
        break;
      case 'flow':
        grid = this.calculateFlowLayout(slidesData.length, config);
        positions = this.generateFlowPositions(slidesData, targetSize, config);
        break;
      case 'compact':
        grid = this.calculateCompactLayout(slidesData.length, config);
        positions = this.generateCompactPositions(
          slidesData,
          targetSize,
          config,
        );
        break;
      case 'smart-fit':
      default:
        grid = this.calculateSmartFitLayout(slidesData, analysis, config);
        positions = this.generateSmartFitPositions(
          slidesData,
          grid,
          targetSize,
          config,
        );
        break;
    }

    return {
      grid,
      positions,
      pageSize: targetSize,
    };
  }

  /**
   * 生成合并后的 HTML
   */
  private generateMergedHtml(
    slidesData: PptSlideData[],
    layout: MergeLayout,
    config: MergeConfig,
  ): string {
    // 生成每个幻灯片的 HTML 片段
    const slideFragments = slidesData
      .map((slide, index) => {
        const position = layout.positions[index];
        if (!position) return '';

        // 提取原始幻灯片的样式
        const slideStyle = this.extractSlideStyles(slide);

        // 生成缩放后的幻灯片 HTML
        return `
        <div class="merged-slide" data-slide-index="${index}" 
             style="position: absolute; 
                    left: ${position.x}px; 
                    top: ${position.y}px; 
                    width: ${position.width}px; 
                    height: ${position.height}px; 
                    transform: scale(${position.scale}); 
                    transform-origin: top left;
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    background: ${slideStyle.background};">
          <div class="slide-content" style="width: 100%; height: 100%; overflow: hidden;">
            ${this.extractSlideContent(slide)}
          </div>
        </div>
      `;
      })
      .join('');

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>合并的 PPT 文档</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: ${config.pageSize === 'A4' ? '210mm 297mm' : config.pageSize === '16:9' ? '1600px 900px' : '1200px 900px'};
      margin: 20mm;
    }
    
    body {
      font-family: 'Inter', 'Microsoft YaHei', 'PingFang SC', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f9fafb;
    }
    
    .merged-document {
      width: ${layout.pageSize.width}px;
      height: ${layout.pageSize.height}px;
      position: relative;
      background: white;
      margin: 0 auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .merged-slide {
      transition: all 0.3s ease;
    }
    
    .merged-slide:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 10;
    }
    
    .slide-content {
      font-size: 12px;
      line-height: 1.4;
    }
    
    .slide-content h1 {
      font-size: 18px;
      font-weight: 700;
      margin: 8px 0;
      color: #1f2937;
    }
    
    .slide-content h2 {
      font-size: 14px;
      font-weight: 600;
      margin: 6px 0;
      color: #374151;
    }
    
    .slide-content ul {
      list-style: none;
      padding: 0;
      margin: 4px 0;
    }
    
    .slide-content li {
      font-size: 10px;
      margin: 2px 0;
      padding: 2px 4px;
      background: rgba(59, 130, 246, 0.05);
      border-left: 2px solid #3b82f6;
      border-radius: 2px;
    }
    
    @media print {
      body { margin: 0; padding: 0; }
      .merged-document { 
        page-break-after: always;
        box-shadow: none;
      }
      .merged-document:last-child { page-break-after: auto; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="merged-document">
    ${slideFragments}
  </div>
  <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #6b7280;">
    生成时间: ${new Date().toLocaleString('zh-CN')} | Rematrix PPT 合并
  </div>
</body>
</html>`;
  }

  /**
   * 推荐网格尺寸
   */
  private recommendGridSize(
    slideCount: number,
    config: MergeConfig,
  ): { rows: number; cols: number } {
    const maxSlides = config.maxSlidesPerPage;

    if (slideCount <= maxSlides) {
      // 尝试形成接近正方形的网格
      const cols = Math.ceil(Math.sqrt(slideCount));
      const rows = Math.ceil(slideCount / cols);
      return { rows, cols };
    }

    // 超出最大数量时，使用最大配置
    const cols = Math.ceil(Math.sqrt(maxSlides));
    const rows = Math.ceil(maxSlides / cols);
    return { rows, cols };
  }

  /**
   * 计算网格布局
   */
  private calculateGridLayout(
    slideCount: number,
    config: MergeConfig,
  ): { rows: number; cols: number } {
    return this.recommendGridSize(slideCount, config);
  }

  /**
   * 计算流式布局
   */
  private calculateFlowLayout(
    slideCount: number,
    config: MergeConfig,
  ): { rows: number; cols: number } {
    // 流式布局优先横向排列
    const cols = Math.min(slideCount, Math.floor(config.maxSlidesPerPage / 2));
    const rows = Math.ceil(slideCount / cols);
    return { rows, cols };
  }

  /**
   * 计算紧凑布局
   */
  private calculateCompactLayout(
    slideCount: number,
    config: MergeConfig,
  ): { rows: number; cols: number } {
    // 紧凑布局最大化幻灯片数量
    const cols = Math.ceil(Math.sqrt(slideCount * 1.5));
    const rows = Math.ceil(slideCount / cols);
    return { rows, cols };
  }

  /**
   * 计算智能适配布局
   */
  private calculateSmartFitLayout(
    slidesData: PptSlideData[],
    analysis: MergeAnalysis,
    config: MergeConfig,
  ): { rows: number; cols: number } {
    // 根据内容复杂度调整布局
    const complexity = analysis.complexityScore;
    let slideCount = slidesData.length;

    if (complexity > 0.7) {
      // 高复杂度：减少每页幻灯片数量
      slideCount = Math.min(
        slideCount,
        Math.floor(config.maxSlidesPerPage * 0.6),
      );
    } else if (complexity < 0.3) {
      // 低复杂度：可以增加幻灯片数量
      slideCount = Math.min(slideCount, config.maxSlidesPerPage);
    }

    return this.recommendGridSize(slideCount, config);
  }

  /**
   * 生成网格位置
   */
  private generateGridPositions(
    grid: { rows: number; cols: number },
    pageSize: { width: number; height: number },
    config: MergeConfig,
  ): MergeLayout['positions'] {
    const positions: MergeLayout['positions'] = [];
    const { spacing } = config;

    const availableWidth = pageSize.width - spacing.margin * 2;
    const availableHeight = pageSize.height - spacing.margin * 2;

    const cellWidth =
      (availableWidth - spacing.horizontal * (grid.cols - 1)) / grid.cols;
    const cellHeight =
      (availableHeight - spacing.vertical * (grid.rows - 1)) / grid.rows;

    // 计算缩放比例
    const slideAspectRatio = 16 / 9;
    const cellAspectRatio = cellWidth / cellHeight;
    const scale =
      cellAspectRatio > slideAspectRatio ? cellHeight / 900 : cellWidth / 1600;
    const finalScale = Math.min(
      Math.max(scale, config.scaling.minScale),
      config.scaling.maxScale,
    );

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const index = row * grid.cols + col;
        if (index >= grid.rows * grid.cols) break;

        positions.push({
          x: spacing.margin + col * (cellWidth + spacing.horizontal),
          y: spacing.margin + row * (cellHeight + spacing.vertical),
          width: cellWidth,
          height: cellHeight,
          scale: finalScale,
        });
      }
    }

    return positions;
  }

  /**
   * 生成流式位置
   */
  private generateFlowPositions(
    slidesData: PptSlideData[],
    pageSize: { width: number; height: number },
    config: MergeConfig,
  ): MergeLayout['positions'] {
    // 简化实现，使用网格布局
    const grid = this.calculateFlowLayout(slidesData.length, config);
    return this.generateGridPositions(grid, pageSize, config);
  }

  /**
   * 生成紧凑位置
   */
  private generateCompactPositions(
    slidesData: PptSlideData[],
    pageSize: { width: number; height: number },
    config: MergeConfig,
  ): MergeLayout['positions'] {
    const grid = this.calculateCompactLayout(slidesData.length, config);
    return this.generateGridPositions(grid, pageSize, config);
  }

  /**
   * 生成智能适配位置
   */
  private generateSmartFitPositions(
    slidesData: PptSlideData[],
    grid: { rows: number; cols: number },
    pageSize: { width: number; height: number },
    config: MergeConfig,
  ): MergeLayout['positions'] {
    return this.generateGridPositions(grid, pageSize, config);
  }

  /**
   * 计算页面信息
   */
  private calculatePages(
    slidesData: PptSlideData[],
    layout: MergeLayout,
  ): MergedDocument['pages'] {
    const pages: MergedDocument['pages'] = [];
    const slidesPerPage = layout.grid.rows * layout.grid.cols;

    for (let i = 0; i < slidesData.length; i += slidesPerPage) {
      const slideIndices: number[] = [];
      for (let j = 0; j < slidesPerPage && i + j < slidesData.length; j++) {
        slideIndices.push(i + j);
      }

      pages.push({
        pageIndex: pages.length,
        slideIndices,
        dimensions: layout.pageSize,
      });
    }

    return pages;
  }

  /**
   * 获取页面尺寸
   */
  private getPageSize(pageSize: MergeConfig['pageSize']): {
    width: number;
    height: number;
  } {
    switch (pageSize) {
      case 'A4':
        return { width: 794, height: 1123 }; // 96 DPI
      case 'A3':
        return { width: 1123, height: 1587 }; // 96 DPI
      case '16:9':
        return { width: 1600, height: 900 };
      case '4:3':
        return { width: 1200, height: 900 };
      default:
        return { width: 1600, height: 900 };
    }
  }

  /**
   * 提取幻灯片样式
   */
  private extractSlideStyles(slide: PptSlideData): { background: string } {
    const { background } = slide.design;

    switch (background.type) {
      case 'solid':
        return { background: background.value };
      case 'gradient':
        return { background: background.value };
      default:
        return { background: '#ffffff' };
    }
  }

  /**
   * 提取幻灯片内容
   */
  private extractSlideContent(slide: PptSlideData): string {
    let content = '';

    if (slide.title) {
      content += `<h1>${this.escapeHtml(slide.title)}</h1>`;
    }

    if (slide.subtitle) {
      content += `<h2>${this.escapeHtml(slide.subtitle)}</h2>`;
    }

    if (slide.bullets && slide.bullets.length > 0) {
      content += '<ul>';
      slide.bullets.forEach((bullet) => {
        content += `<li>${this.escapeHtml(bullet)}</li>`;
      });
      content += '</ul>';
    }

    return content;
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
}
