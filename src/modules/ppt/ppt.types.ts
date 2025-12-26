/**
 * PPT 生成相关的类型定义
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFont: string;
  bodyFont: string;
  baseSize: number;
  headingScale: number[];
}

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate';
  duration: number;
  delay: number;
  easing: string;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: string | number;
  padding?: string | number;
  margin?: string | number;
  border?: string;
  borderRight?: string;
  borderLeft?: string;
  borderTop?: string;
  borderBottom?: string;
  boxShadow?: string;
  opacity?: number;
  transform?: string;
  // 新增现代设计样式
  backdropFilter?: string; // 玻璃拟态
  backgroundGradient?: string; // 渐变背景
  zIndex?: number;
}

// 图表类型定义
export type ChartType =
  | 'bar'
  | 'horizontal-bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polar'
  | 'scatter'
  | 'bubble'
  | 'number-card' // 特殊图表：数字卡片
  | 'progress-bar' // 特殊图表：进度条
  | 'progress-ring'; // 特殊图表：进度环

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartData {
  type: ChartType;
  labels: string[];
  datasets: ChartDataset[];
  options?: {
    showLegend?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
    showTooltips?: boolean;
    stacked?: boolean;
    colors?: string[]; // 自定义配色方案
    title?: string;
  };
}

// 图标数据定义
export interface IconData {
  iconName: string; // e.g., 'lucide:settings', 'mdi:home'
  color?: string;
  size?: number; // px
  rotation?: number; // degrees
}

// 形状数据定义
export interface ShapeData {
  type:
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'line'
    | 'arrow'
    | 'star'
    | 'blob';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  svgPath?: string; // 自定义 SVG 路径
}

// 表格数据定义
export interface TableData {
  headers: string[];
  rows: string[][];
  showHead?: boolean;
  striped?: boolean;
  bordered?: boolean;
}

// 代码块数据定义
export interface CodeData {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  theme?: string;
}

export interface PptElement {
  id: string;
  type:
    | 'text'
    | 'shape'
    | 'image'
    | 'chart'
    | 'icon'
    | 'divider'
    | 'table'
    | 'code'
    | 'group'; // 组合元素
  position: Position;
  style: ElementStyle;
  content:
    | string // text, image (url)
    | ShapeData // shape
    | ChartData // chart
    | IconData // icon
    | TableData // table
    | CodeData // code
    | PptElement[]; // group
  animation?: AnimationConfig;
  zIndex?: number;
  // 元素元数据
  name?: string;
  locked?: boolean;
  hidden?: boolean;
}

// 页面布局类型定义
export type PageLayoutType =
  | 'title' // 标题页
  | 'content' // 内容页
  | 'two-column' // 双栏布局
  | 'image-text' // 图文混排
  | 'comparison' // 对比页
  | 'cover' // 封面页
  | 'toc' // 目录页
  | 'summary' // 总结页
  | 'ending' // 结尾页
  | 'cards' // 卡片布局
  | 'gallery' // 图片展示
  | 'quote' // 引用页
  | 'custom'; // 自定义布局

// 页面布局模板配置
export interface PageLayoutTemplate {
  id: string;
  name: string;
  type: PageLayoutType;
  description: string;
  category: 'structure' | 'content' | 'visual' | 'special';
  sections: LayoutSection[];
  css: string;
  responsive: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

// 布局区域定义
export interface LayoutSection {
  id: string;
  type: 'header' | 'content' | 'sidebar' | 'footer' | 'main' | 'aside';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    padding?: string;
    margin?: string;
  };
  style: ElementStyle & {
    padding?: string;
    margin?: string;
  };
  content: {
    type: 'title' | 'text' | 'bullets' | 'image' | 'cards' | 'grid' | 'list';
    maxLength?: number;
    required?: boolean;
  };
}

// 卡片布局配置
export interface CardLayoutConfig {
  type: 'grid' | 'masonry' | 'flex';
  columns: number;
  gap: number;
  cardStyle: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    padding: string;
    boxShadow: string;
    hover?: {
      transform: string;
      boxShadow: string;
    };
  };
  content: {
    showIcon: boolean;
    showTitle: boolean;
    showDescription: boolean;
    maxDescriptionLength: number;
  };
}

// 完整演示结构配置
export interface PresentationStructure {
  includeCover: boolean;
  includeToc: boolean;
  includeSummary: boolean;
  includeEnding: boolean;
  sectionDividers: boolean;
  pageNumbers: boolean;
  progressIndicator: boolean;
}

export interface PptSlideDesign {
  layout: PageLayoutType;
  theme: string;
  colors: ColorPalette;
  typography: TypographyConfig;
  animations?: AnimationConfig[];
  background: {
    type: 'solid' | 'gradient' | 'pattern' | 'image';
    value: string;
    opacity?: number;
  };
  // 新增布局特定配置
  layoutConfig?: {
    cardLayout?: CardLayoutConfig;
    columnCount?: number;
    imagePosition?: 'left' | 'right' | 'top' | 'background';
    showProgress?: boolean;
  };
}

export interface PptSlideData {
  slideId: string;
  title: string;
  subtitle?: string;
  content: string[];
  bullets?: string[];
  design: PptSlideDesign;
  elements: PptElement[];
  metadata: {
    slideNumber: number;
    totalSlides: number;
    section?: string;
    notes?: string;
  };
}

export interface PptGenerationOptions {
  /** 设计风格主题 */
  theme?:
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'creative'
    | 'corporate'
    | 'tech'
    | 'glassmorphism'
    | 'gradient-modern'
    | 'tech-grid'
    | 'neon-glass';
  /** 色彩方案 */
  colorScheme?:
    | 'blue'
    | 'green'
    | 'purple'
    | 'orange'
    | 'red'
    | 'monochrome'
    | 'custom';
  /** 是否启用动画效果 */
  enableAnimations?: boolean;
  /** 布局复杂度 */
  layoutComplexity?: 'simple' | 'medium' | 'complex';
  /** AI 设计自由度 */
  designFreedom?: 'conservative' | 'balanced' | 'creative' | 'extreme';
  /** 目标输出格式 */
  outputFormat?: 'html' | 'pdf-ready';
  /** 页面比例 */
  aspectRatio?: '16:9' | '4:3' | 'A4';

  // 新增页面布局相关选项
  /** 启用多样化布局 */
  enableDiverseLayouts?: boolean;
  /** 自动分配页面布局 */
  autoLayoutAssignment?: boolean;
  /** 首选布局类型 */
  preferredLayouts?: PageLayoutType[];

  // 完整演示结构选项
  /** 演示结构配置 */
  presentationStructure?: PresentationStructure;
  /** 自动生成完整结构 */
  autoGenerateStructure?: boolean;

  // AI 生成相关选项
  /** 使用 AI 生成 HTML (完全由 LLM 生成,不使用模板) */
  useAiGeneration?: boolean;
  /** AI 生成并发数 */
  aiConcurrency?: number;
  /** AI 生成最大重试次数 */
  aiMaxRetries?: number;
  /** 启用缓存 */
  enableCache?: boolean;

  // 卡片布局选项
  /** 卡片布局配置 */
  cardLayout?: {
    enabled: boolean;
    config: CardLayoutConfig;
  };

  /** 现代设计选项 */
  modernDesign?: {
    /** 是否启用玻璃拟态效果 */
    glassmorphism?: boolean;
    /** 渐变背景配置 */
    gradientBackground?: {
      enabled: boolean;
      colors: string[];
      angle: number;
      animated: boolean;
    };
    /** 光晕效果配置 */
    glowEffect?: {
      enabled: boolean;
      color: string;
      intensity: 'subtle' | 'medium' | 'strong';
    };
    /** 网格图案配置 */
    gridPattern?: {
      enabled: boolean;
      size: number;
      color: string;
    };
    /** 动画速度 */
    animationSpeed?: number;
  };
  /** 自定义主题配置 */
  customTheme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
  /** 云存储选项 */
  cloudStorage?: {
    enabled: boolean;
    pathPrefix?: string;
    autoRetry?: boolean;
    maxRetries?: number;
  };

  // PDF 生成选项
  /** PDF 生成配置 */
  pdfGeneration?: {
    enabled: boolean;
    format?: 'A4' | 'A3' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    quality?: 'standard' | 'high' | 'print';
    margin?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    watermark?: {
      enabled: boolean;
      text?: string;
      opacity?: number;
    };
  };
}

// 现代设计模板类型定义
export interface ModernDesignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal';
  styles: {
    background: string;
    backdropFilter?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
  };
  effects: string[];
  animations?: string[];
  responsive: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

// 主题设计配置类型
export interface ThemeDesignConfig {
  designTheme: string;
  colorScheme: string;
  typography: string;
  layoutStyle: string;
  visualEffects: string[];
  customizations: Record<string, any>;
}

// 设计质量评估类型
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

export interface PptGenerationResult {
  /** 生成的 HTML 内容 */
  htmlContent: string;
  /** PPT 数据结构 */
  slidesData: PptSlideData[];
  /** 生成时间戳 */
  generatedAt: string;
  /** 使用的配置 */
  options: PptGenerationOptions;
  /** 元数据信息 */
  metadata: {
    slideCount: number;
    totalElements: number;
    hasAnimations: boolean;
    theme: string;
    colorScheme: string;
    layoutTypes: PageLayoutType[];
    hasDiverseLayouts: boolean;
    structureGenerated: boolean;
  };
  /** 云存储相关信息 */
  cloudStorage?: {
    /** PPT 访问 URL */
    pptUrl?: string;
    /** 存储路径 */
    storagePath?: string;
    /** 文件大小（字节） */
    fileSize?: number;
    /** 上传时间戳 */
    uploadedAt?: string;
    /** 上传状态 */
    uploadStatus?: 'pending' | 'success' | 'failed';
    /** 错误信息（如果上传失败） */
    error?: string;
  };
  /** PDF 生成相关信息 */
  pdfGeneration?: {
    /** PDF 访问 URL */
    pdfUrl?: string;
    /** 存储路径 */
    storagePath?: string;
    /** 文件大小（字节） */
    fileSize?: number;
    /** 生成时间戳 */
    generatedAt?: string;
    /** 生成状态 */
    generationStatus?: 'pending' | 'success' | 'failed';
    /** 错误信息（如果生成失败） */
    error?: string;
    /** PDF 配置信息 */
    config?: {
      format: string;
      orientation: string;
      quality: string;
      pageCount: number;
    };
  };
}
