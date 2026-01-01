## 1. 诊断与分析
- [ ] 1.1 增加详细日志，记录 AI 原始输出的 Token 长度和完整文本内容 `@/src/modules/ppt/ai-html-generator.service.ts`
- [ ] 1.2 验证 `extractHtml` 是否在面对多个匹配项时发生了截断

## 2. 增强提取逻辑
- [ ] 2.1 修改 `extractHtml`，支持通过全局匹配识别所有 `ppt-page-wrapper` 片段
- [ ] 2.2 实现片段合并逻辑，确保如果 AI 分多次输出片段也能被正确拼装

## 3. Prompt 优化与分批生成
- [ ] 3.1 在 `generateDirectHtml` 的 User Prompt 中增加更强的约束，要求明确闭合标签
- [ ] 3.2 实现分批生成逻辑：当 slides 数量超过阈值（如 4 页）时，自动拆分为多批次调用并合并结果

## 4. 验证
- [ ] 4.1 运行 `test-ai-generation.ts` 并检查 `test-ppt.html` 是否包含完整的 10 页内容
- [ ] 4.2 验证生成的 HTML 在浏览器中的视觉呈现是否符合预期
