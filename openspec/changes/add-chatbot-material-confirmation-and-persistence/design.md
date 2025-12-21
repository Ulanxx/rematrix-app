## Context
用户希望在详情页右侧 ChatBot 中完成物料确认交互，并让聊天记录持久化。当前 ChatBot 为纯 SSE 对话，无状态、无确认交互。

## Goals / Non-Goals
- **Goals**:
  - ChatBot 能在 Job 进入 WAITING_APPROVAL 时主动推送确认请求卡片
  - 用户在 ChatBot 中点击确认/拒绝，触发 Approval 更新并继续流程
  - 所有聊天消息落库，刷新后恢复
- **Non-Goals**:
  - 不改变现有 SSE 流式对话机制
  - 不实现通用工作流引擎，仅针对 WAITING_APPROVAL 阶段做确认

## Decisions
- **Decision**: 新增 ChatMessage 表存储所有对话，包含 metadata 字段用于区分普通消息与 approval_request。
- **Decision**: 扩展现有 `/jobs/:id/chat/sse` 接口，在用户首次进入且 Job 为 WAITING_APPROVAL 时推送 approval_request 事件。
- **Decision**: 新增 `POST /jobs/:id/approve` 接口，接收 stage 与 action（approve/reject），同步调用 JobsService.approve/reject。
- **Decision**: 前端在 AppDetail 页面加载时先调用 `GET /jobs/:id/messages` 恢复历史，再建立 SSE 连接。

## Risks / Trade-offs
- **Risk**: 并发 SSE 连接可能导致重复落库；缓解：SSE 接口在落库前检查最近消息去重。
- **Trade-off**: 为最小侵入，不改动现有 Approval 表，仅通过 ChatBot UI 触发 Approval Service。

## Migration Plan
1. 新增 ChatMessage 表与 Service/Controller。
2. 修改 SSE 接口，增加落库逻辑与 approval_request 事件。
3. 新增 approve 接口。
4. 前端增加历史消息恢复与 approval_request 卡片渲染。
5. 端到端测试。

## Open Questions
- 是否需要将 approval_request 消息与 Approval 记录关联？（暂不实现，保持解耦）
