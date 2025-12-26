## Context

当前 PPT 生成功能已经能创建基本的 HTML 幻灯片，但存在两个关键问题需要解决：

1. **缺乏云存储支持**: 生成的 PPT 仅停留在内存中，用户无法直接访问和下载
2. **设计感不足**: 现有 PPT 设计较为单调，缺乏现代视觉冲击力，与用户期望的专业演示效果有差距

用户提供了一个优秀的 HTML 设计示例，展示了现代玻璃拟态、渐变效果、动态光晕等高级视觉效果，这为我们优化 PPT 设计提供了明确的目标。

## Goals / Non-Goals

### Goals
- 实现生成 PPT 的自动云存储上传，提供可访问的 URL
- 显著提升 PPT 的视觉设计质量，达到专业演示水准
- 集成现代设计元素：玻璃拟态、渐变、动态效果
- 优化 AI Prompt，让生成的 PPT 更具设计感和创意
- 确保跨设备兼容性和响应式显示

### Non-Goals
- 完全重构现有的 PPT 生成架构（保持现有结构）
- 支持 PPT 原生格式（.pptx）输出（继续使用 HTML 格式）
- 实现复杂的用户自定义编辑功能

## Decisions

### Decision 1: 云存储集成方案
**选择**: 继续使用 Bunny 云存储，与现有 PDF 上传保持一致
**理由**: 
- 保持技术栈一致性
- 已有的上传工具函数可直接复用
- 成本效益和性能表现良好

### Decision 2: 设计优化策略
**选择**: 基于 AI Prompt 优化 + 模板库增强的双轨策略
**理由**:
- AI Prompt 优化能提供无限的创意可能性
- 模板库确保基础设计质量的一致性
- 两者结合能平衡创意性和可靠性

### Decision 3: 视觉设计方向
**选择**: 现代科技风格，融合玻璃拟态和渐变效果
**理由**:
- 符合当前设计趋势
- 技术演示场景的专业性需求
- 用户示例明确展示了这种风格的优势

## 技术实现方案

### 1. PPT 上传功能
```typescript
// 扩展 PptGenerationResult 接口
interface PptGenerationResult {
  htmlContent: string;
  slidesData: PptSlideData[];
  generatedAt: string;
  options: PptGenerationOptions;
  metadata: {
    slideCount: number;
    totalElements: number;
    hasAnimations: boolean;
    theme: string;
    colorScheme: string;
  };
  // 新增字段
  pptUrl?: string;        // PPT 访问 URL
  storagePath?: string;   // 存储路径
  fileSize?: number;      // 文件大小
}
```

### 2. 设计优化 Prompt 策略
```typescript
// 增强的 PPT 生成 Prompt
const ENHANCED_PPT_PROMPT = `
你是一位专业的演示设计师，请创建具有现代视觉冲击力的 PPT 幻灯片。

设计要求：
1. 使用玻璃拟态效果（glassmorphism）：半透明背景、模糊效果、微妙边框
2. 集成渐变背景：从主题色到背景色的平滑过渡
3. 添加动态光晕效果：使用径向渐变创造深度感
4. 现代化排版：大标题、清晰层次、适当留白
5. 专业配色：基于主题色的协调配色方案
6. 微交互效果：悬停状态、过渡动画

视觉元素：
- 背景网格图案增加科技感
- 角落装饰线条提升精致度
- 图标与文字的视觉平衡
- 适当的阴影和深度效果

参考风格：现代科技演示，类似 Apple Keynote 的专业感
`;
```

### 3. 模板库扩展
```typescript
// 新增设计模板
const DESIGN_TEMPLATES = {
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  gradientModern: {
    background: 'linear-gradient(135deg, #4A48E2 0%, transparent 70%)',
  },
  techGrid: {
    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
    backgroundSize: '40px 40px',
  }
};
```

## Risks / Trade-offs

### Risk 1: 文件大小增加
**风险**: 增强视觉效果可能导致 HTML 文件变大
**缓解措施**: 
- 优化 CSS 和 JavaScript
- 使用 CDN 加载外部资源
- 实施资源压缩策略

### Risk 2: 兼容性问题
**风险**: 复杂的 CSS 效果可能在某些浏览器中表现不一致
**缓解措施**:
- 提供降级方案
- 充分的跨浏览器测试
- 使用标准的 CSS 属性

### Trade-off: 设计复杂度 vs 性能
**选择**: 在保证核心性能的前提下，适度增加设计复杂度
**平衡点**: 使用 CSS 动画而非 JavaScript 动画，优化渲染性能

## Migration Plan

### Phase 1: 基础上传功能
1. 扩展 `PptService` 集成 Bunny 上传
2. 更新 `PptGenerationResult` 接口
3. 修改 `pages.step.ts` 支持保存 PPT URL

### Phase 2: 设计优化
1. 更新 AI Prompt 模板
2. 扩展设计模板库
3. 优化 CSS 样式系统

### Phase 3: 测试和优化
1. 全面测试上传功能
2. 验证设计效果在不同场景的表现
3. 性能优化和兼容性修复

## Open Questions

1. **存储策略**: 是否需要为 PPT 文件设置特殊的过期策略？
2. **设计自由度**: 如何平衡 AI 创意和设计一致性？
3. **用户体验**: 是否需要提供设计预览或选择功能？

## Success Metrics

- 生成的 PPT 成功上传率达到 100%
- 用户对 PPT 设计满意度提升（通过反馈收集）
- PPT 文件大小控制在合理范围内（< 5MB）
- 页面加载时间保持在可接受范围（< 3 秒）
