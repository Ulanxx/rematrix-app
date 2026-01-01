# Change: Fix Direct HTML Generation Bug

## Why
`generateDirectHtml` 方法存在严重 bug：
1. 即使 AI 生成了包含 6 页的完整 HTML 文档，`extractHtml` 方法也会错误地只提取第一个 `<div>` 标签
2. 导致最终只输出一页，且缺少必要的 HTML 文档结构（`<!DOCTYPE html>`, `<head>`, `<style>` 等）
3. Prompt 要求与实际处理逻辑不一致

## What Changes
- **MODIFIED**: 修复 `AiHtmlGeneratorService.extractHtml` 方法，正确处理完整 HTML 文档
- **MODIFIED**: 优化 `AiHtmlGeneratorService.generateDirectHtml` 的 prompt，明确要求生成完整文档
- **MODIFIED**: 确保 `PptService.generateDirectPpt` 正确返回完整的多页 HTML

## Impact
- **Affected specs**: `ppt-generation`
- **Affected code**: 
    - `@/src/modules/ppt/ai-html-generator.service.ts` (extractHtml, generateDirectHtml)
    - `@/src/modules/ppt/ppt.service.ts` (generateDirectPpt)
- **Breaking**: No (修复 bug，不改变 API)
