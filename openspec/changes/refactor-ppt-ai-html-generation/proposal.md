# Change: 重构 PPT 生成为 AI 驱动的完整 HTML 生成

## Why

当前 PPT 生成采用模板拼接方式，存在以下核心问题：

1. **设计灵活性受限**：使用固定的 HTML 模板和 CSS 类，无法根据每页内容特点生成独特的视觉设计
2. **创意表现力不足**：模板化的布局和样式限制了视觉创意，每页看起来千篇一律
3. **维护成本高**：需要手动维护大量模板代码、CSS 样式和布局逻辑
4. **扩展困难**：添加新的设计风格或布局需要编写大量代码

理想的 PPT 生成应该：
- 每页根据内容特点生成独特的设计
- 充分利用 AI 的创意能力，生成现代化、专业的视觉效果
- 减少模板代码维护，让 AI 直接生成完整的 HTML/CSS/JS

## What Changes

### 核心架构变更

- **移除模板拼接逻辑**：删除 `generateSlideHtml`、`generateElementHtml` 等模板生成方法
- **引入 AI HTML 生成器**：使用 LLM 直接生成每页的完整 HTML（包含内联 CSS 和 JS）
- **分页流式生成**：基于分镜脚本，逐页调用 AI 生成 HTML
- **HTML 验证机制**：验证生成的 HTML 完整性和有效性
- **单页重试支持**：支持对生成失败或质量不佳的单页进行重新生成

### 技术实现

1. **AI Prompt 设计**
   - 输入：分镜脚本单页内容 + 主题配置 + 大纲上下文
   - 输出：完整的 HTML 字符串（使用 Tailwind CSS + Font Awesome）
   - 约束：16:9 比例、现代设计风格、响应式布局

2. **生成流程优化**
   - 并行生成多页（可配置并发数）
   - 实时进度反馈
   - 失败自动重试（可配置重试次数）

3. **质量保证**
   - HTML 结构验证（完整性检查）
   - CSS 语法验证
   - 可选的视觉质量评分

4. **用户自定义**
   - 支持传入自定义主题样式（颜色、字体等）
   - 保留现有的 `PptGenerationOptions` 接口兼容性

### 兼容性保证

- 保持 `PptGenerationResult` 接口不变
- 兼容现有的 PPT 上传和 PDF 生成流程
- 向后兼容现有的 API 调用方式

## Impact

### 受影响的能力规范
- **ppt-generation**（新增）：AI 驱动的 HTML 生成能力
- **workflow-steps**（修改）：PAGES 步骤的实现方式

### 受影响的代码
- `src/modules/ppt/ppt.service.ts`：**重大重构**
  - 移除模板生成方法（`generateSlideHtml`、`generateElementHtml` 等）
  - 新增 AI HTML 生成方法
  - 新增 HTML 验证方法
  - 保留 `generatePpt` 主入口方法
- `src/modules/workflow-steps/steps/pages.step.ts`：更新调用方式
- 新增 `src/modules/ppt/ai-html-generator.service.ts`：AI HTML 生成服务
- 新增 `src/modules/ppt/html-validator.service.ts`：HTML 验证服务

### 破坏性变更标记
- **BREAKING**：移除所有模板相关的私有方法（不影响公共 API）
- **BREAKING**：`PptSlideData.design` 字段的部分子字段可能不再使用（但保留接口定义）

### 风险评估
- **AI 生成质量**：需要充分测试 Prompt 以确保生成质量稳定
- **性能影响**：AI 调用延迟可能比模板拼接慢（可通过并行生成和缓存优化）
- **成本增加**：每次生成需要多次 LLM 调用（可通过缓存策略降低）

### 预期收益
- 视觉设计质量显著提升
- 每页设计独特且符合内容特点
- 代码维护成本大幅降低
- 设计迭代速度加快（只需调整 Prompt）
