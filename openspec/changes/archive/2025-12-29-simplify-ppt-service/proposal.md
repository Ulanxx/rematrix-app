# Change: simplify-ppt-service

## Why
当前PPT服务过于复杂，包含大量设计模板、布局逻辑和上传功能，而核心需求只需要AI生成HTML幻灯片。需要简化服务结构，只保留核心的`generatePptWithAi`方法，参考AI HTML生成器的简洁流程。

## What Changes
- 移除PPT服务中的设计模板系统（ModernDesignTemplate相关代码）
- 移除复杂的布局生成逻辑（generatePptHtml、generateLayoutHtml等）
- 移除上传相关功能（uploadToCloud、retryUploadPpt等）
- 移除动画效果和样式生成辅助方法
- 保留并优化`generatePptWithAi`作为主要接口
- 简化类型定义，只保留必要的接口
- 移除缓存服务依赖（可选，根据需要）

## Impact
- Affected specs: ppt-generation
- Affected code: src/modules/ppt/ppt.service.ts, src/modules/ppt/ppt.types.ts
- Breaking changes: 移除多个公共方法和接口，需要更新调用方代码
