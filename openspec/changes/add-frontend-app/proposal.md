# Change: 添加前端应用（React 19.2 + Vite 8 + Tailwind）

## Why
当前仓库缺少前端工程目录与基础开发体验，无法提供用户界面来查看/创建 Job、跟踪 pipeline 阶段、预览/确认阶段产物。

## What Changes
- 新增 `app/` 前端工程（React 19.2.0 + Vite 8 + Tailwind CSS）
- 约定前端的目录结构、代码规范、环境变量与构建脚本
- 提供最小可运行的应用壳：布局、路由占位、基础样式与开发服务器
- 引入 `shadcn/ui` 作为基础组件方案
- 定义前端与后端 API 的交互方式（baseURL、JWT 鉴权、错误处理约定）
- 提供“产物预览/确认”相关页面的最小可用实现

## Impact
- Affected specs: frontend-app
- Affected code:
  - 新增 `app/` 目录及其依赖/构建配置
  - 可能新增根级别的开发脚本（可选，视仓库现状而定）

## Out of Scope
- 具体业务页面功能的完整实现（例如完整的 Job 创建表单、分镜编辑器、渲染进度实时订阅等）
- 后端鉴权/权限模型的变更（本 change 仅消费 JWT，不定义 JWT 签发规则）

## Open Questions
- 产物预览/确认页面的交互细节：确认是“逐 stage 确认”，还是“对单个 artifact 做 approve/reject”？

## Decisions
- JWT token 存储在 `localStorage`，并作为 `Authorization: Bearer <token>` 注入请求。
