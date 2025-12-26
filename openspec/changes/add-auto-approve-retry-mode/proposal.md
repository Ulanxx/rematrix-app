# Change: 添加自动审批和重试模式

## Why
用户在创建课程时希望能够选择自动模式，让整个流程无需人工干预自动完成所有审批和重试，直到最终完成。这适用于批量处理或测试场景，提升用户体验和效率。

## What Changes
- 在课程创建页面添加"自动模式"开关
- 开启后自动批准所有需要审批的阶段
- 开启后自动重试失败的阶段，直到成功或达到最大重试次数
- 在Job模型中添加autoMode字段标识自动模式
- 修改工作流引擎支持自动审批逻辑
- 前端界面显示当前Job的自动模式状态

## Impact
- Affected specs: frontend-course-flow, jobs
- Affected code: 
  - `app/src/pages/CourseCreate.tsx` - 添加自动模式开关
  - `src/modules/jobs/jobs.service.ts` - 支持自动模式Job创建
  - `src/modules/workflow-engine/workflow-engine.service.ts` - 自动审批逻辑
  - `prisma/schema.prisma` - Job模型添加autoMode字段
  - `src/temporal/workflows/video-generation.workflow.ts` - 工作流自动审批支持
