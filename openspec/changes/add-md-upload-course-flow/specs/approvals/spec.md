# Approvals（三段确认）能力规格变更

## MODIFIED Requirements

### Requirement: 确认点定义
系统 SHALL 在以下阶段设置确认点：PLAN（计划确认）、NARRATION（口播稿确认）、PAGES（页面确认）。

#### Scenario: 到达确认点时暂停
- **WHEN** Job 执行到确认点阶段
- **THEN** 系统暂停执行，状态变为 WAITING_APPROVAL
- **AND** 系统创建或更新 `Approval(jobId, stage)` 记录为 PENDING

### Requirement: 确认操作
系统 SHALL 支持用户确认（approve）或拒绝（reject）当前阶段的产物。

#### Scenario: 用户确认
- **WHEN** 用户调用 approve 接口，指定 stage
- **THEN** Approval 状态变为 APPROVED
- **AND** Job 状态变为 RUNNING 并继续执行下一阶段

#### Scenario: 用户拒绝
- **WHEN** 用户调用 reject 接口并提供修改意见（reason）
- **THEN** Approval 状态变为 REJECTED
- **AND** comment 记录修改意见
- **AND** Job 保持/回到 WAITING_APPROVAL

## ADDED Requirements

### Requirement: 前端可轮询等待确认点
系统 SHALL 允许前端通过轮询的方式判定是否进入待确认状态。

#### Scenario: 制作过程页等待确认
- **WHEN** 前端轮询 `GET /jobs/:id` 或等待某个 stage 的 artifact
- **THEN** 当前阶段为 PLAN/NARRATION/PAGES 且状态为 WAITING_APPROVAL 时，前端显示确认面板
