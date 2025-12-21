## 1. 数据模型与持久化
- [ ] 1.1 新增 ChatMessage Prisma 模型（id, jobId, role, content, metadata, createdAt）
- [ ] 1.2 新增 ChatMessage Service 与 Controller（CRUD，按 jobId 查询历史）
- [ ] 1.3 扩展 ChatBot SSE 接口支持持久化：接收消息时落库，返回消息时包含 id

## 2. ChatBot 物料确认交互
- [ ] 2.1 定义 approval_request SSE 事件结构（stage, artifactSummary, confirm/reject 按钮）
- [ ] 2.2 后端：当 Job 状态为 WAITING_APPROVAL 时，ChatBot 首条消息推送 approval_request
- [ ] 2.3 新增 POST /jobs/:id/approve 接口供前端调用（同步触发 Approval 更新并继续流程）

## 3. 前端 ChatBot UI 增强
- [ ] 3.1 页面加载时从 /jobs/:id/messages 恢复历史聊天记录
- [ ] 3.2 ChatBot 消息渲染支持 approval_request 卡片（显示物料摘要，确认/拒绝按钮）
- [ ] 3.3 用户点击确认/拒绝后调用 POST /jobs/:id/approve 并本地更新消息状态

## 4. 集成与验证
- [ ] 4.1 端到端验证：进入 WAITING_APPROVAL 时 ChatBot 推送确认卡片，用户确认后 Job 继续
- [ ] 4.2 刷新页面后聊天记录恢复
- [ ] 4.3 更新 API 类型定义与前端类型安全
