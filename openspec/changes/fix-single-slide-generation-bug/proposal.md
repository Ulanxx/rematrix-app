# Change: Fix Single Slide Generation Bug in Direct Path

## Why
在 `generateDirectHtml` 流程中，即使输入了多个幻灯片，系统往往只生成或只保留了一页 PPT。这可能是由于 AI 输出 Token 限制导致内容截断，或者是 `extractHtml` 逻辑在处理多个 HTML 片段时只提取了第一个。

## What Changes
- **MODIFIED**: 优化 `AiHtmlGeneratorService.extractHtml` 逻辑，支持提取并合并多个 HTML 片段，或者更准确地捕获完整文档。
- **MODIFIED**: 改进 `generateDirectHtml` 的 Prompt，引导 AI 在输出过长时进行分段标记或采用更紧凑的 HTML。
- **ADDED**: 引入分批直接生成机制（如果单次生成依然受限），将大量幻灯片拆分为更小的批次（如每批 3-4 页）进行直接生成并合并。

## Impact
- **Affected specs**: `simplified-html-gen`
- **Affected code**: `@/src/modules/ppt/ai-html-generator.service.ts`, `@/src/modules/ppt/ppt.service.ts`
