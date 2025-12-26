# Change: 在 PAGES 步骤中添加 PDF 生成功能

## Why
当前 PAGES 步骤完成后直接跳转到项目完成状态，没有实际生成 PDF 文档。用户期望 PAGES 步骤能生成可下载的 PDF 作为最终输出。

## What Changes
- 在 PAGES 步骤中添加 PDF 生成逻辑
- 更新 PAGES 步骤输出，确保包含有效的 PDF 下载链接
- 修改工作流，确保 PDF 生成成功后才标记任务完成
- 添加 PDF 生成错误处理和重试机制

## Impact
- Affected specs: workflow-steps
- Affected code: 
  - src/modules/workflow-steps/steps/pages.step.ts
  - src/temporal/activities/video-generation.activities.ts
  - 可能需要添加 PDF 生成依赖库
