# 前端重构：Aceternity 科技风 UI + 应用列表 + 详情页 ChatBot

## 实现概览
- **后端**：新增 `GET /jobs` 与 `GET /jobs/:id/chat/sse`（SSE，Bearer 鉴权，OpenRouter 流式）
- **前端**：首页改为应用列表，新增 `/apps/:jobId` 详情页（左侧 Process/物料，右侧 ChatBot），全站升级为 Aceternity 科技风 UI（深色渐变、玻璃态、霓虹光效、微动效）

## 运行指南

### 1. 环境变量
```bash
# 后端根目录
export OPENROUTER_API_KEY=sk-or-xxxxx

# 前端（可选，默认 http://localhost:3000）
export VITE_API_BASE_URL=http://localhost:3000
```

### 2. 启动服务
```bash
# 后端
pnpm -w start:dev

# 前端
pnpm -C app dev
```

### 3. 访问路径
- 首页（应用列表）：`http://localhost:5173/`
- 应用详情页：`http://localhost:5173/apps/:jobId`
- ChatBot SSE 接口：`GET http://localhost:3000/jobs/:id/chat/sse?message=xxx`（Authorization: Bearer <token>）

### 4. 验证要点
- 首页展示应用卡片（状态：已完成/生成中/等待确认/失败/草稿）
- 点击卡片跳转详情页，左侧 Process/物料，右侧 ChatBot
- ChatBot 发送消息后流式返回（需配置 OPENROUTER_API_KEY）
- 全站 UI 为科技风（深色渐变、玻璃态、霓虹光效、微动效）

## 技术细节
- **UI 基座**：`AppShell` 深色渐变 + 玻璃态 Header；新增 `GlassCard`、`BackgroundGradient` 组件
- **SSE 客户端**：`fetch + ReadableStream`，Bearer 鉴权，事件协议 `message/done/error`
- **类型**：`ListJobsResponse`、`Job` 补齐 `createdAt/updatedAt/error` 字段
- **路由**：`/apps/:jobId` 指向 `AppDetailPage`

## 后续扩展
- 可继续引入更多 Aceternity 组件（动画、复杂背景、交互特效）
- ChatBot 可接入更多 PromptOps 配置与多轮上下文
- 应用列表可加搜索/分页/筛选

---
