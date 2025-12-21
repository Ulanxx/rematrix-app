## Context
用户希望 ChatBot 能够作为主 Agent 控制整个应用流程，支持通过 Chat 修改和管理工作流。当前 ChatBot 仅支持问答和物料确认，缺乏工作流编排能力。

## Goals / Non-Goals
- **Goals**:
  - ChatBot 能够解析并执行工作流指令（/run, /pause, /jump-to 等）
  - 支持自然语言转工作流指令
  - 工作流状态可视化与实时反馈
  - 指令执行历史记录与审计
- **Non-Goals**:
  - 不实现通用工作流引擎，仅针对 Job 流程做编排
  - 不支持跨 Job 的复杂工作流依赖
  - 不实现图形化工作流编辑器

## Decisions
- **Decision**: 新增 WorkflowEngine 服务负责指令解析与执行，与 JobsService 协作。
- **Decision**: 使用 WorkflowCommand 表存储指令历史，支持审计与回滚。
- **Decision**: 指令解析采用规则引擎 + LLM 辅助，支持自然语言转指令。
- **Decision**: 通过 SSE 推送指令执行状态，前端实时更新 UI。

## Risks / Trade-offs
- **Risk**: 指令执行可能导致 Job 状态不一致；缓解：使用事务与状态机保证一致性。
- **Trade-off**: 为快速实现，采用规则引擎而非完整 DSL，后续可扩展。

## Migration Plan
1. 新增 WorkflowCommand 表与 WorkflowEngine 服务。
2. 扩展 ChatBot SSE 支持指令事件。
3. 实现指令解析器与执行逻辑。
4. 前端增加指令 UI 与状态可视化。
5. 端到端测试与验证。

## Open Questions
- 是否需要指令权限控制？（暂不实现，所有用户均可执行）
- 是否支持指令模板与参数化？（后续版本考虑）
