## Context
当前 `generateDirectHtml` 方法的设计存在逻辑冲突：
- Prompt 要求 AI 生成"完整的 HTML 文档，包含所有幻灯片"
- 但 `extractHtml` 方法会优先提取单个 `<div>` 标签，导致多页内容丢失
- 实际测试中，jobId `3c02d09e-6d1e-4b82-ae3a-43716c94b74e` 有 6 页内容，但只生成了 1 页

## Goals
- 修复 `extractHtml` 逻辑，正确提取完整 HTML 文档
- 确保多页 PPT 能够完整生成
- 保持与现有测试脚本的兼容性

## Decisions
1. **优先提取完整 HTML 文档**: 修改 `extractHtml` 的匹配顺序，优先匹配 `<!DOCTYPE html>` 开头的完整文档
2. **增强 Prompt 明确性**: 在 prompt 中明确要求输出格式和结构
3. **保持向后兼容**: 保留对单个 `<div>` 片段的支持（用于 `generateSlideHtml`）

## Risks / Trade-offs
- 修改 `extractHtml` 可能影响 `generateSlideHtml` 方法（但该方法本就要求输出 `<div>` 片段，不受影响）
