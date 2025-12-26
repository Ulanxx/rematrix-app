## Context
当前 PDF 生成采用直接 HTML 转换的方式，虽然支持现代化设计，但缺乏专业 PPT 的视觉层次感和演示效果。用户期望通过 PPT 生成和合并的方式，获得更具专业演示效果的文档，同时给予 AI 模型更大的设计自由度。

## Goals / Non-Goals
- **Goals**: 
  - 实现专业级 PPT 幻灯片生成，支持炫酷视觉效果
  - 开发智能页面合并算法，将多页 PPT 内容合并为单页 PDF
  - 给予 AI 模型完全的设计自由度，创造独特视觉体验
  - 保持现有工作流的兼容性，平滑迁移到新架构
  - 支持多种 PPT 设计风格和布局模板
- **Non-Goals**: 
  - 完全替换现有 PDF 生成功能（保持向后兼容）
  - 支持实时 PPT 编辑和交互功能
  - 集成 Microsoft Office 或其他商业 PPT 引擎
  - 支持复杂的 PPT 动画和过渡效果

## Decisions
- **Decision**: 采用三阶段架构：PPT 生成 -> 页面合并 -> PDF 转换
  - **Reason**: 分离关注点，每个阶段专注特定功能，提高可维护性
  - **Alternatives considered**: 
    - 直接生成合并后的 HTML（失去 PPT 专业性）
    - 使用现有 PPT 库生成真实 PPT 文件（依赖复杂，灵活性差）

- **Decision**: 使用 HTML + CSS 模拟 PPT 效果，而非真实 PPT 格式
  - **Reason**: 更灵活的设计控制，无需依赖外部 PPT 库，便于 Web 渲染
  - **Alternatives considered**: 
    - 使用 python-pptx 等库生成真实 PPT（技术栈复杂，维护成本高）
    - 集成在线 PPT 服务（网络依赖，成本问题）

- **Decision**: AI 模型拥有完全设计自由度，系统只提供技术约束
  - **Reason**: 满足用户对"炫酷"和"自由发挥"的需求，激发 AI 创造力
  - **Alternatives considered**: 
    - 严格模板限制（保证一致性但缺乏创意）
    - 半模板化设计（平衡但复杂度增加）

## 技术架构设计

### PPT 生成阶段
```typescript
interface PptSlideData {
  slideId: string;
  title: string;
  content: string[];
  design: {
    layout: 'title' | 'content' | 'two-column' | 'image-text' | 'custom';
    theme: string;
    colors: ColorPalette;
    typography: TypographyConfig;
    animations?: AnimationConfig[];
  };
  background: {
    type: 'solid' | 'gradient' | 'pattern' | 'image';
    value: string;
  };
  elements: PptElement[];
}

interface PptElement {
  type: 'text' | 'shape' | 'image' | 'chart' | 'icon';
  position: Position;
  style: ElementStyle;
  content: any;
}
```

### 页面合并阶段
```typescript
interface MergeConfig {
  targetLayout: 'single-page' | 'multi-page';
  pageSize: 'A4' | 'A3' | '16:9';
  mergeStrategy: 'grid' | 'flow' | 'smart-fit';
  preserveAspectRatio: boolean;
  maxSlidesPerPage: number;
}

class PptMerger {
  async mergeSlides(slides: PptSlideData[], config: MergeConfig): Promise<MergedDocument>
}
```

### PDF 转换阶段
```typescript
class EnhancedPdfService {
  async convertMergedDocument(doc: MergedDocument): Promise<PdfGenerationResult>
}
```

## 算法设计

### 智能合并算法
1. **内容分析**: 分析每页 PPT 的内容密度和视觉重点
2. **布局规划**: 根据内容特征选择最优的合并布局
3. **尺寸调整**: 智能缩放和重排，保持可读性
4. **视觉优化**: 调整间距、对齐和视觉层次

### AI 提示词策略
```prompt
你是一名专业的 PPT 设计师，拥有完全的创作自由。请根据内容创建炫酷的幻灯片设计：

1. **大胆创新**: 使用任何你想要的设计风格和视觉效果
2. **专业品质**: 确保设计符合现代演示标准
3. **视觉冲击**: 运用色彩、排版、图形创造强烈视觉印象
4. **内容适配**: 设计必须完美呈现内容信息
5. **技术先进**: 展示现代设计技术的能力

你的设计将直接影响最终 PDF 的视觉效果，请尽情发挥创意！
```

## Risks / Trade-offs
- **Complexity Risk**: 三阶段架构增加了系统复杂度
  - **Mitigation**: 清晰的接口设计，完善的单元测试
- **Performance Risk**: PPT 生成和合并可能增加处理时间
  - **Mitigation**: 异步处理，缓存机制，性能监控
- **Quality Risk**: AI 自由设计可能导致质量不稳定
  - **Mitigation**: 设计评分机制，用户反馈收集，模板推荐

## Migration Plan
1. **Phase 1**: 开发 PPT 生成核心服务和接口
2. **Phase 2**: 实现页面合并算法和配置系统
3. **Phase 3**: 集成到现有 PAGES 步骤，保持兼容性
4. **Phase 4**: 优化 AI 提示词和设计模板
5. **Phase 5**: 性能优化和用户反馈收集

## Open Questions
- 如何平衡 AI 设计自由度和输出一致性？
- 页面合并的最优算法是什么？如何处理不同内容类型？
- 是否需要提供用户设计偏好配置选项？
- 如何评估和保证生成 PPT 的设计质量？
- 是否需要支持多种合并策略供用户选择？
