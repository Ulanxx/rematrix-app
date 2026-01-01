# Artifacts（模式 A：结构化产物为主）能力规格变更

## ADDED Requirements

### Requirement: 结构化产物可用于前端确认与编辑
系统 SHALL 以结构化 Artifact 作为用户确认与修改的主要载体（模式 A）。

#### Scenario: 前端展示待确认产物
- **WHEN** Job 进入 PLAN/NARRATION/PAGES 的待确认阶段
- **THEN** 前端通过 `GET /jobs/:id/artifacts` 获取该阶段的最新 Artifact
- **AND** 前端展示该 Artifact 内容供用户确认

#### Scenario: 用户修改产物生成新版本
- **WHEN** 用户对 NARRATION 或 PAGES 阶段的 Artifact 做修改并提交
- **THEN** 系统创建新版本 Artifact（`version` 递增，`createdBy=user`）
- **AND** 后续阶段 SHALL 使用最新已确认版本作为输入
