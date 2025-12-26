/**
 * PDF 合并配置
 */

export interface PdfMergeConfig {
  /** 默认合并配置 */
  defaultConfig: MergeStrategyConfig;
  /** 支持的合并策略 */
  strategies: Record<string, MergeStrategyConfig>;
  /** 页面尺寸配置 */
  pageSizes: Record<string, PageSizeConfig>;
  /** 性能配置 */
  performance: PerformanceConfig;
}

export interface MergeStrategyConfig {
  /** 策略名称 */
  name: string;
  /** 策略描述 */
  description: string;
  /** 目标布局 */
  targetLayout: 'single-page' | 'multi-page' | 'grid';
  /** 每页最大幻灯片数 */
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
  /** 保持宽高比 */
  preserveAspectRatio: boolean;
  /** 适用场景 */
  suitableFor: string[];
}

export interface PageSizeConfig {
  /** 尺寸名称 */
  name: string;
  /** 宽度（像素） */
  width: number;
  /** 高度（像素） */
  height: number;
  /** 描述 */
  description: string;
  /** 适用场景 */
  suitableFor: string[];
}

export interface PerformanceConfig {
  /** 最大并发处理数 */
  maxConcurrency: number;
  /** 缓存配置 */
  cache: {
    enabled: boolean;
    maxSize: number;
    ttl: number; // 缓存时间（秒）
  };
  /** 内存限制 */
  memoryLimit: number; // MB
  /** 超时配置 */
  timeout: number; // 毫秒
}

/**
 * 默认 PDF 合并配置
 */
export const defaultPdfMergeConfig: PdfMergeConfig = {
  defaultConfig: {
    name: 'smart-fit',
    description: '智能适配：根据内容复杂度自动选择最佳布局',
    targetLayout: 'single-page',
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
    preserveAspectRatio: true,
    suitableFor: ['通用场景', '商务演示', '教育培训'],
  },
  strategies: {
    grid: {
      name: 'grid',
      description: '网格布局：将幻灯片均匀排列在网格中',
      targetLayout: 'single-page',
      maxSlidesPerPage: 6,
      spacing: {
        horizontal: 20,
        vertical: 20,
        margin: 40,
      },
      scaling: {
        autoScale: true,
        maxScale: 0.7,
        minScale: 0.4,
      },
      preserveAspectRatio: true,
      suitableFor: ['规则内容', '相似幻灯片', '快速浏览'],
    },
    flow: {
      name: 'flow',
      description: '流式布局：按顺序排列幻灯片，优先横向排列',
      targetLayout: 'single-page',
      maxSlidesPerPage: 4,
      spacing: {
        horizontal: 15,
        vertical: 15,
        margin: 30,
      },
      scaling: {
        autoScale: true,
        maxScale: 0.8,
        minScale: 0.5,
      },
      preserveAspectRatio: true,
      suitableFor: ['线性内容', '时间序列', '流程展示'],
    },
    'smart-fit': {
      name: 'smart-fit',
      description: '智能适配：根据内容复杂度自动选择最佳布局',
      targetLayout: 'single-page',
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
      preserveAspectRatio: true,
      suitableFor: ['通用场景', '商务演示', '教育培训'],
    },
    compact: {
      name: 'compact',
      description: '紧凑布局：最大化幻灯片数量，适合内容密集的场景',
      targetLayout: 'single-page',
      maxSlidesPerPage: 9,
      spacing: {
        horizontal: 10,
        vertical: 10,
        margin: 20,
      },
      scaling: {
        autoScale: true,
        maxScale: 0.6,
        minScale: 0.2,
      },
      preserveAspectRatio: true,
      suitableFor: ['内容密集', '概览展示', '快速预览'],
    },
  },
  pageSizes: {
    A4: {
      name: 'A4',
      width: 794,
      height: 1123,
      description: '标准 A4 纸张尺寸（96 DPI）',
      suitableFor: ['打印', '文档', '正式报告'],
    },
    A3: {
      name: 'A3',
      width: 1123,
      height: 1587,
      description: '标准 A3 纸张尺寸（96 DPI）',
      suitableFor: ['海报', '大图展示', '详细内容'],
    },
    '16:9': {
      name: '16:9',
      width: 1600,
      height: 900,
      description: '16:9 宽屏比例',
      suitableFor: ['演示文稿', '视频', '现代显示'],
    },
    '4:3': {
      name: '4:3',
      width: 1200,
      height: 900,
      description: '4:3 传统比例',
      suitableFor: ['传统演示', '老式设备', '兼容性'],
    },
  },
  performance: {
    maxConcurrency: 3,
    cache: {
      enabled: true,
      maxSize: 100,
      ttl: 3600, // 1小时
    },
    memoryLimit: 512, // 512MB
    timeout: 300000, // 5分钟
  },
};

/**
 * 获取合并策略配置
 */
export function getMergeStrategy(strategy: string): MergeStrategyConfig {
  return (
    defaultPdfMergeConfig.strategies[strategy] ||
    defaultPdfMergeConfig.defaultConfig
  );
}

/**
 * 获取页面尺寸配置
 */
export function getPageSize(size: string): PageSizeConfig {
  return (
    defaultPdfMergeConfig.pageSizes[size] ||
    defaultPdfMergeConfig.pageSizes['A4']
  );
}

/**
 * 根据内容复杂度推荐策略
 */
export function recommendStrategy(complexity: number): string {
  if (complexity > 0.7) {
    return 'compact';
  } else if (complexity < 0.3) {
    return 'grid';
  } else {
    return 'smart-fit';
  }
}

/**
 * 根据幻灯片数量推荐配置
 */
export function recommendConfig(
  slideCount: number,
): Partial<MergeStrategyConfig> {
  if (slideCount <= 4) {
    return {
      maxSlidesPerPage: 4,
      scaling: {
        autoScale: true,
        maxScale: 0.9,
        minScale: 0.6,
      },
    };
  } else if (slideCount <= 8) {
    return {
      maxSlidesPerPage: 6,
      scaling: {
        autoScale: true,
        maxScale: 0.8,
        minScale: 0.4,
      },
    };
  } else {
    return {
      maxSlidesPerPage: 9,
      scaling: {
        autoScale: true,
        maxScale: 0.6,
        minScale: 0.2,
      },
    };
  }
}
