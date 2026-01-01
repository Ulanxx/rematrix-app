## 1. 修复 extractHtml 逻辑
- [x] 1.1 调整 `extractHtml` 方法的匹配顺序，优先提取完整 HTML 文档 `@/src/modules/ppt/ai-html-generator.service.ts`
- [x] 1.2 确保对单个 `<div>` 片段的支持不受影响（用于 `generateSlideHtml`）

## 2. 优化 generateDirectHtml Prompt
- [x] 2.1 在 System Prompt 中明确要求输出完整 HTML 文档结构 `@/src/modules/ppt/ai-html-generator.service.ts`
- [x] 2.2 在 User Prompt 中强调必须包含所有幻灯片

## 3. 验证与测试
- [x] 3.1 运行 `test-ai-generation.ts` 确保生成完整的多页 HTML
- [ ] 3.2 验证集成环境中的数据流转（确保 `pages.step.ts` 正确汇聚数据）
- [ ] 3.3 验证 jobId `3c02d09e-6d1e-4b82-ae3a-43716c94b74e` 的修复效果（如可行）
