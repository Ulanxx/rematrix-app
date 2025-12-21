## 1. 数据模型与引擎
- [ ] 1.1 新增 WorkflowCommand Prisma 模型（id, jobId, command, params, status, result, createdAt）
- [ ] 1.2 新增 WorkflowEngine Service（指令解析、执行、状态管理）
- [ ] 1.3 扩展 ChatBot SSE 接口支持 workflow_command 事件

## 2. ChatBot 指令系统
- [ ] 2.1 定义工作流指令集（/run, /pause, /resume, /jump-to, /modify-stage）
- [ ] 2.2 实现指令解析器（支持自然语言转指令）
- [ ] 2.3 集成指令执行引擎到 JobsService

## 3. 前端 ChatBot UI 增强
- [ ] 3.1 添加指令快捷按钮与自动补全
- [ ] 3.2 工作流状态可视化展示
- [ ] 3.3 指令执行结果实时反馈

## 4. 集成与验证
- [ ] 4.1 端到端验证：ChatBot 控制完整工作流
- [ ] 4.2 自然语言指令解析测试
- [ ] 4.3 更新 API 类型定义与前端类型安全
