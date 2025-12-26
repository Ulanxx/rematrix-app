# 技术设计：AI 驱动的 PPT HTML 生成

## Context

当前 PPT 生成使用模板拼接方式，通过 TypeScript 代码组装 HTML 字符串。这种方式虽然可控，但限制了设计灵活性和创意表现力。

用户需求：
- 每页 PPT 根据内容特点生成独特的视觉设计
- 使用 Tailwind CSS 和 Font Awesome 构建现代化界面
- 支持自定义主题和样式
- 保持与现有 PPT 上传、PDF 生成流程的兼容性

技术约束：
- 使用 Vercel AI SDK + OpenRouter 作为 LLM 调用方式
- 需要支持分页流式生成
- 需要验证 HTML 质量并支持单页重试
- 需要考虑性能和成本

## Goals / Non-Goals

### Goals
- 实现 AI 驱动的完整 HTML 生成（包含 CSS、JS）
- 每页根据分镜脚本内容生成独特设计
- 支持用户自定义主题样式
- 提供 HTML 验证和单页重试机制
- 保持与现有流程的兼容性

### Non-Goals
- 不改变现有的 API 接口签名
- 不涉及前端展示逻辑的修改
- 不改变 PDF 生成和上传的实现方式
- 不支持实时预览或交互式编辑（未来可扩展）

## Decisions

### 1. AI 生成器架构

**决策**：创建独立的 `AiHtmlGeneratorService`，与 `PptService` 解耦

**理由**：
- 单一职责原则：AI 生成逻辑独立，便于测试和维护
- 可复用性：未来可用于其他 HTML 生成场景
- 可替换性：便于切换不同的 AI 模型或生成策略

**实现**：
```typescript
@Injectable()
export class AiHtmlGeneratorService {
  constructor(
    private readonly aiService: AiService, // Vercel AI SDK wrapper
    private readonly logger: Logger,
  ) {}

  async generateSlideHtml(
    slideScript: StoryboardSlide,
    context: GenerationContext,
    options: AiGenerationOptions,
  ): Promise<AiGeneratedHtml> {
    // 构建 Prompt
    // 调用 LLM
    // 返回生成的 HTML
  }
}
```

### 2. Prompt 设计策略

**决策**：使用结构化 Prompt，包含明确的约束和示例

**Prompt 结构**：
```
系统角色：你是一个专业的前端设计师和 HTML 开发专家

任务：为视频讲解课程生成单页 PPT 的 HTML

输入信息：
- 页面标题：{title}
- 页面内容：{content}
- 视觉建议：{visualSuggestions}
- 主题配置：{themeConfig}
- 课程大纲：{outline}（上下文）

技术要求：
1. 使用 Tailwind CSS 进行样式设计
2. 使用 Font Awesome 图标（CDN: https://cdnjs.cloudflare.com/...）
3. 页面比例：16:9（1920x1080px）
4. 响应式设计，支持不同屏幕尺寸
5. 现代设计风格（玻璃拟态、渐变、阴影等）

设计原则：
- 根据内容特点选择合适的布局（卡片、网格、分栏等）
- 突出重点信息，建立清晰的视觉层次
- 使用丰富的视觉元素（图标、装饰图形、数据可视化等）
- 每页设计应独特且符合内容主题

输出格式：
完整的 HTML 文档，包含：
- <!DOCTYPE html> 声明
- <head> 部分（包含 Tailwind CDN、Font Awesome CDN）
- <body> 部分（完整的页面内容）
- <style> 标签（自定义 CSS）
- <script> 标签（必要的 JS 交互）

示例输出：
{example}
```

**理由**：
- 明确的约束减少生成错误
- 结构化输入便于 AI 理解上下文
- 示例输出提供参考模板

### 3. HTML 验证策略

**决策**：实现轻量级 HTML 验证器，检查关键结构

**验证项**：
1. HTML 文档完整性（DOCTYPE、html、head、body 标签）
2. 必需的 CDN 引用（Tailwind、Font Awesome）
3. 基本语法正确性（标签闭合、属性格式）
4. 可选：CSS 语法验证
5. 可选：可访问性检查（alt 属性、语义化标签）

**实现**：
```typescript
@Injectable()
export class HtmlValidatorService {
  validate(html: string): ValidationResult {
    const issues: ValidationIssue[] = [];
    
    // 1. 检查文档结构
    if (!html.includes('<!DOCTYPE html>')) {
      issues.push({ type: 'error', message: 'Missing DOCTYPE' });
    }
    
    // 2. 检查必需的 CDN
    if (!html.includes('tailwindcss')) {
      issues.push({ type: 'error', message: 'Missing Tailwind CSS' });
    }
    
    // 3. 基本语法检查（使用 parse5 或类似库）
    // ...
    
    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
    };
  }
}
```

### 4. 并行生成和重试机制

**决策**：使用 Promise.allSettled 实现并行生成，支持单页重试

**实现**：
```typescript
async generateAllSlides(
  slides: StoryboardSlide[],
  context: GenerationContext,
  options: PptGenerationOptions,
): Promise<GeneratedSlide[]> {
  const concurrency = options.concurrency ?? 3;
  const maxRetries = options.maxRetries ?? 2;
  
  // 分批并行生成
  const results = await pMap(
    slides,
    async (slide, index) => {
      return this.generateSlideWithRetry(slide, context, options, maxRetries);
    },
    { concurrency },
  );
  
  return results;
}

private async generateSlideWithRetry(
  slide: StoryboardSlide,
  context: GenerationContext,
  options: PptGenerationOptions,
  maxRetries: number,
): Promise<GeneratedSlide> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const html = await this.aiHtmlGenerator.generateSlideHtml(slide, context, options);
      const validation = this.htmlValidator.validate(html);
      
      if (validation.isValid) {
        return { slideId: slide.id, html, status: 'success' };
      }
      
      if (attempt < maxRetries) {
        this.logger.warn(`Slide ${slide.id} validation failed, retrying...`);
        continue;
      }
      
      return { slideId: slide.id, html, status: 'invalid', issues: validation.issues };
    } catch (error) {
      if (attempt < maxRetries) {
        this.logger.warn(`Slide ${slide.id} generation failed, retrying...`);
        continue;
      }
      return { slideId: slide.id, status: 'failed', error: error.message };
    }
  }
}
```

### 5. 缓存策略

**决策**：基于内容哈希的缓存，使用 Redis

**缓存键设计**：
```
ppt:slide:{contentHash}:{themeHash}
```

**缓存逻辑**：
```typescript
async generateSlideHtml(
  slide: StoryboardSlide,
  context: GenerationContext,
  options: AiGenerationOptions,
): Promise<string> {
  // 计算缓存键
  const cacheKey = this.computeCacheKey(slide, context, options);
  
  // 尝试从缓存读取
  const cached = await this.cacheService.get(cacheKey);
  if (cached && options.enableCache !== false) {
    this.logger.debug(`Cache hit for slide ${slide.id}`);
    return cached;
  }
  
  // 生成新内容
  const html = await this.generateWithAi(slide, context, options);
  
  // 写入缓存（TTL: 7天）
  await this.cacheService.set(cacheKey, html, 7 * 24 * 60 * 60);
  
  return html;
}
```

**理由**：
- 减少重复的 AI 调用，降低成本
- 提升生成速度
- 相同内容和主题的页面可复用

### 6. 主题自定义支持

**决策**：通过 `themeConfig` 参数传递用户自定义样式

**接口设计**：
```typescript
interface ThemeConfig {
  // 颜色配置
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  // 字体配置
  typography?: {
    fontFamily?: string;
    headingFont?: string;
    bodyFont?: string;
  };
  // 设计风格
  designStyle?: 'modern' | 'classic' | 'minimal' | 'creative';
  // 自定义 CSS（可选）
  customCss?: string;
}
```

**Prompt 集成**：
```
主题配置：
- 主色调：{colors.primary}
- 辅助色：{colors.secondary}
- 强调色：{colors.accent}
- 字体：{typography.fontFamily}
- 设计风格：{designStyle}

请在生成的 HTML 中应用这些主题配置。
```

## Risks / Trade-offs

### 风险 1：AI 生成质量不稳定

**风险**：LLM 可能生成格式错误、样式不一致或视觉质量差的 HTML

**缓解措施**：
- 充分测试和优化 Prompt
- 实施 HTML 验证机制
- 支持单页重试（最多 2-3 次）
- 提供降级方案（使用简化模板）
- 收集生成失败案例，持续优化

### 风险 2：性能和延迟

**风险**：AI 生成比模板拼接慢，可能影响用户体验

**缓解措施**：
- 并行生成多页（并发数可配置）
- 实施缓存策略（基于内容哈希）
- 异步生成，提供进度反馈
- 预估生成时间并告知用户

**性能目标**：
- 单页生成：< 5 秒
- 10 页 PPT 总时间：< 20 秒（3 并发）

### 风险 3：成本增加

**风险**：每次生成需要多次 LLM 调用，增加 API 成本

**缓解措施**：
- 实施缓存策略（预计缓存命中率 30-50%）
- 使用成本较低的模型（如 GPT-4o-mini）
- 提供生成配额限制
- 监控和优化 Prompt token 使用

**成本估算**：
- 单页 Prompt：~1000 tokens
- 单页输出：~2000 tokens
- 单页成本：~$0.003（GPT-4o-mini）
- 10 页 PPT：~$0.03

### Trade-off：灵活性 vs 可控性

**选择**：优先灵活性，通过验证和重试保证质量

**理由**：
- 模板方式虽然可控，但限制了创意表现
- AI 生成虽然有不确定性，但可通过工程手段降低风险
- 长期来看，AI 生成的质量和效率会持续提升

## Migration Plan

### 阶段 1：实现核心服务（1-2 天）

1. 创建 `AiHtmlGeneratorService`
2. 创建 `HtmlValidatorService`
3. 实现基础的 Prompt 模板
4. 实现单页生成和验证逻辑

### 阶段 2：集成到 PptService（1 天）

1. 重构 `PptService.generatePpt` 方法
2. 移除旧的模板生成方法
3. 集成 AI 生成器和验证器
4. 实现并行生成和重试逻辑

### 阶段 3：缓存和优化（1 天）

1. 实现缓存服务集成
2. 优化 Prompt 以减少 token 使用
3. 性能测试和调优

### 阶段 4：测试和验证（1-2 天）

1. 单元测试（AI 生成器、验证器）
2. 集成测试（完整生成流程）
3. 视觉质量测试（人工评审）
4. 性能测试（并发、延迟）

### 阶段 5：部署和监控（持续）

1. 灰度发布（10% 流量）
2. 监控生成成功率、延迟、成本
3. 收集用户反馈
4. 持续优化 Prompt

### 回滚计划

如果 AI 生成质量不达标：
1. 保留旧的模板生成代码（标记为 deprecated）
2. 提供配置开关，允许切换回模板模式
3. 逐步优化 AI 生成，直到质量稳定

## Open Questions

1. **使用哪个 LLM 模型**？
   - 选项：GPT-4o、GPT-4o-mini、Claude 3.5 Sonnet
   - 建议：先用 GPT-4o-mini 测试，质量不足再升级

2. **是否需要视觉质量评分**？
   - 可选：使用另一个 LLM 对生成的 HTML 进行视觉质量评分
   - 权衡：增加成本和延迟，但可提升质量

3. **缓存 TTL 设置多久**？
   - 建议：7 天（平衡缓存命中率和存储成本）

4. **是否支持用户手动编辑生成的 HTML**？
   - 当前：不支持（未来可扩展）
   - 原因：需要前端编辑器支持

5. **如何处理超长内容**？
   - 策略：自动分页或截断
   - 需要在 Prompt 中明确指导
