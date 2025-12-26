# Change: 为 Job Process 页面添加失败重试按钮

## Why
当前 Job Process 页面在任务失败时，用户无法便捷地重试失败的任务。用户需要重新启动整个工作流，这降低了用户体验。添加失败重试按钮可以让用户在任务失败时快速重试失败的阶段，提高系统的可用性和用户满意度。

## What Changes
- 在 Job Process 页面添加失败重试按钮，当 job 状态为 FAILED 时显示
- 实现后端重试 API 接口，支持重试失败的任务或特定阶段
- 扩展工作流引擎支持重试指令
- 添加重试状态的前端实时反馈
- 增强错误处理和用户提示

## Impact
- **Affected specs**: job-management（任务管理功能）
- **Affected code**: 
  - 前端：`app/src/pages/JobProcess.tsx`
  - 后端：`src/modules/jobs/jobs.controller.ts`、`src/modules/jobs/jobs.service.ts`
  - 工作流引擎：`src/modules/workflow-engine/workflow-engine.service.ts`
- **Dependencies**: 无新增外部依赖
- **Breaking changes**: 无，纯功能增强
