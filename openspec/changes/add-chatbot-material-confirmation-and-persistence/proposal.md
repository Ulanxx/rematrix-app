# Change: ChatBot 物料确认与聊天持久化

## Why
用户希望 ChatBot 能与左侧物料/素材交互：当有需要确认的物料时，ChatBot 输出中返回确认请求并询问用户是否确认；同时聊天消息需要落库，刷新后可见。

## What Changes
- **后端**：新增 ChatMessage 模型用于持久化聊天记录；扩展 ChatBot SSE 接口，支持物料确认事件（approval_request）与用户确认响应。
- **前端**：ChatBot UI 支持渲染确认请求卡片，用户点击确认/拒绝后调用对应接口；页面加载时从后端恢复历史聊天记录。
- **交互流程**：Job 进入 WAITING_APPROVAL 阶段时，ChatBot 主动提示用户确认当前阶段物料；用户在 ChatBot 中直接确认或拒绝，触发 Approval 更新并继续流程。

## Impact
- **Affected specs**: ChatBot、Jobs、Approval
- **Affected code**: JobsController（SSE）、新增 ChatMessage Service/Controller、前端 AppDetail ChatBot UI
- **Database**: 新增 ChatMessage 表；Approval 表可能增加关联 ChatMessage（可选）
