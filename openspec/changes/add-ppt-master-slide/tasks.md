## 1. 基础架构与类型
- [ ] 1.1 在 `ppt.types.ts` 中定义 `PptMasterSlideConfig` 类型
- [ ] 1.2 在 `AiGenerationOptions` 中增加 `enableMasterSlide` 开关

## 2. PptService 实现
- [ ] 2.1 修改 `wrapAllSlides` 方法，支持渲染母版装饰层
- [ ] 2.2 实现变量替换逻辑 (页码、总页数、标题)
- [ ] 2.3 优化全局 CSS 注入，确保母版元素在最顶层

## 3. AI 提示词优化
- [ ] 3.1 修改 `AiHtmlGeneratorService.buildPrompt`，明确告知 AI 不再生成页码和页眉
- [ ] 3.2 在提示词中增加“内容区域”的约束说明

## 4. 验证与测试
- [ ] 4.1 更新 `ppt.service.spec.ts` 验证母版包装逻辑
- [ ] 4.2 运行 `test-ai-generation.ts` 观察视觉一致性
- [ ] 4.3 确认 PDF 导出依然正常包含母版元素
