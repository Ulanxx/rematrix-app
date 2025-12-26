/**
 * PDF 合并服务相关类型定义
 */

export interface MergeConfig {
  /** 目标布局类型 */
  targetLayout: 'single-page' | 'multi-page' | 'grid';
  /** 页面尺寸 */
  pageSize: 'A4' | 'A3' | '16:9' | '4:3';
  /** 合并策略 */
  mergeStrategy: 'grid' | 'flow' | 'smart-fit' | 'compact';
  /** 是否保持宽高比 */
  preserveAspectRatio: boolean;
  /** 每页最大幻灯片数量 */
  maxSlidesPerPage: number;
  /** 间距配置 */
  spacing: {
    horizontal: number;
    vertical: number;
    margin: number;
  };
  /** 缩放配置 */
  scaling: {
    autoScale: boolean;
    maxScale: number;
    minScale: number;
  };
}

export interface SlideMetrics {
  /** 幻灯片宽度 */
  width: number;
  /** 幻灯片高度 */
  height: number;
  /** 内容密度 (0-1) */
  contentDensity: number;
  /** 视觉复杂度 (0-1) */
  visualComplexity: number;
  /** 主要颜色 */
  primaryColor: string;
  /** 是否有背景图 */
  hasBackgroundImage: boolean;
  /** 文本行数 */
  textLines: number;
  /** 元素数量 */
  elementCount: number;
}

export interface MergeLayout {
  /** 布局网格 */
  grid: {
    rows: number;
    cols: number;
  };
  /** 每个幻灯片的位置和尺寸 */
  positions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  }>;
  /** 总页面尺寸 */
  pageSize: {
    width: number;
    height: number;
  };
}

export interface MergedDocument {
  /** 合并后的 HTML 内容 */
  htmlContent: string;
  /** 使用的布局配置 */
  layout: MergeLayout;
  /** 合并配置 */
  config: MergeConfig;
  /** 页面信息 */
  pages: Array<{
    pageIndex: number;
    slideIndices: number[];
    dimensions: { width: number; height: number };
  }>;
  /** 元数据 */
  metadata: {
    totalSlides: number;
    totalPages: number;
    slidesPerPage: number;
    generatedAt: string;
  };
}

export interface MergeAnalysis {
  /** 幻灯片分析结果 */
  slideMetrics: SlideMetrics[];
  /** 推荐的合并策略 */
  recommendedStrategy: 'grid' | 'flow' | 'smart-fit' | 'compact';
  /** 推荐的网格尺寸 */
  recommendedGrid: {
    rows: number;
    cols: number;
  };
  /** 内容复杂度评分 */
  complexityScore: number;
  /** 预估页面数量 */
  estimatedPages: number;
}
