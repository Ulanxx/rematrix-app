# Change: ChatBot 主 Agent 工作流编排

## Why
用户希望 ChatBot 能够作为主 Agent 控制整个应用流程，支持通过 Chat 修改和管理工作流，提供更智能的交互式操作体验。

## What Changes
- **后端**：新增 WorkflowEngine 服务，支持 ChatBot 指令解析与执行；扩展 ChatBot 支持工作流指令（如 /run、/pause、/modify-stage、/jump-to）；新增 WorkflowCommand 表存储指令历史。
- **前端**：ChatBot UI 支持指令提示与快捷按钮；工作流状态可视化展示；支持通过自然语言修改工作流参数。
- **交互流程**：用户可通过 ChatBot 发送指令控制 Job 流程，ChatBot 解析并执行，返回执行结果与状态更新。

## Impact
- **Affected specs**: ChatBot、Jobs、Workflow
- **Affected code**: 新增 WorkflowEngine、扩展 JobsController、ChatBot UI 增强
- **Database**: 新增 WorkflowCommand 表
