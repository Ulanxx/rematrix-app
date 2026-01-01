# Design: Fix Single Slide Generation Bug

## Context
在调用 `generateDirectHtml` 时，AI 被要求生成包含所有幻灯片（通常为 10 页）的完整 HTML 文档。然而，目前的观察是输出结果往往只包含第一页幻灯片。

## Goals
- 确保 `generateDirectHtml` 能够稳定输出所有请求的幻灯片。
- 提高对长内容生成的鲁棒性，防止 AI 偷懒。

## Decisions
### 1. 增强型提示词 (Enhanced Prompting)
在 Prompt 中加入更明确的结构约束，例如要求 AI 在每个幻灯片开始前输出特定的注释标记（如 `<!-- SLIDE_START: id -->`），以便后续提取和验证。

### 2. 分段提取逻辑 (Fragment Extraction)
优化 `extractHtml`，使其能够识别多个独立的幻灯片容器（`ppt-page-wrapper`），即使 AI 没有输出一个完美的完整文档，也能通过拼接片段来构建最终页面。

### 3. 分批生成机制 (Chunked Generation) - *备选方案*
如果单次生成 10 页导致内容由于 Token 限制而截断，将 `generateDirectHtml` 改为分批调用模型（例如每批生成 3 页），然后将生成的 HTML 片段合并到一个大的 HTML 框架中。

## Risks / Trade-offs
- 分批生成会增加总的生成时间和 API 调用次数。
- 提示词过于复杂可能会导致 AI 在视觉设计上表现下降。
