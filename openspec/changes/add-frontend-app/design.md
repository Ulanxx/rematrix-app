## Context
本仓库当前聚焦后端（NestJS）与长任务视频生成流程，但缺少前端工程以承载用户操作与阶段性确认。`app/` 将作为前端工程根目录，使用 React 19.2 + Vite 8 + Tailwind，优先保证最小可运行与可扩展性。

## Goals / Non-Goals
- Goals:
  - 在 `app/` 落地可运行的前端工程与基础工程化配置
  - 约定清晰的目录结构与 API 访问层，便于后续迭代业务页面
- Non-Goals:
  - 本 change 不实现完整业务功能
  - 不引入复杂状态管理/数据缓存方案（除非明确要求）

## Decisions
- Decision: 使用 Vite 8 + React 19.2 + TypeScript
  - Why: 开发体验好、构建快速，与当前 Node >= 20 兼容
- Decision: 样式使用 Tailwind CSS
  - Why: 与快速搭建 UI 的目标一致；减少自定义 CSS 维护成本
- Decision: UI 组件基于 `shadcn/ui`
  - Why: 提供一致的基础组件与可定制主题，避免从零维护组件体系
- Decision: API 访问层先用轻量 fetch 封装
  - Why: 避免在范围未明确前引入 axios/react-query 等更重方案；后续可根据需求演进
- Decision: 前端独立部署，通过 `VITE_API_BASE_URL` 访问后端
  - Why: 简化部署边界；允许前后端独立发布与扩容
- Decision: 前端消费 JWT（Authorization: Bearer）进行鉴权
  - Why: 与后端接口交互简单直接；为后续权限控制留出空间
- Decision: JWT token 存储在 `localStorage`
  - Why: 首期实现成本最低；后续若引入 refresh/更高安全要求可演进

## Risks / Trade-offs
- 风险: 业务范围不明确导致工程化过度/不足
  - 缓解: 先交付应用壳 + 最小 API 层；后续按页面需求再扩展

## Open Questions
- 是否需要 SSR/同构（Next.js）？若无明确需求，默认不做。
- “产物确认”的后端接口形态：
  - 若后端提供 approval/confirm API，则前端直接调用
  - 若暂未提供，则先实现 UI 与交互流程，并预留 API 对接点
