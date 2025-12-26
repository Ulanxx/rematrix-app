# 技术设计：创意驱动的自由页面生成

## Context

当前系统的页面生成流程基于固定的布局模板和简化的内容要点，导致生成的页面缺乏创意和多样性。本次重构旨在：

1. 引入新的 SCRIPT 阶段，为页面生成提供完整的内容上下文
2. 移除所有布局模板限制，给予 AI 完全的设计自由
3. 重构 PAGES 阶段的 AI Prompt，强调创意和独特性

**约束条件**：
- 必须保持与现有工作流的兼容性（除了新增的 SCRIPT 阶段）
- 生成的页面仍需支持 PDF 导出和视频渲染
- 需要考虑 AI 生成的稳定性和质量控制

**利益相关者**：
- 用户：期望获得更具创意和视觉吸引力的视频页面
- 开发团队：需要维护代码质量和系统稳定性
- AI 模型：需要更清晰的指令和更大的创作空间

## Goals / Non-Goals

### Goals
- 新增 SCRIPT 阶段，生成完整的视频脚本和每页口播稿
- 移除 PAGES 阶段的所有布局模板限制
- 重构 AI Prompt，强调创意自由和内容驱动设计
- 保持生成页面的技术可行性（可渲染、可导出）
- 提升页面设计的多样性和视觉吸引力

### Non-Goals
- 不改变其他工作流阶段（OUTLINE、STORYBOARD、TTS 等）
- 不引入新的外部依赖或服务
- 不改变前端的基本交互模式
- 不优化 AI 模型的性能或成本（这是独立的优化任务）

## Decisions

### Decision 1: 新增 SCRIPT 阶段的位置和职责

**决策**：在 STORYBOARD 和 PAGES 之间新增 SCRIPT 阶段

**理由**：
- STORYBOARD 提供分镜框架，但内容过于简化（只有要点）
- PAGES 需要完整的内容理解才能做出好的设计决策
- SCRIPT 作为中间层，将分镜扩展为完整的脚本和口播稿

**SCRIPT 阶段的输出**：
```typescript
{
  fullScript: string,           // 完整视频脚本
  pages: Array<{
    pageNumber: number,
    narration: string,           // 该页的完整口播稿
    keyPoints: string[],         // 关键要点（可选）
    visualSuggestions: string[], // 视觉建议（可选）
    duration: number             // 预估时长（秒）
  }>
}
```

**替代方案**：
- 方案 A：在 STORYBOARD 阶段直接生成完整口播稿
  - 缺点：STORYBOARD 职责过重，违反单一职责原则
- 方案 B：在 PAGES 阶段内部调用 AI 生成口播稿
  - 缺点：无法复用口播稿，TTS 阶段需要重新生成

### Decision 2: 移除布局模板系统

**决策**：完全移除 `layout` 枚举和相关的模板逻辑

**理由**：
- 当前的布局模板（title、content、two-column 等）严重限制了设计创意
- AI 模型有能力根据内容自由设计布局，不需要预定义模板
- 移除模板后，AI 可以为每页创造独特的设计

**技术实现**：
- 移除 `pagesOutputSchema` 中的 `design.layout` 枚举限制
- 修改 AI Prompt，不再提及任何布局类型
- 保留 `design` 对象的其他字段（colors、typography、background 等）
- 允许 AI 自由定义 `elements` 数组中的元素类型和位置

**风险缓解**：
- 在 Schema 中保留基本的结构验证（必须有 title、elements 等）
- 通过 AI Prompt 引导设计质量（强调可读性、视觉层次等）
- 在测试阶段严格验证生成质量

### Decision 3: 重构 PAGES 阶段的 AI Prompt

**决策**：完全重写 AI Prompt，强调创意自由和内容驱动

**新 Prompt 的核心原则**：
1. **移除所有限制性语言**：不提及模板、布局类型、固定元素
2. **强调创意和独特性**：鼓励 AI 为每页设计独特的视觉风格
3. **提供完整上下文**：使用完整的脚本和口播稿，而不是简化的要点
4. **引导设计质量**：强调可读性、视觉层次、品牌一致性等设计原则
5. **保持技术可行性**：确保生成的设计可以被渲染和导出

**Prompt 结构**：
```
# role
你是世界顶级的视觉设计大师和创意总监...

# context  
你正在为视频的每一页设计独特的视觉呈现...

# instructions
基于 <script_json> 和 <theme_design_json>，为每一页创造独特的设计：
1. 深入理解该页的口播稿和内容主题
2. 自由设计页面布局，不受任何模板限制
3. 选择最适合内容的视觉元素和表现形式
4. 确保设计具有创意、独特性和视觉冲击力
5. 保持整体风格的一致性和专业性

# design_freedom
- 你可以使用任何布局方式：单栏、多栏、网格、自由布局等
- 你可以使用任何视觉元素：文本、图形、图标、图表、装饰等
- 你可以创造独特的视觉风格：现代、复古、极简、丰富等
- 你可以自由组合元素，创造独一无二的设计

# constraints
- 设计必须清晰传达内容，不能影响可读性
- 保持与主题设计的整体一致性
- 确保技术上可以渲染和导出
```

**替代方案**：
- 方案 A：保留部分模板作为"建议"
  - 缺点：AI 仍会倾向于使用模板，限制创意
- 方案 B：使用多个专门的 Prompt 针对不同内容类型
  - 缺点：增加系统复杂度，难以维护

## Risks / Trade-offs

### Risk 1: AI 生成质量不稳定

**风险**：移除模板后，AI 可能生成质量参差不齐的设计

**缓解措施**：
- 在 Prompt 中强调设计质量标准
- 实施严格的输出验证（Schema validation）
- 添加设计质量评分机制（可选的后续优化）
- 允许用户重新生成或手动调整

### Risk 2: 性能和成本增加

**风险**：更复杂的 Prompt 和更大的输出可能增加 AI 调用成本

**缓解措施**：
- 优化 Prompt 长度，移除冗余内容
- 使用合适的 temperature 参数平衡创意和稳定性
- 监控 token 使用量，必要时调整策略

### Risk 3: 向后兼容性问题

**风险**：现有的 Job 数据结构可能不兼容新的 Schema

**缓解措施**：
- 提供数据迁移脚本
- 在代码中添加版本检测和兼容性处理
- 允许用户选择使用旧版或新版生成模式（过渡期）

### Trade-off: 创意自由 vs 一致性

**权衡**：给予 AI 更大的创意自由可能导致页面风格不一致

**决策**：优先选择创意自由，通过以下方式保持一致性：
- 在 THEME_DESIGN 阶段确定全局设计主题
- 在 Prompt 中强调整体风格一致性
- 通过 `design.theme` 和 `design.colors` 等字段约束设计元素

## Migration Plan

### Phase 1: 数据库迁移（Breaking）

1. 在 Prisma Schema 中添加 `SCRIPT` 到 `JobStage` 枚举
2. 生成并执行数据库迁移
3. 更新现有 Job 的状态处理逻辑

```prisma
enum JobStage {
  PLAN
  OUTLINE
  STORYBOARD
  SCRIPT        // 新增
  THEME_DESIGN
  PAGES
  TTS
  RENDER
  MERGE
  DONE
}
```

### Phase 2: 实现 SCRIPT 步骤

1. 创建 `script.step.ts` 文件
2. 定义输入/输出 Schema
3. 编写 AI Prompt
4. 实现自定义执行逻辑
5. 添加单元测试和集成测试

### Phase 3: 重构 PAGES 步骤

1. 修改 `pagesInputSchema`，添加 SCRIPT 作为输入源
2. 移除 `design.layout` 枚举限制
3. 重写 AI Prompt
4. 更新 `customExecutePagesStep` 函数
5. 更新测试用例

### Phase 4: 更新工作流编排

1. 在 Temporal Workflow 中添加 SCRIPT 阶段
2. 更新阶段依赖关系
3. 更新前端工作流显示
4. 更新 API 文档

### Phase 5: 测试和验证

1. 端到端测试完整工作流
2. 验证生成质量
3. 性能和成本评估
4. 用户验收测试

### Rollback Plan

如果新方案出现严重问题：

1. 通过 Feature Flag 切换回旧版生成逻辑
2. 保留旧版代码作为 fallback
3. 数据库回滚需要手动处理（移除 SCRIPT 相关数据）

## Open Questions

1. **SCRIPT 阶段是否需要用户审批？**
   - 倾向：不需要，保持流程流畅性
   - 待确认：用户是否需要在页面生成前修改脚本

2. **是否需要为不同内容类型提供设计指导？**
   - 例如：技术内容 vs 营销内容 vs 教育内容
   - 倾向：暂不实现，保持简单

3. **如何处理 AI 生成的图片/图表需求？**
   - 当前：AI 只能生成文本和基本图形
   - 未来：可能需要集成图片生成 API

4. **是否需要设计质量评分机制？**
   - 倾向：作为后续优化，初期依赖人工验证
