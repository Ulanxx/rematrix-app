# Change: 增强 PDF 生成功能 - 16:9 比例、AI 内容扩充和炫酷设计

## Why
当前 PDF 生成功能使用 A4 纵向布局，设计较为简单，无法满足现代演示需求。用户期望生成更具视觉冲击力的 PDF 文档，支持 16:9 宽屏比例、AI 智能扩充内容和现代化设计风格。

## What Changes
- **PDF 布局改进**: 从 A4 纵向改为 16:9 横向布局，适配现代演示需求
- **AI 内容扩充**: 在 PAGES 步骤中集成 AI 内容扩充逻辑，根据 slides items 智能扩展内容
- **视觉设计升级**: 集成 Font Awesome 图标和 Tailwind CSS 样式，创建炫酷的视觉效果
- **流程优化**: 改进 PDF 生成流程，确保前后逻辑连贯性和内容一致性
- **模板系统**: 创建可配置的 PDF 模板系统，支持多种设计风格

## Impact
- Affected specs: workflow-steps, pdf-generation
- Affected code: 
  - src/modules/pdf/pdf.service.ts (重构 HTML 模板生成)
  - src/modules/workflow-steps/steps/pages.step.ts (增加 AI 内容扩充)
  - src/modules/pdf/pdf.module.ts (添加新依赖)
  - 可能需要添加 Font Awesome 和 Tailwind CSS CDN 支持
