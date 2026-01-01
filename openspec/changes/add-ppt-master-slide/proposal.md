# Change: Add PPT Master Slide Support

## Why
目前生成的 PPT 每一页风格虽然相似，但在细节实现（如页码样式、页眉位置、背景细节）上存在差异，缺乏统一的“母版”概念。通过引入母版系统，可以确保所有页面在视觉上保持高度一致性，提升专业感。

## What Changes
- **引入母版系统**: 在 `PptService` 中实现一套母版渲染逻辑。
- **统一页码和页眉**: 将页码、课程标题等共有信息从 AI 生成内容中剥离，由母版统一控制。
- **样式注入**: 支持通过配置注入全局样式和页级样式。
- **AI 提示词调整**: 修改 AI 提示词，让 AI 专注于内容生成，而不是重复生成通用的页码和页眉元素。

## Impact
- **Affected code**: 
    - `ppt.service.ts`: 实现母版包装和变量替换。
    - `ppt.types.ts`: 增加母版相关的类型定义。
    - `ai-html-generator.service.ts`: 简化提示词，移除页眉页码生成要求。
- **Breaking changes**: 无。这是一个功能增强。
